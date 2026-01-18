/**
 * Component: Drone Feed
 * Simulates 4 live drone camera feeds & supports IP Camera Connection for all
 */

window.initDroneFeeds = function () {
    const grid = document.getElementById('camera-grid');
    if (!grid) return;

    // Clear existing
    grid.innerHTML = '';

    // All slots are now 'hybrid' (connectable)
    const cameras = [
        { id: 'CAM-01', location: 'Drone/Webcamera 1', status: 'standby' },
        { id: 'CAM-02', location: 'Drone/Webcamera 2', status: 'standby' },
        { id: 'CAM-03', location: 'Drone/Webcamera 3', status: 'standby' },
        { id: 'CAM-04', location: 'Drone/Webcamera 4', status: 'standby' }
    ];

    cameras.forEach((cam, index) => {
        const feed = document.createElement('div');
        feed.className = 'cam-feed';
        feed.style.position = 'relative';
        feed.style.background = '#000';
        feed.id = `feed-box-${index}`;

        // Unique IDs for inputs
        const inputId = `ip-cam-url-${index}`;
        const imgId = `live-stream-img-${index}`;
        const uiId = `connect-ui-${index}`;

        // UI: Connection Overlay & Controls
        // Added Analyze Button to the active view
        feed.innerHTML = `
            <div class="cam-overlay">
                <div class="cam-header">
                    <span class="cam-id">${cam.id}</span>
                    <span class="cam-status" id="status-${index}"><i class="fa-solid fa-circle"></i> REC</span>
                </div>
                <div class="cam-info">
                    <span>${cam.location}</span>
                    <span class="cam-timer">00:00:00</span>
                </div>
            </div>

            <!-- Active Feed Controls (Top Right) -->
            <div class="feed-controls" style="position:absolute; top:10px; right:10px; z-index:10; display:flex; gap:5px;">
                <button id="auto-btn-${index}" onclick="toggleAutoScan(${index})" style="display:none; background:rgba(37, 99, 235, 0.9); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:0.75rem;">
                    <i class="fa-solid fa-robot"></i> Auto
                </button>
                <button id="analyze-btn-${index}" onclick="captureAndAnalyze(${index})" style="display:none; background:rgba(16, 185, 129, 0.9); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:0.75rem;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Diagnose
                </button>
                <button id="exit-btn-${index}" onclick="disconnectStream(${index})" style="display:none; background:rgba(239, 68, 68, 0.9); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:0.75rem;">
                    <i class="fa-solid fa-power-off"></i> Exit
                </button>
            </div>
            
            <div id="${uiId}" class="connect-ui" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem; text-align:center; z-index:5;">
                <i class="fa-solid fa-mobile-screen" style="font-size:2rem; margin-bottom:0.5rem; color:var(--primary);"></i>
                <h3 style="font-size:1rem; margin-bottom:0.5rem;">Connect Device</h3>
                <!-- IP Camera Input -->
                <input type="text" id="${inputId}" placeholder="http://192.168.x.x:8080/video" style="width:100%; font-size:0.8rem; padding:6px; margin-bottom:0.5rem; border-radius:4px; border:1px solid var(--border); background:var(--bg-dark); color:white;">
                
                <div style="display:flex; gap:10px; width:100%;">
                    <button onclick="connectIpCam(${index})" id="btn-ip-${index}" style="flex:1; background:var(--bg-input); color:white; border:1px solid var(--border); padding:6px; border-radius:4px; cursor:pointer; font-size:0.8rem;">IP Cam</button>
                    <button onclick="connectLocalCam(${index})" style="flex:1; background:var(--primary); color:white; border:none; padding:6px; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600;">My Camera</button>
                </div>
                <span style="font-size:0.65rem; color:#666; margin-top:0.5rem;">Use "IP Cam" for remote or "My Camera" for laptop</span>
            </div>
            
            <div id="loader-${index}" style="position:absolute; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); z-index:6; color:var(--primary);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem;"></i>
            </div>
            
            <img id="${imgId}" style="width:100%; height:100%; object-fit:cover; display:none;" crossorigin="anonymous" onerror="handleStreamError(${index})">
            <video id="local-video-${index}" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover; display:none;"></video>
            
            <!-- Hidden Canvas for Capture -->
            <canvas id="capture-canvas-${index}" style="display:none;"></canvas>
        `;

        grid.appendChild(feed);
    });

    // Start Clock Simulation
    setInterval(updateTimers, 1000);
}

// Capture current frame and send to analysis
// Capture current frame and send to analysis
window.captureAndAnalyze = function (index, isSilent = false) {
    if (!isSilent) console.log("Capturing frame for analysis...");

    const videoEl = document.getElementById(`local-video-${index}`);
    const imgEl = document.getElementById(`live-stream-img-${index}`);
    const canvas = document.getElementById(`capture-canvas-${index}`);

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Determine source (Video or Image)
    if (videoEl && videoEl.style.display !== 'none') {
        width = videoEl.videoWidth;
        height = videoEl.videoHeight;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(videoEl, 0, 0, width, height);
    } else if (imgEl && imgEl.style.display !== 'none') {
        width = imgEl.naturalWidth;
        height = imgEl.naturalHeight;
        // Check for cross-origin issues with IP cams
        try {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(imgEl, 0, 0, width, height);
        } catch (e) {
            if (!isSilent) alert("Security Error: Cannot capture from external IP camera due to browser CORS policy. Please use 'My Camera' (Webcam) for analysis feature.");
            return;
        }
    } else {
        if (!isSilent) alert("No active stream to capture.");
        return;
    }

    // Convert to Blob and Analyze
    canvas.toBlob(function (blob) {
        if (blob) {
            let btn, originalText;

            // Only toggle button state if manual click
            if (!isSilent) {
                btn = document.getElementById(`analyze-btn-${index}`);
                if (btn) {
                    originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
                    btn.disabled = true;
                }
            }

            // Call Analytics
            if (window.analyzeUploadedImage) {
                window.analyzeUploadedImage(new File([blob], "capture.jpg", { type: "image/jpeg" }))
                    .then((data) => {
                        // Reset button
                        if (!isSilent && btn) {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }

                        // Show Overlay Result on Feed if significant
                        if (data && data.name && data.name !== "Healthy") {
                            showFeedOverlay(index, data);
                        }
                    })
                    .catch((err) => {
                        console.error(err);

                        // Handle Quota Exceeded (Stop Auto Scan)
                        if (err && err.status === 429) {
                            if (autoTimers[index]) {
                                clearInterval(autoTimers[index]);
                                delete autoTimers[index];
                                const autoBtn = document.getElementById(`auto-btn-${index}`);
                                if (autoBtn) {
                                    autoBtn.innerHTML = '<i class="fa-solid fa-robot"></i> Auto';
                                    autoBtn.style.background = 'rgba(37, 99, 235, 0.9)';
                                    autoBtn.classList.remove('pulsing');
                                }
                                alert("⚠️ Auto-Scan Paused: Free Tier Daily Limit Reached.\n\nPlease try again later or switch to Manual Mode.");
                            }
                        }

                        if (!isSilent && btn) {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    });
            } else {
                console.error("Analytics component not loaded");
                if (!isSilent && btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }
        }
    }, 'image/jpeg', 0.95);
}

const autoTimers = {};

window.toggleAutoScan = function (index) {
    const btn = document.getElementById(`auto-btn-${index}`);

    if (autoTimers[index]) {
        // TURN OFF
        clearInterval(autoTimers[index]);
        delete autoTimers[index];
        btn.innerHTML = '<i class="fa-solid fa-robot"></i> Auto';
        btn.style.background = 'rgba(37, 99, 235, 0.9)'; // Blue
        btn.classList.remove('pulsing'); // Remove animation
    } else {
        // TURN ON
        // Immediate first scan
        captureAndAnalyze(index, true);

        // Loop every 15 seconds (Safety for Free Tier API Limits)
        autoTimers[index] = setInterval(() => {
            captureAndAnalyze(index, true); // true = silent mode (no button spinner)
        }, 15000); // 15 seconds

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning...';
        btn.style.background = 'rgba(234, 179, 8, 0.9)'; // Yellow/Warning
        btn.classList.add('pulsing');
    }
}

// Global function to handle connection with Index
window.connectIpCam = function (index) {
    const urlInput = document.getElementById(`ip-cam-url-${index}`);
    const imgEl = document.getElementById(`live-stream-img-${index}`);
    const videoEl = document.getElementById(`local-video-${index}`);
    const uiEl = document.getElementById(`connect-ui-${index}`);
    const exitBtn = document.getElementById(`exit-btn-${index}`);
    const analyzeBtn = document.getElementById(`analyze-btn-${index}`);
    const autoBtn = document.getElementById(`auto-btn-${index}`); // New
    const loader = document.getElementById(`loader-${index}`);
    const btnIp = document.getElementById(`btn-ip-${index}`);

    let url = urlInput.value.trim();

    if (!url) {
        alert("Please enter a valid IP URL (e.g., http://192.168.1.5:8080/video)");
        return;
    }

    // Smart Auto-Correction

    // 1. Fix https -> http for private ranges:
    //    192.168.x.x, 10.x.x.x, 172.16.x.x - 172.31.x.x
    const isPrivateIp = url.includes('192.168.') || url.includes('10.') || url.includes('172.');

    if (url.startsWith('https://') && isPrivateIp) {
        url = url.replace('https://', 'http://');
    }

    // 2. Fix missing http://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }

    // 3. Fix common port typos (IP followed by .PORT instead of :PORT)
    // Regex matches X.X.X.X.YYYY where YYYY is 2-5 digits
    const portTypos = /(\d{1,3}\.\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{2,5})/;
    const match = url.match(portTypos);
    if (match) {
        // match[0] is the full IP.port string found in the URL
        // We replace the LAST dot with a colon
        const ipPart = match[0];
        const fixedIpPart = ipPart.substring(0, ipPart.lastIndexOf('.')) + ':' + ipPart.substring(ipPart.lastIndexOf('.') + 1);
        url = url.replace(ipPart, fixedIpPart);
    }

    // Update input to show corrected URL
    urlInput.value = url;

    // Show Loader
    loader.style.display = 'flex';
    btnIp.disabled = true;
    btnIp.textContent = 'Connecting...';

    // Reset others
    videoEl.srcObject = null;
    videoEl.style.display = 'none';

    // Set source
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Try specifically for capture permissions
    img.onload = () => {
        // Successful connection
        imgEl.src = url;
        imgEl.style.display = 'block';

        // UI Updates
        uiEl.style.display = 'none';
        loader.style.display = 'none';
        exitBtn.style.display = 'block';
        analyzeBtn.style.display = 'block';
        autoBtn.style.display = 'block'; // Show Auto Btn
        btnIp.disabled = false;
        btnIp.textContent = 'IP Cam';
    };

    img.onerror = () => {
        // Failed
        loader.style.display = 'none';
        btnIp.disabled = false;
        btnIp.textContent = 'IP Cam';

        const tryNewTab = confirm(`Failed to connect to ${url}.\n\nPossibilities:\n1. Your phone/PC are on different Wi-Fi networks.\n2. The IP Camera app is not running.\n3. Browser security is blocking "http" on a local network.\n\nTry opening the URL in a new tab to test it?`);

        if (tryNewTab) {
            window.open(url, '_blank');
        }
    };

    // Trigger load
    img.src = url;

    // Double-click to disconnect
    imgEl.parentElement.ondblclick = () => disconnectFeed(index);
}

window.connectLocalCam = async function (index) {
    const imgEl = document.getElementById(`live-stream-img-${index}`);
    const videoEl = document.getElementById(`local-video-${index}`);
    const uiEl = document.getElementById(`connect-ui-${index}`);
    const exitBtn = document.getElementById(`exit-btn-${index}`);
    const analyzeBtn = document.getElementById(`analyze-btn-${index}`);
    const autoBtn = document.getElementById(`auto-btn-${index}`); // New

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Reset IP Cam
        imgEl.src = '';
        imgEl.style.display = 'none';

        // Set Local Stream
        videoEl.srcObject = stream;
        videoEl.style.display = 'block';

        // UI Updates
        uiEl.style.display = 'none';
        exitBtn.style.display = 'block';
        analyzeBtn.style.display = 'block';
        autoBtn.style.display = 'block'; // Show Auto Btn

        // Double-click to disconnect
        videoEl.parentElement.ondblclick = () => disconnectFeed(index);

    } catch (err) {
        console.error("Camera Error:", err);
        alert("Could not access camera. Please allow permissions.");
    }
}

function disconnectFeed(index) {
    const imgEl = document.getElementById(`live-stream-img-${index}`);
    const videoEl = document.getElementById(`local-video-${index}`);
    const uiEl = document.getElementById(`connect-ui-${index}`);
    const exitBtn = document.getElementById(`exit-btn-${index}`);
    const analyzeBtn = document.getElementById(`analyze-btn-${index}`);
    const autoBtn = document.getElementById(`auto-btn-${index}`);

    // Stop Auto Scan if running
    if (autoTimers[index]) {
        clearInterval(autoTimers[index]);
        delete autoTimers[index];
        autoBtn.innerHTML = '<i class="fa-solid fa-robot"></i> Auto';
        autoBtn.style.background = 'rgba(37, 99, 235, 0.9)';
    }

    // Stop tracks if local
    if (videoEl.srcObject) {
        videoEl.srcObject.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
    }

    imgEl.src = '';

    imgEl.style.display = 'none';
    videoEl.style.display = 'none';
    uiEl.style.display = 'flex';
    exitBtn.style.display = 'none';
    if (analyzeBtn) analyzeBtn.style.display = 'none';
    if (autoBtn) autoBtn.style.display = 'none'; // Hide Auto
}

window.handleStreamError = function (index) {
    // Only handle if we aren't using local video
    const videoEl = document.getElementById(`local-video-${index}`);
    if (videoEl.style.display === 'block') return;

    const imgEl = document.getElementById(`live-stream-img-${index}`);
    const uiEl = document.getElementById(`connect-ui-${index}`);

    if (imgEl && uiEl) {
        imgEl.style.display = 'none';
        uiEl.style.display = 'flex';
        console.error(`Stream ${index} failed.`);
    }
}

function updateTimers() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    document.querySelectorAll('.cam-timer').forEach(el => {
        el.textContent = timeString;
    });
}

window.showFeedOverlay = function (index, data) {
    const feedBox = document.getElementById(`feed-box-${index}`);
    if (!feedBox) return;

    // Remove existing
    const existing = feedBox.querySelector('.analysis-overlay');
    if (existing) existing.remove();

    const color = data.color === 'danger' ? '#ef4444' : (data.color === 'warning' ? '#f59e0b' : '#10b981');

    const overlay = document.createElement('div');
    overlay.className = 'analysis-overlay fade-in';
    overlay.style.position = 'absolute';
    overlay.style.bottom = '60px'; // Above controls
    overlay.style.left = '10px';
    overlay.style.right = '10px';
    overlay.style.background = 'rgba(15, 23, 42, 0.9)';
    overlay.style.borderLeft = `4px solid ${color}`;
    overlay.style.padding = '10px';
    overlay.style.borderRadius = '4px';
    overlay.style.zIndex = '20';
    overlay.style.pointerEvents = 'none'; // Click through

    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:white; font-size:0.9rem;">${data.name}</strong>
            <span style="background:${color}; color:white; font-size:0.6rem; padding:2px 6px; border-radius:4px;">${data.severity.toUpperCase()}</span>
        </div>
        <div style="font-size:0.75rem; color:#cbd5e1;">${data.problem}</div>
    `;

    feedBox.appendChild(overlay);

    // Remove after 10 seconds
    setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 10000);
}
