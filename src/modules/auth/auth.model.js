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

const findUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      users.id,
      users.full_name,
      users.email,
      users.phone,
      users.profile_image_url,
      users.last_login,
      users.email_verified_at,
      roles.role_name,
      account_statuses.status_name
     FROM users
     JOIN roles ON users.role_id = roles.id
     JOIN account_statuses ON users.status_id = account_statuses.id
     WHERE users.id = ?
     LIMIT 1`,
    [userId]
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

const markUnusedPasswordResetTokensAsUsed = async (userId) => {
  await pool.query(
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE user_id = ?
       AND used_at IS NULL`,
    [userId]
  );
};

const createPasswordResetToken = async ({ userId, tokenHash, expiresAt }) => {
  const [result] = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );

  return result.insertId;
};

const findValidPasswordResetToken = async (tokenHash) => {
  const [rows] = await pool.query(
    `SELECT
      password_reset_tokens.*,
      users.email,
      users.full_name,
      users.password_hash,
      roles.role_name,
      account_statuses.status_name
     FROM password_reset_tokens
     JOIN users ON password_reset_tokens.user_id = users.id
     JOIN roles ON users.role_id = roles.id
     JOIN account_statuses ON users.status_id = account_statuses.id
     WHERE password_reset_tokens.token_hash = ?
       AND password_reset_tokens.used_at IS NULL
       AND password_reset_tokens.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0];
};

const markPasswordResetTokenAsUsed = async (tokenId) => {
  await pool.query(
    "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?",
    [tokenId]
  );
};

const updatePassword = async (userId, passwordHash) => {
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    userId,
  ]);
};

const createRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  const [result] = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );

  return result.insertId;
};

const findValidRefreshToken = async (tokenHash) => {
  const [rows] = await pool.query(
    `SELECT
      refresh_tokens.*,
      users.full_name,
      users.email,
      users.phone,
      users.profile_image_url,
      users.last_login,
      users.email_verified_at,
      roles.role_name,
      account_statuses.status_name
     FROM refresh_tokens
     JOIN users ON refresh_tokens.user_id = users.id
     JOIN roles ON users.role_id = roles.id
     JOIN account_statuses ON users.status_id = account_statuses.id
     WHERE refresh_tokens.token_hash = ?
       AND refresh_tokens.revoked_at IS NULL
       AND refresh_tokens.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0];
};

const revokeRefreshToken = async (tokenHash) => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE token_hash = ?
       AND revoked_at IS NULL`,
    [tokenHash]
  );
};

const revokeRefreshTokensForUser = async (userId) => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE user_id = ?
       AND revoked_at IS NULL`,
    [userId]
  );
};

module.exports = {
  findRoleByName,
  findStatusByName,
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  markUnusedPasswordResetTokensAsUsed,
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenAsUsed,
  updatePassword,
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokensForUser,
};
