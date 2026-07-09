// ═══════════════════════════════════════════
// MUSIC SCALE DETECTOR — app script
// pick notes → match against 12 major scales → key → modes →
// diatonic chords → progressions → song suggestions
// ═══════════════════════════════════════════

'use strict';

// ───────────────────────────────────────────
// THEORY DATA
// ───────────────────────────────────────────

// circle of fifths order: C G D A E B F# | F Bb Eb Ab Db
const majorScales = {
    "C":  ["C", "D", "E", "F", "G", "A", "B"],
    "G":  ["G", "A", "B", "C", "D", "E", "F#"],
    "D":  ["D", "E", "F#", "G", "A", "B", "C#"],
    "A":  ["A", "B", "C#", "D", "E", "F#", "G#"],
    "E":  ["E", "F#", "G#", "A", "B", "C#", "D#"],
    "B":  ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    "F":  ["F", "G", "A", "Bb", "C", "D", "E"],
    "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
    "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"]
};

const modes = {
    'Ionian': { name: 'Major (Ionian)', degree: 0, description: 'Happy, bright.' },
    'Dorian': { name: 'Dorian', degree: 1, description: 'Minor with a jazzy twist.' },
    'Phrygian': { name: 'Phrygian', degree: 2, description: 'Dark, Spanish, flamenco.' },
    'Lydian': { name: 'Lydian', degree: 3, description: 'Dreamy, floating.' },
    'Mixolydian': { name: 'Mixolydian', degree: 4, description: 'Bluesy, dominant.' },
    'Aeolian': { name: 'Natural Minor', degree: 5, description: 'Sad, emotional.' },
    'Locrian': { name: 'Locrian', degree: 6, description: 'Unstable, rare.' }
};

const chordQualities = {
    'Ionian':     ['Major', 'minor', 'minor', 'Major', 'Major', 'minor', 'dim'],
    'Dorian':     ['minor', 'minor', 'Major', 'Major', 'minor', 'dim', 'Major'],
    'Phrygian':   ['minor', 'Major', 'Major', 'minor', 'dim', 'Major', 'minor'],
    'Lydian':     ['Major', 'Major', 'minor', 'dim', 'Major', 'minor', 'minor'],
    'Mixolydian': ['Major', 'minor', 'dim', 'Major', 'minor', 'minor', 'Major'],
    'Aeolian':    ['minor', 'dim', 'Major', 'minor', 'minor', 'Major', 'Major'],
    'Locrian':    ['dim', 'Major', 'minor', 'minor', 'Major', 'Major', 'minor']
};

const romanNumerals = {
    'Ionian':     ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    'Dorian':     ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
    'Phrygian':   ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
    'Lydian':     ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
    'Mixolydian': ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
    'Aeolian':    ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    'Locrian':    ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii']
};

const seventhQualities = {
    'Ionian':     ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
    'Dorian':     ['m7', 'm7', 'maj7', '7', 'm7', 'm7b5', 'maj7'],
    'Phrygian':   ['m7', 'maj7', '7', 'm7', 'm7b5', 'maj7', 'm7'],
    'Lydian':     ['maj7', '7', 'm7', 'm7b5', 'maj7', 'm7', 'm7'],
    'Mixolydian': ['7', 'm7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7'],
    'Aeolian':    ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'],
    'Locrian':    ['m7b5', 'maj7', 'm7', 'm7', 'maj7', '7', 'm7']
};

// scale-degree indices; roman numerals are computed from the active mode
const commonProgressions = [
    { indices: [0, 4, 5, 3], name: 'Pop Classic' },
    { indices: [0, 3, 4, 0], name: 'Blues / Rock' },
    { indices: [1, 4, 0], name: 'Jazz ii-V-I' },
    { indices: [0, 5, 3, 4], name: '50s Doo-Wop' },
    { indices: [5, 3, 0, 4], name: 'Sad Pop' },
    { indices: [0, 3, 5, 4], name: 'Anthem' },
    { indices: [0, 4, 5, 2, 3], name: 'Canon' },
    { indices: [0, 5, 2, 6], name: 'Andalusian' },
];

// real Spotify track IDs — clicking plays them via embed
const songDatabase = {
    'C': [
        { title: 'Imagine', artist: 'John Lennon', sp: '7pKfPomDEeI4TPT6EOYjn9' },
        { title: 'Let It Be', artist: 'The Beatles', sp: '7iN1s7xHE4ifF5povM6A48' },
        { title: 'No Woman No Cry', artist: 'Bob Marley', sp: '18rF49Lgmn0z3JEEzmgQ9C' },
    ],
    'G': [
        { title: 'Wonderwall', artist: 'Oasis', sp: '1qPbGZqppFwLwcBC1JQ6Vr' },
        { title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', sp: '7e89621JPkKaeDSTQ3avtg' },
        { title: 'Wish You Were Here', artist: 'Pink Floyd', sp: '6mFkJmJqdDVQ1REhVfGgd1' },
        { title: 'Brown Eyed Girl', artist: 'Van Morrison', sp: '3yrSvpt2l1xhsV9Em88Pul' },
    ],
    'D': [
        { title: 'Summer of 69', artist: 'Bryan Adams', sp: '45sqV0WhglbGJswa6SiC0v' },
        { title: 'Cant Help Falling in Love', artist: 'Elvis', sp: '44AyOl4qVkzS48vBsbNXaC' },
    ],
    'A': [
        { title: 'Someone Like You', artist: 'Adele', sp: '1zwMYTA5nlNjZxYrvBB2pV' },
        { title: 'Here Comes The Sun', artist: 'The Beatles', sp: '6dGnYIeXmHdcikdzNNDMm2' },
    ],
    'E': [
        { title: 'Back in Black', artist: 'AC/DC', sp: '08mG3Y1vljYA6bvDt4Wqkj' },
        { title: 'Purple Haze', artist: 'Jimi Hendrix', sp: '0wJoRiX5K5BxlqZTolB2LD' },
        { title: 'Roadhouse Blues', artist: 'The Doors', sp: '1SEJLX94RMARFZaY3Mr3AQ' },
    ],
    'F': [
        { title: 'Hey Jude', artist: 'The Beatles', sp: '0aym2LBJBk9DAYuHHutrIl' },
        { title: 'Piano Man', artist: 'Billy Joel', sp: '1TpxoHaDRVAUQbJsKKZGAv' },
        { title: 'Free Fallin', artist: 'Tom Petty', sp: '5tVA6TkbaAH9QMITTQRrNv' },
    ],
    'Bb': [
        { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', sp: '081AHcLTz6opbo1V9XN8eL' },
    ],
    'Eb': [
        { title: 'Unchained Melody', artist: 'Righteous Brothers', sp: '1jFhnVoJkcB4lf9tT0rSZS' },
    ],
    'Ab': [
        { title: 'Perfect', artist: 'Ed Sheeran', sp: '0tgVpDi06FyKpA1z0VMD4v' },
        { title: 'All of Me', artist: 'John Legend', sp: '3U4isOIWM3VvDubwSI3y7a' },
    ],
};

const noteFrequencies = {
    'C': 261.63, 'C#': 277.18, 'Db': 277.18,
    'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
    'E': 329.63, 'E#': 349.23, 'F': 349.23,
    'F#': 369.99, 'Gb': 369.99,
    'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
    'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
    'B': 493.88
};

const keyboardMap = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
    'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
    'u': 'A#', 'j': 'B'
};

// guitar strings top-to-bottom as displayed (player view: low E on top)
const guitarStrings = [
    { open: 'E', pitch: 4,  octave: 2 },
    { open: 'A', pitch: 9,  octave: 2 },
    { open: 'D', pitch: 2,  octave: 3 },
    { open: 'G', pitch: 7,  octave: 3 },
    { open: 'B', pitch: 11, octave: 3 },
    { open: 'E', pitch: 4,  octave: 4 },
];

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ───────────────────────────────────────────
// STATE
// ───────────────────────────────────────────

let selectedNotes = [];
let selectedKey = null;
let selectedMode = 'Ionian';
let currentOctaves = 2;
let currentChordType = 'triad';

// true after initial load — guards autoscroll on page open
let appReady = false;

// ───────────────────────────────────────────
// SYNESTHESIA — every key re-lights the room in its own color
// (hues walk the circle of fifths; idle = damla purple)
// ───────────────────────────────────────────

// hues stay inside damla's palette band (cyan → purple → pink),
// so the room never drifts into olive or brown
const IDLE_HUE = 285;
const keyHues = {
    'C': 320, 'G': 265, 'D': 205, 'A': 290, 'E': 230, 'B': 335,
    'F#': 215, 'Db': 300, 'Ab': 275, 'Eb': 190, 'Bb': 250, 'F': 348
};

function applyKeyColor(key) {
    const hue = keyHues[key] !== undefined ? keyHues[key] : IDLE_HUE;
    document.documentElement.style.setProperty('--key-h', hue);
}

// the big chip on the rail — answers "what key am I in?" at a glance
function updateKeyReadout() {
    const el = document.getElementById('key-current');
    if (!el) return;
    if (selectedKey) {
        el.classList.remove('empty');
        el.textContent = `${getCurrentRoot()} ${modes[selectedMode].name}`;
    } else {
        el.classList.add('empty');
        el.textContent = selectedNotes.length === 0
            ? 'press a few notes…'
            : 'no single key fits, try fewer notes';
    }
}

// progression page has its own key/mode state
let progKey = null;
let progMode = 'Ionian';
let currentProgression = [];
let savedProgressions = [];

// ───────────────────────────────────────────
// PITCH HELPERS — pitch-based comparison so enharmonics (D# vs Eb) match
// ───────────────────────────────────────────

function noteToPitch(note) {
    const pitchMap = {
        'C': 0, 'B#': 0,
        'C#': 1, 'Db': 1,
        'D': 2,
        'D#': 3, 'Eb': 3,
        'E': 4, 'Fb': 4,
        'E#': 5, 'F': 5,
        'F#': 6, 'Gb': 6,
        'G': 7,
        'G#': 8, 'Ab': 8,
        'A': 9,
        'A#': 10, 'Bb': 10,
        'B': 11, 'Cb': 11
    };
    return pitchMap[note];
}

function scaleContainsNotes(scale, notes) {
    const scalePitches = scale.map(noteToPitch);
    return notes.map(noteToPitch).every(p => scalePitches.includes(p));
}

function getCurrentScale() {
    if (!selectedKey) return [];
    const mode = modes[selectedMode];
    const baseScale = majorScales[selectedKey];
    const modeScale = [];
    for (let i = 0; i < 7; i++) {
        modeScale.push(baseScale[(mode.degree + i) % 7]);
    }
    return modeScale;
}

function getCurrentRoot() {
    if (!selectedKey) return null;
    return majorScales[selectedKey][modes[selectedMode].degree];
}

function getTriadNotes(scale, degreeIndex) {
    return [
        scale[degreeIndex % 7],
        scale[(degreeIndex + 2) % 7],
        scale[(degreeIndex + 4) % 7]
    ];
}

function getChordSymbol(rootNote, quality) {
    if (quality === 'minor') return rootNote + 'm';
    if (quality === 'dim') return rootNote + '°';
    return rootNote;
}

// localStorage is shared across every project on the github.io origin —
// validate everything read back from it before rendering
const CHORD_SYMBOL_RE = /^[A-G][#b]?(°|m7b5|maj7|m7|m|7|sus4)?$/;

function sanitizeProgression(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(c => typeof c === 'string' && CHORD_SYMBOL_RE.test(c));
}

function sanitizeNotes(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(n => typeof n === 'string' && noteToPitch(n) !== undefined);
}

// ───────────────────────────────────────────
// PAGE NAVIGATION
// ───────────────────────────────────────────

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
    document.querySelectorAll('[data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });
    if (page === 'progressions') updateProgressionPage();
    if (page === 'philosophy') showBlogIndex();
}

// ───────────────────────────────────────────
// BLOG — theory page: index of posts, each opens alone
// ───────────────────────────────────────────

function showBlogIndex() {
    document.getElementById('blog-index').classList.remove('hidden');
    document.querySelectorAll('.blog-post').forEach(p => p.classList.add('hidden'));
}

function showBlogPost(id) {
    document.getElementById('blog-index').classList.add('hidden');
    document.querySelectorAll('.blog-post').forEach(p => p.classList.add('hidden'));
    document.getElementById('post-' + id).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTab(choice) {
    document.querySelectorAll('.pick').forEach(tab => tab.classList.remove('active'));
    document.querySelector(choice === 'piano' ? '.tab-piano' : '.tab-guitar').classList.add('active');
    document.getElementById('piano-tab').classList.toggle('hidden', choice !== 'piano');
    document.getElementById('guitar-tab').classList.toggle('hidden', choice !== 'guitar');
}

// ───────────────────────────────────────────
// NOTE SELECTION
// ───────────────────────────────────────────

function toggleNote(noteName, octave) {
    playNote(noteName, octave);
    const index = selectedNotes.indexOf(noteName);
    if (index > -1) {
        selectedNotes.splice(index, 1);
    } else {
        selectedNotes.push(noteName);
    }
    updateVisualDisplay();
    findKeys();
    saveState();
}

function updateVisualDisplay() {
    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(el => {
        el.classList.toggle('selected', selectedNotes.includes(el.textContent.trim()));
    });
    document.getElementById('notes-display').textContent = selectedNotes.join(' - ');
}

function clearNotes() {
    selectedNotes = [];
    selectedKey = null;
    selectedMode = 'Ionian';
    applyKeyColor(null);
    document.getElementById('keys-grid').innerHTML = '';
    document.getElementById('key-count').textContent = '0';
    updateKeyReadout();
    updateVisualDisplay();
    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(el => {
        el.classList.remove('scale', 'root');
    });
    document.getElementById('results').classList.add('hidden');
    removeDynamicPanels();
    saveState();
}

function removeDynamicPanels() {
    const chords = document.getElementById('chords-section-dynamic');
    const progs = document.getElementById('progressions-section-dynamic');
    if (chords) chords.remove();
    if (progs) progs.remove();
}

// ───────────────────────────────────────────
// KEY DETECTION
// ───────────────────────────────────────────

function findKeys() {
    if (selectedNotes.length === 0) {
        updateResults();
        return;
    }

    const possibleKeys = [];
    Object.entries(majorScales).forEach(([keyName, scaleNotes]) => {
        if (scaleContainsNotes(scaleNotes, selectedNotes)) {
            possibleKeys.push(keyName);
        }
    });

    if (possibleKeys.length > 0 && !selectedKey) {
        selectedKey = possibleKeys[0];
    }

    // selected key no longer possible → fall back to the first match
    if (selectedKey && !possibleKeys.includes(selectedKey)) {
        selectedKey = possibleKeys.length > 0 ? possibleKeys[0] : null;
    }

    updateResults(possibleKeys);
}

function updateResults(possibleKeys = []) {
    const resultsDiv = document.getElementById('results');

    if (selectedNotes.length === 0) {
        resultsDiv.classList.add('hidden');
        return;
    }

    resultsDiv.classList.remove('hidden');
    document.getElementById('key-count').textContent = possibleKeys.length;

    const keysGrid = document.getElementById('keys-grid');
    keysGrid.innerHTML = '';
    possibleKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'key-btn' + (key === selectedKey ? ' active' : '');
        btn.style.setProperty('--btn-h', keyHues[key]);
        const name = document.createElement('div');
        name.className = 'key-name';
        name.textContent = key;
        const sub = document.createElement('div');
        sub.textContent = 'Major';
        btn.appendChild(name);
        btn.appendChild(sub);
        btn.onclick = () => selectKey(key);
        keysGrid.appendChild(btn);
    });

    applyKeyColor(selectedKey);
    updateKeyReadout();

    if (selectedKey) {
        updateModes();
        updateScaleInfo();
    } else {
        // no key matches — hide every stale result
        document.getElementById('modes-section').classList.add('hidden');
        document.getElementById('scale-info').classList.add('hidden');
        removeDynamicPanels();
        updateSongSuggestions();
    }
}

function selectKey(key) {
    selectedKey = key;
    selectedMode = 'Ionian';
    updateVisualDisplay();
    findKeys();
    saveState();
}

// ───────────────────────────────────────────
// MODES
// ───────────────────────────────────────────

function updateModes() {
    const modesSection = document.getElementById('modes-section');
    const modesGrid = document.getElementById('modes-grid');

    modesSection.classList.remove('hidden');
    modesGrid.innerHTML = '';

    Object.entries(modes).forEach(([modeKey, modeData]) => {
        const btn = document.createElement('button');
        btn.className = 'mode-btn' + (modeKey === selectedMode ? ' active' : '');

        const modeRoot = majorScales[selectedKey][modeData.degree];
        const title = document.createElement('div');
        title.className = 'mode-root';
        title.textContent = `${modeRoot} ${modeData.name}`;
        const desc = document.createElement('div');
        desc.className = 'mode-desc';
        desc.textContent = modeData.description;

        btn.appendChild(title);
        btn.appendChild(desc);
        btn.onclick = () => {
            selectedMode = modeKey;
            updateModes();
            updateScaleInfo();
            saveState();
        };
        modesGrid.appendChild(btn);
    });
}

// ───────────────────────────────────────────
// SCALE INFO + INSTRUMENT HIGHLIGHT
// ───────────────────────────────────────────

function updateScaleInfo() {
    const scaleInfoDiv = document.getElementById('scale-info');
    const scaleTitleEl = document.getElementById('scale-title');
    const scaleNotesEl = document.getElementById('scale-notes');

    scaleInfoDiv.classList.remove('hidden');

    const currentScale = getCurrentScale();
    const rootNote = getCurrentRoot();
    const modeData = modes[selectedMode];

    scaleTitleEl.textContent = `${rootNote} ${modeData.name} · ${modeData.description.toLowerCase()}`;
    updateKeyReadout();

    scaleNotesEl.innerHTML = '';
    currentScale.forEach(note => {
        const span = document.createElement('span');
        span.className = 'scale-note';
        if (noteToPitch(note) === noteToPitch(rootNote)) {
            span.classList.add('root-note');
        } else if (selectedNotes.some(sn => noteToPitch(sn) === noteToPitch(note))) {
            span.classList.add('selected-note');
        } else {
            span.classList.add('normal');
        }
        span.textContent = note;
        scaleNotesEl.appendChild(span);
    });

    highlightScaleOnInstruments(currentScale, rootNote);
    updateChords();
    updateProgressions();
    updateSongSuggestions();
}

function highlightScaleOnInstruments(scale, rootNote) {
    const scalePitches = scale.map(noteToPitch);
    const rootPitch = noteToPitch(rootNote);

    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(el => {
        const elPitch = noteToPitch(el.textContent.trim());
        el.classList.remove('scale', 'root');
        if (elPitch === rootPitch) {
            el.classList.add('root');
        } else if (scalePitches.includes(elPitch)) {
            el.classList.add('scale');
        }
    });
}

// ───────────────────────────────────────────
// DIATONIC CHORDS
// ───────────────────────────────────────────

function updateChords() {
    if (!selectedKey) return;

    const currentScale = getCurrentScale();
    const qualities = chordQualities[selectedMode];
    const numerals = romanNumerals[selectedMode];
    const seventh = seventhQualities[selectedMode];

    let chordsSection = document.getElementById('chords-section-dynamic');
    if (!chordsSection) {
        chordsSection = document.createElement('div');
        chordsSection.id = 'chords-section-dynamic';
        chordsSection.className = 'panel';
        document.getElementById('results-grid').appendChild(chordsSection);
    }
    chordsSection.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'chords';
    const heading = document.createElement('h3');
    heading.textContent = 'Diatonic Chords';
    const tabs = document.createElement('div');
    tabs.className = 'chord-type-tabs';
    [['triad', 'Triads'], ['7th', '7th'], ['sus', 'Sus']].forEach(([type, label]) => {
        const btn = document.createElement('button');
        btn.className = 'chord-type-btn' + (currentChordType === type ? ' active' : '');
        btn.textContent = label;
        btn.onclick = () => { currentChordType = type; updateChords(); };
        tabs.appendChild(btn);
    });
    const grid = document.createElement('div');
    grid.className = 'chords-grid';
    chordsSection.append(title, heading, tabs, grid);

    for (let i = 0; i < 7; i++) {
        const chordRoot = currentScale[i];
        const quality = qualities[i];
        let chordSymbol, chordQualityText, notesDisplay;

        if (currentChordType === 'triad') {
            chordSymbol = getChordSymbol(chordRoot, quality);
            chordQualityText = quality;
            notesDisplay = getTriadNotes(currentScale, i).join(' - ');
        } else if (currentChordType === '7th') {
            const notes = [
                currentScale[i % 7],
                currentScale[(i + 2) % 7],
                currentScale[(i + 4) % 7],
                currentScale[(i + 6) % 7]
            ];
            chordSymbol = chordRoot + seventh[i];
            chordQualityText = seventh[i];
            notesDisplay = notes.join(' - ');
        } else { // sus
            const sus2note = currentScale[(i + 1) % 7];
            const sus4note = currentScale[(i + 3) % 7];
            const fifth = currentScale[(i + 4) % 7];
            chordSymbol = chordRoot + 'sus4';
            chordQualityText = 'sus4 / sus2';
            notesDisplay = chordRoot + ' - ' + sus4note + ' - ' + fifth + ' (sus4) | ' + chordRoot + ' - ' + sus2note + ' - ' + fifth + ' (sus2)';
        }

        const card = document.createElement('div');
        card.className = 'chord-card';
        card.title = 'click to add to progression';
        [['chord-degree', numerals[i]], ['chord-name', chordSymbol],
         ['chord-quality', chordQualityText], ['chord-notes-display', notesDisplay]].forEach(([cls, text]) => {
            const div = document.createElement('div');
            div.className = cls;
            div.textContent = text;
            card.appendChild(div);
        });
        card.onclick = () => addChordToProgression(chordSymbol);
        grid.appendChild(card);
    }
}

// ───────────────────────────────────────────
// SUGGESTED PROGRESSIONS (detector page)
// ───────────────────────────────────────────

function progressionChords(scale, qualities, prog) {
    return prog.indices.map(i => getChordSymbol(scale[i % 7], qualities[i % 7]));
}

function progressionNumerals(modeKey, prog) {
    return prog.indices.map(i => romanNumerals[modeKey][i % 7]);
}

function updateProgressions() {
    if (!selectedKey) return;

    const currentScale = getCurrentScale();
    const qualities = chordQualities[selectedMode];

    let progressionsSection = document.getElementById('progressions-section-dynamic');
    if (!progressionsSection) {
        progressionsSection = document.createElement('div');
        progressionsSection.id = 'progressions-section-dynamic';
        progressionsSection.className = 'panel';
        document.getElementById('results-grid').appendChild(progressionsSection);
    }
    progressionsSection.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'suggested progressions';
    const heading = document.createElement('h3');
    heading.textContent = 'Chord Progressions';
    const list = document.createElement('div');
    list.className = 'progressions-list';
    progressionsSection.append(title, heading, list);

    commonProgressions.forEach(prog => {
        const chip = document.createElement('div');
        chip.className = 'progression-chip';
        const chords = document.createElement('div');
        chords.textContent = progressionChords(currentScale, qualities, prog).join(' → ');
        const label = document.createElement('span');
        label.className = 'progression-label';
        label.textContent = `${prog.name} (${progressionNumerals(selectedMode, prog).join('-')})`;
        chip.append(chords, label);
        list.appendChild(chip);
    });
}

// ───────────────────────────────────────────
// PROGRESSION PLANNER PAGE
// ───────────────────────────────────────────

function updateProgressionPage() {
    const keyContainer = document.getElementById('prog-key-buttons');
    keyContainer.innerHTML = '';
    Object.keys(majorScales).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'prog-key-btn' + (key === progKey ? ' active' : '');
        btn.textContent = key;
        btn.onclick = () => { progKey = key; updateProgressionPage(); };
        keyContainer.appendChild(btn);
    });

    const modeContainer = document.getElementById('prog-mode-buttons');
    modeContainer.innerHTML = '';
    Object.entries(modes).forEach(([modeKey, modeData]) => {
        const btn = document.createElement('button');
        btn.className = 'prog-mode-btn' + (modeKey === progMode ? ' active' : '');
        btn.textContent = modeData.name;
        btn.onclick = () => { progMode = modeKey; updateProgressionPage(); };
        modeContainer.appendChild(btn);
    });

    const container = document.getElementById('prog-available-chords');
    if (!progKey) {
        // inherit the detector's selection if there is one
        if (selectedKey) {
            progKey = selectedKey;
            progMode = selectedMode;
            updateProgressionPage();
            return;
        }
        container.innerHTML = '';
        const hint = document.createElement('span');
        hint.className = 'prog-hint';
        hint.textContent = 'select a key above';
        container.appendChild(hint);
        return;
    }

    const baseScale = majorScales[progKey];
    const mode = modes[progMode];
    const scale = [];
    for (let i = 0; i < 7; i++) {
        scale.push(baseScale[(mode.degree + i) % 7]);
    }
    const qualities = chordQualities[progMode];

    container.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const symbol = getChordSymbol(scale[i], qualities[i]);
        const btn = document.createElement('button');
        btn.className = 'prog-chord-btn';
        btn.textContent = symbol;
        btn.onclick = () => addChordToProgression(symbol);
        container.appendChild(btn);
    }

    const commonList = document.getElementById('common-progressions-list');
    commonList.innerHTML = '';
    commonProgressions.forEach(prog => {
        const chordNames = progressionChords(scale, qualities, prog);
        const item = document.createElement('div');
        item.className = 'prog-common-item';
        const chords = document.createElement('div');
        chords.textContent = chordNames.join(' → ');
        const label = document.createElement('span');
        label.className = 'prog-common-label';
        label.textContent = `${prog.name} (${progressionNumerals(progMode, prog).join('-')})`;
        item.append(chords, label);
        item.onclick = () => {
            currentProgression = [...chordNames];
            renderProgressionBar();
            saveState();
        };
        commonList.appendChild(item);
    });
}

// ───────────────────────────────────────────
// PROGRESSION BUILDER + PERSISTENCE
// ───────────────────────────────────────────

function addChordToProgression(chordName) {
    currentProgression.push(chordName);
    renderProgressionBar();
    saveState();
}

function removeChordFromProgression(index) {
    currentProgression.splice(index, 1);
    renderProgressionBar();
    saveState();
}

function clearProgression() {
    currentProgression = [];
    renderProgressionBar();
    saveState();
}

function saveProgression() {
    if (currentProgression.length === 0) return;
    savedProgressions.push([...currentProgression]);
    localStorage.setItem('msi_progressions', JSON.stringify(savedProgressions));
    currentProgression = [];
    renderProgressionBar();
    renderSavedProgressions();
    saveState();
}

function deleteSavedProgression(index) {
    savedProgressions.splice(index, 1);
    localStorage.setItem('msi_progressions', JSON.stringify(savedProgressions));
    renderSavedProgressions();
}

function renderProgressionBar() {
    const slots = document.getElementById('progression-slots');
    slots.innerHTML = '';
    if (currentProgression.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'progression-empty';
        empty.textContent = 'click a chord below to add it here!';
        slots.appendChild(empty);
        return;
    }
    currentProgression.forEach((chord, i) => {
        const slot = document.createElement('span');
        slot.className = 'prog-slot';
        slot.textContent = chord;
        slot.title = 'click to remove';
        slot.onclick = () => removeChordFromProgression(i);
        slots.appendChild(slot);

        if (i < currentProgression.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'prog-arrow';
            arrow.textContent = ' → ';
            slots.appendChild(arrow);
        }
    });
}

function renderSavedProgressions() {
    const container = document.getElementById('saved-progressions');
    container.innerHTML = '';
    savedProgressions.forEach((prog, i) => {
        const item = document.createElement('div');
        item.className = 'saved-prog-item';
        const chords = document.createElement('span');
        chords.className = 'saved-prog-chords';
        chords.textContent = prog.join(' → ');
        const del = document.createElement('button');
        del.className = 'saved-prog-delete';
        del.textContent = '✕';
        del.onclick = () => deleteSavedProgression(i);
        item.append(chords, del);
        container.appendChild(item);
    });
}

function saveState() {
    localStorage.setItem('msi_state', JSON.stringify({
        selectedNotes: selectedNotes,
        selectedKey: selectedKey,
        selectedMode: selectedMode,
        octaves: currentOctaves,
        currentProgression: currentProgression
    }));
}

function loadState() {
    // phones default to 1 octave so the piano fits without endless scrolling
    const defaultOctaves = window.matchMedia('(max-width: 600px)').matches ? 1 : 2;
    currentOctaves = defaultOctaves;

    const saved = localStorage.getItem('msi_state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            selectedNotes = sanitizeNotes(state.selectedNotes);
            selectedKey = majorScales[state.selectedKey] ? state.selectedKey : null;
            selectedMode = modes[state.selectedMode] ? state.selectedMode : 'Ionian';
            currentOctaves = [1, 2, 3].includes(state.octaves) ? state.octaves : defaultOctaves;
            currentProgression = sanitizeProgression(state.currentProgression);
        } catch (e) {
            // corrupt state — start fresh
        }
    }

    const savedProgs = localStorage.getItem('msi_progressions');
    if (savedProgs) {
        try {
            const parsed = JSON.parse(savedProgs);
            savedProgressions = Array.isArray(parsed)
                ? parsed.map(sanitizeProgression).filter(p => p.length > 0)
                : [];
        } catch (e) {
            savedProgressions = [];
        }
    }

    generatePiano(currentOctaves);
    document.querySelectorAll('.octave-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.octaves, 10) === currentOctaves);
    });

    renderProgressionBar();
    renderSavedProgressions();

    if (selectedNotes.length > 0) {
        updateVisualDisplay();
        findKeys();
    } else {
        document.getElementById('results').classList.add('hidden');
        applyKeyColor(null);
    }
}

// ───────────────────────────────────────────
// INSTRUMENT BUILDERS
// ───────────────────────────────────────────

function setOctaves(num) {
    currentOctaves = num;
    document.querySelectorAll('.octave-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.octaves, 10) === num);
    });
    generatePiano(num);
    updateVisualDisplay();
    if (selectedKey) highlightScaleOnInstruments(getCurrentScale(), getCurrentRoot());
    saveState();
}

function generatePiano(numOctaves) {
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];

    // keys shrink as octave count grows — big and proud, the piano is the hero
    const keyWidths = { 1: 74, 2: 58, 3: 42 };
    const keyHeights = { 1: 210, 2: 185, 3: 150 };
    const fontSizes = { 1: 15, 2: 13, 3: 11 };
    const blackFontSizes = { 1: 12, 2: 10, 3: 8 };

    // fit the keyboard to its column (min 30px keys, then it scrolls)
    const bench = document.querySelector('.bench-left');
    const available = (bench && bench.clientWidth > 0 ? bench.clientWidth : Math.min(document.documentElement.clientWidth, 1120) - 40) - 20;
    const fitted = Math.floor(available / (7 * numOctaves));
    const ww = Math.max(30, Math.min(keyWidths[numOctaves] || 32, fitted));
    const wh = Math.round((keyHeights[numOctaves] || 120) * (ww / (keyWidths[numOctaves] || 32)) * 0.5 + (keyHeights[numOctaves] || 120) * 0.5);
    const bw = Math.max(14, Math.round(ww * 0.44));
    const bh = Math.round(wh * 0.58);
    const fs = fontSizes[numOctaves] || 10;
    const bfs = blackFontSizes[numOctaves] || 8;

    const octaveWidth = ww * 7;
    // black key offsets within one octave, centered between white keys
    const blackOffsets = [
        ww * 1 - bw / 2 - 2,      // C#
        ww * 2 - bw / 2 - 2,      // D#
        ww * 4 - bw / 2 - 2,      // F#
        ww * 5 - bw / 2 - 2,      // G#
        ww * 6 - bw / 2 - 2       // A#
    ];

    const keysDiv = document.getElementById('piano-keys');
    keysDiv.innerHTML = '';
    keysDiv.style.width = (octaveWidth * numOctaves) + 'px';
    keysDiv.style.height = wh + 'px';

    const whiteKeysDiv = document.createElement('div');
    whiteKeysDiv.className = 'white-keys';
    const blackKeysDiv = document.createElement('div');
    blackKeysDiv.className = 'black-keys';
    blackKeysDiv.style.height = bh + 'px';

    // starts at octave 4 (middle C)
    for (let oct = 0; oct < numOctaves; oct++) {
        const octaveNum = 4 + oct;
        whiteNotes.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'white-key';
            btn.textContent = note;
            btn.onclick = () => toggleNote(note, octaveNum);
            btn.style.width = ww + 'px';
            btn.style.height = wh + 'px';
            btn.style.fontSize = fs + 'px';
            whiteKeysDiv.appendChild(btn);
        });

        blackNotes.forEach((note, i) => {
            const btn = document.createElement('button');
            btn.className = 'black-key';
            btn.textContent = note;
            btn.onclick = () => toggleNote(note, octaveNum);
            btn.style.left = (blackOffsets[i] + oct * octaveWidth) + 'px';
            btn.style.width = bw + 'px';
            btn.style.height = bh + 'px';
            btn.style.fontSize = bfs + 'px';
            blackKeysDiv.appendChild(btn);
        });
    }

    keysDiv.appendChild(whiteKeysDiv);
    keysDiv.appendChild(blackKeysDiv);
}

function generateGuitar() {
    const container = document.getElementById('guitar-strings');
    container.innerHTML = '';

    guitarStrings.forEach(string => {
        const row = document.createElement('div');
        row.className = 'guitar-string';
        row.dataset.string = string.open;

        const name = document.createElement('div');
        name.className = 'string-name';
        const line = document.createElement('div');
        line.className = 'string-line';
        row.append(name, line);

        for (let fret = 0; fret <= 12; fret++) {
            const note = SHARP_NAMES[(string.pitch + fret) % 12];
            // octave bumps when the pitch wraps past B
            const octave = string.octave + Math.floor((string.pitch + fret) / 12);
            const dot = document.createElement('button');
            dot.className = 'fret-dot';
            dot.dataset.fret = fret;
            dot.textContent = note;
            if (fret === 0) dot.title = `open ${string.open}${string.octave} string`;
            dot.onclick = () => toggleNote(note, octave);
            row.appendChild(dot);
        }
        container.appendChild(row);
    });
}

// ───────────────────────────────────────────
// WEB AUDIO — sine piano, triangle + harmonics guitar
// ───────────────────────────────────────────

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function isGuitarActive() {
    const guitarTab = document.getElementById('guitar-tab');
    return guitarTab && !guitarTab.classList.contains('hidden');
}

function playPianoSound(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.8);
}

function playGuitarSound(freq) {
    const t = audioCtx.currentTime;
    const partials = [
        { mult: 1, type: 'triangle', gain: 0.35, decay: 1.5 },
        { mult: 2, type: 'sine', gain: 0.12, decay: 0.8 },
        { mult: 3, type: 'sine', gain: 0.05, decay: 0.5 },
    ];
    partials.forEach(p => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = p.type;
        osc.frequency.setValueAtTime(freq * p.mult, t);
        gain.gain.setValueAtTime(p.gain, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + p.decay);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + p.decay);
    });
}

function playNote(noteName, octave = 4) {
    const baseFreq = noteFrequencies[noteName];
    if (!baseFreq) return;

    // autoplay policy: the context is born suspended until a user gesture
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const freq = baseFreq * Math.pow(2, octave - 4);
    if (isGuitarActive()) {
        playGuitarSound(freq);
    } else {
        playPianoSound(freq);
    }
}

// ───────────────────────────────────────────
// QWERTY KEYBOARD — plays notes without selecting them
// ───────────────────────────────────────────

document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.repeat) return;

    const note = keyboardMap[e.key.toLowerCase()];
    if (!note) return;

    playNote(note, 4);
    // flash only the first matching key (first octave)
    const allKeys = document.querySelectorAll('.white-key, .black-key');
    for (const el of allKeys) {
        if (el.textContent.trim() === note) {
            el.classList.add('keyboard-active');
            setTimeout(() => el.classList.remove('keyboard-active'), 200);
            break;
        }
    }
});

// ───────────────────────────────────────────
// SONG SUGGESTIONS — Spotify embed player
// ───────────────────────────────────────────

function updateSongSuggestions() {
    const strip = document.getElementById('songs-strip');
    const nowPlaying = document.getElementById('now-playing');
    if (!strip || !nowPlaying) return;
    nowPlaying.innerHTML = '';

    if (!selectedKey) {
        strip.classList.add('hidden');
        return;
    }
    strip.classList.remove('hidden');

    const songs = songDatabase[selectedKey] || [];
    if (songs.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'songs-empty';
        empty.textContent = `no songs for ${selectedKey} yet — soon.`;
        nowPlaying.appendChild(empty);
        return;
    }

    dockSongs = songs;
    dockIndex = -1;
    songs.forEach((song, i) => {
        const track = document.createElement('div');
        track.className = 'player-track';
        track.dataset.index = i;
        const info = document.createElement('div');
        info.className = 'track-info';
        const title = document.createElement('div');
        title.className = 'track-title';
        title.textContent = song.title;
        const artist = document.createElement('div');
        artist.className = 'track-artist';
        artist.textContent = song.artist;
        info.append(title, artist);
        const play = document.createElement('div');
        play.className = 'track-play-btn';
        play.textContent = '▶ play';
        track.append(info, play);
        track.onclick = () => dockPlay(i);
        nowPlaying.appendChild(track);
    });
}

// ───────────────────────────────────────────
// THE IPOD — songs play in the dock; the wheel walks the tracklist
// ───────────────────────────────────────────

let dockSongs = [];
let dockIndex = -1;

function dockPlay(index) {
    const song = dockSongs[index];
    if (!song || !/^[A-Za-z0-9]+$/.test(song.sp)) return;
    dockIndex = index;

    document.querySelectorAll('.player-track').forEach(t => {
        t.classList.toggle('playing', parseInt(t.dataset.index, 10) === index);
    });

    document.getElementById('dock-frame').src = `https://open.spotify.com/embed/track/${song.sp}?theme=0`;
    document.getElementById('dock-label').textContent = `♪ ${song.title.toLowerCase()}`;
    document.getElementById('dock').classList.remove('collapsed');
}

function dockStep(direction) {
    if (dockSongs.length === 0) return;
    dockPlay((dockIndex + direction + dockSongs.length) % dockSongs.length);
}

// ───────────────────────────────────────────
// THEME
// ───────────────────────────────────────────

function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    document.getElementById('theme-toggle').textContent = dark ? '☀️' : '🌙';
}

// ───────────────────────────────────────────
// INIT
// ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            showPage(el.dataset.page);
        });
    });

    document.querySelectorAll('.pick').forEach(tab => {
        tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });

    document.querySelectorAll('.octave-btn').forEach(btn => {
        btn.addEventListener('click', () => setOctaves(parseInt(btn.dataset.octaves, 10)));
    });

    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', () => showBlogPost(card.dataset.post));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showBlogPost(card.dataset.post); }
        });
    });
    document.querySelectorAll('.blog-back').forEach(btn => {
        btn.addEventListener('click', showBlogIndex);
    });

    document.getElementById('clear-notes-btn').addEventListener('click', clearNotes);
    document.getElementById('clear-prog-btn').addEventListener('click', clearProgression);
    document.getElementById('save-prog-btn').addEventListener('click', saveProgression);

    const dock = document.getElementById('dock');
    document.getElementById('dock-menu').addEventListener('click', () => dock.classList.toggle('collapsed'));
    document.getElementById('dock-bar').addEventListener('click', () => dock.classList.toggle('collapsed'));
    document.getElementById('dock-center').addEventListener('click', () => dock.classList.remove('collapsed'));
    document.getElementById('dock-prev').addEventListener('click', () => dockStep(-1));
    document.getElementById('dock-next').addEventListener('click', () => dockStep(1));

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const dark = !document.body.classList.contains('dark-mode');
        applyTheme(dark);
        localStorage.setItem('msi_theme', dark ? 'dark' : 'light');
    });
    applyTheme(localStorage.getItem('msi_theme') === 'dark');

    generateGuitar();
    loadState();
    appReady = true;
});

// rebuild the piano when the viewport changes (rotation, resize)
let _resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
        generatePiano(currentOctaves);
        updateVisualDisplay();
        if (selectedKey) highlightScaleOnInstruments(getCurrentScale(), getCurrentRoot());
    }, 150);
});
