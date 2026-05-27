const Joi = require("joi");

const createPropertySchema = Joi.object({
  category_id: Joi.number().integer().positive().required().messages({
    "any.required": "Category ID is required",
    "number.base": "Category ID must be a number",
    "number.integer": "Category ID must be an integer",
    "number.positive": "Category ID must be a positive number",
  }),

  property_name: Joi.string().trim().min(3).max(150).required().messages({
    "any.required": "Property name is required",
    "string.base": "Property name must be a string",
    "string.empty": "Property name cannot be empty",
    "string.min": "Property name must be at least 3 characters",
    "string.max": "Property name cannot exceed 150 characters",
  }),

  description: Joi.string().max(5000).allow(null, "").messages({
    "string.base": "Description must be a string",
    "string.max": "Description cannot exceed 5000 characters",
  }),

  address: Joi.string().trim().min(5).max(500).required().messages({
    "any.required": "Address is required",
    "string.base": "Address must be a string",
    "string.empty": "Address cannot be empty",
    "string.min": "Address must be at least 5 characters",
    "string.max": "Address cannot exceed 500 characters",
  }),

  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      "any.required": "City is required",
      "string.base": "City must be a string",
      "string.empty": "City cannot be empty",
      "string.min": "City must be at least 2 characters",
      "string.max": "City cannot exceed 100 characters",
      "string.pattern.base":
        "City can only contain letters, spaces, hyphens, and apostrophes",
    }),

  province: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      "any.required": "Province is required",
      "string.base": "Province must be a string",
      "string.empty": "Province cannot be empty",
      "string.min": "Province must be at least 2 characters",
      "string.max": "Province cannot exceed 100 characters",
      "string.pattern.base":
        "Province can only contain letters, spaces, hyphens, and apostrophes",
    }),

  country: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .default("Cambodia")
    .messages({
      "string.base": "Country must be a string",
      "string.max": "Country cannot exceed 100 characters",
      "string.pattern.base":
        "Country can only contain letters, spaces, hyphens, and apostrophes",
    }),

  latitude: Joi.number().min(-90).max(90).allow(null).messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
  }),

  longitude: Joi.number().min(-180).max(180).allow(null).messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
  }),

  contact_phone: Joi.string()
    .trim()
    .max(30)
    .pattern(/^[+\d\s()-]+$/)
    .allow(null, "")
    .messages({
      "string.base": "Contact phone must be a string",
      "string.max": "Contact phone cannot exceed 30 characters",
      "string.pattern.base": "Contact phone contains invalid characters",
    }),

  contact_email: Joi.string().trim().email().max(150).allow(null, "").messages({
    "string.base": "Contact email must be a string",
    "string.email": "Please provide a valid email address",
    "string.max": "Contact email cannot exceed 150 characters",
  }),
});

const updatePropertySchema = Joi.object({
  category_id: Joi.number().integer().positive().messages({
    "number.base": "Category ID must be a number",
    "number.integer": "Category ID must be an integer",
    "number.positive": "Category ID must be a positive number",
  }),

  property_name: Joi.string().trim().min(3).max(150).messages({
    "string.base": "Property name must be a string",
    "string.empty": "Property name cannot be empty",
    "string.min": "Property name must be at least 3 characters",
    "string.max": "Property name cannot exceed 150 characters",
  }),

  description: Joi.string().max(5000).allow(null, "").messages({
    "string.base": "Description must be a string",
    "string.max": "Description cannot exceed 5000 characters",
  }),

  address: Joi.string().trim().min(5).max(500).messages({
    "string.base": "Address must be a string",
    "string.empty": "Address cannot be empty",
    "string.min": "Address must be at least 5 characters",
    "string.max": "Address cannot exceed 500 characters",
  }),

  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .messages({
      "string.base": "City must be a string",
      "string.empty": "City cannot be empty",
      "string.min": "City must be at least 2 characters",
      "string.max": "City cannot exceed 100 characters",
      "string.pattern.base":
        "City can only contain letters, spaces, hyphens, and apostrophes",
    }),

  province: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .messages({
      "string.base": "Province must be a string",
      "string.empty": "Province cannot be empty",
      "string.min": "Province must be at least 2 characters",
      "string.max": "Province cannot exceed 100 characters",
      "string.pattern.base":
        "Province can only contain letters, spaces, hyphens, and apostrophes",
    }),

  country: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .messages({
      "string.base": "Country must be a string",
      "string.max": "Country cannot exceed 100 characters",
      "string.pattern.base":
        "Country can only contain letters, spaces, hyphens, and apostrophes",
    }),

  latitude: Joi.number().min(-90).max(90).allow(null).messages({
    "number.base": "Latitude must be a number",
    "number.min": "Latitude must be between -90 and 90",
    "number.max": "Latitude must be between -90 and 90",
  }),

  longitude: Joi.number().min(-180).max(180).allow(null).messages({
    "number.base": "Longitude must be a number",
    "number.min": "Longitude must be between -180 and 180",
    "number.max": "Longitude must be between -180 and 180",
  }),

  contact_phone: Joi.string()
    .trim()
    .max(30)
    .pattern(/^[+\d\s()-]+$/)
    .allow(null, "")
    .messages({
      "string.base": "Contact phone must be a string",
      "string.max": "Contact phone cannot exceed 30 characters",
      "string.pattern.base": "Contact phone contains invalid characters",
    }),

  contact_email: Joi.string().trim().email().max(150).allow(null, "").messages({
    "string.base": "Contact email must be a string",
    "string.email": "Please provide a valid email address",
    "string.max": "Contact email cannot exceed 150 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

const isValidRow = (row) => {
  if (row.length === 0) {
    return false;
  }
  return true;
};

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  isValidRow,
};
