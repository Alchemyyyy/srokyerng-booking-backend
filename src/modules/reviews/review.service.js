const db = require("../../config/db");

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
    if (reservation.status !== "completed") {
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

    // 5. Insert review
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
            reservation.id,
            reservation.property_id,
            userId,
            rating,
            comment
        ]
    );

    // 6. Return inserted review
    const [reviews] = await db.query(
        `
        SELECT *
        FROM reviews
        WHERE id = ?
        `,
        [result.insertId]
    );

    return reviews[0];
};

module.exports = {
    createReview
};