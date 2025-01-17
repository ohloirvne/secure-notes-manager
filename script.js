console.log("Secure Notes Manager loaded!");

// Select elements
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const notesList = document.getElementById('notes-list');

// Load notes from localStorage
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.forEach((note, index) => renderNote(note, index));
}

// Render a single note in the list
function renderNote(note, index) {
    const noteItem = document.createElement('li');
    noteItem.className = 'note-item';
    noteItem.innerHTML = `
        <span>${note}</span>
        <button class="delete-note-btn" data-index="${index}">Delete</button>
    `;
    notesList.appendChild(noteItem);
}

// Save a new note
function saveNote() {
    const noteText = noteInput.value.trim();
    if (!noteText) {
        alert('Please write something before adding a note.');
        return;
    }

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteText);
    localStorage.setItem('notes', JSON.stringify(notes));

    // Render the new note and clear the input
    renderNote(noteText, notes.length - 1);
    noteInput.value = '';
}

// Delete a note
function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1); // Remove the note at the specified index
    localStorage.setItem('notes', JSON.stringify(notes));

    // Re-render the list
    notesList.innerHTML = '';
    notes.forEach((note, idx) => renderNote(note, idx));
}

// Event listeners
addNoteBtn.addEventListener('click', saveNote);

notesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-note-btn')) {
        const index = e.target.dataset.index;
        deleteNote(index);
    }
});

// Load existing notes on page load
loadNotes();
