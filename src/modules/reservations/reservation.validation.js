/**
 * Validates reservation creation request body
 * @param {Object} body - Request body object
 * @param {number} body.room_id - ID of the room to book
 * @param {string} body.check_in_date - Check-in date (YYYY-MM-DD)
 * @param {string} body.check_out_date - Check-out date (YYYY-MM-DD)
 * @param {number} body.total_guests - Number of guests
 * @param {string} [body.special_request] - Optional special requests
 * @returns {string[]} Array of validation error messages (empty if valid)
 */
const validateCreateReservation = (body) => {
  const errors = [];

  // Required field validation
  if (!body.room_id) errors.push("Room ID is required");
  if (!body.check_in_date) errors.push("Check-in date is required");
  if (!body.check_out_date) errors.push("Check-out date is required");
  if (!body.total_guests) errors.push("Total guests is required");

  // Type validation
  if (body.room_id && isNaN(parseInt(body.room_id))) {
    errors.push("Room ID must be a number");
  }

  // Guest count validation
  if (
    body.total_guests &&
    (isNaN(parseInt(body.total_guests)) || parseInt(body.total_guests) <= 0)
  ) {
    errors.push("Total guests must be a positive number");
  }

  // Date validation
  if (body.check_in_date && body.check_out_date) {
    const checkIn = new Date(body.check_in_date);
    const checkOut = new Date(body.check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Date format validation
    if (isNaN(checkIn.getTime())) {
      errors.push("Invalid check-in date format. Use YYYY-MM-DD");
    }
    if (isNaN(checkOut.getTime())) {
      errors.push("Invalid check-out date format. Use YYYY-MM-DD");
    }

    // Business rule validations
    if (checkIn < today) {
      errors.push("Check-in date cannot be in the past");
    }
    if (checkIn >= checkOut) {
      errors.push("Check-in date must be before check-out date");
    }
  }

  return errors;
};

/**
 * Validates reservation status update request
 * @param {Object} body - Request body object
 * @param {string} body.status - New status value
 * @param {string[]} allowedStatuses - Array of allowed status values
 * @returns {string[]} Array of validation error messages
 */
const validateUpdateStatus = (body, allowedStatuses = []) => {
  const errors = [];

  if (!body.status) {
    errors.push("Status is required");
  }

  if (body.status && !allowedStatuses.includes(body.status)) {
    errors.push(`Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  return errors;
};

/**
 * Normalizes and sanitizes reservation request body
 * @param {Object} body - Raw request body
 * @returns {Object} Sanitized request body with proper types
 */
const normalizeReservationBody = (body = {}) => {
  return {
    room_id: body.room_id ? parseInt(body.room_id) : null,
    check_in_date: body.check_in_date ? body.check_in_date.trim() : null,
    check_out_date: body.check_out_date ? body.check_out_date.trim() : null,
    total_guests: body.total_guests ? parseInt(body.total_guests) : null,
    special_request: body.special_request ? body.special_request.trim() : null,
  };
};

module.exports = {
  validateCreateReservation,
  validateUpdateStatus,
  normalizeReservationBody,
};
