# Web Tech Group Assignment

## 👥 Team & Roles
- **Calvin**: Database Schema, Middle-end integration
- **Gordon**: UI Wireframes, Static HTML/CSS (Front-end)
- **Kharunaa (Leader)**: UI Wireframes, Static HTML/CSS (Front-end)
- **John**: API endpoints / Server logic (Back-end)
- **Audrey**: API endpoints / Server logic (Back-end)

## 📅 Timeline & Tasks

### 1. Database Schema & Mockups (Week 1: Now - April 30)
- **Calvin**: Finalize DB Schema (MySQL/MongoDB tables). *(Note: Back-end team is blocked until this is done).*
- **Gordon & Kharunaa**: Finish UI wireframes.

### 2. Core Development (Week 2: May 1 - May 4)
- **Gordon & Kharunaa**: Build static HTML/CSS.
- **John & Audrey**: Build API endpoints / Server logic.
- **Calvin**: Middle-end work (connect Front-end forms to Back-end routes).

### 3. Integration & Testing (Week 3: May 5 - May 7)
- **Calvin (Lead)**: Final integration of all components.
- **Whole Team**: Security & Accessibility testing (Make sure bookstore checkout doesn't crash and the forum is moderated correctly).

### 4. Documentation & Submission (Deadline: May 8)
- **Whole Team**: Finalize rationale, implementation process, and reflections. 
- *Note: Peer review form will be based on the contributions seen here and on Git!*

## 🔗 Important Links
- **Documentation (Google Docs)**: [Project Report / Documentation](https://docs.google.com/document/d/1no8UXVThnIzwlf2BHCMIDdSy_oTpKOXTW12EZyzN6ec/edit?usp=sharing)
- **GitHub Repository**: https://github.com/JOHNELIANAKNGELAI/Web-Tech

---

## 🛠️ Git Crash Course for Beginners
If you are new to Git, please follow this workflow so we don't accidentally break the project! 

### 1. Setup (First time only)
Once John sends the GitHub link, open your terminal/command prompt and clone the project:
```bash
git clone https://github.com/JOHNELIANAKNGELAI/Web-Tech.git
cd Web-Tech
```

### 2. Start of your work session
Always get the latest code from your teammates before you start making changes to avoid conflicts:
```bash
git pull origin main
```

### 3. Check what you changed
After making your edits in the `frontend`, `backend`, or `database` folders, see which files Git noticed:
```bash
git status
```

### 4. Save (Commit) your work
Prepare your files and wrap them in a commit with a message describing what you did:
```bash
# Add all changed files to the staging area
git add .

# Save them with a clear message (e.g., "created login page HTML")
git commit -m "your descriptive message here"
```

### 5. Upload (Push) to GitHub
Send your saved commits up to the shared repository so the rest of the team can see them:
```bash
git push origin main
```

### 💡 Golden Rules for the Team:
1. **Always `git pull` before you start working** and right before you `git push`.
2. Commit often. It's better to have many small, descriptive commits than one giant one.
3. If you encounter a **merge conflict**, don't panic! Ask in the group chat and we will resolve it together.
