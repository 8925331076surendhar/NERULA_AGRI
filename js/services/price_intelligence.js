/**
 * Service: Market Price Intelligence
 * Analyzes market data (simulated) to predict trends and suggest best selling times.
 */

class PriceIntelligence {

    constructor() {
        this.crops = {
            'Paddy': { base: 2400, volatility: 0.05, trend: 'bullish' },
            'Cotton': { base: 6200, volatility: 0.08, trend: 'stable' },
            'Coconut': { base: 28, volatility: 0.12, trend: 'bearish' },
            'Maize': { base: 1900, volatility: 0.06, trend: 'bullish' }
        };
    }

    /**
     * Generate a 30-day price forecast
     * @param {string} crop - Crop name
     * @returns {Object} Analysis result
     */
    analyze(crop) {
        const data = this.crops[crop] || this.crops['Paddy'];
        const currentPrice = data.base + (Math.random() * 100 - 50); // Add some daily noise

        let forecast = [];
        let labels = [];
        let price = currentPrice;
        let peakPrice = 0;
        let peakDay = 0;

        // Generate 30 days of data
        for (let i = 0; i < 30; i++) {
            let change = 0;
            const noise = (Math.random() * data.volatility * 2 - data.volatility); // Random daily flux

            // Trend Logic
            if (data.trend === 'bullish') change = 0.005; // +0.5% daily avg
            if (data.trend === 'bearish') change = -0.003; // -0.3% daily avg
            if (data.trend === 'stable') change = 0.001;  // Slight inflation

            // Market Events (Random spikes)
            if (i === 15 && Math.random() > 0.5) change += 0.08; // 15th day spike possibility

            price = price * (1 + change + noise);
            forecast.push(Math.round(price));

            const d = new Date();
            d.setDate(d.getDate() + i);
            labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));

            if (price > peakPrice) {
                peakPrice = price;
                peakDay = i;
            }
        }

        // Recommendation Logic
        const profitDiff = peakPrice - currentPrice;
        const profitPercent = (profitDiff / currentPrice) * 100;

        let recommendation = 'HOLD';
        let reason = '';
        let sentiment = 'neutral';

        if (profitPercent > 5) {
            recommendation = 'HOLD';
            reason = `Prices likely to peak in ${peakDay} days. Potential +${profitPercent.toFixed(1)}% gain.`;
            sentiment = 'bullish';
        } else if (profitPercent < 0 || peakDay < 3) {
            recommendation = 'SELL NOW';
            reason = `Market is currently at a high point. Prices may dip soon.`;
            sentiment = 'bearish'; // Actually good to sell, but trend is down
        } else {
            recommendation = 'WATCH';
            reason = `Market is stable. No major spikes predicted.`;
        }

        return {
            currentPrice: Math.round(currentPrice),
            peakPrice: Math.round(peakPrice),
            peakDay: peakDay,
            forecast: forecast,
            labels: labels,
            recommendation: recommendation,
            reason: reason,
            sentiment: sentiment,
            profit: Math.round(profitDiff * 10) // Approx profit per ton/quintal * 10 (just a score)
        };
    }

    /**
     * Get CSS gradient for chart based on trend
     */
    getChartColor(sentiment) {
        if (sentiment === 'bullish') return '#10b981';
        if (sentiment === 'bearish') return '#f59e0b'; // Selling opportunity
        return '#3b82f6';
    }
}

// Global Export
window.PriceIntelligence = new PriceIntelligence();
