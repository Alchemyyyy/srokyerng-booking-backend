const express = require("express");

const router = express.Router();

const amenityController = require(
    "./amenity.controller"
);

router.get(
    "/",
    amenityController.getAllAmenities
);

router.get(
    "/properties/:propertyId/amenities",
    amenityController.getPropertyAmenities
);

router.put(
    "/properties/:propertyId/amenities",
    amenityController.updatePropertyAmenities
);

module.exports = router;