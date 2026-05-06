# Backend Module Ownership

This backend uses intentional module scaffolding. Empty module files mean the module path is reserved and ready for the assigned owner.

## Ownership

- **Sambath(M):** database schema, seed data, auth module, users module, auth/role contract, shared middleware, API structure review, final merge review
- **MengHour:** `properties`, `rooms`, property images, room images, owner payment accounts APIs
- **Visal:** `reservations`, availability checks, booking calculation, cancellation/update rules, `payments`, payment proof flow, payment verification APIs
- **Leakhena:** `reviews`, `amenities`, property approval APIs, user moderation support
- **Frontend-aligned Support:** confirm API response structure, endpoint contracts, request/response format, and integration requirements with frontend members before implementation

## Module Rules

- Put feature-specific backend code inside `src/modules/<module>`.
- Keep shared middleware in `src/middleware`.
- Keep shared utilities in `src/utils`.
- Keep shared constants in `src/constants`.
- Keep database schema and seed changes under `src/database`.

## Scaffold Policy

- Scaffolded modules are not production-ready.
- Before enabling a module route in `src/routes/index.js`, complete the route, controller, service, model, validation, and tests.
- Do not delete scaffold files unless the module is removed from product scope.
- Schema, seed, auth, and role changes must be reviewed by the team lead.

## API Contract Rule

Before frontend integration, each active module should document:

- endpoint path
- HTTP method
- required role
- request body/query params
- success response shape
- expected error cases
