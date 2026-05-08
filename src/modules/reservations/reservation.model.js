const pool = require("../../config/db");

/**
 * Finds a room by ID with its associated property details
 * @param {number} roomId - Room ID to lookup
 * @returns {Promise<Object|null>} Room object with property details or null
 */
const findRoomById = async (roomId) => {
  const [rows] = await pool.query(
    `SELECT 
      r.*,
      p.id as property_id,
      p.owner_id,
      p.status_id,
      ps.status_name as property_status,
      r.price_per_night
     FROM rooms r
     JOIN properties p ON r.property_id = p.id
     JOIN property_statuses ps ON p.status_id = ps.id
     WHERE r.id = ?`,
    [roomId]
  );
  return rows[0];
};

/**
 * Finds existing reservations that conflict with date range
 * @param {number} roomId - Room ID to check
 * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of conflicting reservations
 */
const findExistingReservations = async (roomId, checkInDate, checkOutDate) => {
  const [rows] = await pool.query(
    `SELECT * FROM reservations 
     WHERE room_id = ? 
     AND reservation_status NOT IN ('cancelled')
     AND (
       (check_in_date <= ? AND check_out_date > ?) OR
       (check_in_date < ? AND check_out_date >= ?) OR
       (check_in_date >= ? AND check_out_date <= ?)
     )`,
    [
      roomId,
      checkOutDate,
      checkInDate,
      checkOutDate,
      checkInDate,
      checkInDate,
      checkOutDate,
    ]
  );
  return rows;
};

/**
 * Creates a new reservation record
 * @param {Object} data - Reservation data
 * @param {number} data.customer_id - ID of the customer
 * @param {number} data.room_id - ID of the room
 * @param {string} data.check_in_date - Check-in date
 * @param {string} data.check_out_date - Check-out date
 * @param {number} data.total_guests - Number of guests
 * @param {number} data.total_nights - Calculated total nights
 * @param {number} data.total_amount - Calculated total amount
 * @param {string} data.special_request - Optional special requests
 * @returns {Promise<number>} ID of created reservation
 */
const createReservation = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO reservations 
      (customer_id, room_id, check_in_date, check_out_date, 
       total_guests, total_nights, total_amount, special_request, reservation_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.customer_id,
      data.room_id,
      data.check_in_date,
      data.check_out_date,
      data.total_guests,
      data.total_nights,
      data.total_amount,
      data.special_request || null,
      "pending", // Default status for new reservations
    ]
  );
  return result.insertId;
};

/**
 * Finds a reservation by ID with all related data
 * @param {number} id - Reservation ID
 * @returns {Promise<Object|null>} Reservation object with related data
 */
const findReservationById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      r.*,
      rm.room_name,
      rm.price_per_night,
      rm.max_guests,
      p.id as property_id,
      p.property_name,
      p.owner_id,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone as customer_phone
     FROM reservations r
     JOIN rooms rm ON r.room_id = rm.id
     JOIN properties p ON rm.property_id = p.id
     JOIN users u ON r.customer_id = u.id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0];
};

/**
 * Finds all reservations for a specific customer
 * @param {number} customerId - Customer ID
 * @param {Object} filters - Optional filters (status, etc.)
 * @returns {Promise<Array>} Array of customer's reservations
 */
const findReservationsByCustomer = async (customerId, filters = {}) => {
  let query = `
    SELECT 
      r.*,
      rm.room_name,
      p.property_name,
      p.id as property_id
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    JOIN properties p ON rm.property_id = p.id
    WHERE r.customer_id = ?
  `;
  const params = [customerId];

  // Apply status filter if provided
  if (filters.status) {
    query += ` AND r.reservation_status = ?`;
    params.push(filters.status);
  }

  query += ` ORDER BY r.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Finds all reservations for properties owned by a specific owner
 * @param {number} ownerId - Owner ID
 * @param {Object} filters - Optional filters (status, property_id)
 * @returns {Promise<Array>} Array of owner's property reservations
 */
const findReservationsByOwner = async (ownerId, filters = {}) => {
  let query = `
    SELECT 
      r.*,
      rm.room_name,
      p.property_name,
      p.id as property_id,
      u.full_name as customer_name,
      u.email as customer_email
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    JOIN properties p ON rm.property_id = p.id
    JOIN users u ON r.customer_id = u.id
    WHERE p.owner_id = ?
  `;
  const params = [ownerId];

  // Apply status filter
  if (filters.status) {
    query += ` AND r.reservation_status = ?`;
    params.push(filters.status);
  }

  // Apply property filter
  if (filters.property_id) {
    query += ` AND p.id = ?`;
    params.push(filters.property_id);
  }

  query += ` ORDER BY r.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Finds all reservations in the system (admin only)
 * @param {Object} filters - Optional filters (status, property_id)
 * @returns {Promise<Array>} Array of all reservations with customer/owner info
 */
const findAllReservations = async (filters = {}) => {
  let query = `
    SELECT 
      r.*,
      rm.room_name,
      p.property_name,
      p.owner_id,
      u.full_name as customer_name,
      u.email as customer_email,
      owner.full_name as owner_name
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    JOIN properties p ON rm.property_id = p.id
    JOIN users u ON r.customer_id = u.id
    JOIN users owner ON p.owner_id = owner.id
    WHERE 1=1
  `;
  const params = [];

  // Apply status filter
  if (filters.status) {
    query += ` AND r.reservation_status = ?`;
    params.push(filters.status);
  }

  // Apply property filter
  if (filters.property_id) {
    query += ` AND p.id = ?`;
    params.push(filters.property_id);
  }

  query += ` ORDER BY r.created_at DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Updates reservation status
 * @param {number} id - Reservation ID
 * @param {string} status - New status value
 * @param {string|null} reason - Cancellation reason (if applicable)
 * @returns {Promise<boolean>} True if update was successful
 */
const updateReservationStatus = async (id, status, reason = null) => {
  let query = `UPDATE reservations SET reservation_status = ?`;
  const params = [status];

  // Add cancellation reason if provided
  if (reason && status === "cancelled") {
    query += `, cancellation_reason = ?`;
    params.push(reason);
  }

  query += ` WHERE id = ?`;
  params.push(id);

  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
};

/**
 * Checks room availability excluding a specific reservation (for updates)
 * @param {number} roomId - Room ID
 * @param {string} checkInDate - Check-in date
 * @param {string} checkOutDate - Check-out date
 * @param {number} excludeReservationId - Reservation ID to exclude from check
 * @returns {Promise<Array>} Array of conflicting reservations
 */
const checkRoomAvailabilityForUpdate = async (
  roomId,
  checkInDate,
  checkOutDate,
  excludeReservationId
) => {
  const [rows] = await pool.query(
    `SELECT * FROM reservations 
     WHERE room_id = ? 
     AND id != ?
     AND reservation_status NOT IN ('cancelled')
     AND (
       (check_in_date <= ? AND check_out_date > ?) OR
       (check_in_date < ? AND check_out_date >= ?) OR
       (check_in_date >= ? AND check_out_date <= ?)
     )`,
    [
      roomId,
      excludeReservationId,
      checkOutDate,
      checkInDate,
      checkOutDate,
      checkInDate,
      checkInDate,
      checkOutDate,
    ]
  );
  return rows;
};

module.exports = {
  findRoomById,
  findExistingReservations,
  createReservation,
  findReservationById,
  findReservationsByCustomer,
  findReservationsByOwner,
  findAllReservations,
  updateReservationStatus,
  checkRoomAvailabilityForUpdate,
};
