require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const requestLogger = require("./middleware/requestLogger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

const configuredClientUrl = process.env.CLIENT_URL || "http://localhost:5173";

/*
|--------------------------------------------------------------------------
| Allowed Frontend Origins
|--------------------------------------------------------------------------
| Development:
| - http://localhost:5173
| - http://127.0.0.1:5173
|
| Production:
| - CLIENT_URL from .env
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  configuredClientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174", 
].filter(Boolean);

const uniqueOrigins = [...new Set(allowedOrigins)];

console.log("Allowed CORS origins:");
uniqueOrigins.forEach((origin) => {
  console.log(`  ✓ ${origin}`);
});

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin.
      // Useful for Postman, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      const isLocalDevelopment =
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (uniqueOrigins.includes(origin) || isLocalDevelopment) {
        return callback(null, true);
      }

      console.error(`❌ CORS blocked origin: ${origin}`);

      return callback(new Error("CORS policy: Origin not allowed"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use(requestLogger);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "LeadDesk CRM API",
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Root
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    service: "LeadDesk CRM API",
    version: "3.0.0",
    message: "LeadDesk CRM backend is running.",
  });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Process-Level Error Handling
|--------------------------------------------------------------------------
*/

process.on("unhandledRejection", (error) => {
  console.error("❌ UNHANDLED REJECTION:");
  console.error(error);
});

process.on("uncaughtException", (error) => {
  console.error("❌ UNCAUGHT EXCEPTION:");
  console.error(error);

  process.exit(1);
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log("");
  console.log("============================================");
  console.log("       LeadDesk CRM API SERVER");
  console.log("============================================");
  console.log(`✓ Server:      http://localhost:${PORT}`);
  console.log(`✓ Health:      http://localhost:${PORT}/health`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("============================================");
  console.log("");
}); 