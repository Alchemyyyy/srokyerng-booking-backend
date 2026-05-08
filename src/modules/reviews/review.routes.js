const express = require("express");
const router = express.Router();

const reviewController = require("./review.controller");

router.post(
    "/reservations/:reservationId/reviews",
    reviewController.createReview
);

module.exports = router;
