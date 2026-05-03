const { errorResponse } = require("../utils/apiResponse");

const errorMiddleware = (err, req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode >= 500 ? "Internal server error" : err.message || "Request failed";

  return errorResponse(res, message, statusCode);
};

module.exports = errorMiddleware;
