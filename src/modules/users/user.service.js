const userModel = require("./user.model");
const { comparePassword, hashPassword } = require("../../utils/hashPassword");
const { USER_STATUS } = require("../../constants/statuses");

const toSafeUser = (user) => {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role_name,
    status: user.status_name,
    profile_image_url: user.profile_image_url,
    gender: user.gender,
    date_of_birth: user.date_of_birth,
    address: user.address,
    last_login: user.last_login,
    email_verified_at: user.email_verified_at,
  };
};

const ensureActiveUser = async (userId) => {
  const user = await userModel.findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.status_name !== USER_STATUS.ACTIVE) {
    const error = new Error("Your account is not active");
    error.statusCode = 403;
    throw error;
  }

  return user;
};

const getMyProfile = async (userId) => {
  const user = await ensureActiveUser(userId);

  return toSafeUser(user);
};

const updateMyProfile = async (userId, payload) => {
  const user = await ensureActiveUser(userId);
  const getNextValue = (field) => {
    return Object.hasOwn(payload, field) ? payload[field] : user[field];
  };

  const nextProfile = {
    full_name: getNextValue("full_name"),
    phone: getNextValue("phone"),
    profile_image_url: getNextValue("profile_image_url"),
    gender: getNextValue("gender"),
    date_of_birth: getNextValue("date_of_birth"),
    address: getNextValue("address"),
  };

  await userModel.updateProfile(userId, nextProfile);

  const updatedUser = await ensureActiveUser(userId);

  return toSafeUser(updatedUser);
};

const changeMyPassword = async (userId, { current_password, new_password }) => {
  const user = await ensureActiveUser(userId);
  const isMatch = await comparePassword(current_password, user.password_hash);

  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  const passwordHash = await hashPassword(new_password);
  await userModel.updatePassword(userId, passwordHash);
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
};
