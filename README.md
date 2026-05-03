# SrokYerng Booking Backend

Backend API for an accommodation booking platform (customers, owners, admins).

## Current Scope

- Implemented: `auth` module (`register`, `login`, auth middleware, role middleware)
- Scaffolded only: `users`, `properties`, `rooms`, `reservations`, `payments`, `reviews`, `amenities`, `admin`
- Module status reference: `docs/module-status.md`

## Tech Stack

- Node.js + Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- Password hashing (`bcrypt`)

## Project Structure

```text
src/
  app.js
  server.js
  config/
  constants/
  middleware/
  modules/
  routes/
  utils/
  database/
```

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- MySQL 8+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `ADMIN_FULL_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

4. Create database schema and seed base data:

- Run SQL in `src/database/schema.sql`
- Run SQL in `src/database/seeders/001-roles.seed.sql`
- Run SQL in `src/database/seeders/002-account-statuses.seed.sql`
- Run SQL in `src/database/seeders/003-categories.seed.sql`
- Run SQL in `src/database/seeders/004-property-statuses.seed.sql`
- Run SQL in `src/database/seeders/005-room-types.seed.sql`
- Run SQL in `src/database/seeders/006-payment-methods.seed.sql`
- Run SQL in `src/database/seeders/007-payment-statuses.seed.sql`
- Run SQL in `src/database/seeders/008-amenities.seed.sql`

5. Create the first admin account:

```bash
npm run seed:admin
```

## Run

- Development:

```bash
npm run dev
```

- Production mode:

```bash
npm start
```

## API Base URL

- Local: `http://localhost:<PORT>/api`

## Implemented Endpoints

- `GET /health` (under `/api`)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)
- `GET /auth/admin-only` (requires admin role)

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

## Quality Commands

- Run tests:

```bash
npm test
```

- Lint:

```bash
npm run lint
```

- Format:

```bash
npm run format
```

- Check formatting:

```bash
npm run format:check
```

## Smoke Tests

`test/auth.smoke.test.js` currently verifies:

- register validation failure path (`400`)
- login validation failure path (`400`)
- protected route without token (`401`)

## Team Notes

- Keep module layering consistent: `routes -> controller -> service -> model`.
- Add validation for every write endpoint.
- Add endpoint tests for each new module before enabling its route in `src/routes/index.js`.
