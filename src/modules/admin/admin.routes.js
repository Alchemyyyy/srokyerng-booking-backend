const express = require("express");

const adminController = require("./admin.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const role = require("../../constants/roles");
const router = express.Router();

router.get(
  "/properties",
  authMiddleware,
  roleMiddleware(role.ADMIN),
  adminController.getAll
);
router.patch(
  "/properties/:id/status",
  authMiddleware,
  roleMiddleware(role.ADMIN),
  adminController.updateStatusProperty
);

module.exports = router;
