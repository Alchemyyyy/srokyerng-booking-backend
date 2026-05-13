const userService = require("./user.service");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const {
  normalizeProfileBody,
  normalizePasswordBody,
  validateProfile,
  validatePassword,
} = require("./user.validation");

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user.id);

  return successResponse(res, "Profile fetched successfully", user);
});

const updateMe = asyncHandler(async (req, res) => {
  const payload = normalizeProfileBody(req.body);
  const errors = validateProfile(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  const user = await userService.updateMyProfile(req.user.id, payload);

  return successResponse(res, "Profile updated successfully", user);
});

const changePassword = asyncHandler(async (req, res) => {
  const payload = normalizePasswordBody(req.body);
  const errors = validatePassword(payload);

  if (errors.length > 0) {
    return errorResponse(res, "Validation failed", 400, errors);
  }

  await userService.changeMyPassword(req.user.id, payload);

  return successResponse(res, "Password changed successfully");
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
};
