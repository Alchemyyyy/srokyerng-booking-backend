const express = require("express");
const ownerController = require("./owner.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");
const paymentController = require("../payments/payment.controller");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.OWNER));

router.get("/dashboard", ownerController.getDashboard);
router.get("/properties", ownerController.getProperties);
router.get("/reservations", ownerController.getReservations);

router.get("/payments", paymentController.getOwnerPayments);
router.get(
  "/payments/pending-verification",
  paymentController.getOwnerPendingVerificationPayments
);
router.get("/payments/:id", paymentController.getPaymentById);
router.get("/payments/:id/proof", paymentController.getPaymentProof);
router.patch("/payments/:id/verify", paymentController.verifyPayment);
router.patch("/payments/:id/reject", paymentController.rejectPayment);
router.patch("/payments/:id/refund", paymentController.refundPayment);

router.get("/reviews", ownerController.getReviews);

module.exports = router;
