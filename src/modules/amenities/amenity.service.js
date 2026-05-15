const amenityModel = require(
    "./amenity.model"
);

const getAllAmenities = async () => {

    return await amenityModel.getAllAmenities();

};

const getPropertyAmenities = async (
    propertyId
) => {

    const property =
        await amenityModel.getPropertyById(
            propertyId
        );

    if (!property) {
        throw new Error(
            "Property not found"
        );
    }

    return await amenityModel.getPropertyAmenities(
        propertyId
    );

};

const updatePropertyAmenities = async (
    userId,
    propertyId,
    amenityIds
) => {

    // 1. check property
    const property =
        await amenityModel.getPropertyById(
            propertyId
        );

    if (!property) {
        throw new Error(
            "Property not found"
        );
    }

    // 2. ownership check
    if (property.owner_id !== userId) {
        throw new Error("Forbidden");
    }

    // 3. validate amenity ids
    const existingAmenities =
        await amenityModel.checkAmenitiesExist(
            amenityIds
        );

    if (
        existingAmenities.length !==
        amenityIds.length
    ) {
        throw new Error(
            "One or more amenity IDs are invalid"
        );
    }

    // 4. remove duplicates
    const uniqueAmenityIds =
        [...new Set(amenityIds)];

    // 5. clear old amenities
    await amenityModel.clearPropertyAmenities(
        propertyId
    );

    // 6. insert new amenities
    if (uniqueAmenityIds.length > 0) {

        await amenityModel.attachAmenitiesToProperty(
            propertyId,
            uniqueAmenityIds
        );

    }

    // 7. return updated amenities
    return await amenityModel.getPropertyAmenities(
        propertyId
    );

};

module.exports = {
    getAllAmenities,
    getPropertyAmenities,
    updatePropertyAmenities
};