const property = require("./property.model");

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

module.exports = {
  getAllApproved,
  getAll,
};
