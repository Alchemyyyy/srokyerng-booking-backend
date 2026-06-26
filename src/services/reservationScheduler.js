// src/services/reservationScheduler.js
const dayjs = require("dayjs");

// Run every hour (3600000 ms)
const AUTO_COMPLETE_INTERVAL = 3600000;

let intervalId = null;

const autoCompleteReservations = async () => {
  try {
    const reservationModel = require("../modules/reservations/reservation.model");
    const affectedRows = await reservationModel.autoCompleteExpiredReservations();
    if (affectedRows > 0) {
      console.log(
        `[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] Auto-completed ${affectedRows} reservation(s)`
      );
    }
  } catch (error) {
    console.error("Auto-complete reservations error:", error.message);
  }
};

const startAutoCompleteScheduler = () => {
  // Run immediately on startup
  autoCompleteReservations();

  // Then run every hour
  intervalId = setInterval(autoCompleteReservations, AUTO_COMPLETE_INTERVAL);
  console.log("Auto-complete reservations scheduler started (every hour)");
};

const stopAutoCompleteScheduler = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Auto-complete reservations scheduler stopped");
  }
};

module.exports = {
  startAutoCompleteScheduler,
  stopAutoCompleteScheduler,
};