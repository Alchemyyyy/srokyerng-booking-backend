// =============================== [ Visal Start ] ==============================

const reservationService = require("../reservations/reservation.service");
const { successResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * Get owner dashboard data
 * @route GET /api/owner/dashboard
 * @access Owner only
 */
const getDashboard = asyncHandler(async (req, res) => {
  // Get dashboard statistics
  const reservations = await reservationService.getOwnerReservations(req.user.id);

  const stats = {
    total_reservations: reservations.length,
    pending_reservations: reservations.filter((r) => r.reservation_status === "pending")
      .length,
    confirmed_reservations: reservations.filter(
      (r) => r.reservation_status === "confirmed"
    ).length,
    completed_reservations: reservations.filter(
      (r) => r.reservation_status === "completed"
    ).length,
    cancelled_reservations: reservations.filter(
      (r) => r.reservation_status === "cancelled"
    ).length,
  };

  return successResponse(res, "Owner dashboard data retrieved", stats);
});

/**
 * Get owner's properties
 * @route GET /api/owner/properties
 * @access Owner only
 */
const getProperties = asyncHandler(async (req, res) => {
  // Import property service (when implemented)
  // For now, return placeholder with instruction
  return successResponse(res, "Owner properties endpoint ready", {
    message: "Connect to propertyService.getOwnerProperties()",
    nextSteps: "Implement propertyService.getOwnerProperties(ownerId)",
  });
});

/**
 * Get owner's reservations (USING REAL SERVICE)
 * @route GET /api/owner/reservations
 * @access Owner only
 * @query status - Filter by reservation status
 * @query property_id - Filter by property ID
 */
const getReservations = asyncHandler(async (req, res) => {
  // console.log(req.user.id);
  
  const { status, property_id } = req.query;
  const filters = {};

  // Apply filters if provided
  if (status) filters.status = status;
  if (property_id) filters.property_id = parseInt(property_id);

  // Get real reservations from service
  const reservations = await reservationService.getOwnerReservations(
    req.user.id,
    filters
  );

  return successResponse(res, "Owner reservations retrieved successfully", reservations);
});

/**
 * Get owner's payments
 * @route GET /api/owner/payments
 * @access Owner only
 */
const getPayments = asyncHandler(async (req, res) => {
  // Import payment service (when implemented)
  return successResponse(res, "Owner payments endpoint ready", {
    message: "Connect to paymentService.getOwnerPayments()",
    nextSteps: "Implement paymentService.getOwnerPayments(ownerId)",
  });
});

/**
 * Get owner's reviews
 * @route GET /api/owner/reviews
 * @access Owner only
 */
const getReviews = asyncHandler(async (req, res) => {
  // Import review service (when implemented)
  return successResponse(res, "Owner reviews endpoint ready", {
    message: "Connect to reviewService.getOwnerReviews()",
    nextSteps: "Implement reviewService.getOwnerReviews(ownerId)",
  });
});

module.exports = {
  getDashboard,
  getProperties,
  getReservations,
  getPayments,
  getReviews,
};

// =============================== [ Visal End ] ==============================