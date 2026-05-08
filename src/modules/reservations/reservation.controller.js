const reservationService = require("./reservation.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  validateCreateReservation,
  validateUpdateStatus,
  normalizeReservationBody,
} = require("./reservation.validation");

/**
 * Create a new reservation
 * @route POST /api/reservations
 * @access Customer only
 */
const createReservation = asyncHandler(async (req, res) => {
  // Validate request body
  const payload = normalizeReservationBody(req.body);
  const errors = validateCreateReservation(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  // Create reservation
  const reservation = await reservationService.createReservation(req.user.id, payload);

  return successResponse(res, "Reservation created successfully", reservation, 201);
});

/**
 * Get current customer's reservations
 * @route GET /api/reservations/my
 * @access Customer only
 */
const getMyReservations = asyncHandler(async (req, res) => {
  // console.log(req.user.id);
  const { status } = req.query;
  const filters = status ? { status } : {};

  const reservations = await reservationService.getCustomerReservations(
    req.user.id,
    filters
  );

  return successResponse(res, "Reservations retrieved successfully", reservations);
});

/**
 * Get reservation details by ID
 * @route GET /api/reservations/:id
 * @access Customer (own), Owner (property), or Admin
 */
const getReservationDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reservation = await reservationService.getReservationById(
    parseInt(id),
    req.user.id,
    req.user.role
  );

  return successResponse(res, "Reservation details retrieved successfully", reservation);
});

/**
 * Cancel a reservation
 * @route PATCH /api/reservations/:id/cancel
 * @access Customer only (own reservations)
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const reservation = await reservationService.cancelReservation(
    parseInt(id),
    req.user.id,
    reason
  );

  return successResponse(res, "Reservation cancelled successfully", reservation);
});

/**
 * Get reservations for owner's properties
 * @route GET /api/owner/reservations
 * @access Owner only
 */
const getOwnerReservations = asyncHandler(async (req, res) => {
  const { status, property_id } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);

  const reservations = await reservationService.getOwnerReservations(
    req.user.id,
    filters
  );

  return successResponse(res, "Owner reservations retrieved successfully", reservations);
});

/**
 * Get all reservations (admin)
 * @route GET /api/admin/reservations
 * @access Admin only
 */
const getAllReservationsAdmin = asyncHandler(async (req, res) => {
  const { status, property_id } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);

  const reservations = await reservationService.getAllReservations(filters);

  return successResponse(res, "All reservations retrieved successfully", reservations);
});

/**
 * Update reservation status (admin)
 * @route PATCH /api/admin/reservations/:id/status
 * @access Admin only
 */
const updateReservationStatusAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["confirmed", "completed", "cancelled"];
  const errors = validateUpdateStatus({ status }, allowedStatuses);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const reservation = await reservationService.updateReservationStatusByAdmin(
    parseInt(id),
    status,
    req.user.id
  );

  return successResponse(res, "Reservation status updated successfully", reservation);
});

/**
 * Check room availability without creating a reservation
 * @route GET /api/reservations/check-availability
 * @access Public
 */
const checkAvailability = asyncHandler(async (req, res) => {
  const { room_id, check_in_date, check_out_date } = req.query;

  // Validate required parameters
  if (!room_id || !check_in_date || !check_out_date) {
    return errorResponse(res, "Missing required parameters", 400, [
      "room_id, check_in_date, and check_out_date are required",
    ]);
  }

  // Check availability
  const isAvailable = await reservationService.checkAvailability(
    parseInt(room_id),
    check_in_date,
    check_out_date
  );

  // Get room details for pricing information
  const room = await reservationService.getRoomForAvailability(parseInt(room_id));

  // Calculate pricing for informational purposes
  const totalNights = reservationService.calculateTotalNights(
    check_in_date,
    check_out_date
  );
  const totalAmount = room
    ? reservationService.calculateTotalAmount(room.price_per_night, totalNights)
    : 0;

  return successResponse(res, "Availability checked", {
    isAvailable,
    room: room
      ? {
          id: room.id,
          room_name: room.room_name,
          price_per_night: room.price_per_night,
          max_guests: room.max_guests,
        }
      : null,
    total_nights: totalNights,
    total_amount: totalAmount,
  });
});

module.exports = {
  createReservation,
  getMyReservations,
  getReservationDetail,
  cancelReservation,
  getOwnerReservations,
  getAllReservationsAdmin,
  updateReservationStatusAdmin,
  checkAvailability,
};
