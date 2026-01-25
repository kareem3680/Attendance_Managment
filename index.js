// Load env
import dotenv from "dotenv";
dotenv.config({ path: "config.env", quiet: true });

// Core imports
import express, { json } from "express";
import morgan from "morgan";
import cors from "cors";

// Security & utils
import "./utils/cronJob.js";
import { initSocket } from "./io/index.js";
import applySecurity from "./middlewares/securityMiddleware.js";
import globalError from "./middlewares/errorMiddleware.js";
import ApiError from "./utils/apiError.js";
import dbConnection from "./config/dataBase.js";

// Routes
import mountRoutesIdentity from "./modules/identity/routes/index.js";
import mountRoutesAttendance from "./modules/attendance/routes/index.js";
import mountRoutesNotification from "./modules/notifications/routes/index.js";
import mountRoutesConv from "./modules/conv/routes/index.js";

// App init
const app = express();
app.use(json({ limit: "350kb" }));
app.set("trust proxy", 1);

// Security middlewares
applySecurity(app);

// CORS
app.use(cors());

// Dev logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Mount routes
mountRoutesIdentity(app);
mountRoutesAttendance(app);
mountRoutesNotification(app);
mountRoutesConv(app);

// Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Attendance Back-End API 🚀",
  });
});

// Not found
app.use((req, res, next) => {
  next(new ApiError(`🛑 Can not find this route: ${req.originalUrl}`, 404));
});

// Handle Errors In Express
app.use(globalError);

// Server settings
const PORT = process.env.PORT || 8000;
const MODE = process.env.NODE_ENV;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`💥 Uncaught Exception: ${err.name} | ${err.message}`);
  process.exit(1);
});

// Connect to MongoDB first, then start server
(async () => {
  try {
    await dbConnection();

    const server = app.listen(PORT, () => {
      console.log(`🟢 Mode: ${MODE}`);
      console.log(`🟢 Server running on port: ${PORT}`);
    });

    // Initialize Socket.io
    initSocket(server);
    console.log("🟢 Socket.io initialized");

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error(`🔴 Unhandled Rejection: ${err.name} | ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`❌ Server Startup Failed: ${error.message}`);
    process.exit(1);
  }
})();
