const Joi = require("joi");

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

const profileSchema = Joi.object({
  full_name: Joi.string().trim().min(1).max(100).optional().messages({
    "string.empty": "Full name cannot be empty",
    "string.min": "Full name cannot be empty",
    "string.max": "Full name cannot exceed 100 characters",
  }),
  phone: Joi.string().trim().max(30).allow("", null).optional().messages({
    "string.max": "Phone cannot exceed 30 characters",
  }),
  profile_image_url: Joi.string().trim().uri().allow("", null).optional().messages({
    "string.uri": "Profile image URL must be valid",
  }),
  gender: Joi.string()
    .trim()
    .lowercase()
    .valid("male", "female", "other")
    .allow("", null)
    .optional()
    .messages({
      "any.only": "Gender must be male, female, or other",
    }),
  date_of_birth: Joi.string()
    .trim()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .allow("", null)
    .optional()
    .messages({
      "string.pattern.base": "Date of birth must use YYYY-MM-DD format",
    }),
  address: Joi.string().trim().max(500).allow("", null).optional().messages({
    "string.max": "Address cannot exceed 500 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one profile field is required",
  });

const passwordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    "any.required": "Current password is required",
    "string.empty": "Current password is required",
  }),
  new_password: Joi.string().min(8).required().messages({
    "any.required": "New password is required",
    "string.empty": "New password is required",
    "string.min": "New password must be at least 8 characters",
  }),
});

const formatErrors = (error) => {
  return error ? error.details.map((detail) => detail.message) : [];
};

const emptyToNull = (value) => {
  return value === "" ? null : value;
};

const normalizeProfileBody = (body = {}) => {
  const { value } = profileSchema.validate(body, validationOptions);
  const normalized = { ...value };

  ["phone", "profile_image_url", "gender", "date_of_birth", "address"].forEach(
    (field) => {
      if (Object.hasOwn(normalized, field)) {
        normalized[field] = emptyToNull(normalized[field]);
      }
    }
  );

  return normalized;
};

const normalizePasswordBody = (body = {}) => {
  const { value } = passwordSchema.validate(body, validationOptions);
  return value;
};

const validateProfile = (body) => {
  const { error } = profileSchema.validate(body, validationOptions);
  return formatErrors(error);
};

const validatePassword = (body) => {
  const { error } = passwordSchema.validate(body, validationOptions);
  return formatErrors(error);
};

module.exports = {
  normalizeProfileBody,
  normalizePasswordBody,
  validateProfile,
  validatePassword,
};
