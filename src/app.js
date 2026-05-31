const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const env = require("./config/env");

const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");


const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.FRONTEND_URLS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
};
  
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
