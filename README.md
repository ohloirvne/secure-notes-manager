
# secure-notes-manager
VaultNotes - Secure Notes Manager
A simple & secure notes management app.

Features:
Create, edit, and Delete Notes - Easily manage your notes with intuitive actions.
Lock notes with Passcode Encryption - Encrypt sensitive notes with AES encryption.
Search Notes by Title and Content - Quickly locate notes with a powerful search bar.
Automatic timestamps - Automatically see when a note was created or last edited.

Getting Started:
1. Clone the Repository
- git clone https://github.com/ohloirvne/secure-notes-manager.git
- cd secure-notes-manager

2. Open the Project
- Simply open the index.html file in your web browser.

3. Start Using VaultNotes
- Write and save notes
- Delete unwanted notes
- Edit existing notes
- Lock notes to encrypt them
- Search for specific notes

Key points:
- Notes are stored in localStorage for easy access.
- Encrypted notes use CryptoJS. Passcodes are not visible in localStorage for security. 
- Notes will remain stored until manually deleted, or localStorage is cleared by the user.
- The UI is built with HTML, CSS, and JavaScript.

Disclaimer:
If you forget a passcode, the locked note cannot be recovered. 
Please ensure you remember your passcodes, or you will have to manually delete the note from local storage to remove it.
This is to ensure maximum security within the app.