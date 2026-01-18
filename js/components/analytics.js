/**
 * Component: AI Analysis
 * Displays real-time disease detection results from drone feeds and Gemini AI
 */

window.initAnalytics = function () {
    const container = document.getElementById('analysis-content');
    if (!container) return;

    // 1. Render Enhanced UI (Upload + List)
    renderUploadUI(container);
}

function renderUploadUI(container) {
    const uploadHtml = `
        <div class="upload-section" style="margin-bottom: 1rem; padding: 1.5rem; background: rgba(16, 185, 129, 0.05); border: 1px dashed var(--primary); border-radius: var(--radius-sm); text-align: center; transition: all 0.2s;">
            <input type="file" id="imageInput" accept="image/*" style="display: none;">
            <label for="imageInput" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; width: 100%;">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: var(--primary);"></i>
                <span style="font-weight: 600; color: var(--text-primary);">Analyze Capture</span>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">Upload crop/pest image for AI diagnosis</span>
            </label>
            <div id="uploadStatus" style="font-size: 0.85rem; margin-top: 1rem; font-weight: 500; display: none;"></div>
        </div>
        <div id="alerts-list"></div>
    `;
    container.innerHTML = uploadHtml;

    const input = document.getElementById('imageInput');
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) window.analyzeUploadedImage(e.target.files[0]);
    });
}

// Public function to allow calling from Webcam/Drone Feed
window.analyzeUploadedImage = async function (file) {
    const statusEl = document.getElementById('uploadStatus');
    if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending to Gemini 1.5 Flash...';
        statusEl.style.color = 'var(--warning)';
    }

    try {
        if (!window.GeminiService) throw new Error("Gemini Service not loaded. Check config/network.");

        // Call our new Service
        const result = await window.GeminiService.analyzeImage(file);

        // Map API result to UI format
        const alertData = {
            name: result.name || result.type,
            severity: result.severity || "Unknown",
            problem: result.problem || "Issue undetected",
            reason: result.reason || "Analysis required",
            solution: result.solution || result.treatment || "Consult expert",
            prevention: result.prevention || "Monitor regularly",
            confidence: result.confidence, // Pass confidence score
            color: getSeverityColor(result.severity, result.type)
        };

        // Add to UI as "Real" alert
        const list = document.getElementById('alerts-list');
        if (list) addAlert(list, alertData, true);

        if (statusEl) {
            statusEl.innerHTML = '<i class="fa-solid fa-check"></i> Analysis Complete';
            statusEl.style.color = 'var(--success)';
            setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
        }

        return alertData;

    } catch (error) {
        console.error("Analysis Error:", error);
        if (statusEl) {
            statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${error.message}`;
            statusEl.style.color = 'var(--danger)';
        }
        // Re-throw so the caller (drone feed) can handle auto-scan stop
        throw error;
    }
}

function getSeverityColor(severity, type) {
    if (type === 'Healthy') return 'success';
    if (severity === 'High') return 'danger';
    if (severity === 'Medium') return 'warning';
    return 'success'; // Low or None
}

// Background Mock Data
function addMockAlert() {
    const list = document.getElementById('alerts-list');
    if (!list) return;

    const diseases = [
        {
            name: "Leaf Blight",
            severity: "High",
            color: "danger",
            problem: "Fungal infection detected on leaves",
            solution: "Apply Fungicide A and improve ventilation"
        },
        {
            name: "Yellow Rust",
            severity: "Medium",
            color: "warning",
            problem: "Yellow streaks appearing on leaf surface",
            solution: "Monitor moisture levels and apply rust inhibitor"
        },
        {
            name: "Aphid Attack",
            severity: "Low",
            color: "success",
            problem: "Small pests visible under leaves",
            solution: "Use Organic Spray or release ladybugs"
        },
        {
            name: "Powdery Mildew",
            severity: "High",
            color: "danger",
            problem: "White powdery spots spreading rapidly",
            solution: "Remove infected leaves immediately and spray sulfur"
        }
    ];
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    addAlert(list, randomDisease, false);
}

// ALert Data Store for safer access
window.ALERT_DATA_STORE = {};

// Universal Alert Renderer
function addAlert(containerList, data, isReal) {
    const time = new Date().toLocaleTimeString();

    // Generate Unique ID for this alert
    const alertId = 'alert_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    window.ALERT_DATA_STORE[alertId] = data;

    // Distinct styling for Real User Uploads vs Mock stream
    const borderStyle = isReal ? 'border-left: 4px solid #34d399; background: rgba(52, 211, 153, 0.05);' : '';
    const badge = isReal ? '<span style="background:var(--primary); color:#fff; font-size:0.6rem; padding:2px 6px; border-radius:4px; margin-left:auto; letter-spacing:0.5px;">GEMINI AI</span>' : '';

    // Confidence Display (only if real and available)
    const confidenceHtml = (isReal && data.confidence)
        ? `<div style="font-size:0.7rem; color:var(--text-secondary); margin-bottom:4px;">Confidence: <strong style="color:var(--text-primary);">${data.confidence}%</strong></div>`
        : '';

    const alertHtml = `
        <div class="alert-card fade-in" style="${borderStyle}">
            <div class="alert-header">
                <span class="disease-name ${data.color}">
                    <i class="fa-solid ${getDataIcon(data.name)}"></i> ${data.name}
                </span>
                ${badge}
                <span class="alert-time" style="margin-left: ${isReal ? '0.5rem' : 'auto'}">${time}</span>
                <button onclick="window.speakDiagnosis('${alertId}')" 
                        title="Read out diagnosis"
                        style="background:none; border:none; color:var(--text-secondary); cursor:pointer; margin-left:10px; font-size:1rem; transition:color 0.2s;">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
            </div>
            <div class="alert-body">
                ${confidenceHtml}
                <div class="severity-meter">
                    <span class="label">Severity</span>
                    <div class="progress-bar">
                        <div class="fill ${data.color}" style="width: ${getSeverityWidth(data.severity)}"></div>
                    </div>
                </div>
                
                <!-- New Problem/Solution Layout -->
                <div style="margin-top:0.5rem; font-size:0.8rem; color:#ccc; display: flex; flex-direction: column; gap: 6px;">
                    <div><strong style="color:#f87171;">Problem:</strong> ${data.problem}</div>
                    <div><strong style="color:#fbbf24;">Reason:</strong> ${data.reason}</div>
                    <div><strong style="color:#4ade80;">Solution:</strong> ${data.solution}</div>
                    <div style="padding-top: 4px; border-top: 1px dashed #334155; margin-top: 2px;">
                        <strong style="color:#60a5fa;">Prevention:</strong> <span style="font-style: italic; color: #94a3b8;">${data.prevention}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    containerList.insertAdjacentHTML('afterbegin', alertHtml);

    // Limit list length
    if (containerList.children.length > 5) {
        containerList.lastElementChild.remove();
    }
}

function getSeverityWidth(sev) {
    if (sev === 'High') return '90%';
    if (sev === 'Medium') return '60%';
    return '30%';
}

function getDataIcon(name) {
    name = name.toLowerCase();
    if (name.includes('animal') || name.includes('cow') || name.includes('boar') || name.includes('pig')) return 'fa-cow';
    if (name.includes('insect') || name.includes('locust') || name.includes('aphid') || name.includes('worm')) return 'fa-bug';
    if (name.includes('healthy')) return 'fa-leaf';
    return 'fa-circle-exclamation';
}

// TEXT TO SPEECH ENGINE
// TEXT TO SPEECH ENGINE
window.CURRENT_SPEAKING_ID = null;

window.speakDiagnosis = function (identifier) {
    console.log("TTS Triggered:", identifier);

    // 1. Check if we need to STOP
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();

        // If clicking the SAME alert that is playing, just stop and return (Toggle Off)
        if (window.CURRENT_SPEAKING_ID === identifier) {
            console.log("TTS: Stopped by user toggle.");
            window.CURRENT_SPEAKING_ID = null;
            return;
        }
    }

    let data = null;

    // Support both ID-based (new) and Encoded JSON (legacy/fallback)
    if (window.ALERT_DATA_STORE && window.ALERT_DATA_STORE[identifier]) {
        data = window.ALERT_DATA_STORE[identifier];
    } else {
        try {
            data = JSON.parse(decodeURIComponent(identifier));
        } catch (e) {
            console.error("TTS: Failed to parse data", e);
            return;
        }
    }

    if (!data) return;

    try {
        window.CURRENT_SPEAKING_ID = identifier; // Track what's playing
        const lang = window.CURRENT_LANGUAGE || 'en';

        // Construct Sentence
        let text = "";
        if (lang === 'en') {
            text = `Analysis: ${data.name}. Severity: ${data.severity}. ${data.problem}. Solution: ${data.solution}`;
        } else {
            text = `${data.name}. ${data.problem}. ${data.solution}`;
        }

        console.log("TTS Text:", text);

        const utterance = new SpeechSynthesisUtterance(text);

        const langMap = { 'ta': 'ta-IN', 'hi': 'hi-IN', 'te': 'te-IN', 'ml': 'ml-IN', 'en': 'en-US' };
        const targetLang = langMap[lang] || 'en-US';
        utterance.lang = targetLang;

        // Voice Selection with Retry Logic
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            const targetVoice = voices.find(v => v.lang.includes(targetLang));
            if (targetVoice) {
                utterance.voice = targetVoice;
                console.log("TTS Voice:", targetVoice.name);
            }
        };

        setVoice();
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoice;
        }

        utterance.rate = 0.9;

        utterance.onend = () => {
            window.CURRENT_SPEAKING_ID = null;
        };

        window.speechSynthesis.speak(utterance);

    } catch (e) {
        console.error("TTS Error:", e);
        alert("Audio playback failed: " + e.message);
    }
}
