const express = require("express");

const propertyController = require("./property.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

const role = require("../../constants/roles");
const reviewController = require("../reviews/review.controller");
const amenityController =
require("../amenities/amenity.controller");

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
router.get(
  "/:propertyId/reviews",
  reviewController.getPropertyReviews
);
router.get(
    "/properties/:propertyId/amenities",
    amenityController.getPropertyAmenities
);

router.put(
    "/properties/:propertyId/amenities",
    amenityController.updatePropertyAmenities
);
router.get("/:id", propertyController.getDetail);
router.get(
  "/my/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.getMyPropertyById
);

module.exports = router;
