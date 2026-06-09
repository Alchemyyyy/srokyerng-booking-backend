const dayjs = require("dayjs");
const calendarModel = require("./calendar.model");
const calendarValidation = require("./calendar.validation");
const { getRoomById } = require("../rooms/room.model");

const { getDatesBetween } = require("../../utils/getDatesBetween");

const getRoomCalendar = async (roomId, startDate, endDate) => {
  if (dayjs(startDate).isBefore(dayjs().startOf("day"))) {
    return {
      result: false,
      status: 400,
      message: "Start date cannot be in the past",
    };
  }
  const room = await getRoomById(roomId);

  if (!room) {
    return {
      result: false,
      status: 404,
      message: "Room not found",
    };
  }

  const reservations = await calendarModel.getRoomReservations(
    roomId,
    startDate,
    endDate
  );

  const unavailableDates = [];

  reservations.forEach((reservation) => {
    unavailableDates.push(
      ...getDatesBetween(reservation.check_in_date, reservation.check_out_date)
    );
  });

  const uniqueUnavailableDates = [...new Set(unavailableDates)];

  const allDates = getDatesBetween(startDate, endDate);

  const availableDates = allDates.filter(
    (date) => !uniqueUnavailableDates.includes(date)
  );

  return {
    result: true,
    status: 200,
    data: {
      room_id: roomId,
      available_dates: availableDates,
      unavailable_dates: uniqueUnavailableDates,
    },
  };
};

const getPropertyCalendar = async (propertyId, startDate, endDate) => {
  const property = await calendarModel.getPropertyById(propertyId);

  if (!property) {
    return {
      result: false,
      status: 404,
      message: "Property not found",
    };
  }

  const reservations = await calendarModel.getPropertyReservations(
    propertyId,
    startDate,
    endDate
  );

  return {
    result: true,
    status: 200,
    data: reservations,
  };
};

const getOwnerPropertyCalendar = async (propertyId, ownerId, startDate, endDate) => {
  const property = await calendarModel.getOwnerProperty(propertyId, ownerId);

  if (!property) {
    return {
      result: false,
      status: 403,
      message: "Property not found",
    };
  }

  return getPropertyCalendar(propertyId, startDate, endDate);
};

const getOwnerRoomCalendar = async (roomId, ownerId, startDate, endDate) => {
  const room = await calendarModel.getOwnerRoom(roomId, ownerId);

  if (!room) {
    return {
      result: false,
      status: 403,
      message: "Room not found",
    };
  }

  return getRoomCalendar(roomId, startDate, endDate);
};

module.exports = {
  getRoomCalendar,
  getPropertyCalendar,
  getOwnerPropertyCalendar,
  getOwnerRoomCalendar,
};
