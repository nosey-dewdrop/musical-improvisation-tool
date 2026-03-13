// find theme-toggle id labeled button.
const themeToggle = document.getElementById("theme-toggle");

const body = document.body;

themeToggle.addEventListener("click",
    function() {
        // from my css classes, get every element with label dark-mode
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            themeToggle.textContent = "☀️ Light Mode";
        }
        else {
            themeToggle.textContent = "🌙 Dark Mode";
        }

    }
);


// a function where i can switch between two instruments.
// they are shaped with css due to their organisations.
function showTab(choice) {

    document.querySelectorAll(".pick").forEach(tab => {
        tab.classList.remove("active");
    });

    if (choice === "piano") {
        document.querySelector(".tab-piano").classList.add("active");
    }
    else {
        document.querySelector(".tab-guitar").classList.add("active");
    }

    document.getElementById("piano-tab").classList.add("hidden");
    document.getElementById("guitar-tab").classList.add("hidden");

    if (choice === "piano") {
        document.getElementById("piano-tab").classList.remove("hidden");
    }
    else {
        document.getElementById("guitar-tab").classList.remove("hidden");
    }
}

let selectedNotes = [];

// in html, onclick's were labeled with toggleNote
function toggleNote(noteName) {
    console.log(noteName + " picked!!");

    // delete the note if it is already picked.
    if (selectedNotes.includes(noteName)) {
        let index = selectedNotes.indexOf(noteName);
        if (index > -1) {
            selectedNotes.splice(index, 1);
        }
    }

    // add a note if it is not on the selected notes list.
    else {
        selectedNotes.push(noteName);
    }

    console.log("all the notes: " + selectedNotes.join(", "))
    updateVisualDisplay();
    findKeys();
}

function updateVisualDisplay() {
    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(element => {
    element.classList.remove('selected');
    });

    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(element => {
        const noteName = element.textContent.trim();

        if (selectedNotes.includes(noteName)) {
            element.classList.add('selected');
        }
    });

    if (selectedNotes.length > 0) {
        document.getElementById('notes-display').textContent = selectedNotes.join(' - ');
    }
    else {
        document.getElementById('notes-display').textContent = '';
    }

    console.log("🎨 updated!!");
}

function testNotes() {
    console.log("testing: ");
    toggleNote('C');
    toggleNote('E');
    toggleNote('G');
    console.log('🎹 C major note picked!!');
}

// ═══════════════════════════════════════════
// ALL 12 MAJOR SCALES (eksik 5 tane eklendi)
// circle of fifths order: C G D A E B F# Gb Db Ab Eb Bb F
// ═══════════════════════════════════════════

let majorScales = {
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

let selectedKey = null;
let selectedMode = 'Ionian';

// ═══════════════════════════════════════════
// ENHARMONIC FIX — iki yönlü dönüşüm
// böylece Bb scale'deki Eb ile kullanıcının seçtiği D# eşleşir
// ═══════════════════════════════════════════

const enharmonicMap = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'E#': 'F',  'Fb': 'E',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
    'B#': 'C',  'Cb': 'B'
};

// her notayı 0-11 arası sayıya çevir, böylece enharmonic karşılaştırma kesin olur
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

function normalizeNote(note) {
    const enharmonics = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
        'E#': 'F', 'B#': 'C', 'Fb': 'E', 'Cb': 'B'
    };
    return enharmonics[note] || note;
}

// pitch-based karşılaştırma: enharmonic farketmez
function scaleContainsNotes(scale, notes) {
    const scalePitches = scale.map(noteToPitch);
    const notePitches = notes.map(noteToPitch);
    return notePitches.every(p => scalePitches.includes(p));
}

function clearNotes() {
    selectedNotes = [];
    selectedKey = null;
    selectedMode = 'Ionian';
    updateVisualDisplay();

    document.getElementById('results').classList.add('hidden');
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
    const mode = modes[selectedMode];
    return majorScales[selectedKey][mode.degree];
}

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

    // eğer seçili key artık possible değilse, ilkine geç
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
        btn.className = 'key-btn';
        if (key === selectedKey) btn.classList.add('active');
        btn.innerHTML = `<div style="font-size: 1.2rem; font-weight: bold;">${key}</div><div>Major</div>`;
        btn.onclick = () => selectKey(key);
        keysGrid.appendChild(btn);
    });

    if (selectedKey) {
        updateModes();
        updateScaleInfo();
    }
}

function selectKey(key) {
    selectedKey = key;
    selectedMode = 'Ionian';
    updateVisualDisplay();
    findKeys();
}

// ═══════════════════════════════════════════
// updateModes — 7 mode'u göster, seçilebilir yap
// ═══════════════════════════════════════════

function updateModes() {
    const modesSection = document.getElementById('modes-section');
    const modesGrid = document.getElementById('modes-grid');

    modesSection.classList.remove('hidden');
    modesGrid.innerHTML = '';

    Object.entries(modes).forEach(([modeKey, modeData]) => {
        const btn = document.createElement('button');
        btn.className = 'mode-btn';
        if (modeKey === selectedMode) btn.classList.add('active');

        // mode'un root notasını hesapla
        const baseScale = majorScales[selectedKey];
        const modeRoot = baseScale[modeData.degree];

        btn.innerHTML = `
            <div style="font-weight: bold;">${modeRoot} ${modeData.name}</div>
            <div class="mode-desc">${modeData.description}</div>
        `;

        btn.onclick = () => {
            selectedMode = modeKey;
            updateModes();
            updateScaleInfo();
        };

        modesGrid.appendChild(btn);
    });
}

// ═══════════════════════════════════════════
// updateScaleInfo — seçili mode'un scale notalarını göster
// + piano/gitar üzerinde highlight yap
// ═══════════════════════════════════════════

function updateScaleInfo() {
    const scaleInfoDiv = document.getElementById('scale-info');
    const scaleTitleEl = document.getElementById('scale-title');
    const scaleNotesEl = document.getElementById('scale-notes');

    scaleInfoDiv.classList.remove('hidden');

    const currentScale = getCurrentScale();
    const rootNote = getCurrentRoot();
    const modeData = modes[selectedMode];

    scaleTitleEl.textContent = `🎵 ${rootNote} ${modeData.name}  —  "${modeData.description}"`;

    // scale notalarını göster
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

    // piano ve gitar tuşlarını highlight et
    highlightScaleOnInstruments(currentScale, rootNote);
}

function highlightScaleOnInstruments(scale, rootNote) {
    // önce eski scale/root class'larını temizle
    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(el => {
        el.classList.remove('scale', 'root');
    });

    const scalePitches = scale.map(noteToPitch);
    const rootPitch = noteToPitch(rootNote);

    document.querySelectorAll('.white-key, .black-key, .fret-dot').forEach(el => {
        const elNote = el.textContent.trim();
        const elPitch = noteToPitch(elNote);

        if (elPitch === rootPitch) {
            el.classList.add('root');
        } else if (scalePitches.includes(elPitch)) {
            el.classList.add('scale');
        }
    });
}

// ═══════════════════════════════════════════
// DIATONIC CHORDS — her scale degree için triad
// Major scale: I ii iii IV V vi vii°
// ═══════════════════════════════════════════

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

// triad notalarını hesapla (1-3-5 of scale from that degree)
function getTriadNotes(scale, degreeIndex) {
    return [
        scale[degreeIndex % 7],
        scale[(degreeIndex + 2) % 7],
        scale[(degreeIndex + 4) % 7]
    ];
}

function getChordSymbol(rootNote, quality) {
    if (quality === 'Major') return rootNote;
    if (quality === 'minor') return rootNote + 'm';
    if (quality === 'dim') return rootNote + '°';
    return rootNote;
}

function updateChords() {
    if (!selectedKey) return;

    const currentScale = getCurrentScale();
    const qualities = chordQualities[selectedMode];
    const numerals = romanNumerals[selectedMode];

    // chords container — yoksa oluştur
    let chordsSection = document.getElementById('chords-section-dynamic');
    if (!chordsSection) {
        chordsSection = document.createElement('div');
        chordsSection.id = 'chords-section-dynamic';
        // scale-info'dan sonra ekle
        const scaleInfo = document.getElementById('scale-info');
        scaleInfo.parentNode.insertBefore(chordsSection, scaleInfo.nextSibling);
    }

    chordsSection.innerHTML = `<h3>★ Diatonic Chords</h3><div class="chords-grid" id="chords-grid-dynamic"></div>`;
    const grid = document.getElementById('chords-grid-dynamic');

    for (let i = 0; i < 7; i++) {
        const triadNotes = getTriadNotes(currentScale, i);
        const chordRoot = currentScale[i];
        const quality = qualities[i];
        const numeral = numerals[i];

        const card = document.createElement('div');
        card.className = 'chord-card';
        card.innerHTML = `
            <div class="chord-degree">${numeral}</div>
            <div class="chord-name">${getChordSymbol(chordRoot, quality)}</div>
            <div class="chord-quality">${quality}</div>
            <div class="chord-notes-display">${triadNotes.join(' - ')}</div>
        `;
        grid.appendChild(card);
    }
}

// ═══════════════════════════════════════════
// CHORD PROGRESSIONS — yaygın akor yürüyüşleri
// ═══════════════════════════════════════════

const commonProgressions = [
    { numerals: ['I', 'V', 'vi', 'IV'], name: 'Pop Classic', indices: [0, 4, 5, 3] },
    { numerals: ['I', 'IV', 'V', 'I'], name: 'Blues / Rock', indices: [0, 3, 4, 0] },
    { numerals: ['ii', 'V', 'I'], name: 'Jazz ii-V-I', indices: [1, 4, 0] },
    { numerals: ['I', 'vi', 'IV', 'V'], name: '50s Doo-Wop', indices: [0, 5, 3, 4] },
    { numerals: ['vi', 'IV', 'I', 'V'], name: 'Sad Pop', indices: [5, 3, 0, 4] },
    { numerals: ['I', 'IV', 'vi', 'V'], name: 'Anthem', indices: [0, 3, 5, 4] },
    { numerals: ['I', 'V', 'vi', 'iii', 'IV'], name: 'Canon', indices: [0, 4, 5, 2, 3] },
    { numerals: ['i', 'VI', 'III', 'VII'], name: 'Andalusian', indices: [0, 5, 2, 6] },
];

function updateProgressions() {
    if (!selectedKey) return;

    const currentScale = getCurrentScale();
    const qualities = chordQualities[selectedMode];

    // progressions container — yoksa oluştur
    let progressionsSection = document.getElementById('progressions-section-dynamic');
    if (!progressionsSection) {
        progressionsSection = document.createElement('div');
        progressionsSection.id = 'progressions-section-dynamic';
        const chordsSection = document.getElementById('chords-section-dynamic');
        if (chordsSection) {
            chordsSection.parentNode.insertBefore(progressionsSection, chordsSection.nextSibling);
        }
    }

    progressionsSection.innerHTML = `<h3>★ Chord Progressions</h3><div class="progressions-list" id="progressions-list-dynamic"></div>`;
    const list = document.getElementById('progressions-list-dynamic');

    commonProgressions.forEach(prog => {
        const chordNames = prog.indices.map(i => {
            const root = currentScale[i % 7];
            const quality = qualities[i % 7];
            return getChordSymbol(root, quality);
        });

        const chip = document.createElement('div');
        chip.className = 'progression-chip';
        chip.innerHTML = `
            <div>${chordNames.join(' → ')}</div>
            <span class="progression-label">${prog.name} (${prog.numerals.join('-')})</span>
        `;
        list.appendChild(chip);
    });
}

// updateScaleInfo'yu güncelle — chord ve progression de çağırsın
const _originalUpdateScaleInfo = updateScaleInfo;
updateScaleInfo = function() {
    _originalUpdateScaleInfo();
    updateChords();
    updateProgressions();
};

// sayfa yüklendiğinde results gizli olsun
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('results').classList.add('hidden');
});
