// src/modules/reservations/reservation.service.js
const reservationModel = require("./reservation.model");
const {
  RESERVATION_STATUS,
  CUSTOMER_CANCELLABLE_STATUSES,
} = require("../../constants/reservation");
const { validateCreateReservation } = require("./reservation.validation");

const calculateTotalNights = (checkInDate, checkOutDate) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut <= checkIn) {
    throw new Error("Check-out date must be after check-in date");
  }

  const diffTime = checkOut - checkIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateTotalAmount = (pricePerNight, totalNights) => {
  return pricePerNight * totalNights;
};

const createReservation = async (customerId, reservationData) => {
  const { errors, value } = validateCreateReservation(reservationData);
  if (errors && errors.length > 0) {
    const error = new Error(errors.join(", "));
    error.statusCode = 400;
    throw error;
  }

  const { room_id, check_in_date, check_out_date, total_guests, special_request } = value;

  // Find room with property details
  const room = await reservationModel.findRoomById(room_id);

  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if property is approved
  const approvedStatus = await reservationModel.findPropertyStatusByName("approved");
  if (room.property_status_id !== approvedStatus?.id) {
    const error = new Error("Room is not available for booking (property not approved)");
    error.statusCode = 400;
    throw error;
  }

  // Check guest capacity
  if (total_guests > room.max_guests) {
    const error = new Error(`Room can accommodate maximum ${room.max_guests} guests`);
    error.statusCode = 400;
    throw error;
  }

  // Calculate nights and amount
  const totalNights = calculateTotalNights(check_in_date, check_out_date);
  const totalAmount = calculateTotalAmount(room.price_per_night, totalNights);

  // Check availability
  const availability = await reservationModel.checkAvailability(
    room_id,
    check_in_date,
    check_out_date
  );

  if (!availability.isAvailable) {
    const error = new Error(
      `Room is not available. Only ${availability.availableRooms} of ${availability.totalRooms} rooms available`
    );
    error.statusCode = 409;
    throw error;
  }

  // Create reservation with transaction and row lock to prevent race conditions
  const lockResult = await reservationModel.createReservationWithLock({
    customer_id: customerId,
    room_id,
    check_in_date,
    check_out_date,
    total_guests,
    total_nights: totalNights,
    total_amount: totalAmount,
    reservation_status: RESERVATION_STATUS.PENDING,
    special_request,
  });

  if (!lockResult.success) {
    const error = new Error("Room became unavailable during booking process. Please try again.");
    error.statusCode = 409;
    throw error;
  }

  const reservation = await reservationModel.findReservationById(lockResult.id);

  return reservation;
};

const getCustomerReservations = async (customerId, filters = {}) => {
  const reservations = await reservationModel.findReservationsByCustomer(
    customerId,
    filters
  );
  return reservations;
};

const getReservationById = async (
  reservationId,
  requestingUserId,
  requestingUserRole
) => {
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Check access permissions
  const hasAccess =
    requestingUserRole === "admin" ||
    reservation.customer_id === requestingUserId ||
    (requestingUserRole === "owner" && reservation.owner_id === requestingUserId);

  if (!hasAccess) {
    const error = new Error("You don't have permission to view this reservation");
    error.statusCode = 403;
    throw error;
  }

  return reservation;
};

const getOwnerReservations = async (ownerId, filters = {}) => {
  const reservations = await reservationModel.findReservationsByOwner(ownerId, filters);
  return reservations;
};

const getAllReservations = async (filters = {}) => {
  const reservations = await reservationModel.findAllReservations(filters);
  return reservations;
};

const cancelReservation = async (
  reservationId,
  customerId,
  cancellationReason = null
) => {
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify customer owns this reservation
  if (reservation.customer_id !== customerId) {
    const error = new Error("You can only cancel your own reservations");
    error.statusCode = 403;
    throw error;
  }

  // Check if cancellation is allowed
  if (reservation.reservation_status === RESERVATION_STATUS.CANCELLED) {
    const error = new Error("Reservation is already cancelled");
    error.statusCode = 400;
    throw error;
  }

  if (reservation.reservation_status === RESERVATION_STATUS.COMPLETED) {
    const error = new Error("Completed reservations cannot be cancelled");
    error.statusCode = 400;
    throw error;
  }

  // Check if check-in date is in the past
  const checkInDate = new Date(reservation.check_in_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (checkInDate <= now) {
    const error = new Error("Cannot cancel reservation after check-in date has passed");
    error.statusCode = 400;
    throw error;
  }

  // Check if status allows cancellation
  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(reservation.reservation_status)) {
    const error = new Error(
      `Cannot cancel reservation with status: ${reservation.reservation_status}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Update reservation status
  await reservationModel.updateReservationStatus(
    reservationId,
    RESERVATION_STATUS.CANCELLED,
    cancellationReason || "Cancelled by customer"
  );

  const updatedReservation = await reservationModel.findReservationById(reservationId);

  return updatedReservation;
};

const updateReservationStatus = async (reservationId, status, adminId, reason = null) => {
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Validate status transition
  const currentStatus = reservation.reservation_status;
  const newStatus = status;

  // Prevent invalid transitions
  if (
    currentStatus === RESERVATION_STATUS.CANCELLED &&
    newStatus !== RESERVATION_STATUS.CANCELLED
  ) {
    const error = new Error("Cannot change status of cancelled reservation");
    error.statusCode = 400;
    throw error;
  }

  if (
    currentStatus === RESERVATION_STATUS.COMPLETED &&
    newStatus !== RESERVATION_STATUS.COMPLETED
  ) {
    const error = new Error("Cannot change status of completed reservation");
    error.statusCode = 400;
    throw error;
  }

  // Update status
  await reservationModel.updateReservationStatus(reservationId, status, reason);

  const updatedReservation = await reservationModel.findReservationById(reservationId);

  return updatedReservation;
};

const ownerUpdateReservationStatus = async (reservationId, status, ownerId, reason = null) => {
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership
  if (Number(reservation.owner_id) !== Number(ownerId)) {
    const error = new Error("Forbidden: You do not own this property");
    error.statusCode = 403;
    throw error;
  }

  // Validate status transition
  const currentStatus = reservation.reservation_status;

  if (
    currentStatus === RESERVATION_STATUS.CANCELLED &&
    status !== RESERVATION_STATUS.CANCELLED
  ) {
    const error = new Error("Cannot change status of cancelled reservation");
    error.statusCode = 400;
    throw error;
  }

  if (
    currentStatus === RESERVATION_STATUS.COMPLETED &&
    status !== RESERVATION_STATUS.COMPLETED
  ) {
    const error = new Error("Cannot change status of completed reservation");
    error.statusCode = 400;
    throw error;
  }

  // Update status
  await reservationModel.updateReservationStatus(reservationId, status, reason);

  const updatedReservation = await reservationModel.findReservationById(reservationId);

  return updatedReservation;
};

const checkAvailability = async (roomId, checkInDate, checkOutDate) => {
  const room = await reservationModel.findRoomById(roomId);

  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  const availability = await reservationModel.checkAvailability(
    roomId,
    checkInDate,
    checkOutDate
  );

  return availability;
};

const getCancellationPolicy = async (
  reservationId,
  requestingUserId,
  requestingUserRole
) => {
  const reservation = await reservationModel.findReservationById(reservationId);

  if (!reservation) {
    const error = new Error("Reservation not found");
    error.statusCode = 404;
    throw error;
  }

  const hasAccess =
    requestingUserRole === "admin" ||
    reservation.customer_id === requestingUserId ||
    (requestingUserRole === "owner" && reservation.owner_id === requestingUserId);

  if (!hasAccess) {
    const error = new Error("You don't have permission to view this reservation");
    error.statusCode = 403;
    throw error;
  }

  const cancellationPolicyModule = require("./cancellation-policy");
  return cancellationPolicyModule.getCancellationPolicy(reservation);
};

module.exports = {
  calculateTotalNights,
  calculateTotalAmount,
  createReservation,
  getCustomerReservations,
  getReservationById,
  getOwnerReservations,
  getAllReservations,
  cancelReservation,
  getCancellationPolicy,
  updateReservationStatus,
  ownerUpdateReservationStatus,
  checkAvailability,
};
