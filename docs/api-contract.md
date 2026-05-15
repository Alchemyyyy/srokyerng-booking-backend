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

-----------------------------------------------------

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
-----------------------------------------------------

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

