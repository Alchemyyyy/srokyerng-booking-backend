const asyncHandler = require("../../utils/asyncHandler");

const { successResponse, errorResponse } = require("../../utils/apiResponse");

const property = require("./property.service");

const getAll = asyncHandler(async (req, res) => {
  let result = await property.getAllApproved(req.query);
  if (!result) {
    return errorResponse(res, "Internal server error", 500);
  }
  return successResponse(res, "Get All properties successfully", result, 200);
});

const register = asyncHandler(async (req, res) => {
  let result = await property.register(req.user.id, req.body);
  if (!result.result) {
    return errorResponse(res, result.message, result.status, result.error);
  }
  return successResponse(res, result.message, result.data, result.status);
});

const getDetail = asyncHandler(async (req, res) => {
  let result = await property.getDetail(req.params.id);
  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }
  return successResponse(res, result.message, result.data, result.status);
});

const getMyProperty = asyncHandler(async (req, res) => {
  let result = await property.getMyProperty(req.user.id);
  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }
  return successResponse(res, result.message, result.data, result.status);
});

const getMyPropertyById = asyncHandler(async (req, res) => {
  let result = await property.getMyPropertyById(req.params.id, req.user.id);
  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }
  return successResponse(res, result.message, result.data, result.status);
});

const update = asyncHandler(async (req, res) => {
  let result = await property.update(req.params.id, req.user.id, req.body);
  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }
  return successResponse(res, result.message, result.data, result.status);
});

module.exports = {
  getAll,
  getDetail,
  register,
  getMyProperty,
  getMyPropertyById,
  update,
};
