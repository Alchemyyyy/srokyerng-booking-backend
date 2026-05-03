const app = require("./app");
const pool = require("./config/db");
const env = require("./config/env");

const BASE_PORT = env.PORT;

const listenWithFallback = (startPort) => {
  const server = app.listen(startPort, () => {
    console.log(`Server running on http://localhost:${startPort}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = startPort + 1;
      console.warn(
        `Port ${startPort} is already in use. Trying http://localhost:${nextPort}...`
      );
      listenWithFallback(nextPort);
      return;
    }

    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
};

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connected successfully");
    listenWithFallback(BASE_PORT);
  } catch (error) {
    console.error("Failed to connect to MySQL:", error.message);
    process.exit(1);
  }
};

startServer();
