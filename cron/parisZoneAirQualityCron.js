const cron = require("node-cron");
const { getNearestCityAirQuality } = require("../services/iqAirService");
const { saveAirQualityData } = require("../controllers/airQualityController");

// Paris zone coordinates
const lat = 48.856613;
const lon = 2.352222;
const zone = "Paris";

// It runs every minute
cron.schedule("* * * * *", async () => {
  await fetchParisAirQuality();
});

async function fetchParisAirQuality() {
    try {
        console.log("Fetching air quality data for Paris...");

        const airQualityData = await getNearestCityAirQuality(lat, lon);

        if (airQualityData &&
            airQualityData.Result &&
            airQualityData.Result.Pollution) {
            const pollution = airQualityData.Result.Pollution;

            await saveAirQualityData(lat, lon, zone, pollution);

            console.log("Air quality data for Paris saved successfully");
        } else {
            console.log("No air quality data available for Paris");
        }
    } catch (error) {
        console.error("Error fetching or saving air quality data:", error);
    }
}

module.exports = fetchParisAirQuality;