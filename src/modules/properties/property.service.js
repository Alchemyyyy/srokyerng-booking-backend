const property = require("./property.model");

const getAll = async (query) => {
  const filters = {
    city: query.city || null,
    province: query.province || null,
    category_id: query.category_id || null,
    search: query.search || null,
    page: query.page || 1,
    limit: query.limit || 10,
  };
  let rows = await property.getAll(filters);
  return rows;
};

module.exports = {
  getAll,
};
