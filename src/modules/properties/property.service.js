const property = require("./property.model");

const propertyValidate = require("./property.validation");

const getAllApproved = async (query) => {
  const filters = {
    city: query.city || null,
    province: query.province || null,
    category_id: query.category_id || null,
    search: query.search || null,
    page: query.page || 1,
    limit: query.limit || 10,
  };
  let rows = await property.getAllApproved(filters);
  return rows;
};

const getAll = async () => {
  const rows = await property.getAll();
  return rows;
};

const register = async (user_id, body) => {
  let checkReq = propertyValidate.validateCreateProperty(body);

  if (!checkReq.isValid) {
    return {
      result: false,
      message: "Invalid any fields",
      error: checkReq.errors,
      status: 500,
    };
  }
  let row = await property.create(user_id, body);
  row = await property.getById(row.insertId);
  return {
    result: true,
    message: "Request successfully",
    status: 200,
    data: row,
  };
};

const getDetail = async (id) => {
  if (isNaN(id)) {
    throw new Error("Id must be number");
  }
  let row = await property.getDetail(id);
  if (propertyValidate.isValidRow) {
    let property_data = row[0];
    const images = await property.getImages(property_data.id);
    const amenities = await property.getAmenities(property_data.id);
    const rooms = await property.getRooms(property_data.id);
    property_data.images = images;
    property_data.amenities = amenities;
    property_data.rooms = rooms;
    return {
      result: true,
      message: "Get owner detail successfully",
      status: 200,
      data: property_data,
    };
  } else if (!propertyValidate.isValidRow) {
    return {
      result: false,
      message: "Owner detail not found",
      status: 404,
    };
  }
};

const getMyProperty = async (owner_id) => {
  let row = await property.getMyProperty(owner_id);
  if (row.length === 0) {
    throw new Error("Cannot fetch my properties");
  } else if (row.length > 0) {
    return {
      result: true,
      message: "My properties fetched successfully",
      status: 200,
      data: row,
    };
  }
};

const updateStatus = async (admin_id, property_id, body) => {
  // =====================================
  // VALID STATUS
  // =====================================
  const validStatus = [1, 2, 3, 4];

  if (!validStatus.includes(Number(body.status_id))) {
    return {
      result: false,
      message: "Invalid status id",
      status: 400,
    };
  }

  // =====================================
  // REJECT VALIDATION
  // =====================================
  if (
    Number(body.status_id) === 3 &&
    (!body.rejection_reason || body.rejection_reason.trim() === "")
  ) {
    return {
      result: false,
      message: "Please enter rejection reason",
      status: 400,
    };
  }

  // =====================================
  // APPROVED
  // =====================================
  if (Number(body.status_id) === 2) {
    body.rejection_reason = null;
    body.approved_at = new Date();

    await property.updateStatus(admin_id, property_id, body);
  }

  // =====================================
  // REJECTED
  // =====================================
  else if (Number(body.status_id) === 3) {
    body.approved_at = new Date();

    await property.updateStatus(admin_id, property_id, body);
  }

  // =====================================
  // PENDING / SUSPENDED
  // =====================================
  else if (Number(body.status_id) === 1 || Number(body.status_id) === 4) {
    body.rejection_reason = null;
    body.approved_at = null;

    await property.updateStatus(null, property_id, body);
  }

  // =====================================
  // GET UPDATED DATA
  // =====================================
  let row = await property.getUpdatePropertyById(property_id);

  return {
    result: true,
    message: "Updated status successfully",
    status: 200,
    data: row[0],
  };
};

const getMyPropertyById = async (property_id, owner_id) => {
  let row = await property.getMyOwnPropertyById(property_id, owner_id);
  if (row.length > 0) {
    return {
      result: true,
      message: "get my property successfully",
      status: 200,
      data: row[0],
    };
  } else if (row.length === 0) {
    return {
      result: false,
      message: "My property not found",
      status: 404,
    };
  }
};

const update = async (property_id, owner_id, body) => {
  let checkReq = propertyValidate.validateUpdateProperty(body);
  if (!checkReq.isValid) {
    return {
      result: false,
      message: "Invalid any fields",
      error: checkReq.errors,
      status: 500,
    };
  }
  let checkRow = await property.checkOwnerProperty(property_id, owner_id);
  if (checkRow.length === 0) {
    return {
      result: false,
      message: "Property not found",
      status: 404,
    };
  }
  if (checkRow[0].status_id == 1) {
    await property.update(property_id, owner_id, body);
    let row = await property.getById(property_id);
    return {
      result: true,
      message: "Updated Successfully",
      status: 200,
      data: row[0],
    };
  } else if (checkRow[0].status_id != 1) {
    return {
      result: false,
      message: "Cannot update because status is not in pending",
      status: 403,
    };
  }
};

module.exports = {
  getAllApproved,
  getAll,
  getDetail,
  register,
  getMyProperty,
  updateStatus,
  getMyPropertyById,
  update,
};
