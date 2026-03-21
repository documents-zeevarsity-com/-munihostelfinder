// currency-converter.js - Currency conversion utilities
// Note: Currency exchange functionality has been removed
// Prices are displayed in UGX only

window.currencyConverter = {
    // Placeholder for future currency conversion features
    convert: function(amount, fromCurrency, toCurrency) {
        // For now, return the amount as-is (assuming UGX)
        return amount;
    },

    formatCurrency: function(amount, currency = 'UGX') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }
};