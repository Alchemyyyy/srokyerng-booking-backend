const validateCreateProperty = (data) => {
  const errors = {};

  // 1. Validate category_id
  if (data.category_id === undefined || data.category_id === null) {
    errors.category_id = "Category ID is required";
  } else if (typeof data.category_id !== "number") {
    errors.category_id = "Category ID must be a number";
  } else if (!Number.isInteger(data.category_id)) {
    errors.category_id = "Category ID must be an integer";
  } else if (data.category_id <= 0) {
    errors.category_id = "Category ID must be a positive number";
  }

  // 2. Validate property_name
  if (data.property_name === undefined || data.property_name === null) {
    errors.property_name = "Property name is required";
  } else if (typeof data.property_name !== "string") {
    errors.property_name = "Property name must be a string";
  } else if (data.property_name.trim().length === 0) {
    errors.property_name = "Property name cannot be empty";
  } else if (data.property_name.trim().length < 3) {
    errors.property_name = "Property name must be at least 3 characters";
  } else if (data.property_name.trim().length > 150) {
    errors.property_name = "Property name cannot exceed 150 characters";
  }

  // 3. Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.description = "Description must be a string";
    } else if (data.description.length > 5000) {
      errors.description = "Description cannot exceed 5000 characters";
    }
  }

  // 4. Validate address
  if (data.address === undefined || data.address === null) {
    errors.address = "Address is required";
  } else if (typeof data.address !== "string") {
    errors.address = "Address must be a string";
  } else if (data.address.trim().length === 0) {
    errors.address = "Address cannot be empty";
  } else if (data.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters";
  } else if (data.address.trim().length > 500) {
    errors.address = "Address cannot exceed 500 characters";
  }

  // 5. Validate city
  if (data.city === undefined || data.city === null) {
    errors.city = "City is required";
  } else if (typeof data.city !== "string") {
    errors.city = "City must be a string";
  } else if (data.city.trim().length === 0) {
    errors.city = "City cannot be empty";
  } else if (data.city.trim().length < 2) {
    errors.city = "City must be at least 2 characters";
  } else if (data.city.trim().length > 100) {
    errors.city = "City cannot exceed 100 characters";
  } else if (!/^[a-zA-Z\s\-']+$/.test(data.city.trim())) {
    errors.city = "City can only contain letters, spaces, hyphens, and apostrophes";
  }

  // 6. Validate province
  if (data.province === undefined || data.province === null) {
    errors.province = "Province is required";
  } else if (typeof data.province !== "string") {
    errors.province = "Province must be a string";
  } else if (data.province.trim().length === 0) {
    errors.province = "Province cannot be empty";
  } else if (data.province.trim().length < 2) {
    errors.province = "Province must be at least 2 characters";
  } else if (data.province.trim().length > 100) {
    errors.province = "Province cannot exceed 100 characters";
  } else if (!/^[a-zA-Z\s\-']+$/.test(data.province.trim())) {
    errors.province =
      "Province can only contain letters, spaces, hyphens, and apostrophes";
  }

  // 7. Validate country (optional, defaults to 'Cambodia')
  if (data.country !== undefined && data.country !== null) {
    if (typeof data.country !== "string") {
      errors.country = "Country must be a string";
    } else if (data.country.trim().length > 100) {
      errors.country = "Country cannot exceed 100 characters";
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.country.trim())) {
      errors.country =
        "Country can only contain letters, spaces, hyphens, and apostrophes";
    }
  }

  // 8. Validate latitude (optional)
  if (data.latitude !== undefined && data.latitude !== null) {
    if (typeof data.latitude !== "number") {
      errors.latitude = "Latitude must be a number";
    } else if (data.latitude < -90 || data.latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90";
    }
  }

  // 9. Validate longitude (optional)
  if (data.longitude !== undefined && data.longitude !== null) {
    if (typeof data.longitude !== "number") {
      errors.longitude = "Longitude must be a number";
    } else if (data.longitude < -180 || data.longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180";
    }
  }

  // 10. Validate contact_phone (optional)
  if (data.contact_phone !== undefined && data.contact_phone !== null) {
    if (typeof data.contact_phone !== "string") {
      errors.contact_phone = "Contact phone must be a string";
    } else if (data.contact_phone.trim().length > 30) {
      errors.contact_phone = "Contact phone cannot exceed 30 characters";
    } else if (
      data.contact_phone.trim().length > 0 &&
      !/^[\+\d\s\-\(\)]+$/.test(data.contact_phone.trim())
    ) {
      errors.contact_phone = "Contact phone contains invalid characters";
    }
  }

  // 11. Validate contact_email (optional)
  if (data.contact_email !== undefined && data.contact_email !== null) {
    if (typeof data.contact_email !== "string") {
      errors.contact_email = "Contact email must be a string";
    } else if (data.contact_email.trim().length > 150) {
      errors.contact_email = "Contact email cannot exceed 150 characters";
    } else if (data.contact_email.trim().length > 0) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
      if (!emailRegex.test(data.contact_email.trim())) {
        errors.contact_email = "Please provide a valid email address";
      }
    }
  }

  // Return validation result
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors,
    data: {
      category_id: data.category_id,
      property_name: data.property_name ? data.property_name.trim() : null,
      description: data.description ? data.description.trim() : null,
      address: data.address ? data.address.trim() : null,
      city: data.city ? data.city.trim() : null,
      province: data.province ? data.province.trim() : null,
      country: data.country && data.country.trim() ? data.country.trim() : "Cambodia",
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      contact_phone: data.contact_phone ? data.contact_phone.trim() : null,
      contact_email: data.contact_email ? data.contact_email.trim() : null,
    },
  };
};

// Update property validation (partial update)
const validateUpdateProperty = (data) => {
  const errors = {};

  // 1. Validate category_id (if provided)
  if (data.category_id !== undefined) {
    if (typeof data.category_id !== "number") {
      errors.category_id = "Category ID must be a number";
    } else if (!Number.isInteger(data.category_id)) {
      errors.category_id = "Category ID must be an integer";
    } else if (data.category_id <= 0) {
      errors.category_id = "Category ID must be a positive number";
    }
  }

  // 2. Validate property_name (if provided)
  if (data.property_name !== undefined) {
    if (typeof data.property_name !== "string") {
      errors.property_name = "Property name must be a string";
    } else if (data.property_name.trim().length === 0) {
      errors.property_name = "Property name cannot be empty";
    } else if (data.property_name.trim().length < 3) {
      errors.property_name = "Property name must be at least 3 characters";
    } else if (data.property_name.trim().length > 150) {
      errors.property_name = "Property name cannot exceed 150 characters";
    }
  }

  // 3. Validate description (if provided)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== "string") {
      errors.description = "Description must be a string";
    } else if (data.description.length > 5000) {
      errors.description = "Description cannot exceed 5000 characters";
    }
  }

  // 4. Validate address (if provided)
  if (data.address !== undefined) {
    if (typeof data.address !== "string") {
      errors.address = "Address must be a string";
    } else if (data.address.trim().length === 0) {
      errors.address = "Address cannot be empty";
    } else if (data.address.trim().length < 5) {
      errors.address = "Address must be at least 5 characters";
    } else if (data.address.trim().length > 500) {
      errors.address = "Address cannot exceed 500 characters";
    }
  }

  // 5. Validate city (if provided)
  if (data.city !== undefined) {
    if (typeof data.city !== "string") {
      errors.city = "City must be a string";
    } else if (data.city.trim().length === 0) {
      errors.city = "City cannot be empty";
    } else if (data.city.trim().length < 2) {
      errors.city = "City must be at least 2 characters";
    } else if (data.city.trim().length > 100) {
      errors.city = "City cannot exceed 100 characters";
    }
  }

  // 6. Validate province (if provided)
  if (data.province !== undefined) {
    if (typeof data.province !== "string") {
      errors.province = "Province must be a string";
    } else if (data.province.trim().length === 0) {
      errors.province = "Province cannot be empty";
    } else if (data.province.trim().length < 2) {
      errors.province = "Province must be at least 2 characters";
    } else if (data.province.trim().length > 100) {
      errors.province = "Province cannot exceed 100 characters";
    }
  }

  // 7. Validate country (if provided)
  if (data.country !== undefined && data.country !== null) {
    if (typeof data.country !== "string") {
      errors.country = "Country must be a string";
    } else if (data.country.trim().length > 100) {
      errors.country = "Country cannot exceed 100 characters";
    }
  }

  // 8. Validate latitude (if provided)
  if (data.latitude !== undefined && data.latitude !== null) {
    if (typeof data.latitude !== "number") {
      errors.latitude = "Latitude must be a number";
    } else if (data.latitude < -90 || data.latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90";
    }
  }

  // 9. Validate longitude (if provided)
  if (data.longitude !== undefined && data.longitude !== null) {
    if (typeof data.longitude !== "number") {
      errors.longitude = "Longitude must be a number";
    } else if (data.longitude < -180 || data.longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180";
    }
  }

  // 10. Validate contact_phone (if provided)
  if (data.contact_phone !== undefined && data.contact_phone !== null) {
    if (typeof data.contact_phone !== "string") {
      errors.contact_phone = "Contact phone must be a string";
    } else if (data.contact_phone.trim().length > 30) {
      errors.contact_phone = "Contact phone cannot exceed 30 characters";
    }
  }

  // 11. Validate contact_email (if provided)
  if (data.contact_email !== undefined && data.contact_email !== null) {
    if (typeof data.contact_email !== "string") {
      errors.contact_email = "Contact email must be a string";
    } else if (data.contact_email.trim().length > 150) {
      errors.contact_email = "Contact email cannot exceed 150 characters";
    } else if (data.contact_email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
      if (!emailRegex.test(data.contact_email.trim())) {
        errors.contact_email = "Please provide a valid email address";
      }
    }
  }

  // Check if at least one field is provided for update
  const hasFields = Object.keys(data).some((key) =>
    [
      "category_id",
      "property_name",
      "description",
      "address",
      "city",
      "province",
      "country",
      "latitude",
      "longitude",
      "contact_phone",
      "contact_email",
    ].includes(key)
  );

  if (!hasFields && Object.keys(errors).length === 0) {
    errors._general = "At least one field must be provided for update";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors,
    data: {
      category_id: data.category_id,
      property_name: data.property_name ? data.property_name.trim() : undefined,
      description: data.description ? data.description.trim() : undefined,
      address: data.address ? data.address.trim() : undefined,
      city: data.city ? data.city.trim() : undefined,
      province: data.province ? data.province.trim() : undefined,
      country: data.country && data.country.trim() ? data.country.trim() : undefined,
      latitude: data.latitude !== undefined ? data.latitude : undefined,
      longitude: data.longitude !== undefined ? data.longitude : undefined,
      contact_phone: data.contact_phone ? data.contact_phone.trim() : undefined,
      contact_email: data.contact_email ? data.contact_email.trim() : undefined,
    },
  };
};
const isValidRow = (row) => {
  if (row.length === 0) {
    return false;
  }
  return true;
};

module.exports = {
  validateCreateProperty,
  validateUpdateProperty,
  isValidRow,
};
