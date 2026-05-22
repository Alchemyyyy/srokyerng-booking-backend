const fs = require("fs");
const path = require("path");

const room = require("./room.model");
const property = require("../properties/property.model");

const getPropertyRooms = async (propertyId) => {
  const propertyRow = await room.getApprovedPropertyById(propertyId);

  if (!propertyRow) {
    return {
      status: 404,
      result: false,
      message: "Property not found",
    };
  }

  const rooms = await room.getRoomsByPropertyId(propertyId);

  return {
    status: 200,
    result: true,
    message: "Rooms fetched successfully",
    data: rooms,
  };
};

const getRoomDetail = async (roomId) => {
  const roomRow = await room.getRoomById(roomId);

  if (!roomRow) {
    return {
      status: 404,
      result: false,
      message: "Room not found",
    };
  }

  return {
    status: 200,
    result: true,
    message: "Room detail fetched successfully",
    data: roomRow,
  };
};

const createRoom = async (propertyId, ownerId, body) => {
  const propertyRow = await property.findPropertyById(propertyId);

  if (!propertyRow) {
    return {
      status: 404,
      result: false,
      message: "Property not found",
    };
  }

  if (propertyRow.owner_id !== ownerId) {
    return {
      status: 403,
      result: false,
      message: "Forbidden",
    };
  }

  const data = [
    propertyId,
    body.room_type_id,
    body.room_name,
    body.description,
    body.price_per_night,
    body.max_guests,
    body.total_rooms,
  ];

  const result = await room.createRoom(data);
  const row = await room.getRoomById(result.insertId);

  return {
    status: 201,
    result: true,
    message: "Room created successfully",
    data: {
      id: row.id,
      property_id: row.property_id,
      room_type_id: row.room_type_id,
      room_name: row.room_name,
      price_per_night: row.price_per_night,
      max_guests: row.max_guests,
      total_rooms: row.total_rooms,
    },
  };
};

const updateRoom = async (roomId, ownerId, body) => {
  const roomRow = await room.getRoomById(roomId);

  if (!roomRow) {
    return {
      status: 404,
      result: false,
      message: "Room not found",
    };
  }

  const propertyRow = await property.findPropertyById(roomRow.property_id);

  if (!propertyRow) {
    return {
      status: 404,
      result: false,
      message: "Property not found",
    };
  }

  // owner check
  if (propertyRow.owner_id !== ownerId) {
    return {
      status: 403,
      result: false,
      message: "Forbidden",
    };
  }

  await room.updateRoom(roomId, body);
  let row = await room.getRoomById(roomId);

  return {
    status: 200,
    result: true,
    message: "Room updated successfully",
    data: row,
  };
};

const deleteRoom = async (roomId, ownerId) => {
  // 1. check room
  const row = await room.getRoomById(roomId);

  if (!row) {
    return {
      status: 404,
      result: false,
      message: "Room not found",
    };
  }

  // 2. check ownership via property
  const propertyRow = await property.findPropertyById(row.property_id);

  if (!propertyRow || propertyRow.owner_id !== ownerId) {
    return {
      status: 403,
      result: false,
      message: "You do not own this room",
    };
  }

  // 3. soft delete
  await room.deleteRoom(roomId);

  return {
    status: 200,
    result: true,
    message: "Room deleted successfully",
    data: null,
  };
};

const getMyRooms = async (propertyId, ownerId) => {
  const propertyRow = await property.findPropertyById(propertyId);

  if (!propertyRow) {
    return {
      status: 404,
      result: false,
      message: "Property not found",
    };
  }

  if (propertyRow.owner_id !== ownerId) {
    return {
      status: 403,
      result: false,
      message: "Forbidden",
    };
  }

  const rooms = await room.getRoomsByPropertyId(propertyId);

  return {
    status: 200,
    result: true,
    message: "My rooms fetched successfully",
    data: rooms,
  };
};

const uploadRoomImages = async (roomId, ownerId, files) => {
  // check files
  if (!files || files.length === 0) {
    return {
      status: 400,
      result: false,
      message: "No images uploaded",
    };
  }

  // check room
  const roomRow = await room.getRoomById(roomId);

  if (!roomRow) {
    return {
      status: 404,
      result: false,
      message: "Room not found",
    };
  }

  // check property ownership
  const propertyRow = await property.findPropertyById(roomRow.property_id);

  if (!propertyRow || Number(propertyRow.owner_id) !== Number(ownerId)) {
    return {
      status: 403,
      result: false,
      message: "You do not own this room",
    };
  }

  // prepare images
  const images = files.map((file, index) => ({
    room_id: roomId,
    image_url: `/uploads/rooms/${file.filename}`,
    sort_order: index + 1,
  }));

  // save images
  await room.createManyRoomImages(images);

  return {
    status: 201,
    result: true,
    message: "Room images uploaded successfully",
    data: images,
  };
};

const deleteRoomImage = async (roomId, imageId, ownerId) => {
  // check room
  const roomRow = await room.getRoomById(roomId);

  if (!roomRow) {
    return {
      status: 404,
      result: false,
      message: "Room not found",
    };
  }

  // check ownership
  const propertyRow = await property.findPropertyById(roomRow.property_id);

  if (!propertyRow || Number(propertyRow.owner_id) !== Number(ownerId)) {
    return {
      status: 403,
      result: false,
      message: "You do not own this room",
    };
  }

  // check image
  const imageRow = await room.findRoomImageById(imageId);

  if (!imageRow) {
    return {
      status: 404,
      result: false,
      message: "Image not found",
    };
  }

  // validate image belongs to room
  if (Number(imageRow.room_id) !== Number(roomId)) {
    return {
      status: 400,
      result: false,
      message: "Image does not belong to this room",
    };
  }

  // delete file
  const filePath = path.join(__dirname, "../../..", imageRow.image_url);

  console.log(__dirname);
  console.log(imageRow.image_url);
  console.log(filePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // delete db record
  await room.deleteRoomImage(imageId);

  return {
    status: 200,
    result: true,
    message: "Room image deleted successfully",
    data: null,
  };
};

const getRoomTypes = async () => {
  const types = await room.getRoomTypes();

  return {
    status: 200,
    result: true,
    message: "Room types fetched successfully",
    data: types,
  };
};

module.exports = {
  getPropertyRooms,
  getRoomDetail,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  getMyRooms,
  getRoomTypes,
};
