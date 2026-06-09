const pool = require("../../config/db");

let sql = "";

const getAllApproved = async (filters = {}) => {
  let sql = `
      SELECT 
          p.id,
          p.property_name,
          p.description,
          p.city,
          p.province,

          c.category_name,

          pi.image_url,

          MIN(r.price_per_night) AS price_per_night

      FROM properties p

      JOIN property_statuses ps 
          ON p.status_id = ps.id

      JOIN categories c 
          ON p.category_id = c.id

      LEFT JOIN property_images pi 
          ON p.id = pi.property_id AND pi.is_cover = TRUE

      LEFT JOIN rooms r 
          ON p.id = r.property_id

      WHERE ps.status_name = 'approved'
      AND p.deleted_at IS NULL
    `;

  const params = [];

  // =========================
  // FILTERS
  // =========================

  if (filters.city) {
    sql += ` AND p.city = ?`;
    params.push(filters.city);
  }

  if (filters.province) {
    sql += ` AND p.province = ?`;
    params.push(filters.province);
  }

  if (filters.category_id) {
    sql += ` AND p.category_id = ?`;
    params.push(filters.category_id);
  }

  if (filters.search) {
    sql += ` AND p.property_name LIKE ?`;
    params.push(`%${filters.search}%`);
  }

  // =========================
  // GROUP BY (IMPORTANT)
  // =========================
  sql += `
      GROUP BY 
          p.id,
          p.property_name,
          p.description,
          p.city,
          p.province,
          c.category_name,
          pi.image_url
    `;

  // =========================
  // ORDER BY
  // =========================
  sql += ` ORDER BY p.created_at DESC`;

  // =========================
  // PAGINATION
  // =========================
  if (filters.limit && filters.page) {
    const limit = parseInt(filters.limit);
    const page = parseInt(filters.page);
    const offset = (page - 1) * limit;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  const [rows] = await pool.query(sql, params);

  return rows;
};

const getAll = async () => {
  const sql = `SELECT 
    p.id,
    p.property_name,
    p.description,
    p.address,
    p.city,
    p.province,
    p.country,
    p.latitude,
    p.longitude,

    -- Owner
    u.id AS owner_id,
    u.full_name AS owner_name,
    u.email AS owner_email,
    u.phone AS owner_phone,

    -- Category
    c.id AS category_id,
    c.category_name,

    -- Status
    ps.id AS status_id,
    ps.status_name,

    -- Image (cover only)
    pi.id AS image_id,
    pi.image_url,
    pi.is_cover,

    -- Approval
    p.rejection_reason,
    p.approved_by,
    p.approved_at,

    -- Time
    p.created_at,
    p.updated_at,
    p.deleted_at

    FROM properties p

    -- Owner
    JOIN users u 
        ON p.owner_id = u.id

    -- Category
    JOIN categories c 
        ON p.category_id = c.id

    -- Status
    JOIN property_statuses ps 
        ON p.status_id = ps.id

    -- Images (only cover)
    LEFT JOIN property_images pi 
        ON p.id = pi.property_id 
        AND pi.is_cover = TRUE

    
    ORDER BY p.created_at DESC`;
  // WHERE p.deleted_at IS NULL
  const [rows] = await pool.query(sql);
  return rows;
};
const getById = async (id) => {
  sql = `SELECT *
  FROM properties
  WHERE id = ?
  AND deleted_at IS NULL`;
  const [row] = await pool.query(sql, [id]);
  return row;
};

const getDetail = async (id) => {
  sql = `SELECT
    p.id,
    p.property_name,
    p.description,

    p.address,
    p.city,
    p.province,
    p.country,

    p.latitude,
    p.longitude,

    p.contact_phone,
    p.contact_email,

    p.created_at,
    p.updated_at,

    ps.id AS status_id,
    ps.status_name,

    c.id AS category_id,
    c.category_name,

    u.id AS owner_id,
    u.full_name,
    u.phone AS owner_phone,
    u.email AS owner_email

    FROM properties p

    JOIN property_statuses ps
    ON p.status_id = ps.id

    JOIN categories c
    ON p.category_id = c.id

    JOIN users u
    ON p.owner_id = u.id

    WHERE p.id = ?
    AND ps.status_name = 'approved'
    AND p.deleted_at IS NULL`;

  let [row] = await pool.query(sql, [id]);
  return row;
};

const create = async (user_id, body) => {
  let data = [
    user_id,
    body.category_id,
    1,
    body.property_name,
    body.description,
    body.address,
    body.city,
    body.province,
    body.country,
    body.latitude,
    body.longitude,
    body.contact_phone,
    body.contact_email,
  ];
  sql = `INSERT INTO properties (
          owner_id, category_id, status_id, property_name, description,
          address, city, province, country, latitude, longitude,
          contact_phone, contact_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  let [rows] = await pool.query(sql, data);
  return rows;
};

const getImages = async (property_id) => {
  sql = `SELECT
    id,
    image_url,
    is_cover,
    sort_order
    FROM property_images
    WHERE property_id = ?
    ORDER BY sort_order ASC`;
  let [rows] = await pool.query(sql, [property_id]);
  return rows;
};

const getAmenities = async (property_id) => {
  sql = `SELECT
    a.id,
    a.amenity_name
    FROM property_amenities pa

    JOIN amenities a
    ON pa.amenity_id = a.id

    WHERE pa.property_id = ?`;
  let [rows] = await pool.query(sql, [property_id]);
  return rows;
};

const getRooms = async (property_id) => {
  sql = `SELECT
    r.id,
    r.room_name,
    r.description,
    r.price_per_night,
    r.max_guests,
    r.total_rooms,

    rt.type_name AS room_type

    FROM rooms r

    JOIN room_types rt
    ON r.room_type_id = rt.id

    WHERE r.property_id = ?`;
  let [rows] = await pool.query(sql, [property_id]);
  return rows;
};

const getMyProperty = async (owner_id) => {
  sql = `SELECT
    p.id,
    p.property_name,
    p.city,
    p.province,

    c.category_name,

    ps.status_name,

    pi.image_url AS cover_image,

    p.created_at

    FROM properties p

    JOIN categories c
    ON p.category_id = c.id

    JOIN property_statuses ps
    ON p.status_id = ps.id

    LEFT JOIN property_images pi
    ON p.id = pi.property_id
    AND pi.is_cover = TRUE

    WHERE p.owner_id = ?
    AND p.deleted_at IS NULL

    ORDER BY p.created_at DESC`;
  let [rows] = await pool.query(sql, [owner_id]);
  return rows;
};

const updateStatus = async (admin_id, property_id, body) => {
  sql = `UPDATE properties
  SET
      status_id = ?,
      rejection_reason = ?,
      approved_by = ?,
      approved_at = ?
      WHERE id = ?`;
  await pool.query(sql, [
    body.status_id,
    body.rejection_reason,
    admin_id,
    body.approved_at,
    property_id,
  ]);
};

const getUpdatePropertyById = async (property_id) => {
  sql = `SELECT
    p.id,
    p.property_name,

    ps.status_name,

    p.rejection_reason,
    p.approved_at,

    u.full_name AS approved_by_name

    FROM properties p

    JOIN property_statuses ps
    ON p.status_id = ps.id

    LEFT JOIN users u
    ON p.approved_by = u.id

    WHERE p.id = ?
    AND p.deleted_at IS NULL`;
  let [row] = await pool.query(sql, [property_id]);
  return row;
};

const getMyOwnPropertyById = async (property_id, owner_id) => {
  sql = `SELECT
    p.id,
    p.property_name,
    p.description,

    p.address,
    p.city,
    p.province,
    p.country,

    p.latitude,
    p.longitude,

    p.contact_phone,
    p.contact_email,

    p.created_at,
    p.updated_at,

    ps.id AS status_id,
    ps.status_name,

    c.id AS category_id,
    c.category_name,

    u.id AS owner_id,
    u.full_name,
    u.phone AS owner_phone,
    u.email AS owner_email

    FROM properties p

    JOIN property_statuses ps
    ON p.status_id = ps.id

    JOIN categories c
    ON p.category_id = c.id

    JOIN users u
    ON p.owner_id = u.id

    WHERE p.id = ?
    AND p.owner_id = ?
    AND p.deleted_at IS NULL`;

  let [row] = await pool.query(sql, [property_id, owner_id]);
  return row;
};
const checkOwnerProperty = async (property_id, owner_id) => {
  sql = `SELECT *
    FROM properties
    WHERE id = ?
    AND owner_id = ?
    AND deleted_at IS NULL
    LIMIT 1`;
  let [row] = await pool.query(sql, [property_id, owner_id]);
  return row;
};

const update = async (property_id, owner_id, body) => {
  sql = `
    UPDATE properties
    SET
      category_id = ?,
      property_name = ?,
      description = ?,

      address = ?,
      city = ?,
      province = ?,
      country = ?,

      latitude = ?,
      longitude = ?,

      contact_phone = ?,
      contact_email = ?,

      status_id = 1,
      rejection_reason = NULL,
      approved_by = NULL,
      approved_at = NULL

    WHERE id = ?
    AND owner_id = ?
  `;
  const data = [
    body.category_id,
    body.property_name,
    body.description,

    body.address,
    body.city,
    body.province,
    body.country,

    body.latitude,
    body.longitude,

    body.contact_phone,
    body.contact_email,

    property_id,
    owner_id,
  ];
  await pool.query(sql, data);
};

const softDeleteProperty = async (propertyId) => {
  sql = `
    UPDATE properties
    SET deleted_at = NOW()
    WHERE id = ?
  `;

  await pool.query(sql, [propertyId]);
};

const findPropertyById = async (propertyId) => {
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

const createManyPropertyImages = async (images) => {
  const values = images.map((image) => [
    image.property_id,
    image.image_url,
    image.sort_order,
  ]);

  const [rows] = await pool.query(
    `
    INSERT INTO property_images (
      property_id,
      image_url,
      sort_order
    )
    VALUES ?
    `,
    [values]
  );

  return rows;
};

const findImageById = async (imageId) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM property_images
    WHERE id = ?
    `,
    [imageId]
  );

  return rows[0];
};

const deleteImage = async (imageId) => {
  await pool.query(
    `
    DELETE FROM property_images
    WHERE id = ?
    `,
    [imageId]
  );
};

const resetCoverImages = async (propertyId) => {
  await pool.query(
    `
    UPDATE property_images
    SET is_cover = FALSE
    WHERE property_id = ?
    `,
    [propertyId]
  );
};

const setCoverImage = async (imageId) => {
  await pool.query(
    `
    UPDATE property_images
    SET is_cover = TRUE
    WHERE id = ?
    `,
    [imageId]
  );
};

const updateImageSortOrder = async (imageId, sortOrder) => {
  await pool.query(
    `
    UPDATE property_images
    SET sort_order = ?
    WHERE id = ?
    `,
    [sortOrder, imageId]
  );
};

const getPropertyDetailForAdmin = async (propertyId) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.*,

      c.category_name,

      ps.status_name,

      u.id AS owner_id,
      u.full_name AS owner_name,
      u.email AS owner_email,
      u.phone AS owner_phone

    FROM properties p

    JOIN categories c
      ON p.category_id = c.id

    JOIN property_statuses ps
      ON p.status_id = ps.id

    JOIN users u
      ON p.owner_id = u.id

    WHERE p.id = ?
    `,
    [propertyId]
  );

  return rows[0];
};

const getAllUpdateRequests = async () => {
  const [rows] = await pool.query(`
    SELECT
      pur.*,
      p.property_name,
      u.full_name owner_name
    FROM property_update_requests pur
    JOIN properties p
      ON pur.property_id = p.id
    JOIN users u
      ON pur.owner_id = u.id
    ORDER BY pur.created_at DESC
  `);

  return rows;
};

const createUpdateRequest = async (propertyId, ownerId, updateData) => {
  const [rows] = await pool.query(
    `
    INSERT INTO property_update_requests
    (
      property_id,
      owner_id,
      update_data
    )
    VALUES (?, ?, ?)
    `,
    [propertyId, ownerId, updateData]
  );

  return rows;
};

const getPendingRequests = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      pur.*,
      p.property_name,
      u.full_name
    FROM property_update_requests pur

    JOIN properties p
      ON pur.property_id = p.id

    JOIN users u
      ON pur.owner_id = u.id

    WHERE pur.status = 'pending'

    ORDER BY pur.created_at DESC
    `
  );

  return rows;
};

const getUpdateRequestById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM property_update_requests
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
};

const approveUpdateRequest = async (requestId, adminId) => {
  await pool.query(
    `
    UPDATE property_update_requests
    SET
      status='approved',
      reviewed_by = ?,
      reviewed_at = NOW()
    WHERE id=?
    `,
    [adminId, requestId]
  );
};

const rejectUpdateRequest = async (requestId, adminId, reason) => {
  await pool.query(
    `
    UPDATE property_update_requests
    SET
      status='rejected',
      rejection_reason=?,
      reviewed_by = ?,
      reviewed_at = NOW()
    WHERE id=?
    `,
    [reason, adminId, requestId]
  );
};

module.exports = {
  getAllApproved,
  getAll,
  getById,
  getDetail,
  getImages,
  getAmenities,
  getRooms,
  getMyProperty,
  create,
  updateStatus,
  getUpdatePropertyById,
  getMyOwnPropertyById,
  checkOwnerProperty,
  update,
  softDeleteProperty,
  findPropertyById,
  createManyPropertyImages,
  findImageById,
  deleteImage,
  resetCoverImages,
  setCoverImage,
  updateImageSortOrder,
  getPropertyDetailForAdmin,
  createUpdateRequest,
  getPendingRequests,
  getUpdateRequestById,
  getAllUpdateRequests,
  createUpdateRequest,
  getPendingRequests,
  approveUpdateRequest,
  rejectUpdateRequest,
};
