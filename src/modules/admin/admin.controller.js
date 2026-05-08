const asyncHandler = require("../../utils/asyncHandler");
const { successResponse, errorResponse } = require("../../utils/apiResponse");

const property = require("../properties/property.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await property.getAll();
  if (!result) {
    return errorResponse(res, "Internal server error", 500);
  }
  return successResponse(res, "Get all properties successfully", result, 200);
});

const updateStatusProperty = asyncHandler(async (req, res) => {
  let result = await property.updateStatus(req.user.id, req.params.id, req.body);
  if (!result.result) {
    return errorResponse(res, result.message, result.status);
  }
  return successResponse(res, result.message, result.data, result.status);
});
module.exports = {
  getAll,
  updateStatusProperty,
};
