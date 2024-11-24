/**
 * Maps the API response to a specific object structure
 * @param {Object} data - The data from the API
 * @returns {Object} - Mapped object
 */
function mapAirQualityData(data) {
  const pollutionData = data?.data?.current?.pollution;

  return {
    Result: {
      Pollution: pollutionData ?? {},
    },
  };
}

module.exports = mapAirQualityData;
