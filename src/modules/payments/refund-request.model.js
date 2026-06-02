const db = require("../../config/db");

const findRefundRequestById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM refund_requests WHERE id = ?";
    db.query(query, [id], (error, results) => {
      if (error) return reject(error);
      resolve(results[0]);
    });
  });
};

const findRefundRequestsByPaymentId = (paymentId) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM refund_requests WHERE payment_id = ? ORDER BY requested_at DESC";
    db.query(query, [paymentId], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

const findRefundRequestsByUserId = (userId, limit = 50) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM refund_requests 
      WHERE requested_by = ? 
      ORDER BY requested_at DESC 
      LIMIT ?
    `;
    db.query(query, [userId, limit], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

const findPendingRefundRequests = (limit = 50) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM refund_requests 
      WHERE refund_status = 'requested' 
      ORDER BY requested_at ASC 
      LIMIT ?
    `;
    db.query(query, [limit], (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

const createRefundRequest = (paymentId, requestedBy, amount, reason) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO refund_requests 
      (payment_id, requested_by, amount, reason) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [paymentId, requestedBy, amount, reason], (error, results) => {
      if (error) return reject(error);
      resolve(results.insertId);
    });
  });
};

const updateRefundRequestStatus = (id, status, handledBy, decisionNote) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE refund_requests 
      SET refund_status = ?, handled_by = ?, decision_note = ?, handled_at = NOW() 
      WHERE id = ?
    `;
    db.query(query, [status, handledBy, decisionNote, id], (error, results) => {
      if (error) return reject(error);
      resolve(results.affectedRows > 0);
    });
  });
};

const getRefundRequestStats = (startDate = null, endDate = null) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        refund_status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM refund_requests
    `;
    const params = [];

    if (startDate && endDate) {
      query += " WHERE requested_at BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query += " GROUP BY refund_status";

    db.query(query, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

module.exports = {
  findRefundRequestById,
  findRefundRequestsByPaymentId,
  findRefundRequestsByUserId,
  findPendingRefundRequests,
  createRefundRequest,
  updateRefundRequestStatus,
  getRefundRequestStats,
};
