const pool = require("../../config/db");

const getPropertyById = async (propertyId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM properties
    WHERE id = ?
    AND deleted_at IS NULL
    `,
    [propertyId]
  );

  return rows[0];
};

const getRoomReservations = async (roomId, startDate, endDate) => {
  const [rows] = await pool.query(
    `
    SELECT
      check_in_date,
      check_out_date
    FROM reservations
    WHERE room_id = ?
    AND reservation_status != 'cancelled'
    AND check_in_date < ?
    AND check_out_date > ?
    `,
    [roomId, endDate, startDate]
  );

  return rows;
};

const getPropertyReservations = async (propertyId, startDate, endDate) => {
  const [rows] = await pool.query(
    `
    SELECT
      r.id room_id,
      rs.check_in_date,
      rs.check_out_date
    FROM rooms r

    JOIN reservations rs
      ON r.id = rs.room_id

    WHERE r.property_id = ?
    AND rs.reservation_status != 'cancelled'
    AND rs.check_in_date < ?
    AND rs.check_out_date > ?
    `,
    [propertyId, endDate, startDate]
  );

  return rows;
};

const getOwnerRoom = async (roomId, ownerId) => {
  const [rows] = await pool.query(
    `
    SELECT r.*

    FROM rooms r

    JOIN properties p
      ON r.property_id = p.id

    WHERE r.id = ?
    AND p.owner_id = ?
    `,
    [roomId, ownerId]
  );

  return rows[0];
};

const getOwnerProperty = async (propertyId, ownerId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM properties
    WHERE id = ?
    AND owner_id = ?
    `,
    [propertyId, ownerId]
  );

  return rows[0];
};

module.exports = {
  getPropertyById,
  getRoomReservations,
  getPropertyReservations,
  getOwnerRoom,
  getOwnerProperty,
};
