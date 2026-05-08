const express = require("express");

const adminController = require("./admin.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get("/reservations", adminController.getAllReservations);
router.patch("/reservations/:id/status", adminController.updateReservationStatus);

router.get("/properties", adminController.getAll);
router.patch("/properties/:id/status", adminController.updateStatusProperty);

module.exports = router;
