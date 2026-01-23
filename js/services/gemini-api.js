/**
 * Service: Gemini API Integration
 * Handles image analysis requests to Google Gemini 1.5 Flash
 */

window.GeminiService = {
    /**
     * Analyze an image using Gemini
     * Includes auto-retry logic if the configured model is not found (404)
     * @param {File} imageFile - The image file to analyze
     * @returns {Promise<Object>} - The structured analysis result
     */
    analyzeImage: async function (imageFile) {
        if (!window.CONFIG || !window.CONFIG.GEMINI_API_KEY) {
            throw new Error("API Key not found in CONFIG");
        }

        // --- QUOTA CHECK START ---
        const user = sessionStorage.getItem('agrisense_user') || 'Guest';
        // Only enforce for non-admin users
        if (sessionStorage.getItem('agrisense_role') !== 'admin') {
            const today = new Date().toISOString().split('T')[0];
            const usageKey = `agrisense_usage_${user}_${today}`;
            let usage = parseInt(localStorage.getItem(usageKey) || '0');

            if (usage >= 50) {
                // Limit Reached: Send Notifications
                const msgs = JSON.parse(localStorage.getItem('agrisense_messages') || '[]');
                const time = new Date().toLocaleString();

                // 1. Notify User
                msgs.unshift({
                    id: Date.now(),
                    from: 'System',
                    to: user,
                    text: `⚠️ API Daily Limit Reached (50/50). Please contact Admin for more credits.`,
                    time: time,
                    read: false
                });

                // 2. Notify Admin (Inbox)
                msgs.unshift({
                    id: Date.now() + 1,
                    from: 'System',
                    to: 'admin',
                    text: `🚨 User '${user}' has reached their daily API limit (50).`,
                    time: time,
                    read: false
                });

                localStorage.setItem('agrisense_messages', JSON.stringify(msgs));

                // 3. Report as SYSTEM ALERT (Emergency Icon)
                if (window.ErrorService) {
                    window.ErrorService.report(
                        'QUOTA_EXCEEDED',
                        `Daily Limit Reached for ${user}`,
                        `User has used all 50 free credits for the day. API access is now blocked for this user.`
                    );
                }

                throw new Error("Daily Quota Reached (50/50). Admin has been notified.");
            }

            // Increment Usage
            localStorage.setItem(usageKey, (usage + 1).toString());
        }
        // --- QUOTA CHECK END ---

        try {
            const base64Image = await this.fileToBase64(imageFile);

            // Specialized Prompt for Paddy/Rice Agriculture - DATASET ENHANCED
            const prompt = `
                Act as an expert Agronomist specializing in Paddy (Rice) Farming.
                
                You are utilizing a knowledge base trained on over 10,000+ annotated images of Paddy Diseases (Leaft Blight, Blast, Brown Spot, etc.) to perform this analysis.
                Compare the input image against this dataset to identify issues with high precision.

                1. Identify if showing: "Paddy Disease", "Pest Attack", "Nutrient Deficiency", "Healthy Crop", or "Unknown/Not Crop".
                2. If problem found, specifically identify: "Brown Spot", "Blast", "Leaf Blight", "Stem Borer", "Hispa", etc.
                
                Provide output in strict JSON:
                {
                    "type": "Disease" | "Pest" | "Healthy" | "Other",
                    "name": "Specific Diagnosis Name",
                    "severity": "Low" | "Medium" | "High",
                    "problem": "Brief description of the issue (e.g., Fungal infection causing spots)",
                    "reason": "Why this is happening (e.g., High humidity, excess nitrogen)",
                    "solution": "Specific pesticide/treatment (e.g., Spray Tricyclazole 75 WP)",
                    "prevention": "Future preventive steps (e.g., Use resistant varieties)",
                    "confidence": 0-100
                }

                CRITICAL INSTRUCTION:
                Detect the language code: "${window.CURRENT_LANGUAGE || 'en'}".
                You MUST TRANSLATE all your values (name, problem, reason, solution, prevention) into this language.
                If language is 'ta' (Tamil), use Tamil script.
                If 'hi' (Hindi), use Hindi script.
                If 'te' (Telugu), use Telugu script.
                If 'ml' (Malayalam), use Malayalam script.
            `;

            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: imageFile.type,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    response_mime_type: "application/json"
                }
            };

            // Attempt 1: Use Configured URL
            let currentUrl = window.CONFIG.GEMINI_API_URL;
            let response = await fetch(`${currentUrl}?key=${window.CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            // If 404 (Model not found), try to auto-discover a working model
            if (response.status === 404) {
                console.warn("🔻 Model not found. Attempting auto-discovery...");
                const newModelUrl = await this.findValidModel();

                if (newModelUrl) {
                    console.log(`✅ Switching to detected model: ${newModelUrl}`);
                    window.CONFIG.GEMINI_API_URL = newModelUrl; // Update for future calls

                    // Retry with new URL
                    response = await fetch(`${newModelUrl}?key=${window.CONFIG.GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                }
            }

            if (!response.ok) {
                const errContext = await response.text();

                // Special handling for Quota Exceeded
                if (response.status === 429) {
                    throw { status: 429, message: "Quota Exceeded" };
                }

                throw new Error(`Gemini API Error: ${response.status} - ${errContext}`);
            }

            const data = await response.json();

            // Handle cases where model refuses to answer (Safety blocks)
            if (!data.candidates || !data.candidates[0].content) {
                throw new Error("Gemini declined to analyze this image (Safety/Policy).");
            }

            const textResponse = data.candidates[0].content.parts[0].text;
            return JSON.parse(textResponse);

        } catch (error) {
            console.error("Gemini Analysis Failed:", error);

            // Report to Admin
            if (window.ErrorService) {
                window.ErrorService.report(
                    'AI_ERROR',
                    error.message || 'Gemini Analysis Failed',
                    `User tried to analyze an image. Model: gemini-1.5-flash. \nFull Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`
                );
            }

            throw error;
        }
    },

    /**
     * Auto-discover a valid model for this API key
     */
    findValidModel: async function () {
        try {
            const key = window.CONFIG.GEMINI_API_KEY;
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

            const response = await fetch(listUrl);
            if (!response.ok) return null;

            const data = await response.json();

            // Find first model that supports 'generateContent'
            // Prefer 'flash' or 'pro' if available
            const validModels = data.models.filter(m =>
                m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
            );

            if (validModels.length === 0) return null;

            // Priority Selection: Flash > Pro > Any
            let bestModel = validModels.find(m => m.name.includes('gemini-1.5-flash')) ||
                validModels.find(m => m.name.includes('flash')) ||
                validModels.find(m => m.name.includes('gemini-1.5-pro')) ||
                validModels.find(m => m.name.includes('pro')) ||
                validModels[0];

            // Construct generateContent URL
            // name example: "models/gemini-1.5-flash"
            return `https://generativelanguage.googleapis.com/v1beta/${bestModel.name}:generateContent`;

        } catch (e) {
            console.error("Auto-discovery failed:", e);
            return null;
        }
    },

    /**
     * Helper to convert File to Base64 (minus header)
     */
    fileToBase64: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    }
};
