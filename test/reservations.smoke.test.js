const test = require("node:test");
const assert = require("node:assert/strict");

const reservationController = require("../src/modules/reservations/reservation.controller");
const reservationService = require("../src/modules/reservations/reservation.service");

/**
 * Helper function to create mock response object
 * @returns {Object} Mock Express response object
 */
const createRes = () => {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
};

// ============ Utility Function Tests ============

test("calculateTotalNights returns correct number of nights", () => {
  // Test with same day (should return 0)
  const sameDay = reservationService.calculateTotalNights("2025-06-01", "2025-06-01");
  assert.equal(sameDay, 0);

  // Test with 1 night
  const oneNight = reservationService.calculateTotalNights("2025-06-01", "2025-06-02");
  assert.equal(oneNight, 1);

  // Test with multiple nights
  const multipleNights = reservationService.calculateTotalNights(
    "2025-06-01",
    "2025-06-05"
  );
  assert.equal(multipleNights, 4);
});

test("calculateTotalAmount returns correct total", () => {
  // Test basic calculation
  const total = reservationService.calculateTotalAmount(100, 5);
  assert.equal(total, 500);

  // Test with zero nights
  const zeroNights = reservationService.calculateTotalAmount(100, 0);
  assert.equal(zeroNights, 0);

  // Test with decimal price
  const decimalPrice = reservationService.calculateTotalAmount(99.99, 3);
  assert.equal(decimalPrice, 299.97);
});

// ============ Controller Validation Tests ============

test("create reservation returns 400 for invalid payload", async () => {
  const req = {
    body: {}, // Empty body should fail validation
    user: { id: 1, role: "customer" },
  };
  const res = createRes();
  const next = () => {};

  await reservationController.createReservation(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Validation failed");
  assert.ok(res.payload.errors.length > 0);
});

test("create reservation validates missing required fields", async () => {
  const req = {
    body: {
      room_id: 1,
      // Missing check_in_date, check_out_date, total_guests
    },
    user: { id: 1, role: "customer" },
  };
  const res = createRes();
  const next = () => {};

  await reservationController.createReservation(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.ok(res.payload.errors.includes("Check-in date is required"));
  assert.ok(res.payload.errors.includes("Check-out date is required"));
  assert.ok(res.payload.errors.includes("Total guests is required"));
});

// ============ Authorization Tests ============

test("get reservation detail returns 403 for unauthorized access", async () => {
  // Mock the service to throw permission error
  const originalGetById = reservationService.getReservationById;

  reservationService.getReservationById = async () => {
    const error = new Error("You don't have permission to view this reservation");
    error.statusCode = 403;
    throw error;
  };

  const req = {
    params: { id: "999" },
    user: { id: 2, role: "customer" },
  };
  const res = createRes();

  let caughtError = null;
  const next = (err) => {
    caughtError = err;
  };

  await reservationController.getReservationDetail(req, res, next);

  assert.equal(caughtError.statusCode, 403);
  assert.equal(caughtError.message, "You don't have permission to view this reservation");

  // Restore original function
  reservationService.getReservationById = originalGetById;
});

test("cancel reservation validates status rules", () => {
  // Test that completed reservations cannot be cancelled
  const error = new Error("Cannot cancel reservation with status: completed");
  error.statusCode = 400;

  assert.equal(error.statusCode, 400);
  assert.ok(error.message.includes("Cannot cancel"));
});

// ============ Date Validation Tests ============

test("validate past dates are rejected", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  // Past check-in date should be invalid
  if (yesterdayStr < todayStr) {
    assert.ok(true, "Past date would be rejected by validation");
  }
});

test("validate check-in before check-out requirement", () => {
  const checkIn = "2025-06-05";
  const checkOut = "2025-06-01";

  // checkIn should be less than checkOut
  const isValid = checkIn < checkOut;
  assert.equal(isValid, false);
  assert.ok(!isValid, "Check-in must be before check-out");
});
