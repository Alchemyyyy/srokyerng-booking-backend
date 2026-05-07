const express = require("express");

const adminController = require("./admin.controller");

const router = express.Router();

router.get("/properties", adminController.getAll);

module.exports = router;
