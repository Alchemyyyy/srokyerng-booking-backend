const reviewModel = require("./review.model");

const ROLES = require("../../constants/roles");

const createReview = async (
    userId,
    reservationId,
    body
) => {

    const { rating, comment } = body;

    // 1. Find reservation
    const reservation =
        await reviewModel.getReservationById(
            reservationId
        );

    if (!reservation) {
        throw new Error(
            "Reservation not found"
        );
    }

    // 2. Ownership check
    if (reservation.customer_id !== userId) {
        throw new Error("Forbidden");
    }

    // 3. Completed check
    if (
        reservation.reservation_status !==
        "completed"
    ) {
        throw new Error(
            "Reservation must be completed before review"
        );
    }

    // 4. Duplicate review check
    const existingReview =
        await reviewModel.getReviewByReservationId(
            reservationId
        );

    if (existingReview) {
        throw new Error(
            "Review already exists for this reservation"
        );
    }

    // 5. Find room
    const room =
        await reviewModel.getRoomById(
            reservation.room_id
        );

    // 6. Insert review
    const insertId =
        await reviewModel.insertReview(
            reservation.id,
            room.property_id,
            userId,
            rating,
            comment
        );

    // 7. Return inserted review
    return await reviewModel.getReviewById(
        insertId
    );

};

const getPropertyReviews = async (
    propertyId
) => {

    return await reviewModel.getPropertyReviews(
        propertyId
    );

};

const getMyReviews = async (
    userId
) => {

    return await reviewModel.getMyReviews(
        userId
    );

};

const updateReview = async (
    userId,
    reviewId,
    body
) => {

    const review =
        await reviewModel.getReviewById(
            reviewId
        );

    if (!review) {
        throw new Error(
            "Review not found"
        );
    }

    // ownership check
    if (review.customer_id !== userId) {
        throw new Error("Forbidden");
    }

    await reviewModel.updateReview(
        reviewId,
        body
    );

    return await reviewModel.getReviewById(
        reviewId
    );

};

const deleteReview = async (
    reviewId,
    user
) => {

    const review =
        await reviewModel.getReviewById(
            reviewId
        );

    if (!review) {
        throw new Error(
            "Review not found"
        );
    }

    const isOwner =
        review.customer_id === user.id;

    const isAdmin =
        user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new Error("Forbidden");
    }

    await reviewModel.deleteReview(
        reviewId
    );

};

const getAllReviews = async () => {

    return await reviewModel.getAllReviews();

};

module.exports = {
    createReview,
    getPropertyReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getAllReviews
};