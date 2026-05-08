const express = require("express");

const propertyController = require("./property.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

const role = require("../../constants/roles");

const router = express.Router();

router.get("/", propertyController.getAll);
router.post("/", authMiddleware, roleMiddleware(role.OWNER), propertyController.register);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.update
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.getMyProperty
);
router.get("/:id", propertyController.getDetail);
router.get(
  "/my/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.getMyPropertyById
);

module.exports = router;
