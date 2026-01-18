/**
 * Application Configuration
 * WARNING: Storing API keys in frontend code is not secure for production.
 * This is for demonstration purposes only.
 */

// Helper to get priority key
function getGeminiKey() {
    const user = sessionStorage.getItem('agrisense_user');
    if (user) {
        const userKey = localStorage.getItem('agrisense_key_' + user);
        if (userKey) return userKey;
    }
    return localStorage.getItem('agrisense_api_key_gemini') || 'AIzaSyCpyIRagiHB45d7lHCeIDMiQWQuKCCNQHg';
}

window.CONFIG = {
    GEMINI_API_KEY: getGeminiKey(),
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    OPENAI_API_KEY: localStorage.getItem('agrisense_api_key_openai') || 'YOUR_OPENAI_API_KEY_HERE'
};
