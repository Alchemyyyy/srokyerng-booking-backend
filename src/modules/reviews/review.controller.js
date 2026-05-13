const reviewService = require("./review.service");
const { createReviewSchema, updateReviewSchema } = require("./review.validation");

const createReview = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = 1;

    const reservationId = req.params.reservationId;

    // validation
    const { error } = createReviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const result = await reviewService.createReview(userId, reservationId, req.body);

    res.status(201).json({
      message: "Review created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
const getPropertyReviews = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const reviews = await reviewService.getPropertyReviews(propertyId);

    res.status(200).json({
      message: "Property reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
const getMyReviews = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = 1;

    const reviews = await reviewService.getMyReviews(userId);

    res.status(200).json({
      message: "My reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = 1;

    const reviewId = req.params.id;

    const { error } = updateReviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const review = await reviewService.updateReview(userId, reviewId, req.body);

    res.status(200).json({
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
const deleteReview = async (req, res) => {

    try {

        // const userId = req.user.id;
        const userId = 1;

        // const role = req.user.role;
        const role = "customer";

        const reviewId = req.params.id;

        await reviewService.deleteReview(
            userId,
            role,
            reviewId
        );

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};
const getAllReviews = async (req, res) => {

    try {

        const reviews =
            await reviewService.getAllReviews();

        res.status(200).json({
            message: "All reviews fetched successfully",
            data: reviews
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  updateReview,
  getAllReviews
};
