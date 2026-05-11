const Joi = require("joi");
const ROLES = require("../../constants/roles");

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

const registerSchema = Joi.object({
  full_name: Joi.string().trim().required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name is required",
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Email format is invalid",
  }),
  password: Joi.string().min(8).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
  phone: Joi.string().trim().allow("", null).optional(),
  role: Joi.string()
    .trim()
    .lowercase()
    .valid(ROLES.CUSTOMER, ROLES.OWNER)
    .required()
    .messages({
      "any.required": "Role is required",
      "string.empty": "Role is required",
      "any.only": "Role must be customer or owner",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Email format is invalid",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
});

const formatErrors = (error) => {
  return error ? error.details.map((detail) => detail.message) : [];
};

const normalizeRegisterBody = (body = {}) => {
  const { value } = registerSchema.validate(body, validationOptions);
  return value;
};

const normalizeLoginBody = (body = {}) => {
  const { value } = loginSchema.validate(body, validationOptions);
  return value;
};

const validateRegister = (body) => {
  const { error } = registerSchema.validate(body, validationOptions);
  return formatErrors(error);
};

const validateLogin = (body) => {
  const { error } = loginSchema.validate(body, validationOptions);
  return formatErrors(error);
};

module.exports = {
  validateRegister,
  validateLogin,
  normalizeRegisterBody,
  normalizeLoginBody,
};
