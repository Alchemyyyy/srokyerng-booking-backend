const asyncHandler = require("../../utils/asyncHandler");

const { successResponse, errorResponse } = require("../../utils/apiResponse");

const room = require("./room.service");

const getRoomDetail = asyncHandler(async (req, res) => {
  let result = await room.getRoomDetail(req.params.id);

  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }

  return successResponse(res, result.message, result.data, result.status);
});

const updateRoom = asyncHandler(async (req, res) => {
  let result = await room.updateRoom(req.params.id, req.user.id, req.body);

  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }

  return successResponse(res, result.message, result.data, result.status);
});

const deleteRoom = asyncHandler(async (req, res) => {
  let result = await room.deleteRoom(req.params.id, req.user.id);

  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }

  return successResponse(res, result.message, result.data, result.status);
});

const uploadRoomImages = asyncHandler(async (req, res) => {
  let result = await room.uploadRoomImages(req.params.id, req.user.id, req.files);

  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }

  return successResponse(res, result.message, result.data, result.status);
});

const deleteRoomImage = asyncHandler(async (req, res) => {
  let result = await room.deleteRoomImage(req.params.id, req.params.imageId, req.user.id);

  if (!result.result) {
    return errorResponse(res, result.message, result.status, null);
  }

  return successResponse(res, result.message, result.data, result.status);
});

const getRoomTypes = asyncHandler(async (req, res) => {
  let result = await room.getRoomTypes();

  return successResponse(res, result.message, result.data, result.status);
});

module.exports = {
  getRoomDetail,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  getRoomTypes,
};
