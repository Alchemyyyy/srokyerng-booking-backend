const asyncHandler = require("../../utils/asyncHandler");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const reservationService = require("../reservations/reservation.service");
const propertyService = require("../properties/property.service");

const getAllReservations = asyncHandler(async (req, res) => {
  const { status, property_id } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);

  const reservations = await reservationService.getAllReservations(filters);

  return successResponse(res, "All reservations retrieved successfully", reservations);
});

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

const getAll = asyncHandler(async (req, res) => {
  const result = await propertyService.getAll();

  if (!result) {
    return errorResponse(res, "Internal server error", 500);
  }

  return successResponse(res, "Get all properties successfully", result, 200);
});

const updateStatusProperty = asyncHandler(async (req, res) => {
  const result = await propertyService.updateStatus(req.user.id, req.params.id, req.body);

  if (!result.result) {
    return errorResponse(res, result.message, result.status);
  }

  return successResponse(res, result.message, result.data, result.status);
});

module.exports = {
  getAllReservations,
  updateReservationStatus,
  getAll,
  updateStatusProperty,
};
