const pool = require("../../config/db");

// ─── Full payment SELECT used for consistent return shape ──────────
const PAYMENT_SELECT = `
  SELECT
    pay.id,
    pay.reservation_id,
    pay.customer_id,
    pay.owner_id,
    pay.amount,
    pay.currency,
    pay.transaction_reference,
    pay.receipt_image_url,
    pay.verified_at,
    pay.paid_at,
    pay.created_at,
    pay.updated_at,

    -- payment method
    pm.id         AS payment_method_id,
    pm.method_name,

    -- payment status
    ps.id         AS payment_status_id,
    ps.status_name,

    -- customer
    cu.full_name  AS customer_name,
    cu.email      AS customer_email,
    cu.phone      AS customer_phone,

    -- reservation
    res.check_in_date,
    res.check_out_date,
    res.total_nights,
    res.reservation_status,

    -- room & property
    r.room_name,
    p.property_name,
    p.id          AS property_id,

    -- admin who verified
    pay.verified_by,
    adm.full_name AS verified_by_name
  FROM payments pay
  JOIN payment_methods  pm  ON pay.payment_method_id  = pm.id
  JOIN payment_statuses ps  ON pay.payment_status_id  = ps.id
  JOIN users            cu  ON pay.customer_id        = cu.id
  JOIN reservations     res ON pay.reservation_id     = res.id
  JOIN rooms            r   ON res.room_id            = r.id
  JOIN properties       p   ON r.property_id          = p.id
  LEFT JOIN users       adm ON pay.verified_by        = adm.id
`;

// ─── Lookups ──────────────────────────────────────────────────────

const findReservationById = async (reservationId) => {
  const [rows] = await pool.query(
    `SELECT res.*,
            r.property_id,
            p.owner_id
     FROM reservations res
     JOIN rooms       r ON res.room_id      = r.id
     JOIN properties  p ON r.property_id   = p.id
     WHERE res.id = ?
     LIMIT 1`,
    [reservationId]
  );
  return rows[0];
};

const findPaymentMethodById = async (methodId) => {
  const [rows] = await pool.query(
    "SELECT * FROM payment_methods WHERE id = ? AND is_active = TRUE LIMIT 1",
    [methodId]
  );
  return rows[0];
};

const findPaymentStatusByName = async (statusName) => {
  const [rows] = await pool.query(
    "SELECT * FROM payment_statuses WHERE status_name = ? LIMIT 1",
    [statusName]
  );
  return rows[0];
};

const findExistingPaymentForReservation = async (reservationId) => {
  const [rows] = await pool.query(
    "SELECT id, payment_status_id FROM payments WHERE reservation_id = ? LIMIT 1",
    [reservationId]
  );
  return rows[0];
};

// ─── CRUD ─────────────────────────────────────────────────────────

const createPayment = async ({
  reservationId,
  customerId,
  ownerId,
  paymentMethodId,
  paymentStatusId,
  amount,
  transactionReference,
}) => {
  const [result] = await pool.query(
    `INSERT INTO payments
       (reservation_id, customer_id, owner_id,
        payment_method_id, payment_status_id,
        amount, currency, transaction_reference)
     VALUES (?, ?, ?, ?, ?, ?, 'USD', ?)`,
    [
      reservationId,
      customerId,
      ownerId,
      paymentMethodId,
      paymentStatusId,
      amount,
      transactionReference || null,
    ]
  );
  return result.insertId;
};

const findPaymentById = async (paymentId) => {
  const [rows] = await pool.query(`${PAYMENT_SELECT} WHERE pay.id = ? LIMIT 1`, [
    paymentId,
  ]);
  return rows[0];
};

const findPaymentsByCustomer = async (customerId, filters = {}) => {
  let query = `${PAYMENT_SELECT} WHERE pay.customer_id = ?`;
  const params = [customerId];

  if (filters.status) {
    query += " AND ps.status_name = ?";
    params.push(filters.status);
  }

  query += " ORDER BY pay.created_at DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};

const findAllPayments = async (filters = {}) => {
  let query = `${PAYMENT_SELECT} WHERE 1=1`;
  const params = [];

  if (filters.status) {
    query += " AND ps.status_name = ?";
    params.push(filters.status);
  }
  if (filters.customer_id) {
    query += " AND pay.customer_id = ?";
    params.push(filters.customer_id);
  }
  if (filters.owner_id) {
    query += " AND pay.owner_id = ?";
    params.push(filters.owner_id);
  }

  query += " ORDER BY pay.created_at DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};

const updatePaymentStatus = async (paymentId, statusId, extraFields = {}) => {
  const sets = ["payment_status_id = ?"];
  const params = [statusId];

  if (Object.hasOwn(extraFields, "verified_by")) {
    sets.push("verified_by = ?");
    params.push(extraFields.verified_by);
  }
  if (Object.hasOwn(extraFields, "verified_at")) {
    sets.push("verified_at = ?");
    params.push(extraFields.verified_at);
  }
  if (Object.hasOwn(extraFields, "paid_at")) {
    sets.push("paid_at = ?");
    params.push(extraFields.paid_at);
  }
  if (Object.hasOwn(extraFields, "transaction_reference")) {
    sets.push("transaction_reference = ?");
    params.push(extraFields.transaction_reference);
  }

  params.push(paymentId);

  await pool.query(
    `UPDATE payments SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    params
  );
};

const updateReceiptUrl = async (paymentId, receiptImageUrl, statusId) => {
  await pool.query(
    `UPDATE payments
     SET receipt_image_url = ?,
         payment_status_id = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [receiptImageUrl, statusId, paymentId]
  );
};

module.exports = {
  findReservationById,
  findPaymentMethodById,
  findPaymentStatusByName,
  findExistingPaymentForReservation,
  createPayment,
  findPaymentById,
  findPaymentsByCustomer,
  findAllPayments,
  updatePaymentStatus,
  updateReceiptUrl,
};
