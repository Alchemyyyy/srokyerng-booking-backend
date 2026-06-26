# Cancellation & Refund API

## Route Summary

Customer:

- `GET /reservations/:id/cancellation-policy` — View cancellation policy
- `GET /reservations/refund-requests/my` - View my request refund 
- `PATCH /reservations/:id/cancel` — Cancel reservation
- `POST /reservations/:id/refund-request` — Request refund by reservation

Owner:

- `PATCH /owner/payments/:id/refund` — Directly refund a payment
- `GET /owner/refund-requests` — List refund requests
- `GET /owner/refund-requests/:id` — detail refund requests
- `GET /owner/refund-requests/pending` — List pending refund requests
- `PATCH /owner/refund-requests/:id/approve` — Approve refund request
- `PATCH /owner/refund-requests/:id/reject` — Reject refund request

Admin:

- `GET /admin/refund-requests` — List pending refund requests
- `PATCH /admin/refund-requests/:id/approve` — Approve refund request
- `PATCH /admin/refund-requests/:id/reject` — Reject refund request

---

## Customer Endpoints

### Get Cancellation Policy

```text
GET /reservations/:id/cancellation-policy
```

Requires authentication.

Access control:

- The customer who owns the reservation
- The property owner
- Admin users

Returns detailed cancellation policy and eligibility for a specific reservation.

Success response:

```json
{
  "success": true,
  "message": "Cancellation policy retrieved successfully",
  "data": {
    "reservation_id": 1,
    "reservation_status": "confirmed",
    "check_in_date": "2026-07-01",
    "cancellation_deadline_hours": 24,
    "cancellation_eligibility": {
      "can_cancel": true,
      "reasons": [],
      "deadline": "2026-06-30T00:00:00.000Z",
      "hours_until_deadline": 9,
      "status": "confirmed"
    },
    "policy_summary": {
      "description": "Cancellation is allowed up to 24 hours before check-in",
      "full_refund_deadline": "2026-06-30T00:00:00.000Z",
      "late_cancellation_refund_percentage": 50,
      "non_refundable_after": "24 hours before check-in"
    }
  }
}
```

If the reservation cannot be cancelled (already cancelled, past check-in, or passed deadline), `cancellation_eligibility.can_cancel` will be `false` with a list of `reasons`.

### Cancel Reservation

```text
PATCH /reservations/:id/cancel
```

Requires authentication and `customer` role.

Body:

```json
{
  "cancellation_reason": "My travel plans changed"
}
```

Notes:

- `cancellation_reason` is optional. Defaults to `"Cancelled by customer"`.
- Customer can only cancel their own reservation.
- Only cancellable statuses: `pending`, `confirmed`.
- Cannot cancel after check-in date has passed.
- Cannot cancel already cancelled or completed reservations.

Success response:

```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "data": {
    "id": 1,
    "reservation_status": "cancelled",
    "cancellation_reason": "My travel plans changed"
  }
}
```

### View My Refund Requests

```text
GET /reservations/refund-requests/my
```

Requires authentication and `customer` role.

Query parameters:

- `limit` — max results (default 50, max 100)

Returns all refund requests made by the authenticated customer, ordered by most recent first.

Success response:

```json
{
  "success": true,
  "message": "Refund requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "payment_id": 100,
      "amount": 400.00,
      "reason": "I cancelled my reservation and would like a full refund",
      "refund_status": "requested",
      "requested_at": "2026-06-04T05:00:00.000Z",
      "handled_at": null
    }
  ]
}
```

### Request Refund by Reservation

```text
POST /reservations/:id/refund-request
```

Requires authentication and `customer` role.

Request body:

```json
{
  "amount": 400.00,
  "reason": "I cancelled my reservation and would like a full refund"
}
```

Notes:

- `amount` is required, must be positive and cannot exceed the payment amount.
- `reason` is required, between 10 and 500 characters.
- Looks up the payment associated with the reservation automatically.
- Only `paid` payments are eligible for refund request.
- Customer can only request refunds for their own reservations.
- Duplicate pending refund requests are rejected.

Success response (201):

```json
{
  "success": true,
  "message": "Refund request created successfully",
  "data": {
    "id": 1,
    "payment_id": 100,
    "requested_by": 10,
    "amount": 400.00,
    "reason": "I cancelled my reservation and would like a full refund",
    "refund_status": "requested",
    "requested_at": "2026-06-04T05:00:00.000Z"
  }
}
```

---

## Owner Endpoints

### Refund Payment

```text
PATCH /owner/payments/:id/refund
```

Requires authentication and `owner` role.

Allowed transition:

- `paid` → `refunded`

Request body (optional):

```json
{
  "notes": "Customer cancelled before check-in"
}
```

Marks the payment as refunded. The reservation must already be in `cancelled` status before refunding.

Success response:

```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "id": 10,
    "payment_status": "refunded",
    "paid_at": "2026-05-21T10:00:00.000Z",
    "refunded_at": "2026-05-22T08:00:00.000Z"
  }
}
```

### List Refund Requests

```text
GET /owner/refund-requests
```

Requires authentication and `owner` role.

Query parameters:

- `limit` — max results (default 50, max 100)

Returns refund requests for properties owned by the authenticated owner.

Success response:

```json
{
  "success": true,
  "message": "Refund requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "payment_id": 100,
      "payment_amount": 400.00,
      "reservation_id": 1,
      "customer_name": "John Doe",
      "property_name": "Ocean View Hotel",
      "room_name": "Deluxe Suite",
      "check_in_date": "2026-07-01",
      "check_out_date": "2026-07-05",
      "reservation_status": "cancelled",
      "amount": 400.00,
      "reason": "I cancelled my reservation and would like a full refund",
      "refund_status": "requested",
      "requested_at": "2026-06-04T05:00:00.000Z",
      "handled_at": null
    }
  ]
}
```

### List Pending Refund Requests

```text
GET /owner/refund-requests/pending
```

Requires authentication and `owner` role.

Query parameters:

- `limit` — max results (default 50, max 100)

Returns only refund requests with status `requested` for the owner's properties.

Success response same structure as above, filtered to `refund_status: "requested"`.

### View Refund Request Detail

```text
GET /owner/refund-requests/:id
```

Requires authentication and `owner` role.

Returns detailed information about a specific refund request for a property owned by the authenticated owner.

Access control:

- The refund request must belong to one of the owner's properties.

Success response:

```json
{
  "success": true,
  "message": "Refund request retrieved successfully",
  "data": {
    "id": 1,
    "payment_id": 100,
    "payment_amount": 400.00,
    "reservation_id": 1,
    "customer_name": "John Doe",
    "property_name": "Ocean View Hotel",
    "room_name": "Deluxe Suite",
    "check_in_date": "2026-07-01",
    "check_out_date": "2026-07-05",
    "reservation_status": "cancelled",
    "amount": 400.00,
    "reason": "I cancelled my reservation and would like a full refund",
    "refund_status": "requested",
    "decision_note": null,
    "requested_at": "2026-06-04T05:00:00.000Z",
    "handled_at": null
  }
}
```

### Approve Refund Request

```text
PATCH /owner/refund-requests/:id/approve
```

Requires authentication and `owner` role.

Notes:

- Only `requested` refund requests can be approved.
- The refund request must belong to one of the owner's properties.
- The associated payment must be in `paid` status.
- Approving also transitions the payment status to `refunded`.

Success response:

```json
{
  "success": true,
  "message": "Refund request approved successfully",
  "data": {
    "id": 1,
    "payment_id": 100,
    "refund_status": "approved",
    "handled_by": 20,
    "handled_at": "2026-06-04T05:30:00.000Z"
  }
}
```

### Reject Refund Request

```text
PATCH /owner/refund-requests/:id/reject
```

Requires authentication and `owner` role.

Request body (optional):

```json
{
  "decision_note": "Refund not applicable for this case"
}
```

Notes:

- Only `requested` refund requests can be rejected.
- The refund request must belong to one of the owner's properties.

Success response:

```json
{
  "success": true,
  "message": "Refund request rejected successfully",
  "data": {
    "id": 2,
    "payment_id": 101,
    "refund_status": "rejected",
    "handled_by": 20,
    "handled_at": "2026-06-04T05:35:00.000Z"
  }
}
```

---

## Admin Endpoints

### List Pending Refund Requests

```text
GET /admin/refund-requests
```

Requires authentication and `admin` role.

Query parameters:

- `limit` — max results (default 50, max 100)

Returns all refund requests with status `requested` for audit and review.

Success response:

```json
{
  "success": true,
  "message": "Pending refund requests retrieved successfully",
  "data": [
    {
      "id": 3,
      "payment_id": 102,
      "requested_by": 10,
      "amount": 500.00,
      "reason": "I need a refund for my cancelled booking",
      "refund_status": "requested",
      "requested_at": "2026-06-04T06:00:00.000Z"
    }
  ]
}
```

### Approve Refund Request

```text
PATCH /admin/refund-requests/:id/approve
```

Requires authentication and `admin` role.

Request body (optional):

```json
{
  "decision_note": "Admin approved - valid cancellation"
}
```

Notes:

- Only pending refund requests can be approved.
- The associated payment must be in `paid` status.
- Approving also transitions the payment status to `refunded`.

Success response:

```json
{
  "success": true,
  "message": "Refund request approved successfully",
  "data": {
    "id": 3,
    "payment_id": 102,
    "refund_status": "approved",
    "handled_by": 1,
    "handled_at": "2026-06-04T07:00:00.000Z"
  }
}
```

### Reject Refund Request

```text
PATCH /admin/refund-requests/:id/reject
```

Requires authentication and `admin` role.

Request body (optional):

```json
{
  "decision_note": "Refund policy does not apply"
}
```

Notes:

- Only pending refund requests can be rejected.

Success response:

```json
{
  "success": true,
  "message": "Refund request rejected successfully",
  "data": {
    "id": 4,
    "payment_id": 103,
    "refund_status": "rejected",
    "handled_by": 1,
    "handled_at": "2026-06-04T07:05:00.000Z"
  }
}
```

---

## Status Values

### Reservation Statuses

- `pending`
- `confirmed`
- `cancelled`
- `completed`

### Refund Request Statuses

- `requested`
- `approved`
- `rejected`

### Payment Statuses

- `pending` — Payment created, awaiting receipt upload
- `submitted` — Receipt uploaded, awaiting owner verification
- `paid` — Owner verified payment
- `failed` — Owner rejected payment
- `refunded` — Refund processed

## Business Rules

1. **Cancellation deadline:** 24 hours before check-in date.
2. **Cancellable statuses:** `pending`, `confirmed`.
3. **Full refund (100%):** When cancelled before the 24-hour deadline.
4. **Partial refund (50%):** When cancelled after the deadline but before check-in.
5. **Refund eligibility:** Only `paid` payments can be refunded.
6. **Refund requires cancellation:** Reservation must be `cancelled` before refund.
7. **Owner scope:** Owners can only manage refunds for their own properties.
8. **Admin scope:** Admins can view and process all refund requests.