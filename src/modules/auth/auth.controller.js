const authService = require("./auth.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../../utils/refreshTokenCookie");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
  normalizeRegisterBody,
  normalizeLoginBody,
  normalizeForgotPasswordBody,
  normalizeResetPasswordBody,
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
  setRefreshTokenCookie(res, data.refresh_token);

  return successResponse(res, "Login successful", {
    access_token: data.access_token,
    user: data.user,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  return successResponse(res, "Current user fetched successfully", user);
});

const logout = asyncHandler(async (req, res) => {
  const payload = {
    refresh_token: req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
  };
  const errors = validateRefreshToken(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  await authService.logout(payload);
  clearRefreshTokenCookie(res);

  return successResponse(res, "Logout successful");
});

const forgotPassword = asyncHandler(async (req, res) => {
  const payload = normalizeForgotPasswordBody(req.body);
  const errors = validateForgotPassword(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  await authService.forgotPassword(payload);

  return successResponse(res, authService.getPasswordResetSuccessMessage());
});

const resetPassword = asyncHandler(async (req, res) => {
  const payload = normalizeResetPasswordBody(req.body);
  const errors = validateResetPassword(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  await authService.resetPassword(payload);

  return successResponse(res, "Password reset successfully");
});

const refreshToken = asyncHandler(async (req, res) => {
  const payload = {
    refresh_token: req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
  };
  const errors = validateRefreshToken(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const data = await authService.refreshToken(payload);

  return successResponse(res, "Token refreshed successfully", data);
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  refreshToken,
};
