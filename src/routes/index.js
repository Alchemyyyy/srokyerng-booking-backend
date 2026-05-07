const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const propertyRoutes = require("../modules/properties/property.routes");
const adminRoutes = require("../modules/admin/admin.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API health check OK",
  });
});

// Module routes will be added later
router.use("/auth", authRoutes);
// router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
// router.use("/rooms", roomRoutes);
// router.use("/reservations", reservationRoutes);
// router.use("/payments", paymentRoutes);
// router.use("/reviews", reviewRoutes);
// router.use("/amenities", amenityRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
