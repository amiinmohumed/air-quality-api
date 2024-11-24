const express = require("express");
const { getZoneAirQuality, getMostPollutedForParis } = require("../controllers/airQualityController");

const router = express.Router();

router.get("/air-quality", getZoneAirQuality);
// Info! This can receive the zone as a URL parameter dynamically later on if needed
router.get("/zone/paris/most-polluted-timestamp", getMostPollutedForParis);

module.exports = router;
