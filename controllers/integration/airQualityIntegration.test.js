const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const axios = require("axios");
const AirQuality = require("../../models/AirQuality");

const validLatitude = 40.7128;
const validLongitude = -74.006;

jest.mock("axios");

describe("GET /air-quality", () => {
  beforeAll(async () => {
    await mongoose.disconnect();
    await mongoose.connect("mongodb://localhost:27017/testAirQualityDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    jest.resetAllMocks();
  });

  afterEach(async () => {
    jest.clearAllTimers();
    jest.resetAllMocks();
  });

  describe("GET /air-quality", () => {
    it("Returns 200 and pollution data when valid latitude and longitude are provided", async () => {
      const mockApiResponse = {
        data: {
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
        },
      };

      axios.get.mockResolvedValue(mockApiResponse);

      const response = await request(app)
        .get("/api/air-quality")
        .query({ latitude: validLatitude, longitude: validLongitude });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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
    });

    it("Returns 400 when latitude or longitude is missing", async () => {
      const response = await request(app).get("/api/air-quality");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Latitude and Longitude are required");
    });

    it("Returns 400 when latitude or longitude are empty strings", async () => {
      const response = await request(app)
        .get("/api/air-quality")
        .query({ latitude: "", longitude: "" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Latitude and Longitude are required");
    });

    it("Returns 500 when there is an error fetching air quality data", async () => {
      axios.get.mockRejectedValue(new Error("API failure"));

      const response = await request(app)
        .get("/api/air-quality")
        .query({ latitude: validLatitude, longitude: validLongitude });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe(
        "Failed to fetch air quality data: API failure"
      );
    });
  });

  describe("GET /zone/paris/most-polluted-timestamp", () => {
    beforeEach(async () => {
      await AirQuality.deleteMany({});

      await AirQuality.create([
        {
          latitude: 48.8566,
          longitude: 2.3522,
          zone: "Paris",
          date: new Date("2024-11-20"),
          time: "10:00",
          pollution: {
            ts: new Date("2024-11-20T10:00:00.000Z"),
            aqius: 50,
            mainus: "p2",
            aqicn: 40,
            maincn: "p1",
          },
        },
        {
          latitude: 48.8566,
          longitude: 2.3522,
          zone: "Paris",
          date: new Date("2024-11-21"),
          time: "14:00",
          pollution: {
            ts: new Date("2024-11-21T14:00:00.000Z"),
            aqius: 100,
            mainus: "p2",
            aqicn: 80,
            maincn: "p1",
          },
        },
        {
          latitude: 48.8566,
          longitude: 2.3522,
          zone: "Paris",
          date: new Date("2024-11-22"),
          time: "18:00",
          pollution: {
            ts: new Date("2024-11-22T18:00:00.000Z"),
            aqius: 75,
            mainus: "p2",
            aqicn: 60,
            maincn: "p1",
          },
        },
      ]);
    });

    it("Returns the most polluted timestamp for Paris with th default 'us' pollution type", async () => {
      const response = await request(app).get(
        "/api/zone/paris/most-polluted-timestamp"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        pollutionType: "aqius",
        date: "21/11/2024",
        time: "14:00",
        pollution: 100,
      });
    });

    it("Returns the most polluted timestamp for Paris with 'china' pollution type", async () => {
      const response = await request(app)
        .get("/api/zone/paris/most-polluted-timestamp")
        .query({ pollutionType: "china" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        pollutionType: "aqicn",
        date: "21/11/2024",
        time: "14:00",
        pollution: 80,
      });
    });

    it("Returns 400 for an invalid pollution type", async () => {
      const response = await request(app)
        .get("/api/zone/paris/most-polluted-timestamp")
        .query({ pollutionType: "invalidType" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Invalid pollution type. Supported values: 'aqius' or 'aqicn'"
      );
    });

    it("Returns 404 if no data is found for Paris", async () => {
      await AirQuality.deleteMany({ zone: "Paris" });

      const response = await request(app).get(
        "/api/zone/paris/most-polluted-timestamp"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("No data found for zone: Paris");
    });
  });
});
