const reservationModel = require("./reservation.model");
const { RESERVATION_STATUS } = require("../../constants/statuses");

/**
 * Calculates total number of nights between check-in and check-out dates
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @returns {number} Total number of nights
 */
const calculateTotalNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculates total amount based on price per night and total nights
 * @param {number} pricePerNight - Price for one night
 * @param {number} totalNights - Total number of nights
 * @returns {number} Total amount
 */
const calculateTotalAmount = (pricePerNight, totalNights) => {
  return pricePerNight * totalNights;
};

/**
 * Checks if a room is available for the given date range
 * @param {number} roomId - Room ID to check
 * @param {string} checkInDate - Check-in date
 * @param {string} checkOutDate - Check-out date
 * @returns {Promise<boolean>} True if room is available
 */
const checkAvailability = async (roomId, checkInDate, checkOutDate) => {
  const existingReservations = await reservationModel.findExistingReservations(
    roomId,
    checkInDate,
    checkOutDate
  );
  return existingReservations.length === 0;
};

/**
 * Creates a new reservation
 * @param {number} customerId - ID of the customer making the reservation
 * @param {Object} reservationData - Reservation data from request
 * @returns {Promise<Object>} Created reservation object
 * @throws {Error} If room not found, property not approved, or room unavailable
 */
const createReservation = async (customerId, reservationData) => {
  // Step 1: Find room with property details
  const room = await reservationModel.findRoomById(reservationData.room_id);

  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Verify property is approved for booking
  if (room.property_status !== "approved") {
    const error = new Error("Property is not available for booking");
    error.statusCode = 400;
    throw error;
  }

  // Step 3: Validate guest count against room capacity
  if (reservationData.total_guests > room.max_guests) {
    const error = new Error(`Maximum guests allowed is ${room.max_guests}`);
    error.statusCode = 400;
    throw error;
  }

  // Step 4: Check room availability for selected dates
  const isAvailable = await checkAvailability(
    reservationData.room_id,
    reservationData.check_in_date,
    reservationData.check_out_date
  );

  if (!isAvailable) {
    const error = new Error("Room is not available for selected dates");
    error.statusCode = 409; // Conflict
    throw error;
  }

  // Step 5: Calculate pricing
  const totalNights = calculateTotalNights(
    reservationData.check_in_date,
    reservationData.check_out_date
  );
  const totalAmount = calculateTotalAmount(room.price_per_night, totalNights);

  // Step 6: Create reservation record
  const reservationId = await reservationModel.createReservation({
    customer_id: customerId,
    room_id: reservationData.room_id,
    check_in_date: reservationData.check_in_date,
    check_out_date: reservationData.check_out_date,
    total_guests: reservationData.total_guests,
    total_nights: totalNights,
    total_amount: totalAmount,
    special_request: reservationData.special_request,
  });

  // Step 7: Return created reservation with details
  const reservation = await reservationModel.findReservationById(reservationId);
  return reservation;
};

/**
 * Gets all reservations for a customer
 * @param {number} customerId - Customer ID
 * @param {Object} filters - Query filters (status)
 * @returns {Promise<Array>} Array of customer's reservations
 */
const getCustomerReservations = async (customerId, filters = {}) => {
  return await reservationModel.findReservationsByCustomer(customerId, filters);
};

/**
 * Gets a single reservation by ID with permission check
 * @param {number} reservationId - Reservation ID
 * @param {number} userId - Current user ID
 * @param {string} userRole - Current user role
 * @returns {Promise<Object>} Reservation object
 * @throws {Error} If reservation not found or user lacks permission
 */
const getReservationById = async (reservationId, userId, userRole) => {
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Check access permissions based on user role
  const isCustomer = userRole === "customer" && reservation.customer_id === userId;
  const isOwner = userRole === "owner" && reservation.owner_id === userId;
  const isAdmin = userRole === "admin";

  if (!isCustomer && !isOwner && !isAdmin) {
    const error = new Error("You don't have permission to view this reservation");
    error.statusCode = 403;
    throw error;
  }

  return reservation;
};

/**
 * Gets all reservations for an owner's properties
 * @param {number} ownerId - Owner ID
 * @param {Object} filters - Query filters (status, property_id)
 * @returns {Promise<Array>} Array of reservations for owner's properties
 */
const getOwnerReservations = async (ownerId, filters = {}) => {
  return await reservationModel.findReservationsByOwner(ownerId, filters);
};

/**
 * Gets all reservations in the system (admin only)
 * @param {Object} filters - Query filters (status, property_id)
 * @returns {Promise<Array>} Array of all reservations
 */
const getAllReservations = async (filters = {}) => {
  return await reservationModel.findAllReservations(filters);
};

/**
 * Cancels a reservation
 * @param {number} reservationId - Reservation ID
 * @param {number} customerId - Customer ID (must be the owner of the reservation)
 * @param {string|null} reason - Optional cancellation reason
 * @returns {Promise<Object>} Updated reservation object
 * @throws {Error} If reservation not found, permission denied, or invalid status
 */
const cancelReservation = async (reservationId, customerId, reason = null) => {
  // Step 1: Get reservation details
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Verify customer owns this reservation
  if (reservation.customer_id !== customerId) {
    const error = new Error("You can only cancel your own reservations");
    error.statusCode = 403;
    throw error;
  }

  // Step 3: Verify reservation can be cancelled based on current status
  const allowedStatusesForCancellation = ["pending", "confirmed"];
  if (!allowedStatusesForCancellation.includes(reservation.reservation_status)) {
    const error = new Error(
      `Cannot cancel reservation with status: ${reservation.reservation_status}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Step 4: Verify check-in date is in the future
  const checkInDate = new Date(reservation.check_in_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate <= today) {
    const error = new Error(
      "Cannot cancel reservation that has already started or passed"
    );
    error.statusCode = 400;
    throw error;
  }

  // Step 5: Update reservation status to cancelled
  const updated = await reservationModel.updateReservationStatus(
    reservationId,
    "cancelled",
    reason
  );

  if (!updated) {
    const error = new Error("Failed to cancel reservation");
    error.statusCode = 500;
    throw error;
  }

  // Step 6: Return updated reservation
  return await reservationModel.findReservationById(reservationId);
};

/**
 * Updates reservation status (admin only)
 * @param {number} reservationId - Reservation ID
 * @param {string} status - New status
 * @param {number} adminId - Admin user ID
 * @returns {Promise<Object>} Updated reservation object
 * @throws {Error} If reservation not found or invalid status
 */
const updateReservationStatusByAdmin = async (reservationId, status, adminId) => {
  // Step 1: Get reservation details
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Step 2: Validate allowed statuses for admin update
  const allowedStatuses = ["confirmed", "completed", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  // Step 3: Update status
  const updated = await reservationModel.updateReservationStatus(reservationId, status);

  if (!updated) {
    const error = new Error("Failed to update reservation status");
    error.statusCode = 500;
    throw error;
  }

  // Step 4: Return updated reservation
  return await reservationModel.findReservationById(reservationId);
};

/**
 * Gets room details for availability check
 * @param {number} roomId - Room ID
 * @returns {Promise<Object|null>} Room object with pricing details
 */
const getRoomForAvailability = async (roomId) => {
  const pool = require("../../config/db");
  const [rows] = await pool.query(
    `SELECT id, room_name, price_per_night, max_guests FROM rooms WHERE id = ?`,
    [roomId]
  );
  return rows[0];
};

module.exports = {
  createReservation,
  getCustomerReservations,
  getReservationById,
  getOwnerReservations,
  getAllReservations,
  cancelReservation,
  updateReservationStatusByAdmin,
  checkAvailability,
  calculateTotalNights,
  calculateTotalAmount,
  getRoomForAvailability,
};
