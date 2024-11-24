const mapAirQualityData = require("../airQualityMapper");

describe("airQualityMapper()", () => {
  it("Returns the expected object when there is an API response", () => {
    const rawData = {
      data: {
        current: {
          pollution: {
            aqius: 50,
            aqicn: 100,
          },
        },
      },
    };

    const expected = {
      Result: {
        Pollution: {
          aqius: 50,
          aqicn: 100,
        },
      },
    };

    const result = mapAirQualityData(rawData);

    expect(result).toEqual(expected);
  });

  it("Returns empty Pollution object when the API response is undefined", () => {
    const rawData = undefined;

    const expected = {
      Result: {
        Pollution: {},
      },
    };

    const result = mapAirQualityData(rawData);

    expect(result).toEqual(expected);
  });

  it("Returns empty Pollution object when the API response is empty object {}", () => {
    const rawData = {};

    const expected = {
      Result: {
        Pollution: {},
      },
    };

    const result = mapAirQualityData(rawData);

    expect(result).toEqual(expected);
  });
});
