const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios'); // Import axios for making HTTP requests

// Initialize Firebase Admin SDK (required to interact with Firestore)
admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function to fetch weather data from Open-Meteo and store it in Firestore.
 * This is an HTTPS callable function, meaning it can be invoked directly from your client app.
 *
 * @param {object} data - The data sent from the client. Expected:
 *   {
 *     latitude: number,
 *     longitude: number,
 *     locationName: string // A unique identifier for the location (e.g., city name)
 *   }
 * @param {object} context - The context of the function call (contains auth info).
 */
exports.fetchAndStoreOpenMeteoWeather = functions.https.onCall(async (data, context) => {
    // Optional: Basic authentication check.
    // If you want only authenticated users to call this, uncomment the following lines:
    // if (!context.auth) {
    //     throw new functions.https.HttpsError(
    //         'unauthenticated',
    //         'The function must be called while authenticated.'
    //     );
    // }

    const { latitude, longitude, locationName } = data;

    // Validate input parameters
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !locationName) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Missing or invalid latitude, longitude, or locationName.'
        );
    }

    try {
        const openMeteoApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

        const response = await axios.get(openMeteoApiUrl);
        const weatherData = response.data;

        const dataToStore = {
            locationName: locationName,
            latitude: latitude,
            longitude: longitude,
            fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
            currentWeather: weatherData.current_weather,
            dailyForecast: weatherData.daily,
        };

        await db.collection('weather').doc(locationName).set(dataToStore);

        console.log(`Successfully fetched and stored weather for ${locationName}`);

        return {
            success: true,
            message: `Weather data for ${locationName} fetched and stored successfully.`,
            weather: dataToStore
        };

    } catch (error) {
        console.error(`Error fetching or storing weather data for ${locationName}:`, error);

        if (error.response) {
            throw new functions.https.HttpsError(
                'unavailable',
                `External weather API error: ${error.response.status} - ${error.response.statusText}`,
                error.response.data
            );
        } else if (error.request) {
            throw new functions.https.HttpsError(
                'unavailable',
                'No response received from external weather API.',
                error.message
            );
        } else {
            throw new functions.https.HttpsError(
                'internal',
                'Failed to process weather request.',
                error.message
            );
        }
    }
});
