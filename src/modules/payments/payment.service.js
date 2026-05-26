const path = require("path");
const fs = require("fs");
const paymentModel = require("./payment.model");
const { isValidTransition } = require("./payment.validation");

// ─── Helpers ──────────────────────────────────────────────────────

const toSafePayment = (row) => ({
  id: row.id,
  reservation_id: row.reservation_id,
  customer_id: row.customer_id,
  owner_id: row.owner_id,
  amount: row.amount,
  currency: row.currency,
  transaction_reference: row.transaction_reference,
  rejection_reason: row.rejection_reason,
  receipt_image_url: row.receipt_image_url,
  payment_status: row.status_name,
  payment_method: row.method_name,
  payment_method_id: row.payment_method_id,
  payment_status_id: row.payment_status_id,
  verified_by: row.verified_by,
  verified_by_name: row.verified_by_name,
  verified_at: row.verified_at,
  paid_at: row.paid_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
  customer_name: row.customer_name,
  customer_email: row.customer_email,
  customer_phone: row.customer_phone,
  check_in_date: row.check_in_date,
  check_out_date: row.check_out_date,
  total_nights: row.total_nights,
  reservation_status: row.reservation_status,
  room_name: row.room_name,
  property_name: row.property_name,
  property_id: row.property_id,
  owner_payment_account_id: row.owner_payment_account_id,
  account_name: row.account_name,
  account_number: row.account_number,
  qr_image_url: row.qr_image_url,
});

const throwError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

// ─── Create Payment ───────────────────────────────────────────────

const createPayment = async (
  customerId,
  { reservation_id, payment_method_id, owner_payment_account_id, transaction_reference }
) => {
  // 1. Reservation must exist
  const reservation = await paymentModel.findReservationById(reservation_id);
  if (!reservation) throwError("Reservation not found", 404);

  // 2. Reservation must belong to this customer
  if (reservation.customer_id !== customerId) {
    throwError("You can only pay for your own reservations", 403);
  }

  // 3. Reservation must be in a payable state (confirmed or pending)
  const payableStatuses = ["pending", "confirmed"];
  if (!payableStatuses.includes(reservation.reservation_status)) {
    throwError(
      `Cannot create payment for a reservation with status: ${reservation.reservation_status}`,
      400
    );
  }

  // 4. No duplicate payment
  const existing = await paymentModel.findExistingPaymentForReservation(reservation_id);
  if (existing) throwError("A payment record already exists for this reservation", 409);

  // 5. Payment method must exist and be active
  const method = await paymentModel.findPaymentMethodById(payment_method_id);
  if (!method) throwError("Payment method not found or inactive", 400);

  if (owner_payment_account_id) {
    const ownerPaymentAccount = await paymentModel.findOwnerPaymentAccountById(
      owner_payment_account_id
    );

    if (!ownerPaymentAccount) {
      throwError("Owner payment account not found or inactive", 400);
    }

    if (ownerPaymentAccount.owner_id !== reservation.owner_id) {
      throwError(
        "Owner payment account does not belong to the reservation property owner",
        403
      );
    }

    if (ownerPaymentAccount.payment_method_id !== payment_method_id) {
      throwError("Selected owner payment account does not match the payment method", 400);
    }
  }

  // 6. Status starts as "pending"
  const pendingStatus = await paymentModel.findPaymentStatusByName("pending");
  if (!pendingStatus) throwError("Payment statuses not seeded", 500);

  // 7. Amount must match reservation total
  const amount = parseFloat(reservation.total_amount);

  const paymentId = await paymentModel.createPayment({
    reservationId: reservation_id,
    customerId,
    ownerId: reservation.owner_id,
    paymentMethodId: payment_method_id,
    ownerPaymentAccountId: owner_payment_account_id,
    paymentStatusId: pendingStatus.id,
    amount,
    transactionReference: transaction_reference || null,
  });

  const payment = await paymentModel.findPaymentById(paymentId);
  return toSafePayment(payment);
};

// ─── Upload Receipt ───────────────────────────────────────────────

const uploadReceipt = async (customerId, paymentId, file) => {
  if (!file) throwError("No receipt file provided", 400);

  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) throwError("Payment not found", 404);

  if (payment.customer_id !== customerId) {
    throwError("You can only upload receipts for your own payments", 403);
  }

  // Only allow upload when payment is pending or already submitted (re-upload)
  const uploadableStatuses = ["pending", "submitted"];
  if (!uploadableStatuses.includes(payment.status_name)) {
    throwError(
      `Cannot upload receipt for a payment with status: ${payment.status_name}`,
      400
    );
  }

  // Move file to permanent location (multer already saved it to uploads/receipts)
  const receiptUrl = `/uploads/receipts/${file.filename}`;

  // Remove old receipt file if re-uploading
  if (payment.receipt_image_url) {
    const oldPath = path.join(
      process.cwd(),
      payment.receipt_image_url.replace(/^\//, "")
    );
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // Status transitions to "submitted" once receipt is uploaded
  const submittedStatus = await paymentModel.findPaymentStatusByName("submitted");
  if (!submittedStatus) throwError("Payment statuses not seeded", 500);

  await paymentModel.updateReceiptUrl(paymentId, receiptUrl, submittedStatus.id);

  const updated = await paymentModel.findPaymentById(paymentId);
  return toSafePayment(updated);
};

// ─── Customer Views ───────────────────────────────────────────────

const getMyPayments = async (customerId, filters = {}) => {
  const rows = await paymentModel.findPaymentsByCustomer(customerId, filters);
  return rows.map(toSafePayment);
};

const getReservationOwnerPaymentAccounts = async (customerId, reservationId) => {
  const reservation = await paymentModel.findReservationById(reservationId);
  if (!reservation) throwError("Reservation not found", 404);
  if (reservation.customer_id !== customerId) {
    throwError("You can only view payment accounts for your own reservations", 403);
  }

  const accounts = await paymentModel.findActiveOwnerPaymentAccountsByOwnerId(
    reservation.owner_id
  );
  console.log(accounts);

  return accounts;
};

const getOwnerPayments = async (ownerId, filters = {}) => {
  const rows = await paymentModel.findPaymentsByOwner(ownerId, filters);
  return rows.map(toSafePayment);
};

const getPaymentById = async (paymentId, requestingUserId, requestingUserRole) => {
  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) throwError("Payment not found", 404);

  const isAdmin = requestingUserRole === "admin";
  const isCustomer = payment.customer_id === requestingUserId;
  const isOwner = requestingUserRole === "owner" && payment.owner_id === requestingUserId;

  if (!isAdmin && !isCustomer && !isOwner) {
    throwError("You do not have permission to view this payment", 403);
  }

  return toSafePayment(payment);
};

// ─── Owner Actions ───────────────────────────────────────────────

const _ownerTransition = async (ownerId, paymentId, targetStatus, extraFields = {}) => {
  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) throwError("Payment not found", 404);
  if (payment.owner_id !== ownerId) {
    throwError("You can only manage payments for your own properties", 403);
  }

  if (!isValidTransition(payment.status_name, targetStatus)) {
    throwError(
      `Cannot transition payment from '${payment.status_name}' to '${targetStatus}'`,
      400
    );
  }

  const statusRow = await paymentModel.findPaymentStatusByName(targetStatus);
  if (!statusRow) throwError("Payment statuses not seeded", 500);

  await paymentModel.updatePaymentStatus(payment.id, statusRow.id, extraFields);

  const updated = await paymentModel.findPaymentById(payment.id);
  return toSafePayment(updated);
};

const verifyPayment = async (ownerId, paymentId) => {
  const now = new Date();
  return _ownerTransition(ownerId, paymentId, "paid", {
    verified_by: ownerId,
    verified_at: now,
    paid_at: now,
  });
};

const rejectPayment = async (ownerId, paymentId, rejectionReason) => {
  return _ownerTransition(ownerId, paymentId, "failed", {
    verified_by: ownerId,
    verified_at: new Date(),
    rejection_reason: rejectionReason || null,
  });
};

const refundPayment = async (ownerId, paymentId) => {
  return _ownerTransition(ownerId, paymentId, "refunded", {
    verified_by: ownerId,
    verified_at: new Date(),
  });
};

const getAllPayments = async (filters = {}) => {
  const rows = await paymentModel.findAllPayments(filters);
  return rows.map(toSafePayment);
};

const getPaymentsPendingVerification = async () => {
  const rows = await paymentModel.findAllPayments({ status: "submitted" });
  return rows.map(toSafePayment);
};

const getOwnerPaymentsPendingVerification = async (ownerId) => {
  const rows = await paymentModel.findPaymentsByOwner(ownerId, { status: "submitted" });
  return rows.map(toSafePayment);
};
module.exports = {
  createPayment,
  uploadReceipt,
  getMyPayments,
  getReservationOwnerPaymentAccounts,
  getOwnerPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
  refundPayment,
  getAllPayments,
  getPaymentsPendingVerification,
  getOwnerPaymentsPendingVerification,
};
