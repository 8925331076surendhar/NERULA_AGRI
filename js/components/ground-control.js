/**
 * AgriSense Ground Control Software (GCS)
 * Advanced Drone Mission Planner & Telemetry
 */

class GroundControl {
    constructor() {
        this.container = null;
        this.isActive = false;

        // Mock Telemetry Data
        this.telemetry = {
            altitude: 0,
            speed: 0,
            battery: 100,
            satellites: 8,
            mode: 'DISARMED',
            heading: 0,
            armed: false
        };

        this.logs = [];
        this.missionWaypoints = [];
        this.updateInterval = null;
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.renderInterface();
        this.logSystem("GCS Initialized. Ready for connection.");
        // Simulated connection delay
        setTimeout(() => this.logSystem("Drone Connected: MAVLink v2.0 verified."), 1000);
    }

    renderInterface() {
        this.container.innerHTML = `
            <div class="gcs-layout" style="display: flex; flex-direction: column; height: 100%; gap: 10px; padding: 10px;">
                
                <!-- Top HUD Bar -->
                <div class="gcs-hud" style="display: flex; justify-content: space-between; background: #0f172a; padding: 10px 20px; border-radius: 8px; border: 1px solid #334155; color: #00ff00; font-family: 'Courier New', monospace; font-weight: bold;">
                    <div class="hud-item" id="hud-mode" style="border: 1px solid #334155; padding: 5px 10px; border-radius: 4px; min-width: 150px; text-align: center;">MODE: DISARMED</div>
                    <div class="hud-item" id="hud-bat">BAT: 100%</div>
                    <div class="hud-item" id="hud-gps">GPS: 8 Sats (3D Fix)</div>
                    <div class="hud-item" id="hud-alt">ALT: 0.0m</div>
                    <div class="hud-item" id="hud-spd">SPD: 0.0m/s</div>
                </div>

                <!-- Main Workspace -->
                <div class="gcs-main" style="display: flex; flex: 1; gap: 10px; overflow: hidden;">
                    
                    <!-- LEFT: Map / FPV -->
                    <div id="gcs-map" class="gcs-map" style="flex: 2; background: #1e293b; border-radius: 8px; position: relative; border: 1px solid #334155;">
                        <div style="position: absolute; top: 10px; left: 10px; z-index: 1000; background: rgba(0,0,0,0.6); color: white; padding: 5px 10px; border-radius: 4px; font-size: 0.8rem;">
                            Live Telemetry Stream
                        </div>
                    </div>
                    
                    <!-- RIGHT: Command & Control -->
                    <div class="gcs-sidebar" style="flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 300px;">
                        
                        <!-- Actions Panel -->
                        <div class="panel-box" style="background: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155;">
                            <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #334155; padding-bottom: 5px;">Flight Controls</h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                                <button id="btn-arm" onclick="GroundControlObj.toggleArm()" class="gcs-btn" style="padding: 15px; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">
                                    ARM
                                </button>
                                <button onclick="GroundControlObj.doRTL()" class="gcs-btn" style="padding: 15px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                                    <i class="fa-solid fa-house"></i> RTL
                                </button>
                            </div>

                            <button onclick="GroundControlObj.doTakeoff()" class="gcs-btn" style="width: 100%; padding: 12px; background: #eab308; color: black; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">
                                <i class="fa-solid fa-plane-departure"></i> TAKE OFF
                            </button>
                        </div>

                        <!-- Mission Planner -->
                        <div class="panel-box" style="flex: 1; background: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155; display: flex; flex-direction: column;">
                            <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 10px; display: flex; justify-content: space-between;">
                                <span>Mission</span>
                                <button onclick="GroundControlObj.startMission()" style="background: #10b981; border: none; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; cursor: pointer;">START</button>
                            </h3>
                            
                            <ul id="mission-list" class="mission-list" style="flex: 1; overflow-y: auto; list-style: none; padding: 0; margin: 0; border: 1px solid #334155; border-radius: 4px; background: #0f172a;">
                                <li class="empty-state" style="padding: 10px; color: #64748b; text-align: center; font-size: 0.8rem;">No Waypoints</li>
                            </ul>
                            
                            <div style="display: flex; gap: 5px; margin-top: 10px;">
                                <button onclick="GroundControlObj.addRandomWaypoint()" style="flex: 1; background: #334155; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fa-solid fa-plus"></i> Add WP
                                </button>
                                <button onclick="GroundControlObj.clearMission()" style="background: #334155; color: #ef4444; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <!-- System Log -->
                        <div class="panel-box" style="height: 150px; background: black; padding: 10px; border-radius: 8px; border: 1px solid #334155; font-family: 'Courier New', monospace; font-size: 0.75rem; color: #cbd5e1; overflow-y: auto;" id="gcs-log">
                            <!-- Logs injected here -->
                        </div>

                    </div>
                </div>
            </div>
        `;

        // Initialize Map
        setTimeout(() => this.initGCSMap(), 100);
    }

    initGCSMap() {
        if (window.L) {
            // Check if map already exists and remove it
            if (this.map) {
                this.map.remove();
                this.map = null;
            }

            this.map = L.map('gcs-map').setView([11.0, 77.0], 15);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(this.map);

            // Add Click Listener
            this.map.on('click', (e) => {
                this.addWaypointAt(e.latlng);
            });

            this.logSystem("Map loaded. Terrain data cached.");
        }
    }

    // --- LOGGING ---
    logSystem(msg) {
        const logPanel = document.getElementById('gcs-log');
        if (!logPanel) return;

        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.style.marginBottom = '2px';
        line.innerHTML = `<span style="color: #64748b;">[${timestamp}]</span> ${msg}`;

        logPanel.appendChild(line);
        logPanel.scrollTop = logPanel.scrollHeight;
    }

    // --- FLIGHT CONTROLS ---

    toggleArm() {
        const btn = document.getElementById('btn-arm');

        if (this.telemetry.armed) {
            // Disarm
            this.telemetry.armed = false;
            this.telemetry.mode = 'DISARMED';
            this.telemetry.speed = 0;

            btn.style.background = '#ef4444';
            btn.innerText = 'ARM';

            this.logSystem("COMMAND: DISARM Executed.");
            this.logSystem("Motors Stopped.");

            if (this.updateInterval) clearInterval(this.updateInterval);
        } else {
            // Arm
            this.telemetry.armed = true;
            this.telemetry.mode = 'STABILIZE';

            btn.style.background = '#22c55e'; // Green
            btn.innerText = 'DISARM';

            this.logSystem("COMMAND: ARM Executed.");
            this.logSystem("Motors spinning at idle.");
        }
        this.updateHUD();
    }

    doTakeoff() {
        if (!this.telemetry.armed) {
            this.logSystem("ERROR: Cannot Takeoff. Drone is DISARMED.");
            alert("Please ARM the drone first!");
            return;
        }

        this.telemetry.mode = 'TAKEOFF';
        this.logSystem("COMMAND: TAKEOFF 10m");

        let targetAlt = 10;
        let currentAlt = this.telemetry.altitude;

        const climb = setInterval(() => {
            if (currentAlt < targetAlt) {
                currentAlt += 0.5;
                this.telemetry.altitude = currentAlt;
                this.telemetry.speed = 2; // Vertical speed
                this.updateHUD();
            } else {
                this.telemetry.mode = 'LOITER';
                this.telemetry.speed = 0;
                this.logSystem("Takeoff Complete. Holding Altitude.");
                this.updateHUD();
                clearInterval(climb);
            }
        }, 100);
    }

    doRTL() {
        if (!this.telemetry.armed) return;
        this.telemetry.mode = 'RTL';
        this.logSystem("COMMAND: Return To Launch.");
        this.logSystem("Climbing to Safe Altitude...");
        // Simulation logic would go here
    }

    // --- MISSION ---

    addRandomWaypoint() {
        if (!this.map) return;
        // Add near center
        const center = this.map.getCenter();
        const lat = center.lat + (Math.random() - 0.5) * 0.005;
        const lng = center.lng + (Math.random() - 0.5) * 0.005;
        this.addWaypointAt({ lat, lng });
    }

    addWaypointAt(latlng) {
        const id = this.missionWaypoints.length + 1;

        // Marker icon
        const icon = L.divIcon({
            className: 'custom-wp-icon',
            html: `<div style="background:#eab308; color:black; width:20px; height:20px; border-radius:50%; text-align:center; line-height:20px; font-weight:bold; font-size:12px; border:2px solid white;">${id}</div>`,
            iconSize: [24, 24]
        });

        const marker = L.marker(latlng, { icon: icon }).addTo(this.map);

        // Draw Line
        if (this.missionWaypoints.length > 0) {
            const prev = this.missionWaypoints[this.missionWaypoints.length - 1];
            L.polyline([prev.latlng, latlng], { color: '#eab308', dashArray: '5, 10' }).addTo(this.map);
        }

        this.missionWaypoints.push({ id, lat: latlng.lat, lng: latlng.lng, latlng: latlng, marker });
        this.updateMissionUI();
        this.logSystem(`Waypoint ${id} Added.`);
    }

    updateMissionUI() {
        const list = document.getElementById('mission-list');
        if (this.missionWaypoints.length === 0) {
            list.innerHTML = '<li class="empty-state" style="padding:10px; color:#64748b;">No Waypoints</li>';
            return;
        }

        list.innerHTML = this.missionWaypoints.map(wp => `
            <li class="mission-item" style="padding: 8px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; color: #cbd5e1; font-size: 0.85rem;">
                <span style="color: #eab308; font-weight: bold;">WP ${wp.id}</span>
                <span>${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</span>
            </li>
        `).join('');
    }

    clearMission() {
        // Remove markers (simplified, in real app track layers properly)
        // For now just re-init map to clear layers easily
        this.initGCSMap();
        this.missionWaypoints = [];
        this.updateMissionUI();
        this.logSystem("Mission Cleared.");
    }

    startMission() {
        if (this.missionWaypoints.length < 2) {
            alert("Need at least 2 waypoints for a mission.");
            return;
        }
        if (!this.telemetry.armed) {
            alert("Arm drone first!");
            return;
        }

        this.telemetry.mode = 'AUTO';
        this.logSystem("COMMAND: Start Auto Mission");
        this.logSystem("Uploading Waypoints to Flight Controller...");

        setTimeout(() => {
            this.logSystem("Upload Complete. Executing Mission.");
            this.startTelemetryLoop();
        }, 1000);
    }

    startTelemetryLoop() {
        if (this.updateInterval) clearInterval(this.updateInterval);

        this.updateInterval = setInterval(() => {
            // Random fluctuations
            this.telemetry.speed = 12 + (Math.random() - 0.5);
            this.telemetry.altitude = 40 + (Math.random() - 0.5);
            this.telemetry.battery -= 0.05;

            this.updateHUD();
        }, 1000);
    }

    updateHUD() {
        document.getElementById('hud-mode').innerText = `MODE: ${this.telemetry.mode}`;

        // Color coding mode
        const modeEl = document.getElementById('hud-mode');
        if (this.telemetry.armed) {
            modeEl.style.color = '#ef4444'; // Red for armed
            modeEl.style.borderColor = '#ef4444';
        } else {
            modeEl.style.color = '#00ff00'; // Green for safe
            modeEl.style.borderColor = '#334155';
        }

        document.getElementById('hud-alt').innerText = `ALT: ${this.telemetry.altitude.toFixed(1)}m`;
        document.getElementById('hud-spd').innerText = `SPD: ${this.telemetry.speed.toFixed(1)}m/s`;
        document.getElementById('hud-bat').innerText = `BAT: ${this.telemetry.battery.toFixed(0)}%`;
        document.getElementById('hud-gps').innerText = `GPS: ${this.telemetry.satellites} Sats`;
    }
}

window.GroundControlObj = new GroundControl();

