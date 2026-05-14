# API Contract

Base URL:

```text
http://localhost:<PORT>/api
```

## Response Shape

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

## Auth Header

Protected routes require:

```text
Authorization: Bearer <token>
```

## Roles

Final role values:

- `customer`: books accommodations
- `owner`: manages properties and rooms
- `admin`: manages system approvals and verification

`admin` users are created with `npm run seed:admin`, not public registration.

## Auth Endpoints

### Register

```text
POST /auth/register
```

Allowed roles:

- `customer`
- `owner`

Body:

```json
{
  "full_name": "Customer User",
  "email": "customer@example.com",
  "password": "password123",
  "phone": "012345678",
  "role": "customer"
}
```

### Login

```text
POST /auth/login
```

Body:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Returns:

```json
{
  "access_token": "<jwt>",
  "user": {
    "id": 1,
    "full_name": "Customer User",
    "email": "customer@example.com",
    "phone": "012345678",
    "role": "customer",
    "status": "active",
    "profile_image_url": null
  }
}
```

Also sets an HttpOnly refresh-token cookie:

```text
Set-Cookie: refresh_token=<opaque-refresh-token>; HttpOnly; SameSite=Lax; Path=/api/auth
```

Use `access_token` in the `Authorization: Bearer <token>` header. The refresh token is stored in the HttpOnly cookie and is not readable by frontend JavaScript.

Browser clients must include credentials when calling login, refresh, and logout:

```js
fetch(url, {
  credentials: "include",
});
```

### Refresh Token

```text
POST /auth/refresh-token
```

Requires the `refresh_token` cookie. Frontend requests must include credentials.

Returns:

```json
{
  "access_token": "<new-jwt>",
  "user": {
    "id": 1,
    "full_name": "Customer User",
    "email": "customer@example.com",
    "phone": "012345678",
    "role": "customer",
    "status": "active",
    "profile_image_url": null
  }
}
```

### Current User

```text
GET /auth/me
```

Requires authentication.

Returns the current active user from the database:

```json
{
  "id": 1,
  "full_name": "Customer User",
  "email": "customer@example.com",
  "phone": "012345678",
  "role": "customer",
  "status": "active",
  "profile_image_url": null,
  "last_login": "2026-05-10T10:00:00.000Z",
  "email_verified_at": null
}
```

### Logout

```text
POST /auth/logout
```

Requires authentication.

Requires the `refresh_token` cookie. Frontend requests must include credentials.

Revokes the refresh token in the database and clears the refresh-token cookie. Clients should also remove the in-memory access token after a successful logout response.

### Forgot Password

```text
POST /auth/forgot-password
```

Body:

```json
{
  "email": "customer@example.com"
}
```

Always returns a generic success message so unknown emails are not exposed:

```json
{
  "success": true,
  "message": "If an account exists for this email, a password reset link has been sent",
  "data": null
}
```

Sends a real email using SMTP settings from `.env`. The reset link points to:

```text
<FRONTEND_URL>/reset-password?token=<token>
```

### Reset Password

```text
POST /auth/reset-password
```

Body:

```json
{
  "token": "<token-from-email>",
  "password": "newpassword123"
}
```

Reset tokens expire after 1 hour and can be used once.

## User Endpoints

All user endpoints require authentication.

### List Users

```text
GET /users
```

Requires `admin` role.

Query parameters:

- `role`: `customer`, `owner`, or `admin`
- `status`: `active` or `suspended`
- `search`: matches full name, email, or phone
- `page`: defaults to `1`
- `limit`: defaults to `20`, max `100`

Returns:

```json
{
  "users": [
    {
      "id": 1,
      "full_name": "Customer User",
      "email": "customer@example.com",
      "phone": "012345678",
      "role": "customer",
      "status": "active",
      "profile_image_url": null,
      "gender": null,
      "date_of_birth": null,
      "address": null,
      "last_login": "2026-05-10T10:00:00.000Z",
      "email_verified_at": null,
      "created_at": "2026-05-01T10:00:00.000Z",
      "updated_at": "2026-05-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### User Detail

```text
GET /users/:id
```

Requires `admin` role.

### Update User Status

```text
PATCH /users/:id/status
```

Requires `admin` role.

Body:

```json
{
  "status": "suspended"
}
```

Allowed status values:

- `active`
- `suspended`

### My Profile

```text
GET /users/me
```

Returns the current active user's account and profile data:

```json
{
  "id": 1,
  "full_name": "Customer User",
  "email": "customer@example.com",
  "phone": "012345678",
  "role": "customer",
  "status": "active",
  "profile_image_url": null,
  "gender": null,
  "date_of_birth": null,
  "address": null,
  "last_login": "2026-05-10T10:00:00.000Z",
  "email_verified_at": null
}
```

### Update My Profile

```text
PATCH /users/me
```

Body supports partial updates:

```json
{
  "full_name": "Updated User",
  "phone": "012345678",
  "profile_image_url": "https://example.com/profile.jpg",
  "gender": "female",
  "date_of_birth": "2000-01-31",
  "address": "Phnom Penh"
}
```

Optional nullable fields can be sent as `null` or an empty string to clear them.

### Change My Password

```text
PATCH /users/me/password
```

Body:

```json
{
  "current_password": "password123",
  "new_password": "newpassword123"
}
```

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
