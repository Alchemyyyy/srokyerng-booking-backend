const reviewService = require("./review.service");

const createReview = async (req, res) => {
    try {

        //const userId = req.user.id;
        const userId = 1; // to test without auth, replace with above line when auth is implemented

        const reservationId = req.params.reservationId;

        const result = await reviewService.createReview(
            userId,
            reservationId,
            req.body
        );

        res.status(201).json({
            message: "Review created successfully",
            data: result
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};

module.exports = {
    createReview
};