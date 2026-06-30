const app = require("./app");
const pool = require("./config/db");
const env = require("./config/env");
const { startAutoCompleteScheduler } = require("./services/reservationScheduler");

const BASE_PORT = env.PORT;

const listenWithFallback = (startPort) => {
  const server = app.listen(startPort, () => {
    console.log(`Server running on http://localhost:${startPort}`);
  });

  // Socket.io initialization
  const { Server } = require("socket.io");
  const io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URLS,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} joined room: conversation_${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} left room: conversation_${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  app.set("io", io);

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
    startAutoCompleteScheduler();
  } catch (error) {
    console.error("Failed to connect to MySQL:", error.message);
    process.exit(1);
  }
};

startServer();
