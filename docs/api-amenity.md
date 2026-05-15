### Amenities Endpoints

## Get All Amenities (Public)

````text
GET /amenities
````
Authentication: Not required.

success response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "WiFi"
    },
    {
      "id": 2,
      "name": "Swimming Pool"
    }
  ]
}
```

## Get Property Amenities (Public)

```text
GET /amenities/properties/:propertyId/amenities
```
Authentication: Not required.

success response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "WiFi"
    }
  ]
}

```

## Update Property Amenities (Owner)

```text 
PUT /amenities/properties/:propertyId/amenities
```

Requires authentication.

Body :

```json
{
  "amenity_ids": [1, 2, 3]
}
```