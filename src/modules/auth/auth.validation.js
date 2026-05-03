const ROLES = require("../../constants/roles");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeRegisterBody = (body = {}) => {
  return {
    ...body,
    full_name:
      typeof body.full_name === "string" ? body.full_name.trim() : body.full_name,
    email: typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email,
    phone: typeof body.phone === "string" ? body.phone.trim() : body.phone,
    role: typeof body.role === "string" ? body.role.trim().toLowerCase() : body.role,
  };
};

const normalizeLoginBody = (body = {}) => {
  return {
    ...body,
    email: typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email,
  };
};

const validateRegister = (body) => {
  const errors = [];

  if (!body.full_name) errors.push("Full name is required");
  if (!body.email) errors.push("Email is required");
  if (!body.password) errors.push("Password is required");
  if (!body.role) errors.push("Role is required");

  if (body.email && !EMAIL_REGEX.test(body.email)) {
    errors.push("Email format is invalid");
  }

  if (body.password && body.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  const allowedRoles = [ROLES.CUSTOMER, ROLES.OWNER];
  if (body.role && !allowedRoles.includes(body.role)) {
    errors.push("Role must be customer or owner");
  }

  return errors;
};

const validateLogin = (body) => {
  const errors = [];

  if (!body.email) errors.push("Email is required");
  if (!body.password) errors.push("Password is required");
  if (body.email && !EMAIL_REGEX.test(body.email)) {
    errors.push("Email format is invalid");
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  normalizeRegisterBody,
  normalizeLoginBody,
};
