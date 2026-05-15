const express = require("express");
const router = express.Router();

const reviewController = require("./review.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const roleMiddleware = require("../../middleware/role.middleware");

const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.get(
    "/my",
    roleMiddleware(ROLES.CUSTOMER),
    reviewController.getMyReviews
);

router.patch(
    "/:id",
    roleMiddleware(ROLES.CUSTOMER),
    reviewController.updateReview
);

router.delete(
    "/:id",
    reviewController.deleteReview
);

module.exports = router;
