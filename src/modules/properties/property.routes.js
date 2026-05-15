const express = require("express");

const propertyController = require("./property.controller");
const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");
const upload = require("../../middleware/upload.middleware");

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

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.deleteProperty
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.getMyProperty
);
<<<<<<< HEAD

=======
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
>>>>>>> dev
router.get("/:id", propertyController.getDetail);

router.get(
  "/my/:id",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.getMyPropertyById
);

router.get("/:propertyId/images", propertyController.getPropertyImages);

router.post(
  "/:id/images",
  authMiddleware,
  roleMiddleware(role.OWNER),
  upload.array("images", 10),
  propertyController.uploadPropertyImage
);

router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.deletePropertyImage
);

router.patch(
  "/:propertyId/images/:imageId/cover",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.setCoverImage
);

router.patch(
  "/:propertyId/images/sort",
  authMiddleware,
  roleMiddleware(role.OWNER),
  propertyController.sortPropertyImages
);

module.exports = router;
