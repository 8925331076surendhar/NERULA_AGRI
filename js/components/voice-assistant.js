class VoiceAssistant {
    constructor() {
        this.isRecording = false;
        this.button = null;
        this.statusIndicator = null;

        // Configuration: Use Gemini Key
        this.apiKey = window.CONFIG.GEMINI_API_KEY;
        this.endpoints = {
            chat: window.CONFIG.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
        };

        this.wakeWordRecognition = null;
        this.isWakeWordActive = false;
        this.recognition = null;
    }

    init(buttonId, statusId) {
        this.button = document.getElementById(buttonId);
        this.statusIndicator = document.getElementById(statusId);

        if (this.button) {
            this.button.addEventListener('click', () => this.toggleRecording());
            console.log('✅ Voice Assistant initialized (Gemini Powered)');

            // Initialize Wake Word Listener automatically
            setTimeout(() => this.initWakeWord(), 1000);
        }
    }

    /**
     * WAKE WORD DETECTION (Web Speech API)
     * Listens for "Hey Nerula" continuously
     */
    initWakeWord() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Wake word not supported (no Web Speech API)');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.wakeWordRecognition = new SpeechRecognition();
        this.wakeWordRecognition.continuous = true;
        this.wakeWordRecognition.interimResults = false;
        this.wakeWordRecognition.lang = 'en-US';

        this.wakeWordRecognition.onresult = (event) => {
            const lastResultIndex = event.results.length - 1;
            const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
            console.log('👂 Wake Word Listener heard:', transcript);

            if (this.checkWakeWord(transcript)) {
                console.log('🚀 Wake Word Detected!');
                localStorage.setItem('agrisense_mic_permission', 'granted');
                this.stopWakeWord();
                this.startRecording(); // Trigger main assistant
            }
        };

        this.wakeWordRecognition.onend = () => {
            // Auto-restart if not recording manually
            if (!this.isRecording && this.isWakeWordActive) {
                this.wakeWordRecognition.start();
            }
        };

        this.wakeWordRecognition.onerror = (e) => {
            console.warn("Wake word error:", e.error);
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                this.isWakeWordActive = false; // STOP the retry loop
                console.warn("Mic access denied. Stopping wake word listener.");
            }
        };

        this.startWakeWord();
    }

    checkWakeWord(text) {
        const triggers = [
            'hey nerula', 'hi nerula', 'hello nerula',
            'hey nebula', 'hi nebula', 'neural', 'new ruler',
            'hey narula', 'hi narula'
        ];
        return triggers.some(trigger => text.includes(trigger));
    }

    startWakeWord() {
        if (this.wakeWordRecognition && !this.isRecording) {
            this.isWakeWordActive = true;
            try {
                this.wakeWordRecognition.start();
                console.log('👂 Listening for "Hey Nerula"...');
            } catch (e) { /* Already started */ }
        }
    }

    stopWakeWord() {
        if (this.wakeWordRecognition) {
            this.isWakeWordActive = false;
            this.wakeWordRecognition.stop();
            console.log('🛑 Wake Word Listener Paused');
        }
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    /**
     * Start capturing audio using Web Speech API (STT)
     * Free, Browser Native
     */
    async startRecording() {
        this.stopWakeWord(); // Ensure wake word is off

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech Recognition not supported in this browser via Web API.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // One shot
        this.recognition.interimResults = false;

        // FORCE TAMIL MODE as requested, or fallback to auto
        this.recognition.lang = 'ta-IN';
        console.log('STT Language set to:', this.recognition.lang);

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI('listening');
            localStorage.setItem('agrisense_mic_permission', 'granted');
            console.log('🎤 Dictation started (Tamil)...');
        };

        this.recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('User said:', transcript);

            if (!transcript) return;

            this.updateUI('processing');
            const aiResponse = await this.getAIResponse(transcript);

            if (aiResponse) {
                console.log('AI Reply:', aiResponse);
                this.updateUI('speaking');
                await this.speakResponse(aiResponse);
            } else {
                console.error("No response from Gemini.");
                alert("Smart Agri Error: No response from Gemini. Check Key.");
            }

            this.updateUI('idle');
            this.startWakeWord();
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                alert("Microphone access denied.");
            }
            this.isRecording = false;
            this.updateUI('idle');
            // Restart wake word unless fatal
            if (event.error !== 'not-allowed' && event.error !== 'service-not-allowed') {
                this.startWakeWord();
            }
        };

        this.recognition.onend = () => {
            if (this.isRecording) {
                this.isRecording = false;
                // If normal end without result (silence), we might want to restart wake word
                // But strictly, logic continues in onresult or onerror
            }
        };

        try {
            this.recognition.start();
        } catch (e) { console.error(e); }
    }

    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
            this.isRecording = false;
            this.updateUI('processing');
        }
    }

    /**
     * Call Google Gemini API
     */
    async getAIResponse(text) {
        const payload = {
            contents: [{
                parts: [{
                    text: `You are Nerula, an intelligent agriculture assistant for 'AgriSense'. 
                    User said: "${text}".
                    
                    CRITICAL INSTRUCTION:
                    1. NO MATTER WHAT language the user speaks, you MUST REPLY IN TAMIL (தமிழ்).
                    2. If the user asks in English "How are you?", rely in TAMIL "நான் நலமாக இருக்கிறேன்" (I am fine).
                    3. Keep answers concise, helpful, and friendly. 
                    4. Do not use markdown headers.`
                }]
            }]
        };

        try {
            // Using API Key from Config
            const apiKey = window.CONFIG.GEMINI_API_KEY || localStorage.getItem('agrisense_api_key_gemini');

            if (!apiKey) {
                alert("Please set your Google Gemini API Key in Settings!");
                return "Error: No API Key";
            }

            const url = `${this.endpoints.chat}?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.error) {
                console.error("Gemini API Error details:", data.error);
                return `Error: ${data.error.message}`;
            }

            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            }
            return "I'm sorry, I couldn't process that.";
        } catch (error) {
            console.error('Gemini Error:', error);
            return "Connection Error. Check internet.";
        }
    }

    /**
     * Browser Native TTS
     */
    async speakResponse(text) {
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            // Force Tamil Voice if available
            let voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                };
            }

            // Simple language setting
            utterance.lang = 'ta-IN';

            utterance.onend = resolve;
            utterance.onerror = (e) => { console.error(e); resolve(); };

            window.speechSynthesis.speak(utterance);
        });
    }

    updateUI(state) {
        if (!this.button) return;
        const icon = this.button.querySelector('i');

        if (state === 'listening') {
            this.button.innerHTML = '<i class="fa-solid fa-microphone-lines fa-fade"></i>';
            this.button.classList.add('listening');
            if (this.statusIndicator) this.statusIndicator.textContent = "Listening (Tamil)...";
        } else if (state === 'processing') {
            this.button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            this.button.classList.remove('listening');
            if (this.statusIndicator) this.statusIndicator.textContent = "Asking Gemini...";
        } else if (state === 'speaking') {
            this.button.innerHTML = '<i class="fa-solid fa-volume-high fa-beat"></i>';
            this.button.classList.remove('listening');
            if (this.statusIndicator) this.statusIndicator.textContent = "Speaking...";
        } else {
            this.button.innerHTML = '<i class="fa-solid fa-microphone"></i>';
            this.button.classList.remove('listening');
            if (this.statusIndicator) this.statusIndicator.textContent = "Ready (Gemini Powered)";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.VoiceAssistant = new VoiceAssistant();
});
