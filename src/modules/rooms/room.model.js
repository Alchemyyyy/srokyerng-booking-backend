const pool = require("../../config/db");

const getApprovedPropertyById = async (propertyId) => {
  const [rows] = await pool.query(
    `
    SELECT p.*
    FROM properties p
    JOIN property_statuses ps
      ON p.status_id = ps.id
    WHERE p.id = ?
    AND ps.status_name = 'approved'
    `,
    [propertyId]
  );

  return rows[0];
};

const getRoomsByPropertyId = async (propertyId) => {
  const [rows] = await pool.query(
    `
    SELECT
      r.*,
      rt.type_name,

      (
        SELECT image_url
        FROM room_images
        WHERE room_id = r.id
        AND is_cover = TRUE
        LIMIT 1
      ) AS cover_image

    FROM rooms r

    JOIN room_types rt
      ON r.room_type_id = rt.id

    WHERE r.property_id = ?
    AND r.deleted_at IS NULL
    `,
    [propertyId]
  );

  return rows;
};

const getRoomById = async (roomId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM rooms
    WHERE id = ?
    AND deleted_at IS NULL
    `,
    [roomId]
  );

  return rows[0];
};

const createRoom = async (data) => {
  const [rows] = await pool.query(
    `
    INSERT INTO rooms (
      property_id,
      room_type_id,
      room_name,
      description,
      price_per_night,
      max_guests,
      total_rooms
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    data
  );

  return rows;
};

const updateRoom = async (roomId, data) => {
  const [rows] = await pool.query(
    `
    UPDATE rooms
    SET
      room_type_id = ?,
      room_name = ?,
      description = ?,
      price_per_night = ?,
      max_guests = ?,
      total_rooms = ?
    WHERE id = ?
    `,
    [
      data.room_type_id,
      data.room_name,
      data.description,
      data.price_per_night,
      data.max_guests,
      data.total_rooms,
      roomId,
    ]
  );

  return rows;
};

const deleteRoom = async (roomId) => {
  const [rows] = await pool.query(
    `
    UPDATE rooms
    SET deleted_at = NOW()
    WHERE id = ?
    `,
    [roomId]
  );

  return rows;
};

const createManyRoomImages = async (images) => {
  const values = images.map((image) => [
    image.room_id,
    image.image_url,
    image.sort_order,
  ]);

  const [rows] = await pool.query(
    `
    INSERT INTO room_images (
      room_id,
      image_url,
      sort_order
    )
    VALUES ?
    `,
    [values]
  );

  return rows;
};

const deleteRoomImage = async (imageId) => {
  await pool.query(
    `
    DELETE FROM room_images
    WHERE id = ?
    `,
    [imageId]
  );
};

const findRoomImageById = async (imageId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM room_images
    WHERE id = ?
    `,
    [imageId]
  );

  return rows[0];
};

const getRoomImagesByRoomId = async (roomId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      room_id,
      image_url,
      is_cover,
      sort_order,
      created_at
    FROM room_images
    WHERE room_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [roomId]
  );

  return rows;
};

const getRoomTypes = async () => {
  const [rows] = await pool.query("SELECT * FROM room_types");

  return rows;
};

const getRoomImages = async (roomId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      room_id,
      image_url,
      is_cover,
      sort_order,
      created_at
    FROM room_images
    WHERE room_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [roomId]
  );

  return rows;
};

const getRoomImageById = async (imageId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM room_images
    WHERE id = ?
    `,
    [imageId]
  );

  return rows[0];
};

const clearRoomCoverImages = async (roomId) => {
  await pool.query(
    `
    UPDATE room_images
    SET is_cover = FALSE
    WHERE room_id = ?
    `,
    [roomId]
  );
};

const setRoomCoverImage = async (imageId) => {
  await pool.query(
    `
    UPDATE room_images
    SET is_cover = TRUE
    WHERE id = ?
    `,
    [imageId]
  );
};

const updateRoomImageSortOrder = async (imageId, sort_order) => {
  await pool.query(
    `
    UPDATE room_images
    SET sort_order = ?
    WHERE id = ?
    `,
    [sort_order, imageId]
  );
};

const getBookedRoomCount = async (roomId, checkInDate, checkOutDate) => {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) AS booked_count
    FROM reservations
    WHERE room_id = ?

    AND reservation_status NOT IN (
      'cancelled',
      'failed',
      'expired'
    )

    AND check_in_date < ?
    AND check_out_date > ?
    `,
    [roomId, checkOutDate, checkInDate]
  );

  return rows[0];
};

const getAvailableRoomsByProperty = async (propertyId, guests) => {
  const [rows] = await pool.query(
    `
    SELECT
      r.*,
      rt.type_name,

      (
        SELECT image_url
        FROM room_images
        WHERE room_id = r.id
        AND is_cover = TRUE
        LIMIT 1
      ) AS cover_image

    FROM rooms r

    JOIN room_types rt
      ON r.room_type_id = rt.id

    WHERE r.property_id = ?
    AND r.deleted_at IS NULL
    AND r.max_guests >= ?
    `,
    [propertyId, guests]
  );

  return rows;
};

module.exports = {
  getApprovedPropertyById,
  getRoomsByPropertyId,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  createManyRoomImages,
  deleteRoomImage,
  findRoomImageById,
  getRoomImagesByRoomId,
  getRoomTypes,
  getRoomImages,
  getRoomImageById,
  clearRoomCoverImages,
  setRoomCoverImage,
  updateRoomImageSortOrder,
  getBookedRoomCount,
  getAvailableRoomsByProperty,
};
