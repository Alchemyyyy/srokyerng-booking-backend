const express = require("express");
const router = express.Router();

const reviewController = require("./review.controller");
const amenityController = require("../amenities/amenity.controller");

router.post(
    "/reservations/:reservationId/reviews",
    reviewController.createReview
);
router.get(
    "/properties/:propertyId/reviews",
    reviewController.getPropertyReviews
);
router.get(
    "/my",
    reviewController.getMyReviews
);
router.patch(
    "/:id",
    reviewController.updateReview
);
router.delete(
    "/:id",
    reviewController.deleteReview
);
router.get(
    "/admin/reviews",
    reviewController.getAllReviews
);

module.exports = router;
