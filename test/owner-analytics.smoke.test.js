const test = require("node:test");
const assert = require("node:assert/strict");

const analyticsServicePath = require.resolve("../src/modules/owner/analytics.service");
const analyticsModelPath = require.resolve("../src/modules/owner/analytics.model");

const loadAnalyticsService = ({ analyticsModel }) => {
  const originalCache = {
    analyticsService: require.cache[analyticsServicePath],
    analyticsModel: require.cache[analyticsModelPath],
  };

  delete require.cache[analyticsServicePath];
  require.cache[analyticsModelPath] = {
    id: analyticsModelPath,
    filename: analyticsModelPath,
    loaded: true,
    exports: analyticsModel,
  };

  const analyticsService = require(analyticsServicePath);

  const restore = () => {
    delete require.cache[analyticsServicePath];
    delete require.cache[analyticsModelPath];

    const pathByKey = {
      analyticsService: analyticsServicePath,
      analyticsModel: analyticsModelPath,
    };

    Object.entries(originalCache).forEach(([key, value]) => {
      if (value) {
        require.cache[pathByKey[key]] = value;
      }
    });
  };

  return { analyticsService, restore };
};

// Test: getDashboardSummary
test("getDashboardSummary returns owner dashboard summary without date filters", async () => {
  const mockAnalyticsModel = {
    getDashboardSummary: async () => ({
      total_reservations: 50,
      confirmed_reservations: 30,
      completed_reservations: 20,
      upcoming_reservations: 10,
    }),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getDashboardSummary(1, null, null);

  assert.ok(result.dashboard_summary);
  assert.equal(result.dashboard_summary.total_reservations, 50);
  assert.equal(result.dashboard_summary.confirmed_reservations, 30);
  assert.equal(result.dashboard_summary.completed_reservations, 20);
  assert.equal(result.dashboard_summary.upcoming_reservations, 10);
});

// Test: getDashboardSummary with date filter
test("getDashboardSummary throws error when only one date is provided", async () => {
  const mockAnalyticsModel = {
    getDashboardSummary: async () => ({}),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getDashboardSummary(1, "2026-01-01", null);
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 400);
  }
});

// Test: getReservationAnalytics
test("getReservationAnalytics returns reservation counts by status", async () => {
  const mockAnalyticsModel = {
    getReservationStats: async () => [
      { status: "pending", count: 5, avg_nights: "3.00", total_amount: "500.00" },
      { status: "confirmed", count: 20, avg_nights: "2.50", total_amount: "2000.00" },
      { status: "completed", count: 25, avg_nights: "2.00", total_amount: "2500.00" },
    ],
    verifyPropertyOwnership: async () => true,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getReservationAnalytics(1, null, null);

  assert.ok(result.reservations_by_status);
  assert.equal(result.reservations_by_status.confirmed.count, 20);
  assert.equal(result.total_reservations, 50);
});

// Test: getReservationAnalytics with property_id
test("getReservationAnalytics validates property ownership", async () => {
  const mockAnalyticsModel = {
    getReservationStats: async () => [],
    verifyPropertyOwnership: async () => false,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getReservationAnalytics(1, null, null, 999);
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 403);
    assert.match(error.message, /does not belong to this owner/);
  }
});

// Test: getRevenueAnalytics
test("getRevenueAnalytics returns revenue by status with net revenue calculation", async () => {
  const mockAnalyticsModel = {
    getRevenueStats: async () => [
      { status: "pending", count: 5, total_amount: "500.00" },
      { status: "paid", count: 30, total_amount: "3000.00" },
      { status: "failed", count: 2, total_amount: "200.00" },
      { status: "refunded", count: 3, total_amount: "300.00" },
    ],
    verifyPropertyOwnership: async () => true,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getRevenueAnalytics(1, null, null);

  assert.ok(result.revenue_by_status);
  assert.equal(result.paid_revenue, 3000);
  assert.equal(result.refunded_revenue, 300);
  assert.equal(result.net_revenue, 2700);
});

// Test: getTopProperties
test("getTopProperties returns top performing properties", async () => {
  const mockAnalyticsModel = {
    getTopProperties: async () => [
      {
        id: 1,
        property_name: "Beach Resort",
        reservation_count: 50,
        total_revenue: "5000.00",
        avg_rating: "4.8",
        unique_customers: 40,
      },
      {
        id: 2,
        property_name: "Mountain Villa",
        reservation_count: 30,
        total_revenue: "3000.00",
        avg_rating: "4.5",
        unique_customers: 25,
      },
    ],
    verifyPropertyOwnership: async () => true,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getTopProperties(1, 10, null, null);

  assert.ok(result.top_properties);
  assert.equal(result.top_properties.length, 2);
  assert.equal(result.top_properties[0].property_name, "Beach Resort");
  assert.equal(result.top_properties[0].total_revenue, 5000);
});

// Test: getTopRooms
test("getTopRooms returns top performing rooms", async () => {
  const mockAnalyticsModel = {
    getTopRooms: async () => [
      {
        id: 1,
        room_name: "Deluxe Suite",
        property_name: "Beach Resort",
        price_per_night: "100.00",
        reservation_count: 30,
        total_revenue: "3000.00",
        avg_rating: "4.9",
      },
      {
        id: 2,
        room_name: "Standard Room",
        property_name: "Beach Resort",
        price_per_night: "50.00",
        reservation_count: 20,
        total_revenue: "1000.00",
        avg_rating: "4.3",
      },
    ],
    verifyPropertyOwnership: async () => true,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getTopRooms(1, 10, null, null);

  assert.ok(result.top_rooms);
  assert.equal(result.top_rooms.length, 2);
  assert.equal(result.top_rooms[0].room_name, "Deluxe Suite");
  assert.equal(result.top_rooms[0].price_per_night, 100);
});

// Test: Invalid date format
test("analyticsService throws error with invalid date format", async () => {
  const mockAnalyticsModel = {
    getDashboardSummary: async () => ({}),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getDashboardSummary(1, "not-a-date", "2026-12-31");
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /Invalid date format/);
  }
});

// Test: start_date after end_date
test("analyticsService throws error when start_date is after end_date", async () => {
  const mockAnalyticsModel = {
    getDashboardSummary: async () => ({}),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getDashboardSummary(1, "2026-12-31", "2026-01-01");
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /start_date must be before end_date/);
  }
});

// Test: Validation helper
test("analytics validation returns 400 for invalid date range", async () => {
  const { validateDateRange } = require("../src/modules/owner/analytics.validation");
  const errors = validateDateRange({ start_date: "2026-01-01" });

  assert.ok(errors.length > 0);
  assert.match(errors[0], /Both start_date and end_date must be provided together/);
});

// Test: Date validation with valid range
test("analytics validation accepts valid date range", async () => {
  const { validateDateRange } = require("../src/modules/owner/analytics.validation");
  const errors = validateDateRange({ start_date: "2026-01-01", end_date: "2026-12-31" });

  assert.equal(errors.length, 0);
});

// Test: Revenue calculation with multiple payment statuses
test("getRevenueAnalytics calculates paid, refunded, and cancelled separately", async () => {
  const mockAnalyticsModel = {
    getRevenueStats: async () => [
      { status: "paid", count: 25, total_amount: "2500.00" },
      { status: "refunded", count: 3, total_amount: "300.00" },
      { status: "cancelled", count: 2, total_amount: "200.00" },
    ],
    verifyPropertyOwnership: async () => true,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getRevenueAnalytics(1, null, null);

  assert.equal(result.paid_revenue, 2500);
  assert.equal(result.refunded_revenue, 300);
  assert.equal(result.cancelled_revenue, 200);
  assert.equal(result.net_revenue, 2200); // 2500 - 300
});

// Test: Limit parameter enforcement
test("getTopProperties enforces limit maximum of 50", async () => {
  const mockAnalyticsModel = {
    getTopProperties: async (ownerId, limit) => {
      // Verify the limit passed is capped at 50
      assert.ok(limit <= 50);
      return [];
    },
    verifyPropertyOwnership: async () => true,
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  await analyticsService.getTopProperties(1, 100, null, null);
});
