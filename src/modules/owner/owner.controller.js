const { successResponse } = require("../../utils/apiResponse");

const ownerPlaceholder = (resource, serviceName) => {
  return {
    resource,
    ownerOnly: true,
    nextStep: `Connect this endpoint to ${serviceName}.`,
  };
};

const getDashboard = (req, res) => {
  return successResponse(
    res,
    "Owner dashboard endpoint ready",
    ownerPlaceholder("dashboard", "properties, reservations, and payments services")
  );
};

const getProperties = (req, res) => {
  return successResponse(
    res,
    "Owner properties endpoint ready",
    ownerPlaceholder("properties", "propertyService")
  );
};

const getReservations = (req, res) => {
  return successResponse(
    res,
    "Owner reservations endpoint ready",
    ownerPlaceholder("reservations", "reservationService")
  );
};

const getPayments = (req, res) => {
  return successResponse(
    res,
    "Owner payments endpoint ready",
    ownerPlaceholder("payments", "paymentService")
  );
};

const getReviews = (req, res) => {
  return successResponse(
    res,
    "Owner reviews endpoint ready",
    ownerPlaceholder("reviews", "reviewService")
  );
};

module.exports = {
  getDashboard,
  getProperties,
  getReservations,
  getPayments,
  getReviews,
};
