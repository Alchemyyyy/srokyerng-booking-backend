const express = require("express");
const ownerController = require("./owner.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.OWNER));

router.get("/dashboard", ownerController.getDashboard);
router.get("/properties", ownerController.getProperties);
router.get("/reservations", ownerController.getReservations);
router.get("/payments", ownerController.getPayments);
router.get("/reviews", ownerController.getReviews);

module.exports = router;
