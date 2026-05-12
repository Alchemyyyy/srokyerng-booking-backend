// src/modules/reservations/reservation.routes.js
const express = require("express");
const { validateId, validateDateRange } = require("./reservation.validation");
const reservationController = require("./reservation.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.get(
  "/availability",
  asyncHandler(async (req, res) => {
    const { room_id, check_in_date, check_out_date } = req.query;

    // Validate required fields
    if (!room_id || !check_in_date || !check_out_date) {
      return errorResponse(
        res,
        "room_id, check_in_date, check_out_date are required",
        400
      );
    }

    // Validate ID
    let validatedRoomId;
    try {
      validatedRoomId = validateId(room_id);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }

    // Validate date format and business rules
    try {
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (checkIn < now) {
        return errorResponse(res, "Check-in date cannot be in the past", 400);
      }
      if (checkOut <= checkIn) {
        return errorResponse(res, "Check-out date must be after check-in date", 400);
      }
    } catch (error) {
      return errorResponse(res, "Invalid date format", 400);
    }

    const availability = await reservationService.checkAvailability(
      validatedRoomId,
      check_in_date,
      check_out_date
    );

    return successResponse(res, "Availability checked", availability);
  })
);


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
