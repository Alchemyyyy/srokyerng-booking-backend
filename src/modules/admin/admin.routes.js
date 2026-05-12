const express = require("express");
const reservationController = require("../reservations/reservation.controller");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get("/reservations", reservationController.getAdminReservations);
router.patch("/reservations/:id/status", reservationController.updateReservationStatus);

router.get("/properties", adminController.getAll);
router.patch("/properties/:id/status", adminController.updateStatusProperty);

module.exports = router;
