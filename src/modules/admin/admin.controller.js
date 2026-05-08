// =============================== [ Visal Start ] ==============================

const reservationService = require("../reservations/reservation.service");
const { successResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * Get all reservations in the system
 * @route GET /api/admin/reservations
 * @access Admin only
 * @query status - Filter by reservation status
 * @query property_id - Filter by property ID
 */
const getAllReservations = asyncHandler(async (req, res) => {
  const { status, property_id } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);

  const reservations = await reservationService.getAllReservations(filters);

  return successResponse(res, "All reservations retrieved successfully", reservations);
});

/**
 * Update reservation status
 * @route PATCH /api/admin/reservations/:id/status
 * @access Admin only
 * @param id - Reservation ID
 * @body status - New status (confirmed, completed, cancelled)
 */
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const reservation = await reservationService.updateReservationStatusByAdmin(
    parseInt(id),
    status,
    req.user.id
  );

  return successResponse(res, "Reservation status updated successfully", reservation);
});

module.exports = {
  getAllReservations,
  updateReservationStatus,
};

// ============================== [ Visal End ] ==============================
