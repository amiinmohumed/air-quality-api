require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const airQualityRoutes = require("./routes/airQualityRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");

const app = express();

// Middleware
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const mongouri = process.env.MONGODB_URI;
mongoose.connect(mongouri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongDB");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Routes
app.use("/api", airQualityRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is live" });
});

module.exports = app;
