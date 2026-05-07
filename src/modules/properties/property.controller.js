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
module.exports = {
  getAll,
};
