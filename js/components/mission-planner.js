/**
 * Component: Mission Planner Launcher
 * Simple Interface to Launch Local App
 */

window.initMissionPlanner = function () {
    renderMissionPlannerUI();
}

function renderMissionPlannerUI() {
    const panel = document.getElementById('mission-planner-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div class="panel-header">
            <h2><i class="fa-solid fa-cube"></i> Mission Planner</h2>
        </div>

        <div class="mp-container" style="height: calc(100% - 60px); display:flex; flex-direction:column; justify-content:center; align-items:center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); border-radius:12px; border:1px solid #334155; text-align:center;">
            
            <div style="background: rgba(255,255,255,0.03); padding:3rem; border-radius:20px; border:1px solid rgba(255,255,255,0.05); max-width:500px;">
                <div style="font-size:4rem; color:#f59e0b; margin-bottom:1.5rem;">
                    <i class="fa-solid fa-rocket"></i>
                </div>
                
                <h2 style="color:white; margin-bottom:1rem;">Launch Mission Planner</h2>
                <p style="color:#94a3b8; margin-bottom:2rem; line-height:1.6;">
                    Launch the desktop application directly from your dashboard.<br>
                    <small style="opacity:0.7;">(Requires app to be installed locally)</small>
                </p>

                <a href="missionplanner://" onclick="handleLaunchClick()" class="btn-primary" style="display:inline-flex; align-items:center; gap:10px; padding:15px 40px; font-size:1.2rem; text-decoration:none; border-radius:50px; transition: transform 0.2s;">
                    <span>Open Application</span>
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>

                <div style="margin-top:2rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="font-size:0.8rem; color:#64748b;">
                        Not working? <a href="#" onclick="showScriptHelp()" style="color:#f59e0b;">Run the setup script</a>
                    </p>
                </div>
            </div>

        </div>
    `;
}

window.handleLaunchClick = function () {
    // Visual feedback
    const btn = document.querySelector('.btn-primary');
    if (btn) {
        btn.innerHTML = '<span>Launching...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
        setTimeout(() => {
            btn.innerHTML = '<span>Open Application</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>';
        }, 3000);
    }
}

window.showScriptHelp = function () {
    alert("To fix the launch button:\n\n1. Go to your project folder.\n2. Open 'software' folder.\n3. Right-click 'setup_mp_link.ps1' -> Run with PowerShell.\n\nThis registers the link with Windows.");
}
