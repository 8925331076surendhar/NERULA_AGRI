/**
 * Component: Drone Control System
 * Manages Drone Fleet (Scout, Sprayer, Helper) and Missions
 */

window.initDroneControl = function () {
    console.log('Initializing Drone Control...');
    renderDroneControlUI();
}

function renderDroneControlUI() {
    const panel = document.getElementById('drone-control-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div class="panel-header">
            <h2><i class="fa-solid fa-gamepad"></i> Drone Fleet Control</h2>
            <div style="margin-left:auto;">
                <span class="status-badge warning" id="fleet-status">Offline</span>
            </div>
        </div>
        
        <style>
            .drone-pulse {
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 1);
                animation: pulse-green 2s infinite;
                border-radius: 50%;
            }
            @keyframes pulse-green {
                0% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
                }
                70% {
                    transform: scale(1);
                    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
                }
                100% {
                    transform: scale(0.95);
                    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
                }
            }
        </style>
        
        <div class="control-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; height: calc(100% - 60px);">
            
            <!-- Left: Fleet Status -->
            <div class="fleet-section" style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1.5rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Active Fleet</h3>
                
                <div class="drone-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${renderDroneCard('Scout-Alpha', 'Survey & Mapping', 'fa-paper-plane')}
                    ${renderDroneCard('Sprayer-X1', 'Pesticide Spraying', 'fa-spray-can')}
                    ${renderDroneCard('Cargo-Mule', 'Supply Transport', 'fa-box-open')}
                </div>

                <button onclick="connectAllDrones()" class="btn-primary" style="width: 100%; margin-top: 2rem; padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fa-solid fa-link"></i> Connect All Drones
                </button>
            </div>

            <!-- Right: Mission Control -->
            <div class="mission-section" style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Mission Control</h3>
                
                <div class="blueprint-status" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: white;"><i class="fa-solid fa-map-location-dot"></i> Blueprint Path</span>
                        <span id="path-status" style="font-size: 0.8rem; color: #fbbf24;">Not Set</span>
                    </div>
                    <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0;">Mark a path in "Blueprint" view to enable auto-pilot.</p>
                </div>

                <!-- Mini Map Container -->
                <div id="mini-map" style="height: 250px; width: 100%; background: #0f172a; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #334155; position: relative;"></div>

                <div class="mission-log" id="mission-log" style="flex: 1; min-height: 100px; background: #0f172a; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; overflow-y: auto; font-family: monospace; font-size: 0.85rem; color: #94a3b8; border: 1px solid #334155;">
                    <div>> System Ready...</div>
                    <div>> Waiting for fleet connection...</div>
                </div>

                <button onclick="startMission()" id="btn-mission" disabled class="btn-primary" style="width: 100%; padding: 1rem; background: #334155; cursor: not-allowed;">
                    <i class="fa-solid fa-rocket"></i> Deploy Mission
                </button>
            </div>
        </div>
    `;

    // Check if path exists and init map
    checkBlueprintPath();
    setTimeout(window.initMiniMap, 100); // Delay safely for DOM
}

function renderDroneCard(name, type, icon) {
    return `
        <div class="drone-card" id="card-${name}" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem; border-left: 3px solid #64748b;">
            <div class="drone-icon" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="drone-info" style="flex: 1;">
                <h4 style="margin: 0; color: white; font-size: 0.95rem;">${name}</h4>
                <span style="font-size: 0.8rem; color: #94a3b8;">${type}</span>
            </div>
            <div class="drone-status">
                <i class="fa-solid fa-wifi" style="color: #64748b;" id="wifi-${name}"></i>
            </div>
        </div>
    `;
}

// Global Actions
window.connectAllDrones = function () {
    const log = document.getElementById('mission-log');
    const badge = document.getElementById('fleet-status');

    log.innerHTML += `<div>> Initiating Handshake Protocol...</div>`;

    // Simulate Connection Process
    const drones = ['Scout-Alpha', 'Sprayer-X1', 'Cargo-Mule'];
    let delay = 500;

    drones.forEach(d => {
        setTimeout(() => {
            const card = document.getElementById(`card-${d}`);
            const wifi = document.getElementById(`wifi-${d}`);

            if (card) card.style.borderLeftColor = '#10b981'; // Green
            if (wifi) {
                wifi.style.color = '#10b981';
                wifi.classList.add('fa-beat-fade');
            }
            log.innerHTML += `<div>> ${d} connected successfully.</div>`;
            log.scrollTop = log.scrollHeight;
        }, delay);
        delay += 800;
    });

    setTimeout(() => {
        badge.textContent = 'Online';
        badge.className = 'status-badge success';
        log.innerHTML += `<div>> Fleet Online. Ready for command.</div>`;

        // Enable Mission Button if path is ready
        checkMissionReady();
    }, delay);
}

window.checkBlueprintPath = function () {
    const pathStatus = document.getElementById('path-status');
    const savedPath = sessionStorage.getItem('agrisense_mission_path');

    if (savedPath) {
        pathStatus.textContent = 'Ready';
        pathStatus.style.color = '#10b981';
        checkMissionReady();
    }
}

function checkMissionReady() {
    const fleetOnline = document.getElementById('fleet-status').textContent === 'Online';
    const pathReady = sessionStorage.getItem('agrisense_mission_path');
    const btn = document.getElementById('btn-mission');

    if (fleetOnline && pathReady) {
        btn.disabled = false;
        btn.style.background = 'var(--primary)';
        btn.style.cursor = 'pointer';
        btn.classList.add('pulsing');
    }
}

// Mini Map Logic
window.miniMap = null;
window.droneMarker = null;

window.initMiniMap = function () {
    const container = document.getElementById('mini-map');
    if (!container) return;

    // Destroy existing if any
    if (window.miniMap) {
        window.miniMap.remove();
        window.miniMap = null;
    }

    // Default Center
    const defaultCenter = [11.0168, 76.9558];

    window.miniMap = L.map('mini-map', {
        center: defaultCenter,
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false
    });

    // Use standard OSM for better reliability
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(window.miniMap);

    // Force map refresh and recenter
    setTimeout(() => {
        if (window.miniMap) {
            window.miniMap.invalidateSize();
            window.miniMap.setView(defaultCenter, 16);
        }
    }, 300);

    // Render Path if exists
    const savedPath = sessionStorage.getItem('agrisense_mission_path');
    if (savedPath) {
        const pathPoints = JSON.parse(savedPath);
        if (pathPoints && pathPoints.length > 0) {

            // Draw Path
            L.polyline(pathPoints, {
                color: '#fbbf24',
                weight: 3,
                dashArray: '5, 5'
            }).addTo(window.miniMap);

            // Fit bounds
            window.miniMap.fitBounds(pathPoints, { padding: [20, 20] });

            // Add starting marker
            const startNode = pathPoints[0];
            const droneIcon = L.divIcon({
                className: 'drone-mini-marker drone-pulse',
                html: '<i class="fa-solid fa-plane" style="color:#ffffff; font-size:1rem; transform: rotate(-45deg);"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });

            window.droneMarker = L.marker(startNode, { icon: droneIcon }).addTo(window.miniMap);
            window.droneMarker.bindPopup("<b>Ready to Deploy</b>").openPopup();
        }
    }
}

window.startMission = function () {
    const btn = document.getElementById('btn-mission');
    const log = document.getElementById('mission-log');

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mission in Grogress...';
    btn.disabled = true;
    btn.classList.remove('pulsing');

    log.innerHTML += `<div>> Uploading Blueprint Coordinates...</div>`;
    log.scrollTop = log.scrollHeight;

    // Simulate Movement on Mini Map
    const savedPath = sessionStorage.getItem('agrisense_mission_path');
    if (savedPath && window.miniMap && window.droneMarker) {
        const pathPoints = JSON.parse(savedPath);
        simulateMovement(pathPoints);
    }

    setTimeout(() => {
        log.innerHTML += `<div>> Coordinates Received. Launching Sequence.</div>`;
        log.scrollTop = log.scrollHeight;
    }, 1500);

    setTimeout(() => {
        log.innerHTML += `<div>> 🚀 Drones deployed to field.</div>`;
        log.innerHTML += `<div>> Auto-Pilot functionality active.</div>`;
        log.scrollTop = log.scrollHeight;
        // alert("Mission Started! Watch the Mini-Map for live tracking."); 
    }, 3000);
}

function simulateMovement(points) {
    if (!points || points.length < 2) return;

    // Create Traveled Path Line
    const traveledPath = L.polyline([], {
        color: '#4ade80', // bright green
        weight: 4,
        opacity: 0.8
    }).addTo(window.miniMap);

    let index = 0;
    const interval = setInterval(() => {
        if (index >= points.length) {
            clearInterval(interval);
            window.droneMarker.setPopupContent("<b>Mission Complete</b>").openPopup();
            return;
        }

        const currentPos = points[index];

        // Move Marker
        window.droneMarker.setLatLng(currentPos);
        window.droneMarker.setPopupContent(`<b>Live Tracking</b><br>Lat: ${currentPos.lat.toFixed(4)}<br>Lng: ${currentPos.lng.toFixed(4)}`);

        // Update Trail
        traveledPath.addLatLng(currentPos);

        // Pan Map smoothly
        window.miniMap.panTo(currentPos, { animate: true, duration: 1 });

        index++;
    }, 1000); // Move every second
}
