const express = require("express");

const propertyController = require("./property.controller");

const router = express.Router();

router.get("/", propertyController.getAll);

module.exports = router;
