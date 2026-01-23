/**
 * Component: Language Translation
 * Handles text updates for Indian Languages
 */

const translations = {
    en: {
        "Dashboard": "Dashboard",
        "Drones": "Drones",
        "Blueprint": "Blueprint",
        "Field Map": "Field Map",
        "Analysis": "Analysis",
        "Reports": "Reports",
        "Live Monitoring": "Live Monitoring",
        "Drone Live Feed": "Drone Live Feed",
        "Satellite Disease Mapping": "Satellite Disease Mapping",
        "AI Diagnostics": "AI Diagnostics",
        "Weather Intelligence": "Weather Intelligence",
        "System": "System",
        "Active": "Active",
        "Connect Device": "Connect Device",
        "Stream": "Stream",
        "Analyze Capture": "Analyze Capture",
        "Upload crop/pest image for AI diagnosis": "Upload crop/pest image for AI diagnosis"
    },
    ta: {
        "Dashboard": "முகப்பு",
        "Drones": "ட்ரோன்கள்",
        "Blueprint": "வரைபடம்",
        "Field Map": "வயல் வரைபடம்",
        "Analysis": "ஆய்வு",
        "Reports": "அறிக்கைகள்",
        "Live Monitoring": "நேரடி கண்காணிப்பு",
        "Drone Live Feed": "ட்ரோன் நேரலை",
        "Satellite Disease Mapping": "செயற்கைக்கோள் நோய் வரைபடம்",
        "AI Diagnostics": "AI நோய் கண்டறிதல்",
        "Weather Intelligence": "வானிலை தகவல்",
        "System": "அமைப்பு",
        "Active": "செயலில்",
        "Connect Device": "இணைப்பு",
        "Stream": "ஓடு",
        "Analyze Capture": "படத்தை ஆய்வு செய்",
        "Upload crop/pest image for AI diagnosis": "பயிர்/பூச்சி படத்தை பதிவேற்றவும்"
    },
    hi: {
        "Dashboard": "डैशबोर्ड",
        "Drones": "ड्रोन",
        "Blueprint": "योजना",
        "Field Map": "खेत का नक्शा",
        "Analysis": "विश्लेषण",
        "Reports": "रिपोर्ट",
        "Live Monitoring": "लाइव निगरानी",
        "Drone Live Feed": "ड्रोन लाइव फीड",
        "Satellite Disease Mapping": "उपग्रह रोग मानचित्रण",
        "AI Diagnostics": "AI निदान",
        "Weather Intelligence": "मौसम खुफिया",
        "System": "सिस्टम",
        "Active": "सक्रिय",
        "Connect Device": "कनेक्ट करें",
        "Stream": "स्ट्रीम",
        "Analyze Capture": "चित्र का विश्लेषण करें",
        "Upload crop/pest image for AI diagnosis": "फसल/कीट की छवि अपलोड करें"
    },
    te: {
        "Dashboard": "డ్యాష్‌బోర్డ్",
        "Drones": "డ్రోన్స్",
        "Blueprint": "బ్లూప్రింట్",
        "Field Map": "ఫీల్డ్ మ్యాప్",
        "Analysis": "విశ్లేషణ",
        "Reports": "నివేదికలు",
        "Live Monitoring": "ప్రత్యక్ష పర్యవేక్షణ",
        "Drone Live Feed": "డ్రోన్ లైవ్ ఫీడ్",
        "Satellite Disease Mapping": "శాటిలైట్ వ్యాధి మ్యాపింగ్",
        "AI Diagnostics": "AI నిర్ధారణ",
        "Weather Intelligence": "వాతావరణ సమాచారం",
        "System": "సిస్టమ్",
        "Active": "చురుకైన",
        "Connect Device": "పరికరాన్ని కనెక్ట్ చేయండి",
        "Stream": "స్ట్రీమ్",
        "Analyze Capture": "క్యాప్చర్‌ని విశ్లేషించండి",
        "Upload crop/pest image for AI diagnosis": "పంట/చీడపీడల చిత్రాన్ని అప్‌లోడ్ చేయండి"
    },
    ml: {
        "Dashboard": "ഡാഷ്‌ബോർഡ്",
        "Drones": "ഡ്രോണുകൾ",
        "Blueprint": "രൂപരേഖ",
        "Field Map": "ഫീൽഡ് മാപ്പ്",
        "Analysis": "വിശകലനം",
        "Reports": "റിപ്പോർട്ടുകൾ",
        "Live Monitoring": "തത്സമയ നിരീക്ഷണം",
        "Drone Live Feed": "ഡ്രോൺ ലൈവ് ഫീഡ്",
        "Satellite Disease Mapping": "ഉപഗ്രഹ രോഗ മാപ്പിംഗ്",
        "AI Diagnostics": "AI രോഗനിർണയം",
        "Weather Intelligence": "കാലാവസ്ഥാ വിവരങ്ങൾ",
        "System": "സിസ്റ്റം",
        "Active": "സജീവം",
        "Connect Device": "കണക്റ്റുചെയ്യുക",
        "Stream": "സ്ട്രീം",
        "Analyze Capture": "ചിത്രം വിശകലനം",
        "Upload crop/pest image for AI diagnosis": "വിള/ കീട ചിത്രം അപ്‌ലോഡ്"
    }
};

window.initLanguage = function () {
    const selector = document.getElementById('lang-selector');
    if (!selector) return;

    selector.addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
}

function changeLanguage(lang) {
    console.log("Switching Language to:", lang);
    window.CURRENT_LANGUAGE = lang; // Global State for AI/Voice
    const dict = translations[lang];
    if (!dict) return;

    // 1. Sidebar Items
    document.querySelectorAll('.nav-item span').forEach(el => {
        const key = el.getAttribute('data-i18n') || el.textContent;
        // Save original key if not saved
        if (!el.getAttribute('data-i18n')) el.setAttribute('data-i18n', key);

        const lookup = el.getAttribute('data-i18n');
        if (dict[lookup]) el.textContent = dict[lookup];
    });

    // 2. Headings & Titles
    const targets = [
        'h1', 'h2', '.label', 'button', '.cam-header span', '.cam-info span'
    ];

    targets.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            // Very basic text matching - in production rely on data-keys
            const text = el.childNodes.length === 1 ? el.textContent.trim() : null;
            // Only translate leaf nodes usually, simplistic check
            if (text && dict[text]) {
                el.textContent = dict[text];
            }
            // Check children (like icon + text)
            if (!text && el.lastChild && el.lastChild.nodeType === 3) {
                const innerText = el.lastChild.textContent.trim();
                if (dict[innerText]) {
                    el.lastChild.textContent = " " + dict[innerText];
                }
            }
        });
    });

    // Specific ID overrides if needed
    // ...
}
