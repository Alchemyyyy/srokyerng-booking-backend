const express = require("express");
const reservationController = require("../reservations/reservation.controller");
const adminController = require("./admin.controller");
const reviewController = require("../reviews/review.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");
const paymentController = require("../payments/payment.controller");

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

router.get("/reports", adminController.getAllReports);
router.get("/reports/:id", adminController.getReportByIdAdmin);
router.patch("/reports/:id/status", adminController.updateStatus);
router.patch("/reports/:id/resolve", adminController.resolveReport);

module.exports = router;
