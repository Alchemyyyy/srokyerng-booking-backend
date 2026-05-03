const authModel = require("./auth.model");
const { hashPassword, comparePassword } = require("../../utils/hashPassword");
const generateToken = require("../../utils/generateToken");

const register = async ({ full_name, email, password, phone, role }) => {
  const existingUser = await authModel.findUserByEmail(email);

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const selectedRole = await authModel.findRoleByName(role);
  const activeStatus = await authModel.findStatusByName("active");

  if (!selectedRole || !activeStatus) {
    const error = new Error("System roles/statuses are not seeded");
    error.statusCode = 500;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const userId = await authModel.createUser({
    roleId: selectedRole.id,
    statusId: activeStatus.id,
    fullName: full_name,
    email,
    phone,
    passwordHash,
  });

  return {
    id: userId,
    full_name,
    email,
    phone: phone || null,
    role,
  };
};

const login = async ({ email, password }) => {
  const user = await authModel.findUserByEmail(email);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status_name !== "active") {
    const error = new Error("Your account is not active");
    error.statusCode = 403;
    throw error;
  }

  await authModel.updateLastLogin(user.id);

  const token = generateToken({
    id: user.id,
    role: user.role_name,
  });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role_name,
      status: user.status_name,
      profile_image_url: user.profile_image_url,
    },
  };
};

module.exports = {
  register,
  login,
};
