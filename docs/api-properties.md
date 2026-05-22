# Admin EndPoints (For Admin only)

## Get All Properties

```text
GET admin/properties
```

Authorization: Required

success Response:

```json
{
  "success": true,
  "message": "Get all properties successfully",
  "data": [
    {
      "id": 1,
      "property_name": "Sokha Hotel",
      "description": "Luxury hotel in Siem Reap",
      "address": "Street 60",
      "city": "Siem Reap",
      "province": "Siem Reap",
      "country": "Cambodia",
      "latitude": null,
      "longitude": null,
      "owner_id": 2,
      "owner_name": "Owner Sokha",
      "owner_email": "owner1@gmail.com",
      "owner_phone": "098111222",
      "category_id": 1,
      "category_name": "Hotel",
      "status_id": 2,
      "status_name": "approved",
      "image_id": 1,
      "image_url": "hotel1.jpg",
      "is_cover": 1,
      "rejection_reason": null,
      "approved_by": 1,
      "approved_at": null,
      "created_at": "2026-05-06T15:28:17.000Z",
      "updated_at": "2026-05-06T17:22:22.000Z",
      "deleted_at": null
    }
  ]
}
```

## Update Property Status

```text
PATCH /admin/properties/8/status
```

Authorization: Required

body:

```json
{
  "status_id": 2,
  "rejection_reason": ""
}
```

Success Response:

```json
{
  "success": true,
  "message": "Updated status successfully",
  "data": {
    "id": 5,
    "property_name": "testuser10",
    "status_name": "approved",
    "rejection_reason": null,
    "approved_at": "2026-05-16T13:27:59.000Z",
    "approved_by_name": "System Admin"
  }
}
```

# Properties EndPoints

## Get All Approved Properties (Public)

```text
GET /api/properties
```

Authentication: Not required.

success response:

```json
{
  "success": true,
  "message": "Get All properties successfully",
  "data": [
    {
      "id": 5,
      "property_name": "testuser10",
      "description": "A luxurious beachfront resort with infinity pool, spa, and fine dining. Perfect for family vacations and romantic getaways.",
      "city": "Sihanoukville",
      "province": "Phnom Penh",
      "category_name": "Hotel",
      "image_url": "/uploads/properties/1778656995334-148532588.png",
      "price_per_night": null
    }
  ]
}
```

## Get Approved Property detail (Public)

```text
GET /properties/:propertyId
```

Authentication: Not required.

success response:

```json
{
  "success": true,
  "message": "Get owner detail successfully",
  "data": {
    "id": 1,
    "property_name": "Sokha Hotel",
    "description": "Luxury hotel in Siem Reap",
    "address": "Street 60",
    "city": "Siem Reap",
    "province": "Siem Reap",
    "country": "Cambodia",
    "latitude": null,
    "longitude": null,
    "contact_phone": "098111222",
    "contact_email": "hotel@sokha.com",
    "created_at": "2026-05-06T15:28:17.000Z",
    "updated_at": "2026-05-06T17:22:22.000Z",
    "status_id": 2,
    "status_name": "approved",
    "category_id": 1,
    "category_name": "Hotel",
    "owner_id": 2,
    "full_name": "Owner Sokha",
    "owner_phone": "098111222",
    "owner_email": "owner1@gmail.com",
    "images": [
      {
        "id": 1,
        "image_url": "hotel1.jpg",
        "is_cover": 1,
        "sort_order": 0
      },
      {
        "id": 2,
        "image_url": "hotel2.jpg",
        "is_cover": 0,
        "sort_order": 0
      }
    ],
    "amenities": [
      {
        "id": 1,
        "amenity_name": "Wi-Fi"
      },
      {
        "id": 4,
        "amenity_name": "Air Conditioning"
      },
      {
        "id": 5,
        "amenity_name": "Swimming Pool"
      }
    ],
    "rooms": [
      {
        "id": 1,
        "room_name": "Deluxe Room",
        "description": "Nice deluxe room",
        "price_per_night": "50.00",
        "max_guests": 2,
        "total_rooms": 10,
        "room_type": "Deluxe"
      },
      {
        "id": 2,
        "room_name": "Suite Room",
        "description": "Luxury suite",
        "price_per_night": "120.00",
        "max_guests": 4,
        "total_rooms": 5,
        "room_type": "Suite"
      }
    ]
  }
}
```

## Register Property

```text
POST /properties
```

Authentication: Required.

body

```json
{
  "category_id": 1,
  "property_name": "testuser10_2",
  "description": "A luxurious beachfront resort with infinity pool, spa, and fine dining. Perfect for family vacations and romantic getaways.",
  "address": "Street 123, Sangkat 4, Group 5",
  "city": "Sihanoukville",
  "province": "Phnom Penh",
  "country": "Cambodia",
  "latitude": 10.6345678,
  "longitude": 103.4972345,
  "contact_phone": "+855 12 345 678",
  "contact_email": "reservations@sunsetbeach.com"
}
```

success response:

```json
{
  "success": true,
  "message": "Request successfully",
  "data": [
    {
      "id": 7,
      "owner_id": 10,
      "category_id": 1,
      "status_id": 1,
      "property_name": "testuser10_3",
      "description": "A luxurious beachfront resort with infinity pool, spa, and fine dining. Perfect for family vacations and romantic getaways.",
      "address": "Street 123, Sangkat 4, Group 5",
      "city": "Sihanoukville",
      "province": "Phnom Penh",
      "country": "Cambodia",
      "latitude": "10.63456780",
      "longitude": "103.49723450",
      "contact_phone": "+855 12 345 678",
      "contact_email": "reservations@sunsetbeach.com",
      "rejection_reason": null,
      "approved_by": null,
      "approved_at": null,
      "created_at": "2026-05-16T12:51:36.000Z",
      "updated_at": "2026-05-16T12:51:36.000Z",
      "deleted_at": null
    }
  ]
}
```

## Update Property (Owner only)

```text
PATCH /properties/:propertyId
```

Authentication: Required.

body

```json
{
  "category_id": 1,
  "property_name": "test update",
  "description": "A luxurious beachfront resort with infinity pool, spa, and fine dining. Perfect for family vacations and romantic getaways.",
  "address": "Street 123, Sangkat 4, Group 5",
  "city": "Sihanoukville",
  "province": "Phnom Penh",
  "country": "Cambodia",
  "latitude": 10.6345678,
  "longitude": 103.4972345,
  "contact_phone": "+855 12 345 678",
  "contact_email": "reservations@sunsetbeach.com"
}
```

Success Response:

```json
{
  "success": true,
  "message": "Updated Successfully",
  "data": {
    "id": 7,
    "owner_id": 10,
    "category_id": 1,
    "status_id": 1,
    "property_name": "test update7",
    "description": "A luxurious beachfront resort with infinity pool, spa, and fine dining. Perfect for family vacations and romantic getaways.",
    "address": "Street 123, Sangkat 4, Group 5",
    "city": "Sihanoukville",
    "province": "Phnom Penh",
    "country": "Cambodia",
    "latitude": "10.63456780",
    "longitude": "103.49723450",
    "contact_phone": "+855 12 345 678",
    "contact_email": "reservations@sunsetbeach.com",
    "rejection_reason": null,
    "approved_by": null,
    "approved_at": null,
    "created_at": "2026-05-16T12:51:36.000Z",
    "updated_at": "2026-05-16T12:55:16.000Z",
    "deleted_at": null
  }
}
```

## Delete Property (Owner only)

```text
DELETE /properties/:propertyId
```

Authentication: Required.

Success Response:

```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": null
}
```

## Get My Properties (Owner only)

```text
GET /properties/my
```

Authentication: Required.

Success Response

```json
{
  "success": true,
  "message": "My properties fetched successfully",
  "data": [
    {
      "id": 5,
      "property_name": "testuser10",
      "city": "Sihanoukville",
      "province": "Phnom Penh",
      "category_name": "Hotel",
      "status_name": "approved",
      "cover_image": "/uploads/properties/1778656995334-148532588.png",
      "created_at": "2026-05-13T07:19:23.000Z"
    }
  ]
}
```

## Get My Property By Id (Owner only)

```text
GET /properties/my/:propertyId
```

Authentication: Required.

Success Response:

```json
{
  "success": true,
  "message": "get my property successfully",
  "data": {
    "id": 5,
    "property_name": "testuser10",
    "description": "A luxurious beachfront resort with infinity pool, spa, and fine dining. Perfect for family vacations and romantic getaways.",
    "address": "Street 123, Sangkat 4, Group 5",
    "city": "Sihanoukville",
    "province": "Phnom Penh",
    "country": "Cambodia",
    "latitude": "10.63456780",
    "longitude": "103.49723450",
    "contact_phone": "+855 12 345 678",
    "contact_email": "reservations@sunsetbeach.com",
    "created_at": "2026-05-13T07:19:23.000Z",
    "updated_at": "2026-05-13T07:20:49.000Z",
    "status_id": 2,
    "status_name": "approved",
    "category_id": 1,
    "category_name": "Hotel",
    "owner_id": 10,
    "full_name": "User10",
    "owner_phone": null,
    "owner_email": "user10@gmail.com"
  }
}
```

## Upload Property Images (Owner only)

```text
POST /api/properties/:propertyId/images
```

```text
form data:
key: images(max=10)
```

Authentication: Required.

success Response:

```json
{
  "success": true,
  "message": "Property images uploaded successfully",
  "data": [
    {
      "property_id": "5",
      "image_url": "/uploads/properties/1778936694009-974522482.png",
      "sort_order": 0
    }
  ]
}
```

## Delete Property Image (Owner only)

```text
DELETE properties/:propertyId/images/:imageId
```

Authentication: Required.

```json
{
  "success": true,
  "message": "Property image deleted successfully",
  "data": null
}
```

## Set Cover Image Property (Owner only)

```text
PATCH properties/:propertyId/images/:imageId/cover
```

Authentication: Required.

Success Response:

```json
{
  "success": true,
  "message": "Cover image updated successfully",
  "data": null
}
```

## Sort Images Property (Owner only)

```text
PATCH /properties/:propertyId/images/sort
```

Authentication: Required.

body:

```json
[
  {
    "image_id": 6,
    "sort_order": 1
  },

  {
    "image_id": 5,
    "sort_order": 2
  }
]
```

Success Response:

```json
{
  "success": true,
  "message": "Image sort updated successfully",
  "data": null
}
```

## Get All Images Property (public)

```text
GET properties/:propertyId/images
```

Authentication: No required.

Success Response:

```json
{
  "success": true,
  "message": "Property images fetched successfully",
  "data": [
    {
      "id": 7,
      "image_url": "/uploads/properties/1778936694009-974522482.png",
      "is_cover": 0,
      "sort_order": 0
    }
  ]
}
```
