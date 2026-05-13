const db = require("../../config/db");
const reviewModel = require("./review.model");

const createReview = async (userId, reservationId, body) => {

    const { rating, comment } = body;

    // 1. Find reservation
    const [reservations] = await db.query(
        `
        SELECT *
        FROM reservations
        WHERE id = ?
        `,
        [reservationId]
    );

    if (reservations.length === 0) {
        throw new Error("Reservation not found");
    }

    const reservation = reservations[0];

    // 2. Ownership check
    if (reservation.customer_id !== userId) {
        throw new Error("Forbidden");
    }

    // 3. Completed check
    if (reservation.reservation_status !== "completed") {
        throw new Error(
            "Reservation must be completed before review"
        );
    }

    // 4. Duplicate review check
    const [existingReviews] = await db.query(
        `
        SELECT *
        FROM reviews
        WHERE reservation_id = ?
        `,
        [reservationId]
    );

    if (existingReviews.length > 0) {
        throw new Error(
            "Review already exists for this reservation"
        );
    }

    // 5. Find room
    const room = await reviewModel.getRoomById(
        reservation.room_id
    );

    // 6. Insert review
    const insertId = await reviewModel.insertReview(
        reservation.id,
        room.property_id,
        userId,
        rating,
        comment
    );

    // 7. Get inserted review
    const review = await reviewModel.getReviewById(
        insertId
    );

    return review;
};

const getPropertyReviews = async (propertyId) => {

    return await reviewModel.getPropertyReviews(
        propertyId
    );

};
const getMyReviews = async (userId) => {

    return await reviewModel.getMyReviews(userId);

};
const updateReview = async (
    userId,
    reviewId,
    body
) => {

    const review =
        await reviewModel.getReviewById(reviewId);

    if (!review) {
        throw new Error("Review not found");
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
    userId,
    role,
    reviewId
) => {

    const review =
        await reviewModel.getReviewById(reviewId);

    if (!review) {
        throw new Error("Review not found");
    }

    const isOwner =
        review.customer_id === userId;

    const isAdmin =
        role === "admin";

    if (!isOwner && !isAdmin) {
        throw new Error("Forbidden");
    }

    await reviewModel.deleteReview(reviewId);

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
    updateReview,
    getAllReviews

};