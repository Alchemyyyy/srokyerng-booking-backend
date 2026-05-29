## Get room images (public)

```text
GET /api/rooms/:roomId/images
```

Authorization: not required

success response:

```json
{
  "success": true,
  "message": "Room images fetched successfully",
  "data": [
    {
      "id": 15,
      "room_id": 8,
      "image_url": "/uploads/rooms/1779785180569-634811745.png",
      "is_cover": 0,
      "sort_order": 1,
      "created_at": "2026-05-26T08:46:20.000Z"
    }
  ]
}
```

## Upload room images (owner)

```text
POST /api/rooms/:roomId/images
```

Authorization: required
body:form data(key:images),max =10
success response:

```json
{
  "success": true,
  "message": "Room images uploaded successfully",
  "data": [
    {
      "room_id": "8",
      "image_url": "/uploads/rooms/1779785180569-634811745.png",
      "sort_order": 1
    }
  ]
}
```

## Set room cover-image(owner)

```text
PATCH /api/rooms/:roomId/images/:imageId/cover
```

Authorization: required

success response:

```json
{
  "success": true,
  "message": "Room cover image updated successfully",
  "data": null
}
```

## Sort room images (owner)

```text
PATCH /api/rooms/:roomId/images/sort
```

Authorization: required

body:

```json
[
  {
    "image_id": 15,
    "sort_order": 2
  }
]
```

success response:

```json
{
  "success": true,
  "message": "Room image sort updated successfully",
  "data": null
}
```

## Delete room image (owner)

```text
DELETE /api/rooms/:roomId/images/:imageId
```

Authorization: required
success response:

```json
{
  "success": true,
  "message": "Room image deleted successfully",
  "data": null
}
```

## Check room availability (public)

```text
GET /api/properties/8/availability?check_in_date=2026-06-01&check_out_date=2026-06-03&guests=2
```

check_in_date >= Now

Authorization: not required

success response:

```json
{
  "success": true,
  "message": "Room availability checked successfully",
  "data": {
    "room_id": 1,
    "room_name": "Deluxe Room",
    "total_rooms": 10,
    "booked_rooms": 1,
    "available_rooms": 9,
    "is_available": true,
    "check_in_date": "2026-05-27",
    "check_out_date": "2026-05-30",
    "guests": 2
  }
}
```

## Check property availability(public)

```text
GET /api/properties/8/availability?check_in_date=2026-06-01&check_out_date=2026-06-03&guests=2
```

Authorization: not required

success response:

```json
{
  "success": true,
  "message": "Property availability checked successfully",
  "data": [
    {
      "room_id": 4,
      "room_name": "VIP Room",
      "room_type": "Standard",
      "price_per_night": "50.00",
      "max_guests": 2,
      "available_rooms": 5,
      "cover_image": null
    }
  ]
}
```
