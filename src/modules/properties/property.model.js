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
    p.updated_at

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
  const [rows] = await pool.query(sql);
  return rows;
};

module.exports = {
  getAllApproved,
  getAll,
};
