const express = require("express");
const ownerController = require("./owner.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");
const paymentController = require("../payments/payment.controller");
const upload = require("../../middleware/upload.middleware");

const paymentAccountQrUpload = upload.createImageUpload({
  folder: "payment-account-qrs",
  prefix: "payment-account-qr",
});

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

router.get("/payment-accounts", paymentController.getOwnerPaymentAccounts);
router.post(
  "/payment-accounts",
  upload.handleUpload(paymentAccountQrUpload.single("qr_image")),
  paymentController.createOwnerPaymentAccount
);
router.patch(
  "/payment-accounts/:id",
  upload.handleUpload(paymentAccountQrUpload.single("qr_image")),
  paymentController.updateOwnerPaymentAccount
);
router.patch(
  "/payment-accounts/:id/deactivate",
  paymentController.deactivateOwnerPaymentAccount
);
router.delete(
  "/payment-accounts/:id",
  paymentController.deleteOwnerPaymentAccount
);
router.patch(
  "/payment-accounts/:id/activate",
  paymentController.activateOwnerPaymentAccount
);

router.get("/reviews", ownerController.getReviews);

module.exports = router;
