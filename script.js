
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️ Light Mode';
    } 
    
    else {
        themeToggle.textContent = '🌙 Dark Mode';
    }

});

function showTab(choice) {

    document.querySelectorAll('.pick').forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (choice === 'piano') {
        document.querySelector('.tab-piano').classList.add('active');
    } 
    else {
        document.querySelector('.tab-guitar').classList.add('active');
    }
    
    document.getElementById('piano-tab').classList.add('hidden');
    document.getElementById('guitar-tab').classList.add('hidden');
    
    if (choice === 'piano') {
        document.getElementById('piano-tab').classList.remove('hidden');
    } 
    else {
        document.getElementById('guitar-tab').classList.remove('hidden');
    }
}