# 🌱 AgriSense - Smart Agriculture Dashboard

An AI-powered dashboard for monitoring farmland, detecting crop diseases using Drone Feeds, and providing real-time weather and satellite intelligence.

## 📂 Project Structure

Your project folder is already organized perfectly for hosting:

*   `login.html` - The starting page (Login Screen).
*   `index.html` - The main dashboard (Dashboard Screen).
*   `css/` - Contains all styling (colors, layout).
*   `js/` - Contains all the logic (Maps, Drone, Weather, AI).

---

## 🚀 How to Upload to GitHub (Beginner's Guide)

The easiest way for a beginner is to use **GitHub Desktop**.

### Step 1: Install GitHub Desktop
1.  Download and install [GitHub Desktop](https://desktop.github.com/).
2.  Log in with your GitHub account.

### Step 2: Connect to GitHub
1.  Go to your repository: [https://github.com/8925331076surendhar/agrisense](https://github.com/8925331076surendhar/agrisense)
2.  Click **"Add file"** -> **"Upload files"**.
3.  Drag and drop ALL your project files (`index.html`, `login.html`, `css`, `js`, etc.) into the browser window.
4.  Wait for them to upload.
5.  Click green button **"Commit changes"**.

### Alternative: GitHub Desktop
If you prefer the app:
1.  Open GitHub Desktop.
2.  Go to **File** -> **Clone Repository**.
3.  Paste URL: `https://github.com/8925331076surendhar/agrisense.git`
4.  Choose a Local Path (e.g. Desktop).
5.  Click **Clone**.
6.  Copy your project files INTO that new folder.
7.  Commit and Push.

### Step 3: Publish
1.  In GitHub Desktop, you will see all your files in the list on the left (green colors).
2.  Type a summary (e.g., "Initial Upload") in the bottom left box.
3.  Click **Change Branch** or just **Commit to main**.
4.  Click the blue **"Publish repository"** button on top.
5.  Uncheck "Keep this code private" if you want to host it for free.
6.  Click **Publish**.

---

## 🌐 How to Host (Make it Live)

You can host this for **FREE** using **GitHub Pages**.

1.  Go to your new repository page on **GitHub.com** (e.g., `github.com/your-name/agrisense-dashboard`).
2.  Click **Settings** (Top right tab).
3.  Scroll down (or look in sidebar) for **"Pages"**.
4.  Under **"Build and deployment"** > **Branch**:
    *   Select `main` (or `master`).
    *   Folder: `/ (root)`.
5.  Click **Save**.
6.  Wait 1-2 minutes. Refresh the page.
7.  You will see a link like:  
    `https://your-name.github.io/agrisense-dashboard/`

**Note:** You must open `login.html` first or rename `login.html` to `index.html` if you want the login page to appear first. Since standard generic hosting looks for `index.html`, proceed to the URL and manually add `/login.html` at the end, OR simplify by renaming.

---

## ⚠️ Important Security Warning
You are using a **Google Gemini API Key** inside `js/config.js`.
*   If you make this repository **Public**, anyone can see your key.
*   **For Hackathons/Demos:** This is okay, but valid for only a short time.
*   **Real World:** Never commit API keys. You would use a "Backend Server".
