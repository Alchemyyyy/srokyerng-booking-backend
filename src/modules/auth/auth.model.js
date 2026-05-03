const pool = require("../../config/db");

const findRoleByName = async (roleName) => {
  const [rows] = await pool.query("SELECT * FROM roles WHERE role_name = ? LIMIT 1", [
    roleName,
  ]);

  return rows[0];
};

const findStatusByName = async (statusName) => {
  const [rows] = await pool.query(
    "SELECT * FROM account_statuses WHERE status_name = ? LIMIT 1",
    [statusName]
  );

  return rows[0];
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT 
      users.*,
      roles.role_name,
      account_statuses.status_name
     FROM users
     JOIN roles ON users.role_id = roles.id
     JOIN account_statuses ON users.status_id = account_statuses.id
     WHERE users.email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0];
};

const createUser = async ({ roleId, statusId, fullName, email, phone, passwordHash }) => {
  const [result] = await pool.query(
    `INSERT INTO users 
      (role_id, status_id, full_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [roleId, statusId, fullName, email, phone || null, passwordHash]
  );

  return result.insertId;
};

const updateLastLogin = async (userId) => {
  await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [
    userId,
  ]);
};

module.exports = {
  findRoleByName,
  findStatusByName,
  findUserByEmail,
  createUser,
  updateLastLogin,
};
