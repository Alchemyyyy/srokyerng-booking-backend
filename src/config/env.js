const dotenv = require("dotenv");

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRequired = (key) => {
  const value = process.env[key];

  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const env = {
  PORT: parseNumber(process.env.PORT, 5001),
  DB_HOST: getRequired("DB_HOST"),
  DB_PORT: parseNumber(process.env.DB_PORT, 3306),
  DB_USER: getRequired("DB_USER"),
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: getRequired("DB_NAME"),
  JWT_SECRET: getRequired("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

module.exports = env;
