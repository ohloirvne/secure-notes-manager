# secure-notes-manager
A single page web application for managing secure notes with encryption.

Project Vision:
I will create a secure notes manager that allows users to create and delete notes online via a browser. 
When a user accesses the single-page web application, a list of their saved notes will be displayed. 
These notes will be stored locally using JSON files and will be encrypted. 
When the user opens a note, the stored note data is decrypted and displayed. 
Additionally, users can make specific notes hidden and set up a unique 4-digit code if they wish to secure them further. 
Upon trying to access these “hidden” notes, the user is asked to enter the code before displaying the specific note. 
This means that even if someone gains unauthorised access to another users notes manager, they cannot open any "hidden” notes without the appropriate code. 
If the incorrect code to a note is entered 3 times in a row, it becomes locked for a certain period of time. 
Also, there will be a search feature that allows users to quickly find a desired note. 
