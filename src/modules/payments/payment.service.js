const path = require("path");
const fs = require("fs");
const paymentModel = require("./payment.model");
const propertyModel = require("../properties/property.model");
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

const toSafeOwnerPaymentAccount = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    owner_id: row.owner_id,
    payment_method_id: row.payment_method_id,
    payment_method_name: row.method_name,
    account_name: row.account_name,
    account_number: row.account_number,
    qr_image_url: row.qr_image_url,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
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

  return accounts.map(toSafeOwnerPaymentAccount);
};

const getOwnerPaymentAccounts = async (ownerId) => {
  const accounts = await paymentModel.findOwnerPaymentAccountsByOwnerId(ownerId);
  return accounts.map(toSafeOwnerPaymentAccount);
};

const createOwnerPaymentAccount = async (ownerId, {
  payment_method_id,
  account_name,
  account_number,
  qr_image_url,
}) => {
  if (!account_name || account_name.trim().length === 0) {
    throwError("Account name is required", 400);
  }

  if (!account_number && !qr_image_url) {
    throwError("At least one payment detail is required: account number or QR image", 400);
  }

  const paymentMethod = await paymentModel.findPaymentMethodById(payment_method_id);
  if (!paymentMethod) {
    throwError("Payment method not found or inactive", 400);
  }

  const duplicate = await paymentModel.findOwnerActivePaymentAccountByOwnerAndMethod(
    ownerId,
    payment_method_id
  );
  if (duplicate) {
    throwError(
      "An active payment account already exists for this payment method",
      409
    );
  }

  const insertId = await paymentModel.createOwnerPaymentAccount({
    ownerId,
    paymentMethodId: payment_method_id,
    accountName: account_name.trim(),
    accountNumber: account_number ? account_number.trim() : null,
    qrImageUrl: qr_image_url || null,
    isActive: true,
  });

  const row = await paymentModel.findOwnerPaymentAccountById(insertId, false);
  return toSafeOwnerPaymentAccount(row);
};

const updateOwnerPaymentAccount = async (ownerId, accountId, payload) => {
  const { payment_method_id, account_name, account_number, qr_image_url } = payload;
  const account = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  if (!account) throwError("Owner payment account not found", 404);

  if (account.owner_id !== ownerId) {
    throwError("You can only manage your own payment accounts", 403);
  }

  const updates = {};
  if (payment_method_id && payment_method_id !== account.payment_method_id) {
    const paymentMethod = await paymentModel.findPaymentMethodById(payment_method_id);
    if (!paymentMethod) {
      throwError("Payment method not found or inactive", 400);
    }
    const duplicate = await paymentModel.findOwnerActivePaymentAccountByOwnerAndMethod(
      ownerId,
      payment_method_id
    );
    if (duplicate && duplicate.id !== account.id) {
      throwError(
        "An active payment account already exists for this payment method",
        409
      );
    }
    updates.payment_method_id = payment_method_id;
  }

  if (Object.hasOwn(payload, "account_name")) {
    if (!account_name || account_name.trim().length === 0) {
      throwError("Account name is required", 400);
    }
    updates.account_name = account_name.trim();
  }

  if (Object.hasOwn(payload, "account_number")) {
    updates.account_number = account_number ? account_number.trim() : null;
  }

  if (Object.hasOwn(payload, "qr_image_url")) {
    updates.qr_image_url = qr_image_url || null;
  }

  const finalAccountNumber = Object.hasOwn(updates, "account_number")
    ? updates.account_number
    : account.account_number;
  const finalQrImageUrl = Object.hasOwn(updates, "qr_image_url")
    ? updates.qr_image_url
    : account.qr_image_url;
  const finalAccountName = Object.hasOwn(updates, "account_name")
    ? updates.account_name
    : account.account_name;

  if (!finalAccountName || finalAccountName.trim().length === 0) {
    throwError("Account name is required", 400);
  }

  if (!finalAccountNumber && !finalQrImageUrl) {
    throwError("At least one payment detail is required: account number or QR image", 400);
  }

  if (updates.qr_image_url && account.qr_image_url && account.qr_image_url !== updates.qr_image_url) {
    const oldPath = path.join(process.cwd(), account.qr_image_url.replace(/^\//, ""));
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  await paymentModel.updateOwnerPaymentAccount(accountId, updates);
  const updated = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  return toSafeOwnerPaymentAccount(updated);
};

const activateOwnerPaymentAccount = async (ownerId, accountId) => {
  const account = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  if (!account) throwError("Owner payment account not found", 404);
  if (account.owner_id !== ownerId) {
    throwError("You can only manage your own payment accounts", 403);
  }

  if (account.is_active) {
    return toSafeOwnerPaymentAccount(account);
  }

  const duplicate = await paymentModel.findOwnerActivePaymentAccountByOwnerAndMethod(
    ownerId,
    account.payment_method_id
  );
  if (duplicate && duplicate.id !== account.id) {
    throwError(
      "An active payment account already exists for this payment method",
      409
    );
  }

  await paymentModel.setOwnerPaymentAccountActive(accountId, true);
  const updated = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  return toSafeOwnerPaymentAccount(updated);
};

const deactivateOwnerPaymentAccount = async (ownerId, accountId) => {
  const account = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  if (!account) throwError("Owner payment account not found", 404);
  if (account.owner_id !== ownerId) {
    throwError("You can only manage your own payment accounts", 403);
  }

  await paymentModel.setOwnerPaymentAccountActive(accountId, false);
  const updated = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  return toSafeOwnerPaymentAccount(updated);
};

const deleteOwnerPaymentAccount = async (ownerId, accountId) => {
  return deactivateOwnerPaymentAccount(ownerId, accountId);
};

const getPropertyPaymentAccounts = async (propertyId) => {
  const property = await propertyModel.findPropertyById(propertyId);
  if (!property) throwError("Property not found", 404);

  const accounts = await paymentModel.findActiveOwnerPaymentAccountsByOwnerId(
    property.owner_id
  );
  return accounts.map(toSafeOwnerPaymentAccount);
};

const getAdminOwnerPaymentAccounts = async (filters = {}) => {
  const accounts = await paymentModel.findOwnerPaymentAccounts(filters);
  return accounts.map(toSafeOwnerPaymentAccount);
};

const getAdminOwnerPaymentAccountById = async (accountId) => {
  const account = await paymentModel.findOwnerPaymentAccountById(accountId, false);
  if (!account) throwError("Owner payment account not found", 404);
  return toSafeOwnerPaymentAccount(account);
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
  getOwnerPaymentAccounts,
  createOwnerPaymentAccount,
  updateOwnerPaymentAccount,
  activateOwnerPaymentAccount,
  deactivateOwnerPaymentAccount,
  deleteOwnerPaymentAccount,
  getPropertyPaymentAccounts,
  getAdminOwnerPaymentAccounts,
  getAdminOwnerPaymentAccountById,
  getOwnerPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
  refundPayment,
  getAllPayments,
  getPaymentsPendingVerification,
  getOwnerPaymentsPendingVerification,
};
