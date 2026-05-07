const pool = require("../../config/db");

let sql = "";

const getAll = async (filters = {}) => {
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

module.exports = {
  getAll,
};
