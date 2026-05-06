# Backend Rules

These rules keep the Express API consistent while multiple teammates work in parallel.

## Module Structure

- Put route definitions in `src/modules/<module>/<module>.routes.js`.
- Put HTTP request/response logic in `controller` files.
- Put business rules in `service` files.
- Put SQL queries in `model` files.
- Put request validation in `validation` files.
- Keep shared helpers in `src/utils`, `src/middleware`, or `src/constants`.

## Route Rules

- Register active module routes in `src/routes/index.js`.
- Do not enable scaffolded routes until controller, service, model, validation, and tests exist.
- Protected routes must use `authMiddleware`.
- Role-protected routes must use `roleMiddleware(...)` with constants from `src/constants/roles.js`.
- Keep route paths resource-based, for example `/properties`, `/rooms`, `/reservations`.

## Controller Rules

- Wrap async controllers with `asyncHandler`.
- Validate input before calling services.
- Use `successResponse` and `errorResponse` for consistent response shape.
- Do not write SQL in controllers.
- Do not put business decisions in controllers.

## Service Rules

- Services own business logic and permission decisions for their module.
- Services may call one or more model functions.
- Throw errors with `statusCode` for expected failures.
- Do not send Express responses from services.

## Model Rules

- Models own SQL only.
- Use parameterized queries; never concatenate user input into SQL.
- Import the MySQL pool from `src/config/db.js`.
- Return plain data to services.

## Validation Rules

- Every write endpoint must validate required fields and allowed values.
- Normalize email and string inputs at the boundary.
- Reuse constants for roles/statuses instead of hardcoded strings.

## Auth And Roles

- `customer` and `owner` can self-register.
- `admin` must be created through `npm run seed:admin`, not public registration.
- Use `req.user` only after `authMiddleware`.
- Use fresh database reads when an endpoint needs current role/status/profile data.

## Database Rules

- `schema.sql` is the fresh database source of truth.
- Seed reference data through ordered files in `src/database/seeders`.
- Add or change seed files carefully; they should be safe to rerun.
- Schema or seed changes require team lead review.

## Error Rules

- Expected client errors should throw a clear message and `statusCode`.
- Unexpected server errors should not expose internal details.
- Global error handling belongs in `src/middleware/error.middleware.js`.

## Testing Rules

- Add smoke tests for new public or protected endpoints.
- At minimum, test validation failures, unauthorized access, and successful happy path when practical.
- Run `npm run lint` and `npm test` before opening a PR.
