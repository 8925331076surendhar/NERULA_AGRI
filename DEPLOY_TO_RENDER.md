# 🚀 How to Deploy to Render.com

Since your project is a **Static Site** (HTML/CSS/JS only), you can host it for free on Render.

## ✅ Prerequisite
**Your code must be on GitHub first.**
(Make sure you completed the `git push` step successfully).

---

## 🛠️ Step-by-Step Procedure

### 1. Create Account
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **"Sign up with GitHub"**.
3.  Authorize Render to access your GitHub account.

### 2. Create New Static Site
1.  Click the blue **"New +"** button (top right).
2.  Select **"Static Site"**.

### 3. Connect Repository
1.  You will see a list of your GitHub repositories.
2.  Find `agrisense` (or whatever you named it).
3.  Click **"Connect"**.

### 4. Configure Settings
Fill in these details:

*   **Name:** `agrisense-dashboard` (or any unique name)
*   **Branch:** `main` (default)
*   **Root Directory:** `.` (Leave blank)
*   **Build Command:** (Leave blank - you have no build script)
*   **Publish Directory:** `.` (Leave blank or type `./`)

### 5. Deploy
1.  Click **"Create Static Site"**.
2.  Render will start "building" (uploading) your site.
3.  Wait about 1 minute.
4.  You will see a green checkmark **"Live"**.
5.  Click the URL at the top (e.g., `https://agrisense-dashboard.onrender.com`).

---

## 📱 Note on "Login.html"
By default, Render serves `index.html`.
*   If your main page is `index.html` (the Dashboard), it will open immediately.
*   If you want the Login page to be first, you might need to rename `login.html` to `index.html` (and rename the old index to `dashboard.html`).
