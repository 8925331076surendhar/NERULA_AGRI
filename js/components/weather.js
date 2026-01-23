/**
 * Component: Weather Intelligence
 * Fetches Real-Time Data via Open-Meteo API based on Map Location
 */

window.initWeather = function () {
    console.log('Initializing Weather...');

    // 1. Build the Structure (Restoring Missing UI)
    const panel = document.getElementById('weather-panel');
    if (panel) {
        panel.innerHTML = `
            <div class="panel-header">
                <h2><i class="fa-solid fa-cloud-sun"></i> Weather Intelligence</h2>
            </div>
            <div class="weather-grid">
                <div class="weather-main">
                    <div class="current-temp">
                        <span class="temp-val">--°C</span>
                        <div class="weather-desc">Loading...</div>
                    </div>
                    <i class="fa-solid fa-cloud weather-icon-lg"></i>
                </div>
                <div class="weather-stats">
                    <div class="stat-item">
                        <i class="fa-solid fa-droplet"></i>
                        <div class="stat-info">
                            <span class="label">Humidity</span>
                            <span class="value" id="val-humidity">--%</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fa-solid fa-wind"></i>
                        <div class="stat-info">
                            <span class="label">Wind</span>
                            <span class="value" id="val-wind">-- km/h</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fa-solid fa-cloud-rain"></i>
                        <div class="stat-info">
                            <span class="label">Rain</span>
                            <span class="value">0%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="farming-advice success">
                <i class="fa-solid fa-check-circle advice-icon"></i>
                <div class="advice-content">
                    <h4>System Ready</h4>
                    <p>Detecting location weather...</p>
                </div>
            </div>
        `;
    }

    // 2. Fetch Initial Data (Coimbatore Default)
    window.fetchWeatherData(11.0168, 76.9558);
}

// Public function to fetch real weather
window.fetchWeatherData = async function (lat, lng) {
    const descEl = document.querySelector('.weather-desc');

    // UI Loading State
    if (descEl) descEl.textContent = "Updating...";

    try {
        // Open-Meteo API (Free, No Key)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

        const response = await fetch(url);
        const data = await response.json();

        if (data && data.current) {
            updateWeatherUI({
                temp: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                wind: data.current.wind_speed_10m,
                unit: data.current_units.temperature_2m
            });
        }
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        if (descEl) descEl.textContent = "Offline Mode";
        // Fallback to simulation if offline
        updateWeatherUI({
            temp: 28 + Math.random() * 2,
            humidity: 60 + Math.random() * 10,
            wind: 12 + Math.random() * 5,
            unit: "°C"
        });
    }
}

function updateWeatherUI(data) {
    // 1. Update Values
    const tempEl = document.querySelector('.temp-val');
    const humidityEl = document.getElementById('val-humidity');
    const windEl = document.getElementById('val-wind');
    const descEl = document.querySelector('.weather-desc');

    if (tempEl) tempEl.textContent = `${Math.round(data.temp)}${data.unit}`;
    if (humidityEl) humidityEl.textContent = `${Math.round(data.humidity)}%`;
    if (windEl) windEl.textContent = `${Math.round(data.wind)} km/h`;

    // 2. Derive Description & Advice
    let weatherState = "Sunny";
    let advice = "Good conditions for general farming.";
    let adviceType = "success";
    let icon = "fa-check-circle";

    // Simple Logic based on real temp
    if (data.temp > 30) {
        weatherState = "Hot";
        advice = "High heat. Ensure irrigation.";
        adviceType = "warning";
        icon = "fa-temperature-high";
    } else if (data.humidity > 80) {
        weatherState = "Humid";
        advice = "Fungal risk high. Monitor crops.";
        adviceType = "warning";
        icon = "fa-cloud-rain";
    }

    if (descEl) descEl.textContent = weatherState;

    // 3. Update Advice Box
    const adviceBox = document.querySelector('.farming-advice');
    if (adviceBox) {
        adviceBox.className = `farming-advice ${adviceType}`;
        adviceBox.innerHTML = `
            <i class="fa-solid ${icon} advice-icon"></i>
            <div class="advice-content">
                <h4>Smart Advice</h4>
                <p>${advice}</p>
            </div>
        `;
    }
}
