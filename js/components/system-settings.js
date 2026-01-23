/**
 * Component: API & System Settings
 * Handles API Key Configuration and Account Management
 */

window.initSystemSettings = function () {
    const container = document.getElementById('system-panel');
    if (!container) return;

    renderSystemUI(container);
}

function renderSystemUI(container) {
    // Load current keys
    const currentGemini = localStorage.getItem('agrisense_api_key_gemini') || '';
    const currentOpenAI = localStorage.getItem('agrisense_api_key_openai') || '';
    const supportContact = localStorage.getItem('agrisense_support_contact') || 'Contact Admin for details';

    // Check Role
    const role = sessionStorage.getItem('agrisense_role'); // 'admin' or 'customer'
    const isCustomer = (role !== 'admin');

    // Defer UI updates until after HTML injection
    setTimeout(() => {
        if (isCustomer) {
            const input = document.getElementById('gemini-key');
            if (input) {
                input.disabled = true;
                input.style.opacity = "0.7";
                input.style.cursor = "not-allowed";
                input.title = "Managed by Administrator";

                // Show Lock UI
                document.getElementById('lock-icon').style.display = 'block';
                document.getElementById('admin-note').style.display = 'block';

                // Disable Save Button too
                const btn = document.querySelector('#api-keys-form button[type="submit"]');
                if (btn) {
                    btn.disabled = true;
                    btn.style.background = "#334155";
                    btn.style.cursor = "not-allowed";
                    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Locked by Admin';
                }
            }
        }
    }, 100);


    container.innerHTML = `
        <div class="panel-header">
            <h2><i class="fa-solid fa-gears"></i> Google API & System Settings</h2>
        </div>
        
        <div class="settings-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; padding: 2rem;">
            
            <!-- 1. API Configuration (Replaces System Upgrade) -->
            <div class="setting-card" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.4) 100%); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--primary);">
                <h3 style="color:var(--text-accent); margin-bottom:1rem; border-bottom:1px solid var(--border); padding-bottom:0.5rem;">
                    <i class="fa-brands fa-google"></i> API Configuration
                </h3>
                
                <form id="api-keys-form" onsubmit="handleSaveKeys(event)">
                    <p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">
                        Enter your API Keys here. They are stored locally in your browser.
                    </p>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; color:#e2e8f0; font-size:0.9rem; margin-bottom:5px;">Google Gemini API Key (Admin Managed)</label>
                        <div style="position:relative;">
                            <input type="password" id="gemini-key" placeholder="Contact Admin for Key" value="${currentGemini}"
                                style="width:100%; padding:10px; border-radius:6px; border:1px solid #475569; background:#0f172a; color:white; border-left: 4px solid var(--primary); padding-right: 40px;" onfocus="this.type='text'" onblur="this.type='password'">
                            <i id="lock-icon" class="fa-solid fa-lock" style="position:absolute; right:10px; top:12px; color:#64748b; display:none;"></i>
                        </div>
                        <div id="admin-note" style="font-size:0.75rem; color:#64748b; margin-top:4px; display:none;">
                            <i class="fa-solid fa-circle-info"></i> Only Admins can update this key.
                        </div>
                    </div>

                    <!-- OpenAI Key Removed/Hidden as per user request to use Gemini -->
                    <input type="hidden" id="openai-key" value="">

                    <div style="display:flex; gap:10px;">
                        <button type="submit" style="flex:1; padding:12px; background:var(--primary); color:black; font-weight:bold; border:none; border-radius:6px; cursor:pointer; font-size:1rem; display:flex; justify-content:center; gap:10px; align-items:center;">
                            <i class="fa-solid fa-save"></i> Save Keys
                        </button>
                        <button type="button" onclick="testGeminiConnection()" style="padding:12px; background:#334155; color:white; font-weight:bold; border:none; border-radius:6px; cursor:pointer; font-size:1rem;">
                            <i class="fa-solid fa-plug"></i> Test Gemini
                        </button>
                    </div>
                </form>
            </div>

            <!-- 2. Account Security -->
            <div class="setting-card" style="background: rgba(30, 41, 59, 0.4); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border);">
                <h3 style="color:#cbd5e1; margin-bottom:1rem; border-bottom:1px solid var(--border); padding-bottom:0.5rem;">
                    <i class="fa-solid fa-user-shield"></i> Account Security
                </h3>
                <!-- ... existing security forms ... -->
                <form id="reset-user-form" style="margin-bottom: 2rem;" onsubmit="handleUserReset(event)">
                    <h4 style="font-size:0.9rem; color:#cbd5e1; margin-bottom:0.5rem;">Reset Username</h4>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="new-username" placeholder="New Username" required 
                            style="flex:1; padding:8px; border-radius:4px; border:1px solid #475569; background:#0f172a; color:white;">
                        <button type="submit" style="background:#3b82f6; color:white; border:none; padding:0 15px; border-radius:4px; cursor:pointer;">Update</button>
                    </div>
                </form>

                <form id="reset-pass-form" onsubmit="handlePassReset(event)">
                    <h4 style="font-size:0.9rem; color:#cbd5e1; margin-bottom:0.5rem;">Reset Password</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <input type="password" id="new-password" placeholder="New Password" required 
                            style="padding:8px; border-radius:4px; border:1px solid #475569; background:#0f172a; color:white;">
                        <input type="password" id="confirm-password" placeholder="Confirm Password" required 
                            style="padding:8px; border-radius:4px; border:1px solid #475569; background:#0f172a; color:white;">
                        <button type="submit" style="background:#ef4444; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:600;">Change Password</button>
                    </div>
                </form>
            </div>

            <!-- 3. Contact Admin (NEW) -->
            <div class="setting-card" style="background: rgba(16, 185, 129, 0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                <h3 style="color:#6ee7b7; margin-bottom:1rem; border-bottom:1px solid rgba(16, 185, 129, 0.2); padding-bottom:0.5rem;">
                    <i class="fa-solid fa-headset"></i> Support / Contact Admin
                </h3>
                
                <div style="background:rgba(16, 185, 129, 0.1); padding:1rem; border-radius:8px; margin-bottom:1rem; border:1px solid rgba(16, 185, 129, 0.3); text-align:center;">
                    <div style="color:#94a3b8; font-size:0.9rem; margin-bottom:5px;">Direct Support Line</div>
                    <div style="font-size:1.4rem; color:#f8fafc; font-weight:bold;">
                        <i class="fa-solid fa-phone" style="margin-right:8px;"></i> ${supportContact}
                    </div>
                </div>

                <form onsubmit="handleContactAdmin(event)">
                     <label style="display:block; color:#e2e8f0; font-size:0.9rem; margin-bottom:5px;">Message to Administrator:</label>
                     <textarea id="admin-message" required rows="4" placeholder="Type your issue or request here..."
                        style="width:100%; padding:10px; border-radius:6px; border:1px solid #475569; background:#0f172a; color:white; resize:vertical;"></textarea>
                     <button type="submit" style="margin-top:10px; width:100%; background:var(--primary); color:black; font-weight:bold; border:none; padding:10px; border-radius:6px; cursor:pointer;">
                        <i class="fa-solid fa-paper-plane"></i> Send Message
                     </button>
                </form>
            </div>
        </div>
    `;
}

window.handleSaveKeys = function (e) {
    e.preventDefault();
    const geminiKey = document.getElementById('gemini-key').value.trim();
    const openaiKey = document.getElementById('openai-key').value.trim();

    if (geminiKey) localStorage.setItem('agrisense_api_key_gemini', geminiKey);
    if (openaiKey) localStorage.setItem('agrisense_api_key_openai', openaiKey);

    // Update Runtime Config
    if (window.CONFIG) {
        if (geminiKey) window.CONFIG.GEMINI_API_KEY = geminiKey;
        if (openaiKey) window.CONFIG.OPENAI_API_KEY = openaiKey;
        if (window.VoiceAssistant) window.VoiceAssistant.apiKey = openaiKey; // Live update
    }

    alert("✅ API Keys Saved Successfully!\nThe system will now use your custom keys.");
};

window.testGeminiConnection = async function () {
    const key = document.getElementById('gemini-key').value.trim();
    if (!key) {
        alert("Please enter a Google Gemini Key first.");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, are you active?" }] }]
            })
        });

        if (response.ok) {
            alert("✅ Connection Successful! Your Gemini Key is valid.");
        } else {
            const err = await response.json();
            alert(`❌ Connection Failed: ${err.error?.message || 'Unknown error'}`);
        }
    } catch (e) {
        alert(`❌ Network Error: ${e.message}. \nEnsure you have internet connection.`);
    }
};

// Helper to update local storage user
function updateCurrentUserRecord(updates) {
    const currentSessionUser = sessionStorage.getItem('agrisense_user');
    const role = sessionStorage.getItem('agrisense_role');

    if (!currentSessionUser) return false;
    if (role === 'admin') {
        alert("Admin account cannot be changed from here.");
        return false;
    }

    // 1. Get Users
    let users = JSON.parse(localStorage.getItem('agrisense_users') || '[]');
    // FIX: Case-insensitive lookup (Robustness)
    let userIndex = users.findIndex(u => u.username.toLowerCase() === currentSessionUser.toLowerCase());

    // 2. Fallback for legacy 'custom_user' (single user mode)
    if (userIndex === -1) {
        const legacyUser = localStorage.getItem('custom_user');
        if (legacyUser && currentSessionUser.toLowerCase() === legacyUser.toLowerCase()) {
            // Migrate legacy to array
            const legacyPass = localStorage.getItem('custom_pass');
            users.push({
                username: legacyUser,
                password: legacyPass,
                mobile: 'N/A',
                farm: 'Legacy Farm'
            });
            userIndex = users.length - 1;
        }
    }

    if (userIndex === -1) {
        alert("Error: User record not found.");
        return false;
    }

    // 3. Apply Updates
    if (updates.username) users[userIndex].username = updates.username;
    if (updates.password) users[userIndex].password = updates.password;

    // 4. Save
    localStorage.setItem('agrisense_users', JSON.stringify(users));

    // Update legacy keys if they match (to keep sync just in case)
    if (localStorage.getItem('custom_user') === currentSessionUser) {
        if (updates.username) localStorage.setItem('custom_user', updates.username);
        if (updates.password) localStorage.setItem('custom_pass', updates.password);
    }

    return true;
}

window.handleUserReset = function (e) {
    e.preventDefault();
    const newUser = document.getElementById('new-username').value.trim();
    if (!newUser) return alert("Please enter a valid username");

    if (updateCurrentUserRecord({ username: newUser })) {
        alert(`✅ Username successfully updated to: ${newUser}\n\nPlease login again with your NEW username.`);
        sessionStorage.clear();
        window.location.replace('login.html');
    }
}

window.handlePassReset = function (e) {
    e.preventDefault();
    const p1 = document.getElementById('new-password').value;
    const p2 = document.getElementById('confirm-password').value;

    if (p1 !== p2) {
        alert("❌ Passwords do not match!");
        return;
    }
    if (p1.length < 4) {
        alert("❌ Password must be at least 4 characters.");
        return;
    }

    if (updateCurrentUserRecord({ password: p1 })) {
        alert("✅ Password changed successfully!\n\nPlease login again with your NEW password.");
        sessionStorage.clear();
        window.location.replace('login.html');
    }
}

window.handleContactAdmin = function (e) {
    e.preventDefault();
    const msg = document.getElementById('admin-message').value.trim();
    if (!msg) return;

    const user = sessionStorage.getItem('agrisense_user') || 'Unknown';
    const timestamp = new Date().toLocaleString();

    // Save to Messages Array
    const messages = JSON.parse(localStorage.getItem('agrisense_messages') || '[]');
    messages.unshift({
        id: Date.now(),
        user: user,
        text: msg,
        time: timestamp,
        read: false
    });
    localStorage.setItem('agrisense_messages', JSON.stringify(messages));

    document.getElementById('admin-message').value = "";
    alert("✅ Message Sent to Administrator!");
}
