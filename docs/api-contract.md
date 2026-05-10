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
  "token": "<jwt>",
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

### Customer Protected Check

```text
GET /auth/customer-only
```

Requires:

- authenticated user
- `customer` role

### Owner Protected Check

```text
GET /auth/owner-only
```

Requires:

- authenticated user
- `owner` role

### Admin Protected Check

```text
GET /auth/admin-only
```

Requires:

- authenticated user
- `admin` role
