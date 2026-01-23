/**
 * AgriSense - Smart Agriculture Dashboard
 * Main Application Entry Point
 */

// Components are loaded via <script> tags in index.html and attached to window

document.addEventListener('DOMContentLoaded', () => {
    // Verify user is logged in
    const user = sessionStorage.getItem('agrisense_user');
    if (!user) {
        window.location.replace('login.html');
        return; // Stop execution
    }

    // SESSION WATCHDOG: Check if user has been deleted by Admin
    // Only applies to non-admin customers
    const role = sessionStorage.getItem('agrisense_role');
    if (role !== 'admin') {
        setInterval(() => {
            // New Multi-User Check
            const allUsers = JSON.parse(localStorage.getItem('agrisense_users') || '[]');
            const legacyUser = localStorage.getItem('custom_user'); // Fallback

            // Check if current user exists in EITHER list
            const existsInArray = allUsers.some(u => u.username === user);
            const existsInLegacy = (user === legacyUser);

            if (!existsInArray && !existsInLegacy) {
                alert("⚠️ Session Revoked: Your account has been removed by the Administrator.");
                sessionStorage.clear();
                window.location.replace('login.html');
            }

            // --- ACCESS CONTROL WATCHDOG ---
            const settings = JSON.parse(localStorage.getItem('agrisense_access_settings') || 'null');
            if (settings && user !== 'nerula' && user !== 'admin') {
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const [sh, sm] = settings.start.split(':').map(Number);
                const [eh, em] = settings.end.split(':').map(Number);
                const startMinutes = sh * 60 + sm;
                const endMinutes = eh * 60 + em;

                let isOpen = false;
                if (startMinutes <= endMinutes) {
                    isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes;
                } else { // Overnight
                    isOpen = currentMinutes >= startMinutes || currentMinutes < endMinutes;
                }

                if (!isOpen) {
                    alert(`⚠️ Session Suspended: ${settings.message}`);
                    sessionStorage.clear();
                    window.location.replace('login.html');
                }
            }
            // -------------------------------
        }, 2000); // Check every 2 seconds
    }

    // Update User Profile
    const username = sessionStorage.getItem('agrisense_user') || 'Admin';
    const profileName = document.querySelector('.user-profile .name');
    const avatar = document.querySelector('.user-profile .avatar');

    if (profileName) profileName.textContent = username;
    if (avatar) avatar.textContent = username.substring(0, 2).toUpperCase();

    console.log('🌱 AgriSense initializing...');

    // Initialize Modules
    try {
        if (window.initDroneFeeds) window.initDroneFeeds();
        if (window.initMap) window.initMap();
        if (window.initWeather) window.initWeather();
        if (window.initAnalytics) window.initAnalytics();
        if (window.initReports) window.initReports();
        if (window.initSystemSettings) window.initSystemSettings();
        if (window.initMissionPlanner) window.initMissionPlanner();


        if (window.initLanguage) window.initLanguage();
        if (window.VoiceAssistant) window.VoiceAssistant.init('voice-assist-btn', 'field-subtitle');
    } catch (error) {
        console.error('Error initializing modules:', error);
    }

    // Initialize Navigation
    initNavigation();

    // Mobile Menu Close on Click Outside
    document.addEventListener('click', (e) => {
        const sidebar = document.querySelector('.sidebar');
        const btn = document.getElementById('mobile-menu-btn');
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('mobile-active') &&
            !sidebar.contains(e.target) &&
            !btn.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // Load Field Info
    const savedFieldInfo = localStorage.getItem('agrisense_field_info');
    if (savedFieldInfo) {
        const subtitle = document.getElementById('field-subtitle');
        if (subtitle) subtitle.textContent = savedFieldInfo;
    }
});

// Editable Field Info
window.editFieldInfo = function () {
    const subtitle = document.getElementById('field-subtitle');
    const currentText = subtitle.textContent;
    const newText = prompt("Update Field Information (e.g., Sector Name • Acres):", currentText);

    if (newText && newText.trim() !== "") {
        subtitle.textContent = newText;
        localStorage.setItem('agrisense_field_info', newText);
    }
}

window.toggleMobileMenu = function () {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobile-overlay'); // If we had one
    sidebar.classList.toggle('mobile-active');
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.querySelector('.page-title h1');
    const grid = document.querySelector('.dashboard-grid');

    // Panel Elements
    const panels = {
        drones: document.getElementById('drone-feeds'),
        map: document.getElementById('map-panel'),
        analysis: document.getElementById('analysis-panel'),
        weather: document.getElementById('weather-panel'),
        reports: document.getElementById('reports-panel'),
        system: document.getElementById('system-panel'),
        missionplanner: document.getElementById('mission-planner-panel'),
        marketplace: document.getElementById('marketplace-panel')
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Update Active State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 2. Identify View
            const viewName = item.querySelector('span').textContent.trim();

            // 3. Handle View Switching
            handleViewSwitch(viewName, pageTitle, grid, panels);
        });
    });
}

function handleViewSwitch(view, titleEl, grid, panels) {
    // Debugging
    console.log("Switching View to:", view);

    // Reset Grid Classes
    grid.className = 'dashboard-grid';

    // Get Columns
    const leftCol = document.querySelector('.dashboard-left');
    const rightCol = document.querySelector('.dashboard-right');

    // Reset Column Visibility (Default to Flex/Block as per CSS)
    if (leftCol) leftCol.style.display = '';
    if (rightCol) rightCol.style.display = '';

    // Reset Panel Visibility
    Object.values(panels).forEach(p => {
        if (p) {
            p.classList.remove('hidden-panel', 'full-view');
            p.style.display = '';
        }
    });

    if (view === 'Dashboard') {
        titleEl.textContent = 'Live Monitoring';
        // Dashboard = Standard 4 panels. Ensure Extras are HIDDEN.
        ['reports', 'system', 'control', 'gcs', 'marketplace'].forEach(k => {
            if (panels[k]) panels[k].classList.add('hidden-panel');
        });
    }
    else {
        // FULL VIEW MODE
        grid.classList.add('view-mode');

        if (view === 'Drones') {
            titleEl.textContent = 'Drone Command Center';
            togglePanels(panels, 'drones');
            if (rightCol) rightCol.style.display = 'none'; // Hide Right Col
        }
        else if (view === 'Field Map') {
            titleEl.textContent = 'Satellite Field Map';
            togglePanels(panels, 'map');
            if (rightCol) rightCol.style.display = 'none'; // Hide Right Col

            if (window.setMapMode) window.setMapMode('view');
            setTimeout(() => window.map && window.map.invalidateSize(), 100);
        }
        else {
            // Right Column Views (GCS, Reports, System, Trade)
            if (leftCol) leftCol.style.display = 'none'; // Hide Left Col


            if (view === 'Reports') {
                titleEl.textContent = 'Operational Reports';
                togglePanels(panels, 'reports');
            }
            else if (view === 'System') {
                titleEl.textContent = 'System Configuration';
                togglePanels(panels, 'system');
            }
            else if (view === 'Mission Planner') {
                titleEl.textContent = 'Mission Planner';
                togglePanels(panels, 'missionplanner');
                if (window.initMissionPlanner) window.initMissionPlanner();
            }
            else if (view === 'Direct Trade') {
                titleEl.textContent = 'Direct Trade Network';
                togglePanels(panels, 'marketplace');
                if (window.initMarketplace) window.initMarketplace();
            }
        }
    }
}

function togglePanels(panels, activeKey) {
    for (const [key, panel] of Object.entries(panels)) {
        if (key === activeKey) {
            panel.classList.add('full-view');
        } else if (key !== 'weather' || activeKey !== 'dashboard') {
            // Keep weather unless specifically hiding everything
            // For full views like Drone Control, we hide everything including weather usually, 
            // but let's stick to the pattern.
            // If activeKey is NOT dashboard, we generally hide everything.
            panel.classList.add('hidden-panel');
        }
    }
}

// Global Logout
// Global Logout
window.logout = function () {
    if (confirm("Are you sure you want to logout?")) {
        // Record Logout Time
        const user = sessionStorage.getItem('agrisense_user');
        if (user) {
            try {
                const logs = JSON.parse(localStorage.getItem('agrisense_login_logs') || '[]');
                // Find method: reverse loop to find last entry for this user that doesn't have a logout time?
                // Or just the very last entry for this user.
                for (let i = 0; i < logs.length; i++) {
                    if (logs[i].username === user && !logs[i].logoutTime) {
                        logs[i].logoutTime = new Date().toLocaleString();
                        break; // Update the most recent active session
                    }
                }
                localStorage.setItem('agrisense_login_logs', JSON.stringify(logs));
            } catch (e) {
                console.error("Error logging logout:", e);
            }
        }

        sessionStorage.removeItem('agrisense_auth');
        sessionStorage.clear(); // Clear all session data
        window.location.replace('login.html');
    }
}
