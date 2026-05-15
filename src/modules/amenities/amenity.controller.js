const amenityService = require(
    "./amenity.service"
);

const {
    updatePropertyAmenitiesSchema
} = require(
    "./amenity.validation"
);

const getAllAmenities = async (
    req,
    res
) => {

    try {

        const amenities =
            await amenityService.getAllAmenities();

        res.status(200).json({
            message:
                "Amenities fetched successfully",
            data: amenities
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const getPropertyAmenities = async (
    req,
    res
) => {

    try {

        const propertyId =
            req.params.propertyId;

        const amenities =
            await amenityService.getPropertyAmenities(
                propertyId
            );

        res.status(200).json({
            message:
                "Property amenities fetched successfully",
            data: amenities
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const updatePropertyAmenities = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;
       

        const propertyId =
            req.params.propertyId;

        const { error } =
            updatePropertyAmenitiesSchema.validate(
                req.body
            );

        if (error) {

            return res.status(400).json({
                message:
                    error.details[0].message
            });

        }

        const amenities =
            await amenityService.updatePropertyAmenities(
                userId,
                propertyId,
                req.body.amenity_ids
            );

        res.status(200).json({
            message:
                "Property amenities updated successfully",
            data: amenities
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {
    getAllAmenities,
    getPropertyAmenities,
    updatePropertyAmenities
};