const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const env = require("./config/env");

const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");
const securityHeaders = require("./middleware/security.middleware");
const sanitizeMiddleware = require("./middleware/sanitize.middleware");


const app = express();

const allowedOrigins = new Set(env.FRONTEND_URLS);
const isLoopbackOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?$/.test(origin || "");

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, "");
  if (isLoopbackOrigin(normalizedOrigin)) {
    return true;
  }

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  const originWithoutPort = normalizedOrigin.replace(/:\d+$/, "");
  if (allowedOrigins.has(originWithoutPort)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
};
  
app.use(cors(corsOptions));
app.use(securityHeaders);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SrokYerng Booking API is running",
  });
});

app.use("/api", routes);
app.use(errorMiddleware);
module.exports = app;
