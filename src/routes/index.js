const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const ownerRoutes = require("../modules/owner/owner.routes");
const propertyRoutes = require("../modules/properties/property.routes");
const reservationRoutes = require("../modules/reservations/reservation.routes");
const reviewRoutes = require("../modules/reviews/review.routes");
const adminRoutes = require("../modules/admin/admin.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API health check OK",
  });
});

router.use("/auth", authRoutes);
router.use("/owner", ownerRoutes);
router.use("/properties", propertyRoutes);
router.use("/reservations", reservationRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
