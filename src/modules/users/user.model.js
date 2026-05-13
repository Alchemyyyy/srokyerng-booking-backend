const pool = require("../../config/db");

const findUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      users.id,
      users.full_name,
      users.email,
      users.phone,
      users.password_hash,
      users.profile_image_url,
      users.gender,
      users.date_of_birth,
      users.address,
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

const updateProfile = async (userId, profile) => {
  await pool.query(
    `UPDATE users
     SET full_name = ?,
         phone = ?,
         profile_image_url = ?,
         gender = ?,
         date_of_birth = ?,
         address = ?
     WHERE id = ?`,
    [
      profile.full_name,
      profile.phone,
      profile.profile_image_url,
      profile.gender,
      profile.date_of_birth,
      profile.address,
      userId,
    ]
  );
};

const updatePassword = async (userId, passwordHash) => {
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    userId,
  ]);
};

module.exports = {
  findUserById,
  updateProfile,
  updatePassword,
};
