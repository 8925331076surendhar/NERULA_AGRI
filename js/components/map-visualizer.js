/**
 * Component: Map Visualizer
 * Integrates Leaflet Map with Satellite View, Drone Markers, and Location Search
 */

window.initMap = function () {
    console.log('Initializing Map...');

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Inject Controls (Search & Locate)
    // We add this BEFORE the map initializes so it sits on top (z-index handled in CSS)
    const controlsHtml = `
        <div class="map-loading-overlay" id="map-loading" style="position:absolute; inset:0; background:rgba(0,0,0,0.7); z-index:2000; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white;">
            <i class="fa-solid fa-satellite-dish fa-bounce" style="font-size:2rem; margin-bottom:10px; color:#10b981;"></i>
            <span>Locating Field Satellite...</span>
        </div>
        <div class="map-controls">
            <input type="text" id="map-search" class="map-search-input" placeholder="Search City/Village..." onkeypress="handleMapSearch(event)">
            <button class="btn-map-action" onclick="executeMapSearch()" title="Search">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>
            <button class="btn-map-action secondary" onclick="locateUser()" title="My Location">
                <i class="fa-solid fa-crosshairs"></i>
            </button>
        </div>
    `;
    mapContainer.style.position = 'relative';

    // Create a specific div for leaflet if not exists, or clear and rebuild structure
    mapContainer.innerHTML = controlsHtml + '<div id="leaflet-map" style="width:100%; height:100%; z-index:0;"></div>';

    // 1. Initialize Leaflet Map
    // Default: Coimbatore/Tamil Nadu (Fallback if geo fails)
    const defaultCenter = [11.0168, 76.9558];

    window.map = L.map('leaflet-map', {
        center: defaultCenter,
        zoom: 16,
        zoomControl: false,
        attributionControl: false
    });

    // 2. Add Google Hybrid Layer (Satellite + Labels)
    L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google'
    }).addTo(window.map);

    // CRITICAL: Attempt Auto-Geolocation Immediately
    locateUser(true); // true = auto mode
}

// Helper: Render Field, Drones, Hotspots relative to center
// NOW DYNAMIC: Generates elements relative to WHEREVER the map center is.
function renderFieldElements(center) {
    const map = window.map;
    const [lat, lng] = center;

    // Remove existing layers if any (simple clear for prototype)
    map.eachLayer((layer) => {
        if (!layer._url) map.removeLayer(layer); // Remove everything except tiles
    });

    // 3. Add Field Boundary (Polygon) - roughly 2 acres square around center
    const offset = 0.0015; // Approx 150m radius
    const fieldBoundary = [
        [lat + offset, lng - offset],
        [lat + offset, lng + offset],
        [lat - offset, lng + offset],
        [lat - offset, lng - offset]
    ];

    L.polygon(fieldBoundary, {
        color: '#10b981', // Emerald 500
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 3,
        dashArray: '10, 5'
    }).addTo(map);

    // 4. Add Drone Markers & Patrol Paths (Blueprint Mode)
    // Arrangement: North, East, South, West relative to center
    const offsetPath = 0.0010;

    const droneConfigs = [
        { id: 1, name: "North Wing", lat: lat + offsetPath, lng: lng, color: "#34d399", label: "N" },
        { id: 2, name: "East Wing", lat: lat, lng: lng + offsetPath, color: "#60a5fa", label: "E" },
        { id: 3, name: "South Wing", lat: lat - offsetPath, lng: lng, color: "#f472b6", label: "S" },
        { id: 4, name: "West Wing", lat: lat, lng: lng - offsetPath, color: "#fbbf24", label: "W" }
    ];

    const droneIcon = L.divIcon({
        className: 'drone-marker',
        html: '<i class="fa-solid fa-plane-up"></i>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    droneConfigs.forEach(d => {
        // A. Add Marker
        const marker = L.marker([d.lat, d.lng], {
            icon: droneIcon,
            draggable: true,
            title: d.name
        }).addTo(map);

        marker.bindPopup(`<b>${d.name}</b><br>ID: CAM-0${d.id}<br>Status: Auto-Patrol`);

        // B. Draw Patrol Path (A standardized "Box" pattern around their zone)
        const pathSize = 0.0004;
        const patrolPath = [
            [d.lat + pathSize, d.lng + pathSize],
            [d.lat + pathSize, d.lng - pathSize],
            [d.lat - pathSize, d.lng - pathSize],
            [d.lat - pathSize, d.lng + pathSize],
            [d.lat + pathSize, d.lng + pathSize] // Close loop
        ];

        L.polyline(patrolPath, {
            color: d.color,
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 5'
        }).addTo(map);
    });

    // 5. Add "Disease Hotspots" - DISABLED as per user request
    // (Code removed)

    // 6. Sync Weather to this new location
    if (window.fetchWeatherData) {
        window.fetchWeatherData(lat, lng);
    }
}

// Event: Search Input Enter Key
window.handleMapSearch = function (e) {
    if (e.key === 'Enter') executeMapSearch();
}

// Action: Execute Search
window.executeMapSearch = async function () {
    const query = document.getElementById('map-search').value;
    if (!query) return;

    try {
        const btn = document.querySelector('.btn-map-action i');
        btn.className = 'fa-solid fa-spinner fa-spin'; // Loading state

        // Use Nominatim OpenStreetMap API
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const newCenter = [lat, lon];

            // Fly to location
            window.map.flyTo(newCenter, 16);

            // Update Field Elements after short delay
            setTimeout(() => {
                renderFieldElements(newCenter);
                btn.className = 'fa-solid fa-check';
                setTimeout(() => btn.className = 'fa-solid fa-magnifying-glass', 1000);
            }, 1000);

        } else {
            alert("Location not found!");
            btn.className = 'fa-solid fa-magnifying-glass';
        }
    } catch (e) {
        console.error("Search failed", e);
        alert("Search error. Check internet.");
    }
}

// Action: Geolocation
// Action: Geolocation
window.locateUser = function (isAuto = false) {
    const loadingOverlay = document.getElementById('map-loading');

    if ("geolocation" in navigator) {
        const btn = document.querySelector('.btn-map-action.secondary i');
        if (btn) btn.className = 'fa-solid fa-spinner fa-spin';

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const newCenter = [lat, lng];

            console.log("📍 Location Found:", newCenter);
            localStorage.setItem('agrisense_loc_permission', 'granted'); // Persist permission state

            // Fly to location
            window.map.flyTo(newCenter, 18, {
                animate: true,
                duration: 2 // Smooth long flight
            });

            setTimeout(() => {
                renderFieldElements(newCenter); // Generate elements at user location
                if (btn) btn.className = 'fa-solid fa-crosshairs';

                // Hide loading overlay if present
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            }, 2000); // Wait for flight to finish roughly

        }, error => {
            console.warn("Location access denied or unavailable:", error);
            if (btn) btn.className = 'fa-solid fa-crosshairs';

            // If auto-fail, just hide overlay and stick to default
            if (loadingOverlay) {
                loadingOverlay.innerHTML = '<span style="color:#ef4444"><i class="fa-solid fa-circle-exclamation"></i> Location Denied. Using Demo Field.</span>';
                setTimeout(() => loadingOverlay.style.display = 'none', 2000);
            }

            if (!isAuto) alert("Location access denied. Please enable GPS.");
        });
    } else {
        if (!isAuto) alert("Geolocation not supported by this browser.");
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

// --- Blueprint Drawing Logic ---

let currentDrawMode = null; // 'view' or 'blueprint'
let activeDrawingPath = null;
let currentPolyline = null;
let tempPoints = [];

window.setMapMode = function (mode) {
    currentDrawMode = mode;
    const mapContainer = document.getElementById('map-container');

    // Remove existing blueprint controls if any
    const existingUi = document.getElementById('blueprint-ui');
    if (existingUi) existingUi.remove();

    if (mode === 'blueprint') {
        // Add Drawing Toolbar
        const uiHtml = `
            <div id="blueprint-ui" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); z-index:1000; background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; display:flex; gap:10px; border:1px solid #334155;">
                <span style="color:white; font-size:0.9rem; align-self:center; font-weight:600;">Draw Path:</span>
                <button onclick="startDrawing('North Wing', '#34d399')" class="btn-map-action" style="background:#34d399;">North</button>
                <button onclick="startDrawing('East Wing', '#60a5fa')" class="btn-map-action" style="background:#60a5fa;">East</button>
                <button onclick="startDrawing('South Wing', '#f472b6')" class="btn-map-action" style="background:#f472b6;">South</button>
                <button onclick="startDrawing('West Wing', '#fbbf24')" class="btn-map-action" style="background:#fbbf24;">West</button>
                <div style="width:1px; background:#444; margin:0 5px;"></div>
                <button onclick="saveBlueprintPath()" class="btn-map-action" style="background:#10b981; color:white;"><i class="fa-solid fa-floppy-disk"></i> Save</button>
                <button onclick="clearPaths()" class="btn-map-action secondary"><i class="fa-solid fa-trash"></i> Reset</button>
            </div>
        `;
        mapContainer.insertAdjacentHTML('beforeend', uiHtml);

        // Disable dragging markers while drawing prevents confusion
        // Enable Click Listener
        window.map.on('click', handleMapClick);
        window.map.getContainer().style.cursor = 'crosshair';

    } else {
        // Return to View Mode
        window.map.off('click', handleMapClick);
        window.map.getContainer().style.cursor = '';
    }
}

window.startDrawing = function (droneName, color) {
    activeDrawingPath = { name: droneName, color: color };
    tempPoints = [];

    alert(`Drawing Path for ${droneName}.\n1. Click on map to add points.\n2. Double-click to finish.`);

    // Create new line
    if (currentPolyline) window.map.removeLayer(currentPolyline); // Optional: Keep multiple? For now single active edit.

    currentPolyline = L.polyline([], {
        color: color,
        weight: 4,
        dashArray: '10, 5'
    }).addTo(window.map);
}

window.clearPaths = function () {
    // Ideally clear only user drawn paths, but for prototype we clear all polylines
    window.map.eachLayer(layer => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) { // Don't remove fields
            window.map.removeLayer(layer);
        }
    });
}

function handleMapClick(e) {
    if (!activeDrawingPath) return;

    tempPoints.push(e.latlng);
    currentPolyline.setLatLngs(tempPoints);

    // Add small dot for waypoint
    L.circleMarker(e.latlng, {
        radius: 4,
        color: activeDrawingPath.color,
        fillColor: '#fff',
        fillOpacity: 1
    }).addTo(window.map);
}

window.saveBlueprintPath = function () {
    if (!tempPoints || tempPoints.length < 2) {
        alert("Please draw a path first!");
        return;
    }

    // Save to Session Storage
    sessionStorage.setItem('agrisense_mission_path', JSON.stringify(tempPoints));
    alert("Path Saved Successfully! \n\nGo to 'Drone Control' to deploy mission.");

    // Optional: Visual Feedback
    if (activeDrawingPath) {
        L.polygon(tempPoints, {
            color: activeDrawingPath.color,
            fillColor: activeDrawingPath.color,
            fillOpacity: 0.2
        }).addTo(window.map);
    }
}

