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

// Payments
router.get("/payments", paymentController.getAllPayments);
router.patch("/payments/:id/verify", paymentController.verifyPayment);
router.patch("/payments/:id/reject", paymentController.rejectPayment);
router.patch("/payments/:id/refund", paymentController.refundPayment);
module.exports = router;
