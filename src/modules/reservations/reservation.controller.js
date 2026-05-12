// src/modules/reservations/reservation.controller.js
const reservationService = require("./reservation.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  validateCreateReservation,
  normalizeReservationData,
  validateStatusUpdate,
  validateId,
  validateStatusFilter,
} = require("./reservation.validation");

const createReservation = asyncHandler(async (req, res) => {
  const normalizedData = normalizeReservationData(req.body);
  const { errors, value } = validateCreateReservation(normalizedData);

  if (errors) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const reservation = await reservationService.createReservation(req.user.id, value);

  return successResponse(res, "Reservation created successfully", reservation, 201);
});

const getMyReservations = asyncHandler(async (req, res) => {
  const { status } = req.query;

  // Validate status filter
  if (status) {
    const statusError = validateStatusFilter(status);
    if (statusError) {
      return errorResponse(res, statusError, 400);
    }
  }
  
  const filters = {};

  if (status) filters.status = status;

  const reservations = await reservationService.getCustomerReservations(
    req.user.id,
    filters
  );

  return successResponse(res, "Your reservations retrieved successfully", reservations);
});

const getReservationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get user role for permission checking
  const userRole = req.user.role;
  const validatedId = validateId(id);

  const reservation = await reservationService.getReservationById(
    validatedId,
    req.user.id,
    userRole
  );

  return successResponse(res, "Reservation retrieved successfully", reservation);
});

const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body;

  const validatedId = validateId(id);

  const reservation = await reservationService.cancelReservation(
    validatedId,
    req.user.id,
    cancellation_reason
  );

  return successResponse(res, "Reservation cancelled successfully", reservation);
});

// Owner endpoints
const getOwnerReservations = asyncHandler(async (req, res) => {
  const { status, property_id } = req.query;

  if (status) {
    const statusError = validateStatusFilter(status);
    if (statusError) {
      return errorResponse(res, statusError, 400);
    }
  }

  const filters = {};

  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);

  const reservations = await reservationService.getOwnerReservations(
    req.user.id,
    filters
  );

  return successResponse(res, "Owner reservations retrieved successfully", reservations);
});

// Admin endpoints
const getAdminReservations = asyncHandler(async (req, res) => {
  const { status, property_id, owner_id } = req.query;

  if (status) {
    const statusError = validateStatusFilter(status);
    if (statusError) {
      return errorResponse(res, statusError, 400);
    }
  }

  const filters = {};

  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);
  if (owner_id) filters.owner_id = parseInt(owner_id);

  const reservations = await reservationService.getAllReservations(filters);

  return successResponse(res, "All reservations retrieved successfully", reservations);
});

const updateReservationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const validation = validateStatusUpdate(status);
  if (validation.error) {
    return errorResponse(res, validation.error, 400);
  }

  const reservation = await reservationService.updateReservationStatus(
    parseInt(id),
    status,
    req.user.id,
    reason
  );

  return successResponse(res, "Reservation status updated successfully", reservation);
});

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getOwnerReservations,
  getAdminReservations,
  updateReservationStatus,
};
