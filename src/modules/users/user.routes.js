const express = require("express");
const userController = require("./user.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authMiddleware, userController.getMe);
router.patch("/me", authMiddleware, userController.updateMe);
router.patch("/me/password", authMiddleware, userController.changePassword);

module.exports = router;
