const express = require("express");
const reservationController = require("./reservation.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

// ============ Public Routes ============
/**
 * @route   GET /api/reservations/check-availability
 * @desc    Check if a room is available for specific dates
 * @access  Public
 * @query   room_id - ID of the room
 * @query   check_in_date - Check-in date (YYYY-MM-DD)
 * @query   check_out_date - Check-out date (YYYY-MM-DD)
 */
router.get("/check-availability", reservationController.checkAvailability);

// ============ Customer Routes ============
/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Customer only
 * @body    room_id, check_in_date, check_out_date, total_guests, special_request (optional)
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.createReservation
);

/**
 * @route   GET /api/reservations/my
 * @desc    Get all reservations for the authenticated customer
 * @access  Customer only
 * @query   status - Optional filter by reservation status
 */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.getMyReservations
);

/**
 * @route   PATCH /api/reservations/:id/cancel
 * @desc    Cancel a reservation
 * @access  Customer only (must own the reservation)
 * @param   id - Reservation ID
 * @body    reason - Optional cancellation reason
 */
router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware(ROLES.CUSTOMER),
  reservationController.cancelReservation
);

// ============ Shared Routes (Customer, Owner, Admin) ============
/**
 * @route   GET /api/reservations/:id
 * @desc    Get reservation details by ID
 * @access  Customer (own), Owner (property), or Admin
 * @param   id - Reservation ID
 */
router.get("/:id", authMiddleware, reservationController.getReservationDetail);

module.exports = router;
