const db = require("../../config/db");

/**
 * Analytics Model - Database queries for admin analytics
 */

/**
 * Get platform summary statistics
 */
const getPlatformSummary = async (startDate, endDate) => {
  const dateFilter = startDate && endDate ? "AND DATE(created_at) BETWEEN ? AND ?" : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const query = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'customer') ${dateFilter}) as total_customers,
      (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'owner') ${dateFilter}) as total_owners,
      (SELECT COUNT(*) FROM properties WHERE 1=1 ${dateFilter}) as total_properties,
      (SELECT COUNT(*) FROM reservations WHERE 1=1 ${dateFilter}) as total_reservations,
      (SELECT COUNT(*) FROM payments WHERE payment_status_id = (SELECT id FROM payment_statuses WHERE status_name = 'paid') ${dateFilter}) as paid_payments,
      (SELECT COUNT(*) FROM reviews WHERE 1=1 ${dateFilter}) as total_reviews,
      (SELECT SUM(amount) FROM payments WHERE payment_status_id = (SELECT id FROM payment_statuses WHERE status_name = 'paid') ${dateFilter}) as total_revenue
  `;

  return new Promise((resolve, reject) => {
    const finalParams =
      startDate && endDate
        ? [...params, ...params, ...params, ...params, ...params, ...params, ...params]
        : [];

    db.query(query, finalParams, (error, result) => {
      if (error) return reject(error);
      resolve(result[0] || {});
    });
  });
};

/**
 * Get user counts by role and status
 */
const getUserCounts = async (startDate, endDate) => {
  const whereDateClause =
    startDate && endDate ? "AND DATE(u.created_at) BETWEEN ? AND ?" : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const query = `
    SELECT
      r.role_name as role,
      s.status_name as status,
      COUNT(u.id) as count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN account_statuses s ON u.status_id = s.id
    WHERE 1=1 ${whereDateClause}
    GROUP BY r.role_name, s.status_name
    ORDER BY r.role_name, s.status_name
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

/**
 * Get property counts by status
 */
const getPropertyCounts = async (startDate, endDate) => {
  const whereDateClause =
    startDate && endDate ? "AND DATE(p.created_at) BETWEEN ? AND ?" : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const query = `
    SELECT
      ps.status_name as status,
      COUNT(p.id) as count
    FROM properties p
    JOIN property_statuses ps ON p.status_id = ps.id
    WHERE 1=1 ${whereDateClause}
    GROUP BY ps.status_name
    ORDER BY ps.status_name
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

/**
 * Get reservation counts by status with counts
 */
const getReservationCounts = async (startDate, endDate) => {
  const whereDateClause =
    startDate && endDate ? "AND DATE(r.created_at) BETWEEN ? AND ?" : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const query = `
    SELECT
      r.reservation_status as status,
      COUNT(r.id) as count
    FROM reservations r
    WHERE 1=1 ${whereDateClause}
    GROUP BY r.reservation_status
    ORDER BY r.reservation_status
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

/**
 * Get payment totals by status
 */
const getPaymentCounts = async (startDate, endDate) => {
  const whereDateClause =
    startDate && endDate ? "AND DATE(p.created_at) BETWEEN ? AND ?" : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const query = `
    SELECT
      ps.status_name as status,
      COUNT(p.id) as count,
      COALESCE(SUM(p.amount), 0) as total_amount
    FROM payments p
    JOIN payment_statuses ps ON p.payment_status_id = ps.id
    WHERE 1=1 ${whereDateClause}
    GROUP BY ps.status_name
    ORDER BY ps.status_name
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

/**
 * Get review count summary
 */
const getReviewCounts = async (startDate, endDate) => {
  const whereDateClause =
    startDate && endDate ? "AND DATE(r.created_at) BETWEEN ? AND ?" : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const query = `
    SELECT
      COUNT(r.id) as total_reviews,
      COALESCE(AVG(r.rating), 0) as average_rating,
      MIN(r.rating) as min_rating,
      MAX(r.rating) as max_rating,
      SUM(CASE WHEN r.owner_reply IS NOT NULL THEN 1 ELSE 0 END) as owner_replied_count
    FROM reviews r
    WHERE 1=1 ${whereDateClause}
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result[0] || {});
    });
  });
};

/**
 * Get recent platform activity
 */
const getRecentActivity = async (limit = 20, startDate, endDate) => {
  const whereDateClause =
    startDate && endDate ? "AND DATE(created_at) BETWEEN ? AND ?" : "";

  const query = `
    (SELECT 
      'user_created' as activity_type, 
      id as resource_id, 
      full_name as resource_name, 
      created_at,
      'user' as resource_type
    FROM users
    WHERE 1=1 ${whereDateClause}
    ORDER BY created_at DESC
    LIMIT ?)
    
    UNION ALL
    
    (SELECT 
      'property_created' as activity_type,
      id as resource_id,
      property_name as resource_name,
      created_at,
      'property' as resource_type
    FROM properties
    WHERE 1=1 ${whereDateClause}
    ORDER BY created_at DESC
    LIMIT ?)
    
    UNION ALL
    
    (SELECT 
      'reservation_created' as activity_type,
      id as resource_id,
      CONCAT('Reservation #', id) as resource_name,
      created_at,
      'reservation' as resource_type
    FROM reservations
    WHERE 1=1 ${whereDateClause}
    ORDER BY created_at DESC
    LIMIT ?)
    
    UNION ALL
    
    (SELECT 
      'payment_created' as activity_type,
      id as resource_id,
      CONCAT('Payment #', id) as resource_name,
      created_at,
      'payment' as resource_type
    FROM payments
    WHERE 1=1 ${whereDateClause}
    ORDER BY created_at DESC
    LIMIT ?)
    
    UNION ALL
    
    (SELECT 
      'review_created' as activity_type,
      id as resource_id,
      CONCAT('Review #', id) as resource_name,
      created_at,
      'review' as resource_type
    FROM reviews
    WHERE 1=1 ${whereDateClause}
    ORDER BY created_at DESC
    LIMIT ?)
    
    ORDER BY created_at DESC
    LIMIT ?
  `;

  // Build params array - each union needs the date params + limit
  let queryParams = [];
  if (startDate && endDate) {
    queryParams = [
      startDate,
      endDate,
      limit,
      startDate,
      endDate,
      limit,
      startDate,
      endDate,
      limit,
      startDate,
      endDate,
      limit,
      startDate,
      endDate,
      limit,
      limit,
    ];
  } else {
    queryParams = [limit, limit, limit, limit, limit, limit];
  }

  return new Promise((resolve, reject) => {
    db.query(query, queryParams, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

module.exports = {
  getPlatformSummary,
  getUserCounts,
  getPropertyCounts,
  getReservationCounts,
  getPaymentCounts,
  getReviewCounts,
  getRecentActivity,
};
