const axios = require("axios");
const { getNearestCityAirQuality } = require("../../services/iqAirService");
const mapAirQualityData = require("../../utils/airQualityMapper");

jest.mock("axios");
jest.mock("../../utils/airQualityMapper");

describe("getNearestCityAirQuality", () => {
  it("Returns the air quality data when API call successes", async () => {
    const mockData = {
      status: "success",
      data: {
        current: {
          pollution: {
            ts: "2024-11-23T19:00:00.000Z",
            aqius: 39,
            mainus: "p2",
            aqicn: 17,
            maincn: "p1",
          },
        },
      },
    };

    axios.get.mockResolvedValue(mockData);

    mapAirQualityData.mockReturnValue({
      Result: {
        Pollution: {
          ts: "2024-11-23T19:00:00.000Z",
          aqius: 39,
          mainus: "p2",
          aqicn: 17,
          maincn: "p1",
        },
      },
    });

    const latitude = "48.8566";
    const longitude = "2.3522";

    const result = await getNearestCityAirQuality(latitude, longitude);

    expect(result).toEqual({
      Result: {
        Pollution: {
          ts: "2024-11-23T19:00:00.000Z",
          aqius: 39,
          mainus: "p2",
          aqicn: 17,
          maincn: "p1",
        },
      },
    });

    expect(axios.get).toHaveBeenCalledWith(
      "http://api.airvisual.com/v2/nearest_city",
      {
        params: {
          lat: latitude,
          lon: longitude,
          key: process.env.IQAIR_API_KEY,
        },
      }
    );
  });

  it("Throws error when the API request fails", async () => {
    const errorMessage =
      "Failed to fetch air quality data: Request failed with status code 500";
    axios.get.mockRejectedValue(new Error(errorMessage));

    const latitude = "48.8566";
    const longitude = "2.3522";

    await expect(getNearestCityAirQuality(latitude, longitude)).rejects.toThrow(
      errorMessage
    );
  });
});

