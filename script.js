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
    console.log("🎨 updated!!");
}

function testNotes() {
    console.log("testing: ");
    toggleNote('C');
    toggleNote('E');
    toggleNote('G');
    console.log('🎹 C major note picked!!');
}