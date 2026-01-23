/**
 * Component: Direct Trade Marketplace
 * Connects farmers directly with buyers, bypassing middlemen.
 */

window.initMarketplace = function () {
    renderMarketplaceUI();
    // Initialize Intelligence if available
    setTimeout(() => {
        if (window.PriceIntelligence) {
            renderForecastUI();
        }
    }, 100);
}

function renderMarketplaceUI() {
    const panel = document.getElementById('marketplace-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div class="panel-header" style="flex-direction: column; align-items: flex-start; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                 <h2><i class="fa-solid fa-handshake"></i> Direct Trade Network</h2>
                 <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">
                    <i class="fa-solid fa-plus"></i> Create Listing
                 </button>
            </div>
            
            <div class="tabs" style="display: flex; gap: 1rem; border-bottom: 1px solid #334155; width: 100%;">
                <button onclick="switchMarketTab('local')" id="tab-local" class="tab-btn active" style="background: none; border: none; color: var(--primary); padding: 0.5rem 1rem; cursor: pointer; border-bottom: 2px solid var(--primary); font-weight: 600;">
                    Local Buyers
                </button>
                <button onclick="switchMarketTab('prices')" id="tab-prices" class="tab-btn" style="background: none; border: none; color: #94a3b8; padding: 0.5rem 1rem; cursor: pointer; border-bottom: 2px solid transparent;">
                    Daily Market Prices (Uzhavan)
                </button>
                <button onclick="switchMarketTab('forecast')" id="tab-forecast" class="tab-btn" style="background: none; border: none; color: #facc15; padding: 0.5rem 1rem; cursor: pointer; border-bottom: 2px solid transparent;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Smart Forecast
                </button>
            </div>
        </div>

        <!-- View: Local Market -->
        <div id="view-local" class="market-grid" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; height: calc(100% - 110px);">
            
            <!-- Left: Harvest Status -->
            <div class="harvest-card" style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1.5rem;">
                 <h3 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase;">Your Crop Status</h3>
                 
                 <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid #facc15; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; flex-direction: column; background: rgba(250, 204, 21, 0.1);">
                        <span style="font-size: 2rem; font-weight: 700; color: #facc15;">15</span>
                        <span style="font-size: 0.8rem; color: #e2e8f0;">Days left</span>
                    </div>
                    <h4 style="font-size: 1.2rem; color: white; margin-bottom: 0.5rem;">Premium Ponni Rice</h4>
                    <span class="status-badge warning">Maturation Stage</span>
                 </div>

                 <div class="scout-report" style="background: rgba(15, 23, 42, 0.5); padding: 1rem; border-radius: 8px; border: 1px solid #334155;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                        <span style="color:#94a3b8;">Exp. Yield:</span>
                        <span style="color:white; font-weight: 600;">4.5 Tons</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                         <span style="color:#94a3b8;">Quality:</span>
                         <span style="color:#4ade80; font-weight: 600;">Grade A</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                         <span style="color:#94a3b8;">Avg. Market Rate:</span>
                         <span style="color:#facc15; font-weight: 600;">₹ 2,400 / qtl <span style="color:#10b981; font-size:0.7rem;">(Live)</span></span>
                    </div>
                 </div>
            </div>

            <!-- Right: Buyer Network -->
            <div class="buyers-list" style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1.5rem; overflow-y: auto;">
                <h3 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase;">Verified Buyers & Local Rates</h3>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${renderBuyerCard('AgroCorp Global', ' Multinational Exporter', '₹ 2,650', 'bg-blue-500', '+91 98765 43210', 'Chennai, TN')}
                    ${renderBuyerCard('Nala Foods Ltd', 'Domestic Retail Chain', '₹ 2,580', 'bg-green-600', '+91 98989 89898', 'Coimbatore, TN')}
                    ${renderBuyerCard('Tamil Nadu Civil Supplies', 'Government Procurement', '₹ 2,450', 'bg-gray-600', '044-2435 6789', 'Local Circle Office')}
                    ${renderBuyerCard('Organic Harvest Co.', 'Premium Organic Buyer', '₹ 2,900', 'bg-emerald-600', '+91 99887 76655', 'Madurai, TN')}
                </div>
            </div>
        </div>

        <!-- View: Market Prices Reference (Uzhavan Style) -->
        <div id="view-prices" style="display: none; height: calc(100% - 110px); flex-direction: column; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden;">
            
            <!-- Filter Section (App-like) -->
            <div style="padding: 1rem; background: #0f172a; border-bottom: 1px solid #334155; display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: end;">
                <div>
                    <label style="color: #94a3b8; font-size: 0.75rem; display: block; margin-bottom: 4px;">Select District</label>
                    <select class="form-select" style="width: 100%; background: #1e293b; color: white; border: 1px solid #334155; padding: 8px; border-radius: 6px; outline: none;">
                        <option>All Districts</option>
                        <option selected>Thanjavur</option>
                        <option>Madurai</option>
                        <option>Coimbatore</option>
                    </select>
                </div>
                <div>
                    <label style="color: #94a3b8; font-size: 0.75rem; display: block; margin-bottom: 4px;">Select Crop</label>
                    <select class="form-select" style="width: 100%; background: #1e293b; color: white; border: 1px solid #334155; padding: 8px; border-radius: 6px; outline: none;">
                        <option>All Crops</option>
                        <option selected>Paddy (Rice)</option>
                        <option>Coconut</option>
                        <option>Cotton</option>
                    </select>
                </div>
                <div>
                    <label style="color: #94a3b8; font-size: 0.75rem; display: block; margin-bottom: 4px;">Market</label>
                    <select class="form-select" style="width: 100%; background: #1e293b; color: white; border: 1px solid #334155; padding: 8px; border-radius: 6px; outline: none;">
                        <option selected>All Markets</option>
                        <option>Regulated Market</option>
                        <option>Co-operative</option>
                    </select>
                </div>
                <button class="btn-primary" style="height: 38px; padding: 0 1.5rem;"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
            </div>

            <!-- Results List -->
            <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                <h4 style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">Today's Rate for <strong>Paddy</strong> in <strong>Thanjavur</strong></h4>
                
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    ${renderUzhavanRow('Thanjavur Regulated Mkt', 'Paddy - Ponni', '2,450', '2,500', '2,480')}
                    ${renderUzhavanRow('Kumbakonam Market', 'Paddy - IR 20', '2,100', '2,200', '2,150')}
                    ${renderUzhavanRow('Orathanadu Co-op', 'Paddy - BPT', '2,350', '2,420', '2,400')}
                    ${renderUzhavanRow('Pattukkottai Market', 'Paddy - CR 1009', '2,050', '2,150', '2,100')}
                </div>
            </div>
            
            <div style="padding: 0.8rem; border-top: 1px solid #334155; background: #0f172a; font-size: 0.75rem; color: #64748b; display: flex; justify-content: space-between;">
                <span><i class="fa-solid fa-rotate"></i> Updated: 11-Jan-2026</span>
                <span>Data Source: Uzhavan / Dept of Ag Marketing</span>
            </div>
        </div>

        <!-- View: Smart Forecast AI -->
        <div id="view-forecast" style="display: none; height: calc(100% - 110px); flex-direction: column; background: rgba(255,255,255,0.02); border-radius: 12px; overflow-y: auto; padding: 1.5rem;">
            
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="color: white; margin-bottom: 0.5rem;">AI Price Intelligence <span style="font-size: 0.8rem; background: var(--primary); color:black; padding: 2px 6px; border-radius: 4px;">BETA</span></h2>
                <p style="color: #94a3b8; font-size: 0.9rem;">Advanced algorithms analyze market trends to suggest the Best Time to Sell.</p>
            </div>

            <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem;">
                 <button onclick="renderForecastUI('Paddy')" class="crop-pill active" style="background: #334155; border: 1px solid var(--primary); color: white; padding: 6px 16px; border-radius: 20px; cursor: pointer;">Paddy</button>
                 <button onclick="renderForecastUI('Cotton')" class="crop-pill" style="background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 6px 16px; border-radius: 20px; cursor: pointer;">Cotton</button>
                 <button onclick="renderForecastUI('Coconut')" class="crop-pill" style="background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 6px 16px; border-radius: 20px; cursor: pointer;">Coconut</button>
            </div>

            <div id="forecast-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                 <!-- Injected by JS -->
                 <div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 2rem;">
                    <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary);"></i><br>
                    Analyzing Market Data...
                 </div>
            </div>

        </div>

        <!-- Chat Modal (Hidden by default) -->
        <div id="chat-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; align-items: center; justify-content: center;">
            <div style="width: 400px; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
                <div class="chat-header" style="background: #0f172a; padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155;">
                    <span id="chat-title" style="font-weight: 600; color: white;">Contact Buyer</span>
                    <button onclick="closeChat()" style="background:none; border:none; color: #94a3b8; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="chat-body" style="padding: 1rem; height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;" id="chat-messages">
                    <!-- Messages -->
                </div>
                <div class="chat-footer" style="padding: 1rem; border-top: 1px solid #334155; display: flex; gap: 0.5rem;">
                    <input type="text" id="chat-input" placeholder="Type your offer..." style="flex: 1; background: #0f172a; border: 1px solid #334155; padding: 8px; border-radius: 4px; color: white;">
                    <button onclick="sendMessage()" class="btn-primary" style="padding: 0 1rem;"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
}

function renderBuyerCard(name, type, price, colorClass, phone, location) {
    // Generate a simple initial logo
    const initial = name.charAt(0);
    // Simple mock color mapping for basic style, actual uses inline styles due to no Tailwind
    let bg = '#3b82f6';
    if (colorClass === 'bg-green-600') bg = '#16a34a';
    if (colorClass === 'bg-gray-600') bg = '#4b5563';
    if (colorClass === 'bg-emerald-600') bg = '#059669';

    return `
        <div class="buyer-card" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem; border-left: 3px solid ${bg}; transition: transform 0.2s;">
            <div style="width: 48px; height: 48px; background: ${bg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1.2rem;">
                ${initial}
            </div>
            <div style="flex: 1;">
                <h4 style="margin: 0; color: white; font-size: 1rem;">${name} <i class="fa-solid fa-certificate" style="color: #3b82f6; font-size: 0.8rem; margin-left: 4px;" title="Verified"></i></h4>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${type}</div>
                
                <div style="display: flex; gap: 10px; margin-top: 6px; font-size: 0.75rem; color: #cbd5e1;">
                    <span><i class="fa-solid fa-phone" style="color: #94a3b8;"></i> ${phone}</span>
                    <span><i class="fa-solid fa-location-dot" style="color: #94a3b8;"></i> ${location}</span>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.7rem; color: #cbd5e1;">Live Rate/qtl</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #facc15;">${price}</div>
                <div style="font-size: 0.65rem; color: #10b981; margin-top: 2px;"><i class="fa-solid fa-chart-line"></i> Updated now</div>
            </div>
            <button onclick="openChat('${name}')" style="background: var(--primary); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-left: 1rem; font-weight: 500;">
                Connect
            </button>
        </div>
    `;
}

window.openChat = function (buyerName) {
    const modal = document.getElementById('chat-modal');
    const title = document.getElementById('chat-title');
    const msgContainer = document.getElementById('chat-messages');

    if (!modal) return;

    title.textContent = `Connect with ${buyerName}`;
    modal.style.display = 'flex';

    // Mock History
    msgContainer.innerHTML = `
        <div style="align-self: flex-start; background: #334155; padding: 8px 12px; border-radius: 8px; max-width: 80%; font-size: 0.9rem; color: #e2e8f0;">
            Hello! We are interested in your Premium Ponni Rice harvest. Is it available for Grade A quality check?
        </div>
    `;
}

window.closeChat = function () {
    const modal = document.getElementById('chat-modal');
    if (modal) modal.style.display = 'none';
}

window.sendMessage = function () {
    const input = document.getElementById('chat-input');
    const msgContainer = document.getElementById('chat-messages');
    const msg = input.value.trim();

    if (msg) {
        // Add User Message
        msgContainer.innerHTML += `
             <div style="align-self: flex-end; background: var(--primary); padding: 8px 12px; border-radius: 8px; max-width: 80%; font-size: 0.9rem; color: white; margin-top: 0.5rem;">
                ${msg}
            </div>
        `;
        input.value = '';
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Mock Auto Reply
        setTimeout(() => {
            msgContainer.innerHTML += `
                <div style="align-self: flex-start; background: #334155; padding: 8px 12px; border-radius: 8px; max-width: 80%; font-size: 0.9rem; color: #e2e8f0; margin-top: 0.5rem;">
                    Thanks for the update. Let's schedule a quality inspection visit next week.
                </div>
            `;
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }, 1500);
    }
}

window.switchMarketTab = function (tab) {
    const viewLocal = document.getElementById('view-local');
    const viewPrices = document.getElementById('view-prices');
    const viewForecast = document.getElementById('view-forecast');

    const tabLocal = document.getElementById('tab-local');
    const tabPrices = document.getElementById('tab-prices');
    const tabForecast = document.getElementById('tab-forecast');

    // Reset All
    if (viewLocal) viewLocal.style.display = 'none';
    if (viewPrices) viewPrices.style.display = 'none';
    if (viewForecast) viewForecast.style.display = 'none';

    if (tabLocal) {
        tabLocal.classList.remove('active');
        tabLocal.style.color = '#94a3b8';
        tabLocal.style.borderBottom = '2px solid transparent';
    }
    if (tabPrices) {
        tabPrices.classList.remove('active');
        tabPrices.style.color = '#94a3b8';
        tabPrices.style.borderBottom = '2px solid transparent';
    }
    if (tabForecast) {
        tabForecast.classList.remove('active');
        tabForecast.style.color = '#facc15'; // Default yellow, but dim it? 
        // Actually for inactive state let's use gray or dim yellow
        tabForecast.style.color = '#94a3b8';
        tabForecast.style.borderBottom = '2px solid transparent';
    }

    // Activate Selected
    if (tab === 'local') {
        if (viewLocal) viewLocal.style.display = 'grid';
        if (tabLocal) {
            tabLocal.classList.add('active');
            tabLocal.style.color = 'var(--primary)';
            tabLocal.style.borderBottom = '2px solid var(--primary)';
        }
    } else if (tab === 'forecast') {
        if (viewForecast) viewForecast.style.display = 'flex';
        if (tabForecast) {
            tabForecast.classList.add('active');
            tabForecast.style.color = '#facc15';
            tabForecast.style.borderBottom = '2px solid #facc15';
        }
    } else { // prices
        if (viewPrices) viewPrices.style.display = 'flex';
        if (tabPrices) {
            tabPrices.classList.add('active');
            tabPrices.style.color = 'var(--primary)';
            tabPrices.style.borderBottom = '2px solid var(--primary)';
        }
    }
}

// Render Forecast Logic
window.renderForecastUI = function (crop = 'Paddy') {
    if (!window.PriceIntelligence) return;

    // 1. Get Analysis
    const analysis = window.PriceIntelligence.analyze(crop);
    const container = document.getElementById('forecast-content');

    // 2. Build Recommendation Card
    const recColor = analysis.recommendation === 'SELL NOW' ? '#ef4444' : '#10b981';

    // 3. Build Chart Bars (Simple CSS Bars)
    let chartHTML = `<div style="display:flex; align-items:flex-end; height: 150px; gap: 4px; padding-top: 20px; border-bottom: 1px solid #334155;">`;
    const maxVal = Math.max(...analysis.forecast);
    const minVal = Math.min(...analysis.forecast);

    analysis.forecast.forEach((val, i) => {
        const heightPct = ((val - minVal) / (maxVal - minVal)) * 80 + 10; // Normalize 10-90%
        const isPeak = i === analysis.peakDay;
        chartHTML += `
            <div title="Day ${i + 1}: ₹${val}" style="flex:1; background: ${isPeak ? '#facc15' : '#3b82f6'}; height: ${heightPct}%; border-radius: 2px 2px 0 0; position:relative; opacity: 0.8; transition: height 0.5s;">
                ${isPeak ? '<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:0.6rem; color:#facc15; font-weight:bold;">Peak</span>' : ''}
            </div>
        `;
    });
    chartHTML += `</div><div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#64748b; margin-top:5px;"><span>Today</span><span>15 Days</span><span>30 Days</span></div>`;

    container.innerHTML = `
        <!-- Left: Recommendation -->
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; border-left: 4px solid ${recColor};">
            <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 1rem;">AI Recommendation</h3>
            <div style="font-size: 2.5rem; font-weight: 800; color: ${recColor}; margin-bottom: 0.5rem;">
                ${analysis.recommendation}
            </div>
            <p style="color: white; font-size: 1.1rem; margin-bottom: 1rem;">${analysis.reason}</p>
            
            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-top: 1.5rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                    <span style="color:#94a3b8;">Current Rate:</span>
                    <strong style="color:white;">₹ ${analysis.currentPrice} / qtl</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:#94a3b8;">Predicted Peak:</span>
                    <strong style="color:#facc15;">₹ ${analysis.peakPrice} / qtl</strong> <span style="font-size:0.8rem; color:#94a3b8;">(in ${analysis.peakDay} days)</span>
                </div>
            </div>
        </div>

        <!-- Right: Trend Chart -->
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px;">
            <h3 style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 1rem;">30-Day Price Trend</h3>
            ${chartHTML}
            <div style="margin-top: 1rem; font-size: 0.8rem; color: #64748b; text-align: center;">
                <i class="fa-solid fa-robot"></i> Prediction based on historical data & volatility models.
            </div>
        </div>
    `;
}
