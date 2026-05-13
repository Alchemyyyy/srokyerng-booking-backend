const db = require("../../config/db");

const getRoomById = async (roomId) => {

    const [rooms] = await db.query(
        `
        SELECT *
        FROM rooms
        WHERE id = ?
        `,
        [roomId]
    );

    return rooms[0];
};

const insertReview = async (
    reservationId,
    propertyId,
    userId,
    rating,
    comment
) => {

    const [result] = await db.query(
        `
        INSERT INTO reviews (
            reservation_id,
            property_id,
            customer_id,
            rating,
            comment
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            reservationId,
            propertyId,
            userId,
            rating,
            comment
        ]
    );

    return result.insertId;
};

const getReviewById = async (reviewId) => {

    const [reviews] = await db.query(
        `
        SELECT *
        FROM reviews
        WHERE id = ?
        `,
        [reviewId]
    );

    return reviews[0];
};

const getPropertyReviews = async (propertyId) => {

    const [reviews] = await db.query(
        `
        SELECT
            reviews.id,
            reviews.rating,
            reviews.comment,
            reviews.created_at,
            users.full_name
        FROM reviews
        JOIN users
            ON reviews.customer_id = users.id
        WHERE reviews.property_id = ?
        ORDER BY reviews.created_at DESC
        `,
        [propertyId]
    );

    return reviews;
};
const getMyReviews = async (userId) => {

    const [reviews] = await db.query(
        `
        SELECT *
        FROM reviews
        WHERE customer_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return reviews;
};
const updateReview = async (
    reviewId,
    body
) => {

    const fields = [];
    const values = [];

    if (body.rating !== undefined) {
        fields.push("rating = ?");
        values.push(body.rating);
    }

    if (body.comment !== undefined) {
        fields.push("comment = ?");
        values.push(body.comment);
    }

    values.push(reviewId);

    await db.query(
        `
        UPDATE reviews
        SET ${fields.join(", ")}
        WHERE id = ?
        `,
        values
    );

};
const deleteReview = async (reviewId) => {

    await db.query(
        `
        DELETE FROM reviews
        WHERE id = ?
        `,
        [reviewId]
    );

};
const getAllReviews = async () => {

    const [reviews] = await db.query(
        `
        SELECT
            reviews.*,
            users.full_name
        FROM reviews
        JOIN users
            ON reviews.customer_id = users.id
        ORDER BY reviews.created_at DESC
        `
    );

    return reviews;

};

module.exports = {
    getRoomById,
    insertReview,
    getReviewById,
    getPropertyReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getAllReviews
};