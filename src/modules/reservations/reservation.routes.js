// src/modules/reservations/reservation.routes.js
const express = require("express");
const reservationController = require("./reservation.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/availability", reservationController.checkAvailability);


// All reservation routes require authentication
router.use(authMiddleware);

// Customer routes
router.post("/", roleMiddleware(ROLES.CUSTOMER), reservationController.createReservation);
router.get(
  "/my",
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.getMyReservations
);
router.get("/:id", reservationController.getReservationById);
router.patch(
  "/:id/cancel",
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.cancelReservation
);

module.exports = router;
