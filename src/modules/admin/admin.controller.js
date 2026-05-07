const asyncHandler = require("../../utils/asyncHandler");
const { successResponse, errorResponse } = require("../../utils/apiResponse");

const adminService = require("./admin.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await adminService.getAll();
  if (!result) {
    return errorResponse(res, "Internal server error", 500);
  }
  return successResponse(res, "Get all properties successfully", result, 200);
});
module.exports = {
  getAll,
};
