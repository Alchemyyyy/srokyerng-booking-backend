const Joi = require("joi");

const createRoomSchema = Joi.object({
  room_type_id: Joi.number().required(),

  room_name: Joi.string().required(),

  description: Joi.string().allow("", null),

  price_per_night: Joi.number().positive().required(),

  max_guests: Joi.number().integer().positive().required(),

  total_rooms: Joi.number().integer().positive().required(),
});

module.exports = {
  createRoomSchema,
};
