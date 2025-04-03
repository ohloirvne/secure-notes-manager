console.log("Secure Notes Manager loaded!");

// Select elements
const noteTitleInput = document.getElementById('note-title');
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const notesList = document.getElementById('notes-list');
const searchInput = document.getElementById('search-notes');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let editingIndex = null; // Track the index of the note being edited
let tempPasscode = null; // Hold passcode in temporarily memory
let unsavedChanges = false; // Track unsaved changes

noteInput.addEventListener('input', () => {
	unsavedChanges = true;
});
	
noteTitleInput.addEventListener('input', () => {
	unsavedChanges = true;
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true; // Move slider to the right
}

// Event listener for toggling dark mode
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
});

// Load notes from localStorage
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.forEach((note, index) => renderNote(note, index));
}

// Render a note with title, content, and delete functionality
function renderNote(note, index) {
    const noteItem = document.createElement('li');
    noteItem.className = 'note-item';
    noteItem.dataset.index = index;
	
	// Create container for title and timestamp
	const noteHeader = document.createElement('div');
	noteHeader.className = 'note-header';
	
    // Add title
    const noteTitleSpan = document.createElement('span');
    noteTitleSpan.className = 'note-title';
    noteTitleSpan.textContent = note.title;
	
	// Divider line
	const noteDivider = document.createElement('div');
	noteDivider.className = 'note-divider';
	
	// Show lock icon if note is locked
	if (note.locked) {
		noteDivider.innerHTML = '<i class="fas fa-lock"></i>';
	} else {
		noteDivider.innerHTML = '';
	}
	
	// Timestamp text
    const noteTimestampSpan = document.createElement('span');
    noteTimestampSpan.className = 'note-timestamp';
	const timestampText = note.createdAt 
		? `Created: ${note.createdAt}`
		: `Last edited: ${note.lastEditedAt}`;
    noteTimestampSpan.textContent = timestampText;
	
	noteHeader.appendChild(noteTitleSpan);
    noteHeader.appendChild(noteDivider);
    noteHeader.appendChild(noteTimestampSpan);
		
	// Create a container for displaying note content (hidden by default)
    const noteContentDiv = document.createElement('div');
    noteContentDiv.className = 'note-content';
    noteContentDiv.style.display = 'none'; // Hidden initially
    
	// Create a container for the buttons
    const noteButtons = document.createElement('div');
    noteButtons.className = 'note-buttons';
	
	// Buttons
    const editButton = document.createElement('button');
    editButton.className = 'edit-note-btn';
    editButton.textContent = 'Edit';
    editButton.dataset.index = index;
	
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-note-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.dataset.index = index;

    const lockButton = document.createElement('button');
    lockButton.className = 'lock-note-btn';
    lockButton.textContent = 'Lock';
    lockButton.dataset.index = index;

    const unlockButton = document.createElement('button');
    unlockButton.className = 'unlock-note-btn';
    unlockButton.textContent = 'Unlock';
    unlockButton.dataset.index = index;

	// Append buttons based on note state
    if (note.locked) {
        noteButtons.appendChild(unlockButton);
    } else {
        noteButtons.appendChild(lockButton);
    }
	
	noteButtons.appendChild(editButton);
    noteButtons.appendChild(deleteButton);
	
	// Attach click event to title to toggle note content visibility
    noteTitleSpan.addEventListener('click', () => {
        toggleNoteContent(noteItem, noteContentDiv, noteButtons);
    });
	
	deleteButton.addEventListener('click', () => deleteNote(index));
    editButton.addEventListener('click', () => loadNoteForEditing(index));
    lockButton.addEventListener('click', () => lockNote(index));
    unlockButton.addEventListener('click', () => unlockNote(index));

    // Append header, content, and buttons to the list
	noteItem.appendChild(noteHeader);
    noteItem.appendChild(noteContentDiv);
	noteItem.appendChild(noteButtons);

    notesList.appendChild(noteItem);
}

// Toggle note content visibility
function toggleNoteContent(noteItem, noteContentDiv, noteButtons, note) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const index = parseInt(noteItem.dataset.index);
    note = notes[index];

    if (!note) {
        console.error('Note not found at index:', index);
        return;
    }
	
	const isVisible = noteContentDiv.style.display === 'block';

    // Hide all other notes
    document.querySelectorAll('.note-item').forEach(item => {
        item.querySelector('.note-content').style.display = 'none';
        item.querySelector('.note-buttons').style.display = 'none';
    });

    if (!isVisible) {
        if (note.locked) {
            const passcode = prompt('Enter passcode to unlock this note:');
			
			// Check if the user pressed cancel
			if (passcode === null) {
				return;
			}
			
            const decryptedContent = decryptContent(note.content, passcode);

            if (decryptedContent) {
                noteContentDiv.textContent = decryptedContent;
                note.decryptedContent = decryptedContent; // Store decrypted content temporarily
            } else {
                alert('Incorrect passcode! Cannot view content.');
                return;
            }
        } else {
            noteContentDiv.textContent = note.content;
        }

        noteContentDiv.style.display = 'block';
        noteButtons.style.display = 'flex';
		
		// Scroll the note into view
		noteItem.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
    } else {
        // If locked note, re-encrypt before closing
        if (note.locked && note.decryptedContent) {
            //reEncryptNote(noteItem.dataset.index, note.decryptedContent);
			reEncryptNote(index, note.decryptedContent);
            delete note.decryptedContent; // Remove temporary decrypted content
        }
        noteContentDiv.style.display = 'none';
        noteButtons.style.display = 'none';
    }
}

//Save a note
function saveNote() {
    const noteTitle = noteTitleInput.value.trim();
    const noteContent = noteInput.value.trim();

    if (!noteTitle || !noteContent) {
        alert('Please fill out both the note title and content.');
        return;
    }

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    if (editingIndex !== null) {
        const note = notes[editingIndex];

        // Check if the note is locked
        if (note.locked && tempPasscode) {
            // Re-encrypt with the same passcode after editing
            note.content = encryptContent(noteContent, tempPasscode);
        } else {
            // Update normal note
            note.content = noteContent;
			
        }

        note.title = noteTitle;
		note.createdAt = null;
		note.lastEditedAt = getCurrentTime(); // Set last edited timestamp
		
		// Move edited note to the top
		notes.splice(editingIndex, 1);
		notes.unshift(note);
		
        editingIndex = null;
        addNoteBtn.textContent = 'Save Note'; // Reset button text
    } else {
        // Add a new note
        const newNote = {
			title: noteTitle, 
			content: noteContent, 
			locked : false,
			createdAt: getCurrentTime(), // Set created timestamp
			lastEditedAt: null
		};
        notes.unshift(newNote);
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    refreshNotes();
	noteTitleInput.value = '';
	noteInput.value = '';
	
	unsavedChanges = false; // Reset flag
}

// Helper function to format the current date and time
function getCurrentTime() {
    return formatDate(new Date()); // Format as a localized date/time string
}

// Date & time format
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    return date.toLocaleString('en-UK', options);
}

// Delete a note
function deleteNote(index) {
	const confirmation = confirm('Are you sure you want to delete this note?');
	
	if (confirmation) {
		const notes = JSON.parse(localStorage.getItem('notes')) || [];
		notes.splice(index, 1); // Remove the note at the specified index
		localStorage.setItem('notes', JSON.stringify(notes));
		refreshNotes();
	}
}

// Load note for editing
function loadNoteForEditing(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    // Check if note is locked and has a tempPasscode
    if (note.locked && tempPasscode) {
        const decryptedContent = decryptContent(note.content, tempPasscode);
        if (decryptedContent) {
            noteTitleInput.value = note.title;
            noteInput.value = decryptedContent; // Load decrypted content for editing
        } else {
            alert('Error decrypting the note for editing.');
            return;
        }
    } else {
		// Load normal note for editing
        noteTitleInput.value = note.title;
        noteInput.value = note.content;
    }
	
	editingIndex = index;
    // Change button text to "Update Note"
    addNoteBtn.textContent = 'Update Note';
	
	// Scroll to the top when editing a note
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling for a nice effect
    });
}

// Encrypt content using AES with PBKDF2
function encryptContent(content, passcode) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const key = CryptoJS.PBKDF2(passcode, salt, {
        keySize: 256 / 32,
        iterations: 1000
    });

    const encrypted = CryptoJS.AES.encrypt(content, key.toString()).toString();
    return JSON.stringify({
        ciphertext: encrypted,
        salt: salt.toString()
    });
}

// Decrypt content using passcode
function decryptContent(encryptedData, passcode) {
    try {
        const data = JSON.parse(encryptedData);
        const salt = CryptoJS.enc.Hex.parse(data.salt);
        const key = CryptoJS.PBKDF2(passcode, salt, {
            keySize: 256 / 32,
            iterations: 1000
        });

        const decrypted = CryptoJS.AES.decrypt(data.ciphertext, key.toString());
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        return null; // Return null if decryption fails
    }
}

// Re-encrypt note content on close
function reEncryptNote(index, content) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    if (note.locked) {
        note.content = encryptContent(content, prompt('Re-enter passcode to re-lock this note:'));
        localStorage.setItem('notes', JSON.stringify(notes));
    }
}

// Lock a note with encryption
function lockNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    const passcode = prompt('Enter a passcode to lock this note:');
    if (passcode === '') {
        alert('Passcode cannot be empty!');
        return;
    }
	if (passcode === null) { // Check if the user pressed cancel
		return;
	}

    // Encrypt note content
    note.content = encryptContent(note.content, passcode);
    note.locked = true;
	tempPasscode = passcode; // Store tempPasscode in memory

    localStorage.setItem('notes', JSON.stringify(notes));
	refreshNotes();
	
	alert('Note successfully locked.')
}

// Unlock a note (remove encryption)
function unlockNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    const passcode = prompt('Enter passcode to unlock this note:'); // Prompt for the passcode
	
	if (passcode === null) { // If the user presses cancel
		return;
	}
	
    const decryptedContent = decryptContent(note.content, passcode);

    if (decryptedContent) {
        note.content = decryptedContent;
        note.locked = false;
		tempPasscode = null; // Clear passcode from memory after unlocking
		
        localStorage.setItem('notes', JSON.stringify(notes));
        refreshNotes();
		
		alert('Note successfully unlocked.')
    } else {
        alert('Incorrect passcode! Unable to unlock the note.');
    }
}

// Search and filter notes based on title
function searchNotes() {
    const query = searchInput.value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // Clear the existing list
    notesList.innerHTML = '';

    // Filter and re-render matching notes
    notes.forEach((note, index) => {
        if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
            renderNote(note, index);
        }
    });
}

// Refresh and reload notes
function refreshNotes() {
    notesList.innerHTML = '';
    loadNotes();
}

// Event listeners
	addNoteBtn.addEventListener('click', saveNote);
	searchInput.addEventListener('input', searchNotes);

// Clear tempPasscode on page load
window.addEventListener('load', () => {
    tempPasscode = null; // Extra safeguard to clear passcode on refresh
});

// Confirmation when leaving with unsaved changes
window.addEventListener('beforeunload', (event) => {
    if (unsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; // Required for modern browsers
    }
});

// Load existing notes on page load
loadNotes();