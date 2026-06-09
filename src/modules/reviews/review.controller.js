const reviewService = require("./review.service");

const { createReviewSchema, updateReviewSchema } = require("./review.validation");

const asyncHandler = require("../../utils/asyncHandler");

const { successResponse, errorResponse } = require("../../utils/apiResponse");

const createReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const reservationId = req.params.reservationId;

  // validation
  const { error } = createReviewSchema.validate(req.body);

  if (error) {
    return errorResponse(res, error.details[0].message, null, 400);
  }
  console.log("userId:", userId);
  console.log("reservationId:", reservationId);
  console.log("body:", req.body);

  const result = await reviewService.createReview(userId, reservationId, req.body);

  return successResponse(res, "Review created successfully", result, 201);
});

const getPropertyReviews = asyncHandler(async (req, res) => {
  const propertyId = req.params.propertyId;

  const reviews = await reviewService.getPropertyReviews(propertyId);

  return successResponse(res, "Property reviews fetched successfully", reviews);
});

const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const reviews = await reviewService.getMyReviews(userId);

  return successResponse(res, "My reviews fetched successfully", reviews);
});

const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const reviewId = req.params.id;

  const { error } = updateReviewSchema.validate(req.body);

  if (error) {
    return errorResponse(res, error.details[0].message, null, 400);
  }

  const review = await reviewService.updateReview(userId, reviewId, req.body);

  return successResponse(res, "Review updated successfully", review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  await reviewService.deleteReview(reviewId, req.user);

  return successResponse(res, "Review deleted successfully");
});

const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getAllReviews();

  return successResponse(res, "All reviews fetched successfully", reviews);
});

module.exports = {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
