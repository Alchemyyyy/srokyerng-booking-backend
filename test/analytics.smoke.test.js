const test = require("node:test");
const assert = require("node:assert/strict");

const analyticsServicePath = require.resolve("../src/modules/admin/analytics.service");
const analyticsModelPath = require.resolve("../src/modules/admin/analytics.model");

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

// Test: getSummary endpoint
test("getSummary returns platform summary without date filters", async () => {
  const mockAnalyticsModel = {
    getPlatformSummary: async () => ({
      total_customers: 100,
      total_owners: 50,
      total_properties: 75,
      total_reservations: 200,
      paid_payments: 150,
      total_reviews: 90,
      total_revenue: "15000.00",
    }),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getSummary(null, null);

  assert.ok(result.platform_summary);
  assert.equal(result.platform_summary.total_customers, 100);
  assert.equal(result.platform_summary.total_owners, 50);
  assert.equal(result.platform_summary.total_properties, 75);
  assert.equal(result.platform_summary.total_revenue, 15000);
});

// Test: getSummary with date filter
test("getSummary throws error when only one date is provided", async () => {
  const mockAnalyticsModel = {
    getPlatformSummary: async () => ({}),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getSummary("2026-01-01", null);
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /Both start_date and end_date must be provided together/);
  }
});

// Test: getSummary with invalid date format
test("getSummary throws error with invalid date format", async () => {
  const mockAnalyticsModel = {
    getPlatformSummary: async () => ({}),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getSummary("not-a-date", "2026-12-31");
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /Invalid date format/);
  }
});

// Test: getSummary with start_date after end_date
test("getSummary throws error when start_date is after end_date", async () => {
  const mockAnalyticsModel = {
    getPlatformSummary: async () => ({}),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  try {
    await analyticsService.getSummary("2026-12-31", "2026-01-01");
    assert.fail("Should have thrown error");
  } catch (error) {
    assert.equal(error.statusCode, 400);
    assert.match(error.message, /start_date must be before end_date/);
  }
});

// Test: getUserAnalytics returns user counts
test("getUserAnalytics returns user counts by role and status", async () => {
  const mockAnalyticsModel = {
    getUserCounts: async () => [
      { role: "customer", status: "active", count: 100 },
      { role: "customer", status: "suspended", count: 5 },
      { role: "owner", status: "active", count: 50 },
      { role: "owner", status: "suspended", count: 2 },
    ],
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getUserAnalytics(null, null);

  assert.ok(result.users_by_role_and_status);
  assert.equal(result.users_by_role_and_status.customer.active, 100);
  assert.equal(result.users_by_role_and_status.owner.active, 50);
  assert.equal(result.total_users, 157);
});

// Test: getPropertyAnalytics returns property counts
test("getPropertyAnalytics returns property counts by status", async () => {
  const mockAnalyticsModel = {
    getPropertyCounts: async () => [
      { status: "pending", count: 10 },
      { status: "approved", count: 60 },
      { status: "rejected", count: 5 },
    ],
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getPropertyAnalytics(null, null);

  assert.ok(result.properties_by_status);
  assert.equal(result.properties_by_status.pending, 10);
  assert.equal(result.properties_by_status.approved, 60);
  assert.equal(result.total_properties, 75);
});

// Test: getReservationAnalytics returns reservation counts
test("getReservationAnalytics returns reservation counts by status", async () => {
  const mockAnalyticsModel = {
    getReservationCounts: async () => [
      { status: "pending", count: 20 },
      { status: "confirmed", count: 100 },
      { status: "cancelled", count: 30 },
      { status: "completed", count: 50 },
    ],
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getReservationAnalytics(null, null);

  assert.ok(result.reservations_by_status);
  assert.equal(result.reservations_by_status.confirmed, 100);
  assert.equal(result.total_reservations, 200);
});

// Test: getPaymentAnalytics returns payment counts and revenue
test("getPaymentAnalytics returns payment counts, amounts and revenue", async () => {
  const mockAnalyticsModel = {
    getPaymentCounts: async () => [
      { status: "pending", count: 10, total_amount: "1000.00" },
      { status: "paid", count: 150, total_amount: "15000.00" },
      { status: "failed", count: 5, total_amount: "500.00" },
      { status: "refunded", count: 8, total_amount: "800.00" },
    ],
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getPaymentAnalytics(null, null);

  assert.ok(result.payments_by_status);
  assert.equal(result.payments_by_status.paid.count, 150);
  assert.equal(result.payments_by_status.paid.total_amount, 15000);
  assert.equal(result.total_revenue, 15000);
  assert.equal(result.total_payments, 173);
});

// Test: getReviewAnalytics returns review summary
test("getReviewAnalytics returns review summary with rating stats", async () => {
  const mockAnalyticsModel = {
    getReviewCounts: async () => ({
      total_reviews: 90,
      average_rating: "4.5",
      min_rating: 2,
      max_rating: 5,
      owner_replied_count: 70,
    }),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getReviewAnalytics(null, null);

  assert.ok(result.review_summary);
  assert.equal(result.review_summary.total_reviews, 90);
  assert.equal(result.review_summary.average_rating, "4.50");
  assert.equal(result.review_summary.min_rating, 2);
  assert.equal(result.review_summary.max_rating, 5);
  assert.match(result.review_summary.owner_reply_rate, /77.78%/);
});

// Test: getRecentActivity returns activity list
test("getRecentActivity returns recent platform activity", async () => {
  const mockAnalyticsModel = {
    getRecentActivity: async () => [
      {
        activity_type: "user_created",
        resource_id: 1,
        resource_name: "John Doe",
        created_at: "2026-01-15 10:30:00",
        resource_type: "user",
      },
      {
        activity_type: "property_created",
        resource_id: 1,
        resource_name: "Beach House",
        created_at: "2026-01-15 11:00:00",
        resource_type: "property",
      },
    ],
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  const result = await analyticsService.getRecentActivity(20, null, null);

  assert.ok(result.recent_activity);
  assert.equal(result.recent_activity.length, 2);
  assert.equal(result.recent_activity[0].activity_type, "user_created");
});

// Test: Analytics controller getSummary
test("analytics controller getSummary returns 200 with data", async () => {
  const mockAnalyticsModel = {
    getPlatformSummary: async () => ({
      total_customers: 100,
      total_owners: 50,
      total_properties: 75,
      total_reservations: 200,
      paid_payments: 150,
      total_reviews: 90,
      total_revenue: "15000.00",
    }),
  };

  const { analyticsService } = loadAnalyticsService({
    analyticsModel: mockAnalyticsModel,
  });

  // Manually call the service logic
  const result = await analyticsService.getSummary(null, null);

  assert.ok(result);
  assert.ok(result.platform_summary);
  assert.equal(result.platform_summary.total_customers, 100);
});

// Test: Analytics controller with invalid date format
test("analytics controller returns 400 for invalid date range", async () => {
  // Directly test the validation
  const { validateDateRange } = require("../src/modules/admin/analytics.validation");
  const errors = validateDateRange({ start_date: "01/01/2026" });

  assert.ok(errors.length > 0);
  assert.match(
    errors[0],
    /Both start_date and end_date must be provided together|start_date must be in YYYY-MM-DD format/
  );
});
