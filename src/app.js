const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const env = require("./config/env");

const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");
const amenityRoutes = require("./modules/amenities/amenity.routes");

const app = express();
  
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

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
app.use("/api/amenities", amenityRoutes);
app.use(errorMiddleware);
module.exports = app;
