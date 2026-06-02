// src/modules/reservations/reservation.routes.js
const express = require("express");
const reservationController = require("./reservation.controller");
const reviewController = require("../reviews/review.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

// All reservation routes require authentication
router.use(authMiddleware);

// Customer routes
router.post("/", roleMiddleware(ROLES.CUSTOMER), reservationController.createReservation);
router.post(
  "/:reservationId/reviews",
  roleMiddleware(ROLES.CUSTOMER),
  reviewController.createReview
);
router.get(
  "/my",
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.getMyReservations
);
router.get("/:id", reservationController.getReservationById);
router.get("/:id/cancellation-policy", reservationController.getCancellationPolicy);
router.patch(
  "/:id/cancel",
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.cancelReservation
);

module.exports = router;
