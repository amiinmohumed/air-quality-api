const { getNearestCityAirQuality } = require("../services/iqAirService");
const AirQuality = require("../models/AirQuality");
const AppError = require("../utils/AppError");

/**
 * @swagger
 * /air-quality:
 *   get:
 *     summary: Get air quality data for a specific zone based on latitude and longitude
 *     description: Returns the air quality data for the nearest city based on the provided latitude and longitude.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         description: Latitude of the specified location
 *         schema:
 *           type: number
 *           format: float
 *       - in: query
 *         name: longitude
 *         required: true
 *         description: Longitude of the specified location
 *         schema:
 *           type: number
 *           format: float
 *     responses:
 *       200:
 *         description: Successfully retrieved air quality data for the specified location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Result:
 *                   type: object
 *                   properties:
 *                     Pollution:
 *                       type: object
 *                       properties:
 *                         ts:
 *                           type: string
 *                           format: date-time
 *                           description: Timestamp of the air quality when captured
 *                         aqius:
 *                           type: integer
 *                           description: Air quality index in the US (AQI US)
 *                         mainus:
 *                           type: string
 *                           description: Main pollutant in the US
 *                         aqicn:
 *                           type: integer
 *                           description: Air quality index in China (AQI China)
 *                         maincn:
 *                           type: string
 *                           description: Main pollutant in China
 *       400:
 *         description: Missing latitude or longitude query parameters
 *       500:
 *         description: Internal server error
 */
exports.getZoneAirQuality = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and Longitude are required" });
  }

  try {
    const airQualityData = await getNearestCityAirQuality(latitude, longitude);

    res.status(200).json(airQualityData);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

/**
 * @swagger
 * /zone/paris/most-polluted-timestamp:
 *   get:
 *     summary: Get the most polluted timestamp for Paris based on a specified pollution type
 *     description: Returns the most polluted timestamp for Paris with the specified pollution type. The efault is 'us'
 *     parameters:
 *       - in: query
 *         name: pollutionType
 *         required: false
 *         description: The type of pollution. The default 'us'
 *         schema:
 *           type: string
 *           enum: [us, china]
 *           default: us
 *     responses:
 *       200:
 *         description: Successfully retrieved the most polluted timestamp for the specified pollution type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pollutionType:
 *                   type: string
 *                   description: Type of pollution data used (e.g., 'aqius', 'aqicn')
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: Date of the most polluted timestamp
 *                 time:
 *                   type: string
 *                   format: time
 *                   description: Time of the most polluted timestamp
 *                 pollution:
 *                   type: integer
 *                   description: Pollution level at the most polluted timestamp
 *       400:
 *         description: Invalid pollution type
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */
exports.getMostPollutedForParis = async (req, res) => {
  try {
    let { pollutionType = "aqius" } = req.query;

    if (pollutionType === "us") {
      pollutionType = "aqius";
    } else if (pollutionType === "china") {
      pollutionType = "aqicn";
    }

    const mostPolluted = await getMostPollutedTimestamp("Paris", pollutionType);

    res.status(200).json({
      pollutionType: pollutionType,
      date: mostPolluted.date,
      time: mostPolluted.time,
      pollution: mostPolluted.pollution,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.saveAirQualityData = async function saveAirQualityData(
  lat,
  lon,
  zone,
  pollution
) {
  try {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toISOString().split("T")[1].split(".")[0];

    const airQuality = new AirQuality({
      latitude: lat,
      longitude: lon,
      zone: zone,
      date: date,
      time: time,
      pollution: pollution,
    });

    await airQuality.save();
    console.log("Air quality data saved successfully");
  } catch (error) {
    console.error("Error saving air quality data:", error);
  }
};

/**
 * Fetch the timestamp and pollution data for the most polluted moment based on zone and pollution type
 * @param {string} zone - The zone (city) for which the data is to be retrieved
 * @param {string} pollutionType - The pollution type to calculate the higher pollution based on
 * @returns {Object} - The datetime and pollution value for the most polluted moment
 */
const getMostPollutedTimestamp = async function getMostPollutedTimestamp(
  zone,
  pollutionType = "aqius"
) {
  try {
    if (!zone) {
      throw new AppError("Zone is required", 400);
    }

    if (pollutionType !== "aqius" && pollutionType !== "aqicn") {
      throw new AppError(
        "Invalid pollution type. Supported values: 'aqius' or 'aqicn'",
        400
      );
    }

    const mostPolluted = await AirQuality.findOne({ zone })
      .sort({ [`pollution.${pollutionType}`]: -1 })
      .limit(1);

    if (!mostPolluted) {
      throw new AppError(`No data found for zone: ${zone}`, 404);
    }

    return {
      date: mostPolluted.date.toLocaleDateString("en-GB"),
      time: mostPolluted.time,
      pollution: mostPolluted.pollution[pollutionType],
    };
  } catch (error) {
    console.error("Error fetching most polluted record:", error);

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Internal Server Error", 500);
  }
};
