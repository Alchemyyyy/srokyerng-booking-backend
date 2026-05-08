const express = require("express");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

// Apply authentication and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

/**
 * @route   GET /api/admin/reservations
 * @desc    Get all reservations in the system
 * @access  Admin only
 * @query   status - Filter by reservation status
 * @query   property_id - Filter by property ID
 */
router.get("/reservations", adminController.getAllReservations);

/**
 * @route   PATCH /api/admin/reservations/:id/status
 * @desc    Update reservation status
 * @access  Admin only
 * @param   id - Reservation ID
 * @body    status - New status (confirmed, completed, cancelled)
 */
router.patch("/reservations/:id/status", adminController.updateReservationStatus);

module.exports = router;
