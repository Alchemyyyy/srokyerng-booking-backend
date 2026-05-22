const express = require("express");

const roomController = require("./room.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const upload = require("../../middleware/upload.middleware");

const role = require("../../constants/roles");

const router = express.Router();

// PUBLIC

router.get("/:id", roomController.getRoomDetail);

router.get("/types/all", roomController.getRoomTypes);

// OWNER

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  roomController.updateRoom
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  roomController.deleteRoom
);

router.post(
  "/:id/images",
  authMiddleware,
  roleMiddleware(role.OWNER),
  upload.array("images", 10),
  roomController.uploadRoomImages
);

router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  roleMiddleware(role.OWNER),
  roomController.deleteRoomImage
);

module.exports = router;
