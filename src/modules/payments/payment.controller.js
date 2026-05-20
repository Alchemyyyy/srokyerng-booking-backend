const paymentService = require("./payment.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  validateCreatePayment,
  validateVerifyPayment,
  validateRejectPayment,
  validateRefundPayment,
} = require("./payment.validation");

// ─── Customer ──────────────────────────────────────────────────────

/**
 * POST /api/payments
 * Customer only — create a payment record for their reservation.
 */
const createPayment = asyncHandler(async (req, res) => {
  const { errors, value } = validateCreatePayment(req.body);
  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const payment = await paymentService.createPayment(req.user.id, value);
  return successResponse(res, "Payment created successfully", payment, 201);
});

/**
 * GET /api/payments/my
 * Customer only — list own payments.
 */
const getMyPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const payments = await paymentService.getMyPayments(req.user.id, { status });
  return successResponse(res, "Payments retrieved successfully", payments);
});

/**
 * GET /api/payments/:id
 * Customer (own), owner (own property), admin.
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const paymentId = parseInt(req.params.id, 10);
  if (isNaN(paymentId) || paymentId <= 0) {
    return errorResponse(res, "Invalid payment ID", 400);
  }

  const payment = await paymentService.getPaymentById(
    paymentId,
    req.user.id,
    req.user.role
  );
  return successResponse(res, "Payment retrieved successfully", payment);
});

/**
 * GET /api/payments/:id/proof
 * Customer/admin — view payment proof details.
 */
const getPaymentProof = asyncHandler(async (req, res) => {
  const paymentId = parseInt(req.params.id, 10);
  if (isNaN(paymentId) || paymentId <= 0) {
    return errorResponse(res, "Invalid payment ID", 400);
  }

  const payment = await paymentService.getPaymentById(
    paymentId,
    req.user.id,
    req.user.role
  );
  return successResponse(res, "Payment proof retrieved successfully", {
    id: payment.id,
    payment_status: payment.payment_status,
    receipt_image_url: payment.receipt_image_url,
    rejection_reason: payment.rejection_reason,
    verified_by: payment.verified_by,
    verified_by_name: payment.verified_by_name,
    verified_at: payment.verified_at,
    paid_at: payment.paid_at,
  });
});

/**
 * POST /api/payments/:id/receipt
 * Customer only — upload proof of payment for own payment.
 * multer is applied in the route layer so `req.file` is available here.
 */
const uploadReceipt = asyncHandler(async (req, res) => {
  console.log(req.user.id);
  console.log(req.file);
  
  const paymentId = parseInt(req.params.id, 10);
  if (isNaN(paymentId) || paymentId <= 0) {
    return errorResponse(res, "Invalid payment ID", 400);
  }
  console.log(paymentId);
  

  const payment = await paymentService.uploadReceipt(req.user.id, paymentId, req.file);
  return successResponse(res, "Receipt uploaded successfully", payment);
});

// ─── Admin ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/payments
 * Admin only — list all payments with optional filters.
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const { status, customer_id, owner_id } = req.query;
  const filters = {};
  if (status) filters.status = status;
  if (customer_id) filters.customer_id = parseInt(customer_id);
  if (owner_id) filters.owner_id = parseInt(owner_id);

  const payments = await paymentService.getAllPayments(filters);
  return successResponse(res, "All payments retrieved successfully", payments);
});

/**
 * PATCH /api/admin/payments/:id/verify
 * Admin only — mark payment as paid.
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const paymentId = parseInt(req.params.id, 10);
  if (isNaN(paymentId) || paymentId <= 0) {
    return errorResponse(res, "Invalid payment ID", 400);
  }

  const { errors } = validateVerifyPayment(req.body);
  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const payment = await paymentService.verifyPayment(req.user.id, paymentId);
  return successResponse(res, "Payment verified successfully", payment);
});

/**
 * PATCH /api/admin/payments/:id/reject
 * Admin only — mark payment as failed, requires reason.
 */
const rejectPayment = asyncHandler(async (req, res) => {
  const paymentId = parseInt(req.params.id, 10);
  if (isNaN(paymentId) || paymentId <= 0) {
    return errorResponse(res, "Invalid payment ID", 400);
  }

  const { errors, value } = validateRejectPayment(req.body);
  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const payment = await paymentService.rejectPayment(
    req.user.id,
    paymentId,
    value.rejection_reason
  );
  return successResponse(res, "Payment rejected successfully", payment);
});

/**
 * PATCH /api/admin/payments/:id/refund
 * Admin only — mark payment as refunded.
 */
const refundPayment = asyncHandler(async (req, res) => {
  const paymentId = parseInt(req.params.id, 10);
  if (isNaN(paymentId) || paymentId <= 0) {
    return errorResponse(res, "Invalid payment ID", 400);
  }

  const { errors } = validateRefundPayment(req.body);
  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const payment = await paymentService.refundPayment(req.user.id, paymentId);
  return successResponse(res, "Payment refunded successfully", payment);
});

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentById,
  getPaymentProof,
  uploadReceipt,
  getAllPayments,
  verifyPayment,
  rejectPayment,
  refundPayment,
};
