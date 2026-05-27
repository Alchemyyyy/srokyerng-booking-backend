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
GET /properties/1/amenities
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
PUT /properties/1/amenities
```

Requires authentication.

Body :

```json
{
  "amenity_ids": [1, 2, 3]
}
```