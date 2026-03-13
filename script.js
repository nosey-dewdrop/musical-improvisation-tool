// find theme-toggle id labeled button.
const themeToggle = document.getElementById("theme-toggle");

const body = document.body;

themeToggle.addEventListener("click",
    function() {
        // from my css classes, get every element with label dark-mode
        body.classList.toggle("dark-mode");

        if (body.classList.contains("dark-mode")) {
            themeToggle.textContent = "☀️";
        }
        else {
            themeToggle.textContent = "🌙";
        }

    }
);

// ═══════════════════════════════════════════
// PAGE NAVIGATION — navbar sayfa geçişi
// ═══════════════════════════════════════════

function showPage(page) {
    // tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    // seçilen sayfayı göster
    document.getElementById('page-' + page).classList.remove('hidden');
    // nav linklerini güncelle
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    // progression sayfasındaysa available chords güncelle
    if (page === 'progressions') {
        updateProgressionPage();
    }
}

// progression page için ayrı key/mode state
let progKey = null;
let progMode = 'Ionian';

function updateProgressionPage() {
    // key butonları oluştur
    const keyContainer = document.getElementById('prog-key-buttons');
    if (keyContainer) {
        keyContainer.innerHTML = '';
        Object.keys(majorScales).forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'prog-key-btn' + (key === progKey ? ' active' : '');
            btn.textContent = key;
            btn.onclick = () => { progKey = key; updateProgressionPage(); };
            keyContainer.appendChild(btn);
        });
    }

    // mode butonları oluştur
    const modeContainer = document.getElementById('prog-mode-buttons');
    if (modeContainer) {
        modeContainer.innerHTML = '';
        Object.entries(modes).forEach(([modeKey, modeData]) => {
            const btn = document.createElement('button');
            btn.className = 'prog-mode-btn' + (modeKey === progMode ? ' active' : '');
            btn.textContent = modeData.name;
            btn.onclick = () => { progMode = modeKey; updateProgressionPage(); };
            modeContainer.appendChild(btn);
        });
    }

    // available chords
    const container = document.getElementById('prog-available-chords');
    if (!progKey) {
        // detector'dan seçilmiş key varsa onu kullan
        if (selectedKey) {
            progKey = selectedKey;
            progMode = selectedMode;
            updateProgressionPage();
            return;
        }
        container.innerHTML = '<span class="prog-hint">select a key above</span>';
        return;
    }

    // progKey ve progMode ile scale hesapla
    const baseScale = majorScales[progKey];
    const mode = modes[progMode];
    const scale = [];
    for (let i = 0; i < 7; i++) {
        scale.push(baseScale[(mode.degree + i) % 7]);
    }
    const qualities = chordQualities[progMode];

    container.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const chordRoot = scale[i];
        const quality = qualities[i];
        const symbol = getChordSymbol(chordRoot, quality);
        const btn = document.createElement('button');
        btn.className = 'prog-chord-btn';
        btn.textContent = symbol;
        btn.onclick = () => addChordToProgression(symbol);
        container.appendChild(btn);
    }

    // common progressions
    const commonList = document.getElementById('common-progressions-list');
    if (commonList) {
        commonList.innerHTML = '';
        commonProgressions.forEach(prog => {
            const chordNames = prog.indices.map(idx => {
                const root = scale[idx % 7];
                const q = qualities[idx % 7];
                return getChordSymbol(root, q);
            });
            const item = document.createElement('div');
            item.className = 'prog-common-item';
            item.innerHTML = `<div>${chordNames.join(' → ')}</div><span class="prog-common-label">${prog.name} (${prog.numerals.join('-')})</span>`;
            item.onclick = () => {
                currentProgression = [...chordNames];
                renderProgressionBar();
            };
            commonList.appendChild(item);
        });
    }
}


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
    saveState();
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
    // chords ve progressions temizle
    const chords = document.getElementById('chords-section-dynamic');
    const progs = document.getElementById('progressions-section-dynamic');
    if (chords) chords.remove();
    if (progs) progs.remove();
    saveState();
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
    } else {
        // 0 key bulundu — eski sonuçları gizle
        document.getElementById('modes-section').classList.add('hidden');
        document.getElementById('scale-info').classList.add('hidden');
        const chords = document.getElementById('chords-section-dynamic');
        const progs = document.getElementById('progressions-section-dynamic');
        if (chords) chords.remove();
        if (progs) progs.remove();
    }
}

function selectKey(key) {
    selectedKey = key;
    selectedMode = 'Ionian';
    updateVisualDisplay();
    findKeys();
    saveState();
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
            saveState();
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

let currentChordType = 'triad';

function setChordType(type) {
    currentChordType = type;
    document.querySelectorAll('.chord-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(type));
    });
    updateChords();
}

// 7th chord qualities per mode
const seventhQualities = {
    'Ionian':     ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
    'Dorian':     ['m7', 'm7', 'maj7', '7', 'm7', 'm7b5', 'maj7'],
    'Phrygian':   ['m7', 'maj7', '7', 'm7', 'm7b5', 'maj7', 'm7'],
    'Lydian':     ['maj7', '7', 'm7', 'm7b5', 'maj7', 'm7', 'm7'],
    'Mixolydian': ['7', 'm7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7'],
    'Aeolian':    ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'],
    'Locrian':    ['m7b5', 'maj7', 'm7', 'm7', 'maj7', '7', 'm7']
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
        // results-grid'e panel olarak ekle
        chordsSection.className = 'panel';
        const resultsGrid = document.getElementById('results-grid');
        resultsGrid.appendChild(chordsSection);
    }

    // tab butonlarını güncelle
    const activeType = currentChordType;
    chordsSection.innerHTML = `<div class="panel-title">chords</div><h3>Diatonic Chords</h3><div class="chord-type-tabs"><button class="chord-type-btn ${activeType==='triad'?'active':''}" onclick="setChordType('triad')">Triads</button><button class="chord-type-btn ${activeType==='7th'?'active':''}" onclick="setChordType('7th')">7th</button><button class="chord-type-btn ${activeType==='sus'?'active':''}" onclick="setChordType('sus')">Sus</button></div><div class="chords-grid" id="chords-grid-dynamic"></div>`;
    const grid = document.getElementById('chords-grid-dynamic');

    const seventh = seventhQualities[selectedMode];

    for (let i = 0; i < 7; i++) {
        const chordRoot = currentScale[i];
        const quality = qualities[i];
        const numeral = numerals[i];
        let chordSymbol, chordQualityText, notesDisplay;

        if (currentChordType === 'triad') {
            const notes = getTriadNotes(currentScale, i);
            chordSymbol = getChordSymbol(chordRoot, quality);
            chordQualityText = quality;
            notesDisplay = notes.join(' - ');
        } else if (currentChordType === '7th') {
            const notes = [
                currentScale[i % 7],
                currentScale[(i + 2) % 7],
                currentScale[(i + 4) % 7],
                currentScale[(i + 6) % 7]
            ];
            const q = seventh[i];
            chordSymbol = chordRoot + q;
            chordQualityText = q;
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
        card.style.cursor = 'pointer';
        card.title = 'click to add to progression';
        card.innerHTML = `
            <div class="chord-degree">${numeral}</div>
            <div class="chord-name">${chordSymbol}</div>
            <div class="chord-quality">${chordQualityText}</div>
            <div class="chord-notes-display">${notesDisplay}</div>
        `;
        card.onclick = () => addChordToProgression(chordSymbol);
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
        progressionsSection.className = 'panel';
        const resultsGrid = document.getElementById('results-grid');
        resultsGrid.appendChild(progressionsSection);
    }

    progressionsSection.innerHTML = `<div class="panel-title">suggested progressions</div><h3>Chord Progressions</h3><div class="progressions-list" id="progressions-list-dynamic"></div>`;
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

// ═══════════════════════════════════════════
// PIANO OCTAVE GENERATOR
// ═══════════════════════════════════════════

let currentOctaves = 2;

function setOctaves(num) {
    currentOctaves = num;
    document.querySelectorAll('.octave-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === String(num));
    });
    generatePiano(num);
    updateVisualDisplay();
    if (selectedKey) highlightScaleOnInstruments(getCurrentScale(), getCurrentRoot());
    saveState();
}

function generatePiano(numOctaves) {
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#'];

    // oktav arttıkça tuşları küçült
    const keyWidths = { 1: 60, 2: 45, 3: 32 };
    const keyHeights = { 1: 180, 2: 150, 3: 120 };
    const blackHeights = { 1: 100, 2: 85, 3: 70 };
    const blackWidths = { 1: 25, 2: 20, 3: 16 };
    const fontSizes = { 1: 14, 2: 12, 3: 10 };
    const blackFontSizes = { 1: 12, 2: 10, 3: 8 };

    const ww = keyWidths[numOctaves] || 32;
    const wh = keyHeights[numOctaves] || 120;
    const bw = blackWidths[numOctaves] || 16;
    const bh = blackHeights[numOctaves] || 70;
    const fs = fontSizes[numOctaves] || 10;
    const bfs = blackFontSizes[numOctaves] || 8;

    // black key offsets within one octave (relative to white key positions)
    // C#: between C and D, D#: between D and E, F#: between F and G, G#: between G and A, A#: between A and B
    const octaveWidth = ww * 7;
    const blackOffsets = [
        ww * 1 - bw / 2 - 2,      // C#
        ww * 2 - bw / 2 - 2,      // D#
        ww * 4 - bw / 2 - 2,      // F#
        ww * 5 - bw / 2 - 2,      // G#
        ww * 6 - bw / 2 - 2       // A#
    ];

    const keysDiv = document.getElementById('piano-keys');
    keysDiv.innerHTML = '';

    const totalWidth = octaveWidth * numOctaves;
    keysDiv.style.width = totalWidth + 'px';
    keysDiv.style.height = wh + 'px';

    const whiteKeysDiv = document.createElement('div');
    whiteKeysDiv.className = 'white-keys';

    const blackKeysDiv = document.createElement('div');
    blackKeysDiv.className = 'black-keys';
    blackKeysDiv.style.height = bh + 'px';

    for (let oct = 0; oct < numOctaves; oct++) {
        whiteNotes.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'white-key';
            btn.textContent = note;
            btn.onclick = () => toggleNote(note);
            btn.style.width = ww + 'px';
            btn.style.height = wh + 'px';
            btn.style.fontSize = fs + 'px';
            whiteKeysDiv.appendChild(btn);
        });

        blackNotes.forEach((note, i) => {
            const btn = document.createElement('button');
            btn.className = 'black-key';
            btn.textContent = note;
            btn.onclick = () => toggleNote(note);
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

// ═══════════════════════════════════════════
// CHORD PROGRESSION PLANNER + LOCALSTORAGE
// ═══════════════════════════════════════════

let currentProgression = [];
let savedProgressions = [];

function addChordToProgression(chordName) {
    currentProgression.push(chordName);
    renderProgressionBar();
}

function removeChordFromProgression(index) {
    currentProgression.splice(index, 1);
    renderProgressionBar();
}

function clearProgression() {
    currentProgression = [];
    renderProgressionBar();
}

function saveProgression() {
    if (currentProgression.length === 0) return;
    savedProgressions.push([...currentProgression]);
    localStorage.setItem('msi_progressions', JSON.stringify(savedProgressions));
    currentProgression = [];
    renderProgressionBar();
    renderSavedProgressions();
}

function deleteSavedProgression(index) {
    savedProgressions.splice(index, 1);
    localStorage.setItem('msi_progressions', JSON.stringify(savedProgressions));
    renderSavedProgressions();
}

function renderProgressionBar() {
    const slots = document.getElementById('progression-slots');
    if (currentProgression.length === 0) {
        slots.innerHTML = '<span class="progression-empty">click a chord below to add it here!</span>';
        return;
    }
    slots.innerHTML = '';
    currentProgression.forEach((chord, i) => {
        const slot = document.createElement('span');
        slot.className = 'prog-slot';
        slot.innerHTML = chord;
        slot.title = 'click to remove';
        slot.onclick = () => removeChordFromProgression(i);
        slots.appendChild(slot);

        if (i < currentProgression.length - 1) {
            const arrow = document.createElement('span');
            arrow.textContent = ' → ';
            arrow.style.color = '#999';
            arrow.style.fontWeight = '700';
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
        item.innerHTML = `
            <span class="saved-prog-chords">${prog.join(' → ')}</span>
            <button class="saved-prog-delete" onclick="deleteSavedProgression(${i})">✕</button>
        `;
        container.appendChild(item);
    });
}

// saveState — nota seçimlerini kaydet
function saveState() {
    localStorage.setItem('msi_state', JSON.stringify({
        selectedNotes: selectedNotes,
        selectedKey: selectedKey,
        selectedMode: selectedMode,
        octaves: currentOctaves
    }));
}

function loadState() {
    // nota seçimlerini yükle
    const saved = localStorage.getItem('msi_state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            selectedNotes = state.selectedNotes || [];
            selectedKey = state.selectedKey || null;
            selectedMode = state.selectedMode || 'Ionian';
            currentOctaves = state.octaves || 1;
        } catch(e) {
            console.log('state parse error', e);
        }
    }

    // kaydedilmiş akor yürüyüşlerini yükle
    const savedProgs = localStorage.getItem('msi_progressions');
    if (savedProgs) {
        try {
            savedProgressions = JSON.parse(savedProgs) || [];
        } catch(e) {
            savedProgressions = [];
        }
    }

    // piano oluştur
    generatePiano(currentOctaves);

    // oktav butonunu güncelle
    document.querySelectorAll('.octave-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() === String(currentOctaves));
    });

    // kaydedilmiş yürüyüşleri göster
    renderSavedProgressions();

    if (selectedNotes.length > 0) {
        updateVisualDisplay();
        findKeys();
    } else {
        document.getElementById('results').classList.add('hidden');
    }
}

// sayfa yüklendiğinde state'i yükle
document.addEventListener('DOMContentLoaded', function() {
    loadState();
});
