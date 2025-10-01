import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { scrapeTickets } from "./scrapers/index.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "traffic-ticket-scraper",
  });
});

// Main scraping endpoint
app.get("/scrape/:county", async (req, res) => {
  const { county } = req.params;
  const { dl, state, dob } = req.query;

  console.log(`[API] Scraping request for ${county}: DL=${dl}, State=${state}`);

  try {
    const result = await scrapeTickets(county, dl, state, dob);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(`[API] Error processing request:`, error);
    res.status(500).json({
      success: false,
      tickets: [],
      count: 0,
      county: county.toLowerCase(),
      message: `Internal server error: ${error.message}. Please try manual entry.`,
    });
  }
});

// Alternative POST endpoint for more complex requests
app.post("/scrape/:county", async (req, res) => {
  const { county } = req.params;
  const { driverLicenseNumber, state, dob } = req.body;

  console.log(`[API] POST scraping request for ${county}:`, {
    driverLicenseNumber,
    state,
    dob,
  });

  try {
    const result = await scrapeTickets(county, driverLicenseNumber, state, dob);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error(`[API] Error processing POST request:`, error);
    res.status(500).json({
      success: false,
      tickets: [],
      count: 0,
      county: county.toLowerCase(),
      message: `Internal server error: ${error.message}. Please try manual entry.`,
    });
  }
});

// List available counties
app.get("/counties", (req, res) => {
  res.json({
    counties: ["shavano"],
    message: "Available counties for scraping",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[API] Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error. Please try manual entry.",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    availableEndpoints: [
      "GET /health",
      "GET /scrape/:county?dl=XXX&state=TX",
      "POST /scrape/:county",
      "GET /counties",
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Traffic Ticket Scraper running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /scrape/shavano?dl=XXX&state=TX`);
  console.log(`   POST /scrape/shavano`);
  console.log(`   GET  /counties`);
  console.log(`\n🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});
