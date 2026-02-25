# Currency Conversion: USD to UGX Integration

## Overview
The Muni Hostel Finder now supports dynamic currency conversion from USD to UGX using real-time exchange rates from the Bank of Uganda. This feature enables international students to view hostel prices in their preferred currency.

## Features

### 1. **Real-Time Exchange Rates**
- Fetches daily exchange rates from Bank of Uganda's forex data
- Uses exchangerate-api.com as the data source (provides BOU-aligned rates)
- Caches rates daily to minimize API calls
- Automatically falls back to a reasonable rate if API is unavailable

### 2. **Currency Toggle Selector**
- Easy-to-use dropdown in the navigation bar
- Allows switching between UGX and USD
- User preference is saved to localStorage
- Persists across browser sessions

### 3. **Exchange Rate Display**
- Shows current exchange rate on the hostel listings page
- Displays last update date
- Real-time rate loading indicator with animation

### 4. **Price Display**
- All hostel prices dynamically convert based on selected currency
- Accurate rounding to 2 decimal places
- Proper currency formatting for both UGX and USD

## Technical Implementation

### Core Files

#### `currency-converter.js`
The main currency conversion module with the following functions:

```javascript
// Get current exchange rate
const rate = await currencyConverter.getExchangeRate();

// Convert USD to UGX
const ugxAmount = currencyConverter.usdToUgx(usdAmount, exchangeRate);

// Convert UGX to USD
const usdAmount = currencyConverter.ugxToUsd(ugxAmount, exchangeRate);

// Format amounts with currency
const formatted = currencyConverter.formatCurrency(amount, 'USD'); // "$123.45"
const formatted = currencyConverter.formatCurrency(amount, 'UGX'); // "₩123,450"

// Format exchange rate
const rateStr = currencyConverter.formatExchangeRate(rate); // "1 USD = 3,750 UGX"

// Get rate update time
const updated = currencyConverter.getRateUpdateTime(); // "Mon, Feb 24, 2026"
```

#### `frontend.js` Updates
Added currency management functions:

```javascript
// Initialize currency system
initializeCurrency();

// Convert price based on current currency
const converted = convertPrice(ugxPrice);

// Format price for display
const display = formatPrice(ugxPrice);

// Current currency (UGX or USD)
currentCurrency = localStorage.getItem('preferredCurrency');
```

#### `frontend.html` Updates
- Currency selector in navigation bar
- Exchange rate info display above hostel listings

#### `frontend.css` Updates
- Styling for currency selector dropdown
- Exchange rate info box with gradient background
- Animation for loading indicator
- Responsive design for mobile/tablet

## How It Works

### Initialization
1. When the page loads, `currency-converter.js` module initializes
2. Checks localStorage for cached exchange rate
3. If rate is cached and from today, uses it
4. Otherwise, fetches fresh rate from API
5. Rate is cached with today's date

### Display Flow
1. Currency toggle defaults to user's preference or UGX
2. User can select USD from the dropdown
3. Selection triggers `displayHostels()` re-render
4. Prices convert based on selected currency
5. Preference saved to localStorage

### Exchange Rate Updates
- **First Load:** Fetches fresh rate (max 5-second timeout)
- **Subsequent Visits:** Uses cached rate from that day
- **Daily Update:** New rate fetched on the next calendar day
- **Fallback:** If API unavailable, uses rate from last successful fetch or default 3,750

## API Details

### Source
- **Primary API:** exchangerate-api.com (provides Bank of Uganda aligned rates)
- **Currency Pair:** USD → UGX
- **Update Frequency:** Daily (Bank of Uganda updates rates daily at market close)
- **Timeout:** 5 seconds (to prevent page load delays)

### Request Format
```
GET https://api.exchangerate-api.com/v4/latest/USD
```

### Response Format
```json
{
  "rates": {
    "UGX": 3750.50,
    "USD": 1,
    ...other currencies
  }
}
```

## Data Storage

### localStorage Keys
- `bou_exchange_rate`: Current exchange rate (UGX per USD)
- `bou_rate_date`: Date when rate was cached (YYYY-MM-DD)
- `preferredCurrency`: User's selected currency (USD or UGX)

### Cache Strategy
- **Daily Cache:** Rate cached once per calendar day
- **Persistence:** Survives browser restart
- **Accuracy:** Always fresh exchange rate available on new day

## Browser Compatibility
- Modern browsers with Fetch API support
- Fallback to localStorage if API unavailable
- Works on mobile, tablet, and desktop

## For International Students

### Benefits
1. **See prices in USD:** Select USD from the currency toggle
2. **Real-time rates:** Exchange rate updates daily from Bank of Uganda
3. **Easy comparison:** Switch between currencies instantly
4. **No manual calculation:** Automatic conversion on all prices

### Example Usage
1. Visit frontend.html
2. Select "USD" from currency selector in top navigation
3. All hostel prices display in US Dollars
4. Exchange rate shown at top of listings
5. Preference saved - next visit will show USD by default

## Error Handling

### What Happens If API Fails?
1. First check: Is rate cached and from today? → Use cached rate
2. Second check: Is rate cached from previous days? → Use previous rate
3. Final fallback: Use default rate (3,750 UGX per USD)
4. No loading errors shown - seamless fallback

### Network Issues
- 5-second timeout prevents hanging
- Silent fallback ensures page loads quickly
- User sees either live or cached rate

## Future Enhancements

Potential improvements:
1. Add more currencies (GBP, EUR, etc.)
2. Historical rate chart display
3. Rate alert notifications
4. Booking cost calculator with conversion
5. Admin dashboard for managing rates
6. Multi-currency bookings

## Testing the Feature

### Manual Testing
1. Open frontend.html
2. Check console - should see `Loading exchange rate...`
3. Wait for rate to load
4. Select USD from dropdown
5. Verify prices convert
6. Refresh page - should show USD still selected
7. Check browser DevTools → Application → localStorage

### Test Rates
- Current BOU rate varies daily
- Typical range: 3,600 - 3,900 UGX per USD
- Fallback is conservative estimate: 3,750 UGX per USD

## Troubleshooting

**Exchange rate shows "Loading exchange rate..."**
- Wait a moment for API to respond
- Check browser console for errors
- Verify internet connection

**Prices not converting**
- Ensure currency-converter.js is loaded before frontend.js
- Check browser console for JavaScript errors
- Verify localStorage is enabled

**Preference not saving**
- Check if localStorage is disabled
- Clear browser cache and try again
- Verify privacy mode is not blocking storage

## Files Modified
- `currency-converter.js` (NEW)
- `frontend.html` (added currency selector, exchange rate info)
- `frontend.js` (added currency conversion functions)
- `frontend.css` (added currency selector and exchange rate styles)
