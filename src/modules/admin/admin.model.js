const pool = require("../../config/db");

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
  getAll,
};
