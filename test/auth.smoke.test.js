const test = require("node:test");
const assert = require("node:assert/strict");

const authController = require("../src/modules/auth/auth.controller");
const authMiddleware = require("../src/middleware/auth.middleware");
const roleMiddleware = require("../src/middleware/role.middleware");

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

test("register returns 400 for invalid payload", async () => {
  const req = { body: {} };
  const res = createRes();
  const next = () => {};

  await authController.register(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Validation failed");
});

test("login returns 400 for invalid payload", async () => {
  const req = { body: {} };
  const res = createRes();
  const next = () => {};

  await authController.login(req, res, next);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Validation failed");
});

test("auth middleware returns 401 without bearer token", () => {
  const req = { headers: {} };
  const res = createRes();
  const next = () => {};

  authMiddleware(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Unauthorized access");
});

test("role middleware returns 403 when role is not allowed", () => {
  const req = { user: { id: 1, role: "owner" } };
  const res = createRes();
  const next = () => {};

  roleMiddleware("customer")(req, res, next);

  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.message, "Forbidden access");
});

test("role middleware allows customer role for customer endpoints", () => {
  const req = { user: { id: 2, role: "customer" } };
  const res = createRes();
  let called = false;

  const next = () => {
    called = true;
  };

  roleMiddleware("customer")(req, res, next);

  assert.equal(called, true);
});
