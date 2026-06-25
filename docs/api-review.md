### Reviews Endpoints

## Create Review (Customer)

```text
POST /reviews/reservations/:reservationId/reviews
```

Body:

```json
{
  "rating": 5,
  "comment": "Very clean room and friendly staff"
}
```

## Get Property Reviews (Public)

```text
GET /reviews/properties/:propertyId/reviews
```

Authentication: Not required.

Body:

```json
{
  "id": 1,
  "rating": 5,
  "comment": "Very clean room and friendly staff",
  "customer_name": "John Doe",
  "created_at": "2026-05-10T10:00:00.000Z"
}
```

## Update Review (Customer)

```text
PATCH /reviews/:id
```

Requires authentication.

Body:

```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

## Delete Review (Customer)

```text
DELETE /reviews/:id
```

Requires authentication.

Success response:

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```

## Get All Reviews (Admin)

```text
GET /reviews/admin/reviews
```

Requires authentication.

success response:

````json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Great stay!",
      "customer_id": 3,
      "property_id": 2,
      "created_at": "2026-05-10T10:00:00.000Z"
    }
  ]
}
````

## Get Owner Reviews (Owner)

```text
GET /reviews/owner
```

Requires authentication (Role: `OWNER`).

success response:

```json
{
  "success": true,
  "message": "Owner reviews fetched successfully",
  "data": [
    {
      "id": 1,
      "reservation_id": 101,
      "property_id": 2,
      "customer_id": 3,
      "rating": 5,
      "comment": "Excellent property and wonderful host!",
      "owner_reply": "Thank you so much! We hope to host you again.",
      "replied_by": 2,
      "replied_at": "2026-05-11T09:30:00.000Z",
      "created_at": "2026-05-10T10:00:00.000Z",
      "property_name": "Sunset Villa",
      "room_name": "Deluxe Sea View",
      "customer_name": "Jane Smith",
      "check_in_date": "2026-05-01T14:00:00.000Z",
      "check_out_date": "2026-05-05T12:00:00.000Z"
    }
  ]
}
```

## Reply to Review (Owner)

```text
PATCH /reviews/:id/reply
```

Requires authentication (Role: `OWNER` or `ADMIN`). Only the owner of the property associated with the review can submit a reply.

Body:

```json
{
  "owner_reply": "Thank you for choosing to stay with us! We appreciate your wonderful feedback."
}
```

success response:

```json
{
  "success": true,
  "message": "Review replied successfully",
  "data": {
    "id": 1,
    "reservation_id": 101,
    "property_id": 2,
    "customer_id": 3,
    "rating": 5,
    "comment": "Excellent property and wonderful host!",
    "owner_reply": "Thank you for choosing to stay with us! We appreciate your wonderful feedback.",
    "replied_by": 2,
    "replied_at": "2026-05-11T12:00:00.000Z",
    "created_at": "2026-05-10T10:00:00.000Z",
    "property_name": "Sunset Villa",
    "owner_id": 2,
    "room_name": "Deluxe Sea View",
    "check_in_date": "2026-05-01T14:00:00.000Z",
    "check_out_date": "2026-05-05T12:00:00.000Z"
  }
}
```