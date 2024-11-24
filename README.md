# Air Quality API

A Node.js application for providing air quality data for different zones, pollution levels based on different pollution types. It supports querying the most polluted timestamp for Paris and pollution type based on US and China indexes.

## Features

- Get the most polluted timestamp for a given zone (e.g., Paris).
- Supports two pollution types: `us` (AQI US) and `china` (AQI China).
- Cron job to fetch Paris air quality every minute
- Error handling with custom `AppError` class.
- MongoDB integration to fetch the pollution data.
- The app has unit and integration testing applied.

## API endpoints
- [GET] http://localhost:3000/api/zone/paris/most-polluted-timestamp
- [GET] http://localhost:3000/api/air-quality?latitude={latitude}&longitude={longitude}


## Tech Stack

- Node.js
- Express.js
- Mongoose (for MongoDB integration)
- Swagger (for API documentation)
- Jest (for testing)

## API Documentation
Go to http://localhost:3000/api-docs

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/air-quality-api.git

2. Navigate to the project folder:
   ```bash
   cd air-quality-api

3. Install dependencies:
   ```bash
   npm install

4. Set up environment variables. Create a .env file in the root of your project and add the following:
   ```bash
   MONGODB_URI=your-mongodb-uri
   IQAIR_API_KEY=your_api_key
   PORT=3000

5. Start the API
   ```bash
   npm start

5. Test the API
   ```bash
   npm test
