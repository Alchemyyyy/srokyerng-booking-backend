const authService = require("./auth.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  validateRegister,
  validateLogin,
  normalizeRegisterBody,
  normalizeLoginBody,
} = require("./auth.validation");

const register = asyncHandler(async (req, res) => {
  const payload = normalizeRegisterBody(req.body);
  const errors = validateRegister(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const user = await authService.register(payload);

  return successResponse(res, "Account registered successfully", user, 201);
});

const login = asyncHandler(async (req, res) => {
  const payload = normalizeLoginBody(req.body);
  const errors = validateLogin(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const data = await authService.login(payload);

  return successResponse(res, "Login successful", data);
});

const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, "Current user fetched successfully", req.user);
});

const adminOnly = asyncHandler(async (req, res) => {
  return successResponse(res, "Admin access granted", {
    id: req.user.id,
    role: req.user.role,
  });
});

const customerOnly = asyncHandler(async (req, res) => {
  return successResponse(res, "Customer access granted", {
    id: req.user.id,
    role: req.user.role,
  });
});

module.exports = {
  register,
  login,
  getMe,
  adminOnly,
  customerOnly,
};
