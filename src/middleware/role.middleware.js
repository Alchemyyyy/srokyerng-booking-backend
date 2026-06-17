const { errorResponse } = require("../utils/apiResponse");
const { AUTH } = require("../constants/messages");

// const roleMiddleware = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role) {
//       return errorResponse(res, AUTH.UNAUTHORIZED, 401);
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return errorResponse(res, AUTH.FORBIDDEN, 403);
//     }

//     return next();
//   };
// };


const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('ROLE CHECK:', { userRole: req.user?.role, allowedRoles });

    if (!req.user || !req.user.role) {
      return errorResponse(res, AUTH.UNAUTHORIZED, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, AUTH.FORBIDDEN, 403);
    }

    return next();
  };
};
 module.exports = roleMiddleware;