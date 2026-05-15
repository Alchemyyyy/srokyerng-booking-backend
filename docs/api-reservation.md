## Reservation Endpoints

### Check Availability

```text
GET /reservations/availability
```

No authentication required.

Query parameters:

- `room_id`: Room ID (required)
- `check_in_date`: ISO date (required)
- `check_out_date`: ISO date (required)

Returns:

```json
{
  "success": true,
  "message": "Availability checked",
  "data": {
    "isAvailable": true,
    "availableRooms": 2,
    "bookedCount": 1,
    "totalRooms": 3
  }
}
```

### Create Reservation

```text
POST /reservations
```

Requires authentication and `customer` role.

Body:

```json
{
  "room_id": 1,
  "check_in_date": "2026-05-20",
  "check_out_date": "2026-05-25",
  "total_guests": 2,
  "special_request": "High floor preferred"
}
```

Returns:

```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": 1,
    "customer_id": 5,
    "room_id": 1,
    "check_in_date": "2026-05-20",
    "check_out_date": "2026-05-25",
    "total_guests": 2,
    "total_nights": 5,
    "total_amount": 500.0,
    "reservation_status": "pending",
    "special_request": "High floor preferred",
    "created_at": "2026-05-14T10:00:00.000Z"
  }
}
```

### Get My Reservations

```text
GET /reservations/my
```

Requires authentication and `customer` role.

Query parameters:

- `status`: Filter by status (`pending`, `confirmed`, `cancelled`, `completed`)

Returns:

```json
{
  "success": true,
  "message": "Your reservations retrieved successfully",
  "data": [
    {
      "id": 1,
      "room_id": 1,
      "check_in_date": "2026-05-20",
      "check_out_date": "2026-05-25",
      "total_guests": 2,
      "total_nights": 5,
      "total_amount": 500.0,
      "reservation_status": "confirmed",
      "room_name": "Deluxe Suite",
      "property_name": "Ocean View Hotel",
      "property_id": 1
    }
  ]
}
```

### Get Reservation by ID

```text
GET /reservations/:id
```

Requires authentication.

Returns:

```json
{
  "success": true,
  "message": "Reservation retrieved successfully",
  "data": {
    "id": 1,
    "customer_id": 5,
    "room_id": 1,
    "check_in_date": "2026-05-20",
    "check_out_date": "2026-05-25",
    "total_guests": 2,
    "total_nights": 5,
    "total_amount": 500.0,
    "reservation_status": "confirmed",
    "special_request": "High floor preferred",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "0123456789",
    "room_name": "Deluxe Suite",
    "price_per_night": 100.0,
    "max_guests": 4,
    "property_id": 1,
    "property_name": "Ocean View Hotel",
    "owner_id": 2,
    "owner_name": "Property Owner"
  }
}
```

### Cancel Reservation

```text
PATCH /reservations/:id/cancel
```

Requires authentication and `customer` role.

Body:

```json
{
  "cancellation_reason": "Personal reasons"
}
```

Restrictions:

- Cannot cancel after the check-in date has passed
- Cannot cancel already cancelled or completed reservations
- Only cancellable statuses: `pending`, `confirmed`

Returns:

```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "data": {
    "id": 1,
    "reservation_status": "cancelled"
  }
}
```

### Owner Reservation Endpoints

#### List Owner Reservations

```text
GET /owner/reservations
```

Requires authentication and `owner` role.

Query parameters:

- `status`: Filter by status (`pending`, `confirmed`, `cancelled`, `completed`)
- `property_id`: Filter by property ID

Returns:

```json
{
  "success": true,
  "message": "Owner reservations retrieved successfully",
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "room_id": 1,
      "check_in_date": "2026-05-20",
      "check_out_date": "2026-05-25",
      "total_guests": 2,
      "total_nights": 5,
      "total_amount": 500.0,
      "reservation_status": "confirmed",
      "room_name": "Deluxe Suite",
      "property_name": "Ocean View Hotel",
      "property_id": 1,
      "customer_name": "John Doe",
      "customer_email": "john@example.com"
    }
  ]
}
```

### Admin Reservation Endpoints

#### List All Reservations

```text
GET /admin/reservations
```

Requires authentication and `admin` role.

Query parameters:

- `status`: Filter by status (`pending`, `confirmed`, `cancelled`, `completed`)
- `property_id`: Filter by property ID
- `owner_id`: Filter by owner ID

Returns:

```json
{
  "success": true,
  "message": "All reservations retrieved successfully",
  "data": [
    {
      "id": 1,
      "customer_id": 5,
      "room_id": 1,
      "check_in_date": "2026-05-20",
      "check_out_date": "2026-05-25",
      "total_guests": 2,
      "total_nights": 5,
      "total_amount": 500.0,
      "reservation_status": "confirmed",
      "room_name": "Deluxe Suite",
      "property_name": "Ocean View Hotel",
      "property_id": 1,
      "owner_id": 2,
      "owner_name": "Property Owner"
    }
  ]
}
```

#### Update Reservation Status

```text
PATCH /admin/reservations/:id/status
```

Requires authentication and `admin` role.

Body:

```json
{
  "status": "confirmed"
}
```

Returns:

```json
{
  "success": true,
  "message": "Reservation status updated successfully",
  "data": {
    "id": 1,
    "reservation_status": "confirmed"
  }
}
```

### Reservation Status Values

- `pending`
- `confirmed`
- `cancelled`
- `completed`