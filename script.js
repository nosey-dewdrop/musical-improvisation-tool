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

let majorScales = {
    "C": ["C", "D", "E", "F", "G", "A", "B"],
    "G": ["G", "A", "B", "C", "D", "E", "F#"],
    "D": ["D", "E", "F#", "G", "A", "B", "C#"],
    "A": ["A", "B", "C#", "D", "E", "F#", "G#"],
    "E": ["E", "F#", "G#", "A", "B", "C#", "D#"],
    "F": ["F", "G", "A", "Bb", "C", "D", "E"],
    "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"]
};

const modes = {
    'Ionian': { name: 'Major (Ionian)', degree: 0, description: 'Happy, bright.' },
    'Dorian': { name: 'Dorian', degree: 1, description: 'Minor with a twist.' },
    'Phrygian': { name: 'Phrygian', degree: 2, description: 'Dark, Spanish.' },
    'Lydian': { name: 'Lydian', degree: 3, description: 'Dreamy, floating.' },
    'Mixolydian': { name: 'Mixolydian', degree: 4, description: 'Bluesy, dominant.' },
    'Aeolian': { name: 'Natural Minor', degree: 5, description: 'Sad, emotional.' },
    'Locrian': { name: 'Locrian', degree: 6, description: 'Unstable, rare.' }
};

let selectedKey = null;
let selectedMode = 'Ionian';

function normalizeNote(note) {
    const enharmonics = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    return enharmonics[note] || note;
}

function scaleContainsNotes(scale, notes) {
    const normalizedScale = scale.map(normalizeNote);
    const normalizedNotes = notes.map(normalizeNote);
    return normalizedNotes.every(note => normalizedScale.includes(note));
}

function clearNotes() {
    selectedNotes = [];
    selectedKey = null;
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
    return normalizeNote(majorScales[selectedKey][mode.degree]);
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
    updateVisualDisplay();
    findKeys();
}