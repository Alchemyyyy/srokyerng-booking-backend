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

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Email format is invalid",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Reset token is required",
    "string.empty": "Reset token is required",
  }),
  password: Joi.string().min(8).required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().trim().required().messages({
    "any.required": "Refresh token is required",
    "string.empty": "Refresh token is required",
  }),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "any.required": "Verification token is required",
    "string.empty": "Verification token is required",
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

const normalizeForgotPasswordBody = (body = {}) => {
  const { value } = forgotPasswordSchema.validate(body, validationOptions);
  return value;
};

const normalizeResetPasswordBody = (body = {}) => {
  const { value } = resetPasswordSchema.validate(body, validationOptions);
  return value;
};

const normalizeRefreshTokenBody = (body = {}) => {
  const { value } = refreshTokenSchema.validate(body, validationOptions);
  return value;
};

const normalizeVerifyEmailBody = (body = {}) => {
  const { value } = verifyEmailSchema.validate(body, validationOptions);
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

const validateForgotPassword = (body) => {
  const { error } = forgotPasswordSchema.validate(body, validationOptions);
  return formatErrors(error);
};

const validateResetPassword = (body) => {
  const { error } = resetPasswordSchema.validate(body, validationOptions);
  return formatErrors(error);
};

const validateRefreshToken = (body) => {
  const { error } = refreshTokenSchema.validate(body, validationOptions);
  return formatErrors(error);
};

const validateVerifyEmail = (body) => {
  const { error } = verifyEmailSchema.validate(body, validationOptions);
  return formatErrors(error);
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
  validateVerifyEmail,
  normalizeRegisterBody,
  normalizeLoginBody,
  normalizeForgotPasswordBody,
  normalizeResetPasswordBody,
  normalizeRefreshTokenBody,
  normalizeVerifyEmailBody,
};
