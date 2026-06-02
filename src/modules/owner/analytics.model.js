const db = require("../../config/db");

/**
 * Owner Analytics Model - Database queries for owner analytics
 * All queries are filtered to only the authenticated owner's properties
 */

/**
 * Get owner dashboard summary
 * @param {number} ownerId - The owner's user ID
 * @param {string} startDate - Optional start date (YYYY-MM-DD)
 * @param {string} endDate - Optional end date (YYYY-MM-DD)
 */
const getDashboardSummary = async (ownerId, startDate, endDate) => {
  const dateFilter = startDate && endDate ? "AND DATE(r.created_at) BETWEEN ? AND ?" : "";
  const params =
    startDate && endDate
      ? [
          ownerId,
          startDate,
          endDate,
          ownerId,
          startDate,
          endDate,
          ownerId,
          startDate,
          endDate,
          ownerId,
          startDate,
          endDate,
        ]
      : [ownerId, ownerId, ownerId, ownerId];

  const query = `
    SELECT
      (SELECT COUNT(r.id) FROM reservations r 
       JOIN rooms rm ON r.room_id = rm.id 
       JOIN properties p ON rm.property_id = p.id 
       WHERE p.owner_id = ? ${dateFilter}) as total_reservations,
      (SELECT COUNT(r.id) FROM reservations r 
       JOIN rooms rm ON r.room_id = rm.id 
       JOIN properties p ON rm.property_id = p.id 
       WHERE p.owner_id = ? AND r.reservation_status = 'confirmed' ${dateFilter}) as confirmed_reservations,
      (SELECT COUNT(r.id) FROM reservations r 
       JOIN rooms rm ON r.room_id = rm.id 
       JOIN properties p ON rm.property_id = p.id 
       WHERE p.owner_id = ? AND r.reservation_status = 'completed' ${dateFilter}) as completed_reservations,
      (SELECT COUNT(r.id) FROM reservations r 
       JOIN rooms rm ON r.room_id = rm.id 
       JOIN properties p ON rm.property_id = p.id 
       WHERE p.owner_id = ? AND r.check_in_date > CURDATE() ${dateFilter}) as upcoming_reservations
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result[0] || {});
    });
  });
};

/**
 * Get reservation statistics for owner's properties
 */
const getReservationStats = async (ownerId, startDate, endDate, propertyId = null) => {
  const dateFilter = startDate && endDate ? "AND DATE(r.created_at) BETWEEN ? AND ?" : "";
  const propertyFilter = propertyId ? "AND p.id = ?" : "";

  let params = [];
  if (startDate && endDate && propertyId) {
    params = [ownerId, startDate, endDate, propertyId];
  } else if (startDate && endDate) {
    params = [ownerId, startDate, endDate];
  } else if (propertyId) {
    params = [ownerId, propertyId];
  } else {
    params = [ownerId];
  }

  const query = `
    SELECT
      r.reservation_status as status,
      COUNT(r.id) as count,
      AVG(r.total_nights) as avg_nights,
      SUM(r.total_amount) as total_amount
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    JOIN properties p ON rm.property_id = p.id
    WHERE p.owner_id = ? ${dateFilter} ${propertyFilter}
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
 * Get revenue statistics for owner's properties
 */
const getRevenueStats = async (ownerId, startDate, endDate, propertyId = null) => {
  const dateFilter =
    startDate && endDate ? "AND DATE(py.created_at) BETWEEN ? AND ?" : "";
  const propertyFilter = propertyId ? "AND p.id = ?" : "";

  let params = [];
  if (startDate && endDate && propertyId) {
    params = [ownerId, startDate, endDate, propertyId];
  } else if (startDate && endDate) {
    params = [ownerId, startDate, endDate];
  } else if (propertyId) {
    params = [ownerId, propertyId];
  } else {
    params = [ownerId];
  }

  const query = `
    SELECT
      ps.status_name as status,
      COUNT(py.id) as count,
      COALESCE(SUM(py.amount), 0) as total_amount
    FROM payments py
    JOIN reservations r ON py.reservation_id = r.id
    JOIN rooms rm ON r.room_id = rm.id
    JOIN properties p ON rm.property_id = p.id
    JOIN payment_statuses ps ON py.payment_status_id = ps.id
    WHERE p.owner_id = ? ${dateFilter} ${propertyFilter}
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
 * Get top performing properties for owner
 */
const getTopProperties = async (ownerId, limit = 10, startDate, endDate) => {
  const dateFilter = startDate && endDate ? "AND DATE(r.created_at) BETWEEN ? AND ?" : "";
  const params =
    startDate && endDate ? [ownerId, startDate, endDate, limit] : [ownerId, limit];

  const query = `
    SELECT
      p.id,
      p.property_name,
      COUNT(r.id) as reservation_count,
      COALESCE(SUM(py.amount), 0) as total_revenue,
      COALESCE(AVG(rev.rating), 0) as avg_rating,
      COUNT(DISTINCT r.customer_id) as unique_customers
    FROM properties p
    LEFT JOIN rooms rm ON p.id = rm.property_id
    LEFT JOIN reservations r ON rm.id = r.room_id ${dateFilter}
    LEFT JOIN payments py ON r.id = py.reservation_id AND py.payment_status_id = (SELECT id FROM payment_statuses WHERE status_name = 'paid')
    LEFT JOIN reviews rev ON r.id = rev.reservation_id
    WHERE p.owner_id = ?
    GROUP BY p.id, p.property_name
    ORDER BY total_revenue DESC
    LIMIT ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

/**
 * Get top performing rooms for owner
 */
const getTopRooms = async (ownerId, limit = 10, startDate, endDate) => {
  const dateFilter = startDate && endDate ? "AND DATE(r.created_at) BETWEEN ? AND ?" : "";
  const params =
    startDate && endDate ? [ownerId, startDate, endDate, limit] : [ownerId, limit];

  const query = `
    SELECT
      rm.id,
      rm.room_name,
      p.property_name,
      COUNT(r.id) as reservation_count,
      COALESCE(SUM(py.amount), 0) as total_revenue,
      COALESCE(AVG(rev.rating), 0) as avg_rating,
      rm.price_per_night
    FROM rooms rm
    JOIN properties p ON rm.property_id = p.id
    LEFT JOIN reservations r ON rm.id = r.room_id ${dateFilter}
    LEFT JOIN payments py ON r.id = py.reservation_id AND py.payment_status_id = (SELECT id FROM payment_statuses WHERE status_name = 'paid')
    LEFT JOIN reviews rev ON r.id = rev.reservation_id
    WHERE p.owner_id = ?
    GROUP BY rm.id, rm.room_name, p.property_name, rm.price_per_night
    ORDER BY total_revenue DESC
    LIMIT ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, params, (error, result) => {
      if (error) return reject(error);
      resolve(result || []);
    });
  });
};

/**
 * Check if property belongs to owner
 */
const verifyPropertyOwnership = async (ownerId, propertyId) => {
  const query = `
    SELECT id FROM properties WHERE id = ? AND owner_id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [propertyId, ownerId], (error, result) => {
      if (error) return reject(error);
      resolve(result && result.length > 0);
    });
  });
};

module.exports = {
  getDashboardSummary,
  getReservationStats,
  getRevenueStats,
  getTopProperties,
  getTopRooms,
  verifyPropertyOwnership,
};
