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