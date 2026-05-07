const adminModel = require("./admin.model");

const getAll = async () => {
  const rows = await adminModel.getAll();
  return rows;
};

module.exports = {
  getAll,
};
