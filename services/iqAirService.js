require("dotenv").config();
const axios = require("axios");
const mapAirQualityData = require("../utils/airQualityMapper");
const AppError = require('../utils/AppError');

const IQAIR_API_BASE_URL = "http://api.airvisual.com/v2";
const IQAIR_API_KEY = process.env.IQAIR_API_KEY;

/**
 * Fetch air quality data for the nearest city of the given latitude, longitude
 * @param {string} latitude - Latitude of the zone
 * @param {string} longitude - Longitude of the zone
 * @returns {Promise<Object>} - Air quality data
 */
async function getNearestCityAirQuality(latitude, longitude) {
  try {
    const response = await axios.get(`${IQAIR_API_BASE_URL}/nearest_city`, {
      params: {
        lat: latitude,
        lon: longitude,
        key: IQAIR_API_KEY,
      },
    });

    return mapAirQualityData(response.data);
  } catch (error) {
    throw new AppError(
      `Failed to fetch air quality data: ${
        error.response?.data?.message || error.message
      }`, 500
    );
  }
}

module.exports = {
  getNearestCityAirQuality,
};
