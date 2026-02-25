// currency-converter.js - USD to UGX conversion with Bank of Uganda daily rates

const currencyConverter = (() => {
    // Cache key for storing exchange rates
    const CACHE_KEY = 'bou_exchange_rate';
    const DATE_KEY = 'bou_rate_date';
    const API_TIMEOUT = 5000; // 5 seconds timeout

    // Bank of Uganda forex API endpoint
    // Using exchangerate-api.com which provides BOU data
    const BOU_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
    
    // Fallback rate (approximate) - used if API fails
    const FALLBACK_RATE = 3750; // UGX per USD

    /**
     * Fetch current exchange rate from Bank of Uganda
     * @returns {Promise<number>} Exchange rate (UGX per USD)
     */
    async function fetchExchangeRate() {
        try {
            const response = await Promise.race([
                fetch(BOU_API_URL),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT)
                )
            ]);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract UGX rate from API response
            if (data.rates && data.rates.UGX) {
                const rate = Math.round(data.rates.UGX * 100) / 100; // Round to 2 decimals
                cacheExchangeRate(rate);
                return rate;
            }
            
            throw new Error('UGX rate not found in API response');
        } catch (error) {
            console.warn('Failed to fetch live exchange rate:', error.message);
            // Try to use cached rate if available
            const cachedRate = getCachedExchangeRate();
            if (cachedRate) {
                console.log('Using cached exchange rate:', cachedRate);
                return cachedRate;
            }
            // Use fallback rate
            console.log('Using fallback exchange rate:', FALLBACK_RATE);
            return FALLBACK_RATE;
        }
    }

    /**
     * Cache exchange rate with today's date
     * @param {number} rate - Exchange rate to cache
     */
    function cacheExchangeRate(rate) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(CACHE_KEY, rate.toString());
        localStorage.setItem(DATE_KEY, today);
    }

    /**
     * Get cached exchange rate if it's from today
     * @returns {number|null} Cached rate or null if expired/not found
     */
    function getCachedExchangeRate() {
        const today = new Date().toISOString().split('T')[0];
        const cachedDate = localStorage.getItem(DATE_KEY);
        
        // Return cached rate only if it's from today
        if (cachedDate === today) {
            const rate = parseFloat(localStorage.getItem(CACHE_KEY));
            return isNaN(rate) ? null : rate;
        }
        
        return null;
    }

    /**
     * Get current exchange rate (use cache or fetch new)
     * @returns {Promise<number>} Current exchange rate
     */
    async function getExchangeRate() {
        // Check if we have today's cached rate
        const cachedRate = getCachedExchangeRate();
        if (cachedRate !== null) {
            return cachedRate;
        }
        
        // Fetch fresh rate from API
        return await fetchExchangeRate();
    }

    /**
     * Convert USD to UGX
     * @param {number} usdAmount - Amount in USD
     * @param {number} exchangeRate - Exchange rate (UGX per USD)
     * @returns {number} Amount in UGX
     */
    function usdToUgx(usdAmount, exchangeRate) {
        return Math.round(usdAmount * exchangeRate * 100) / 100;
    }

    /**
     * Convert UGX to USD
     * @param {number} ugxAmount - Amount in UGX
     * @param {number} exchangeRate - Exchange rate (UGX per USD)
     * @returns {number} Amount in USD
     */
    function ugxToUsd(ugxAmount, exchangeRate) {
        return Math.round((ugxAmount / exchangeRate) * 100) / 100;
    }

    /**
     * Format amount with currency symbol
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code ('USD' or 'UGX')
     * @returns {string} Formatted amount
     */
    function formatCurrency(amount, currency = 'UGX') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'USD' ? 2 : 0,
            maximumFractionDigits: currency === 'USD' ? 2 : 0
        });
        return formatter.format(amount);
    }

    /**
     * Format exchange rate display
     * @param {number} rate - Exchange rate
     * @returns {string} Formatted rate
     */
    function formatExchangeRate(rate) {
        return `1 USD = ${Math.round(rate).toLocaleString()} UGX`;
    }

    /**
     * Get rate update time
     * @returns {string} Date when rate was last cached
     */
    function getRateUpdateTime() {
        const date = localStorage.getItem(DATE_KEY);
        if (date) {
            return new Date(date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        return 'Never';
    }

    // Initialize - fetch rate when module loads
    getExchangeRate().catch(err => 
        console.error('Error initializing currency converter:', err)
    );

    // Public API
    return {
        getExchangeRate,
        usdToUgx,
        ugxToUsd,
        formatCurrency,
        formatExchangeRate,
        getRateUpdateTime,
        FALLBACK_RATE
    };
})();

// Make it globally accessible
if (typeof window !== 'undefined') {
    window.currencyConverter = currencyConverter;
}
