const express = require("express");
const reservationController = require("../reservations/reservation.controller");
const adminController = require("./admin.controller");
const reviewController = require("../reviews/review.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");
const paymentController = require("../payments/payment.controller");
const analyticsController = require("./analytics.controller");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get("/reservations", reservationController.getAdminReservations);
router.patch("/reservations/:id/status", reservationController.updateReservationStatus);

router.get("/properties", adminController.getAll);
router.patch("/properties/:id/status", adminController.updateStatusProperty);
router.get("/reviews", reviewController.getAllReviews);

router.get(
  "/payments/pending-verification",
  paymentController.getPendingVerificationPayments
);
router.get("/payments/:id", paymentController.getPaymentById);
router.get("/payments/:id/proof", paymentController.getPaymentProof);
router.get("/payments", paymentController.getAllPayments);
router.get("/payment-accounts", paymentController.getAdminOwnerPaymentAccounts);
router.get("/payment-accounts/:id", paymentController.getAdminOwnerPaymentAccountById);

// Refund request endpoints
router.get("/refund-requests", paymentController.getPendingRefundRequests);
router.patch("/refund-requests/:id/approve", paymentController.approveRefundRequest);
router.patch("/refund-requests/:id/reject", paymentController.rejectRefundRequest);

// Analytics endpoints
router.get("/analytics/summary", analyticsController.getSummary);
router.get("/analytics/users", analyticsController.getUsers);
router.get("/analytics/properties", analyticsController.getProperties);
router.get("/analytics/reservations", analyticsController.getReservations);
router.get("/analytics/payments", analyticsController.getPayments);
router.get("/analytics/reviews", analyticsController.getReviews);
router.get("/analytics/activity", analyticsController.getActivity);

module.exports = router;
