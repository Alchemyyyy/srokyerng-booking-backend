# Payment API

## Route Summary

Customer:

- `POST /payments`
- `GET /payments/my`
- `GET /payments/:id`
- `POST /payments/:id/receipt`
- `POST /payments/:id/proof`
- `PATCH /payments/:id/proof`
- `GET /payments/:id/proof`
- `GET /payments/reservation/:id/owner-payment-accounts`

Owner:

- `GET /owner/payments`
- `GET /owner/payments/:id`
- `PATCH /owner/payments/:id/verify`
- `PATCH /owner/payments/:id/reject`
- `PATCH /owner/payments/:id/refund`

Admin:

- `GET /admin/payments`
- `GET /admin/payments/:id`
- `GET /admin/payments/:id/proof`
- `GET /admin/payments/pending-verification`

---

## Customer Endpoints

### Create Payment

```text
POST /payments
```

Requires authentication and `customer` role.

Request body:

```json
{
  "reservation_id": 1,
  "payment_method_id": 2,
  "transaction_reference": "TXN-ABC123"
}
```

Notes:

- `reservation_id` must belong to the authenticated customer.
- `payment_method_id` must be an active payment method.
- `transaction_reference` is optional.
- Payment amount is loaded from `reservations.total_amount`.
- New payments are created with status `pending`.

Success response:

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    /* payment object */
  }
}
```

### Get My Payments

```text
GET /payments/my
```

Requires authentication and `customer` role.

Query parameters:

- `status` — filter by payment status (`pending`, `submitted`, `paid`, `failed`, `refunded`).

Returns the authenticated customer’s payments.

### Get Payment by ID

```text
GET /payments/:id
```

Requires authentication.

Access rules:

- `customer`: can only view their own payments.
- `owner`: can only view payments for their properties.
- `admin`: can view any payment.

Returns the payment detail object.

### Upload Receipt

```text
POST /payments/:id/receipt
```

Requires authentication and `customer` role.

Content-Type: `multipart/form-data`

Form field:

- `receipt` — receipt image file.

Allowed file types:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Limits:

- Max file size: 5 MB.
- Stored in `uploads/receipts/`.

Behavior:

- Allowed when payment status is `pending` or `submitted`.
- First successful upload transitions status from `pending` → `submitted`.
- Re-upload is allowed while the payment is still `pending` or `submitted`.

Returns the updated payment with `receipt_image_url` and `payment_status: "submitted"`.

### Upload or Replace Proof

```text
POST /payments/:id/proof
PATCH /payments/:id/proof
```

Requires authentication and `customer` role.

Content-Type: `multipart/form-data`

Form field:

- `receipt` — receipt image file.

These endpoints are alternate receipt upload paths and behave like `/receipt`.

### View Proof Details

```text
GET /payments/:id/proof
```

Requires authentication.

Access rules:

- `customer`: own payment only.
- `owner`: payments for their properties.
- `admin`: any payment.

Returns proof metadata including:

- `receipt_image_url`
- `payment_status`
- `rejection_reason`
- `verified_by`
- `verified_at`
- `paid_at`

### Get Reservation Owner Payment Accounts

```text
GET /payments/reservation/:id/owner-payment-accounts
```

Requires authentication and `customer` role.

Returns a list of owner payment account options for the reservation’s owner.

---

## Owner Endpoints

### Get Owner Payments

```text
GET /owner/payments
```

Requires authentication and `owner` role.

Query parameters:

- `status`
- `customer_id`
- `reservation_id`

Returns payments for properties owned by the authenticated owner.

### Get Owner Payment by ID

```text
GET /owner/payments/:id
```

Requires authentication and `owner` role.

Returns the payment detail when it belongs to the owner’s property.

### Get Owner Payments Pending Verification

```text
GET /owner/payments/pending-verification
```

Requires authentication and `owner` role.

Returns payments in `submitted` status that belong to the authenticated owner, suitable for review and verification.

Query parameters: none.

Success response:

```json
{
  "success": true,
  "message": "Owner pending verification payments retrieved successfully",
  "data": [
    /* array of payment objects with status "submitted" */
  ]
}
```

Errors:

- `401` — unauthenticated
- `403` — authenticated but not an owner

### Get Owner Payment Proof

```text
GET /owner/payments/:id/proof
```

Requires authentication and `owner` role.

Access rules:

- `owner`: can view proof for payments related to their own properties.

Returns proof metadata including:

- `receipt_image_url`
- `payment_status`
- `rejection_reason`
- `verified_by`
- `verified_at`
- `paid_at`

### Verify Payment

```text
PATCH /owner/payments/:id/verify
```

Requires authentication and `owner` role.

Allowed transition:

- `submitted` → `paid`

Request body (optional):

```json
{
  "notes": "Verified via ABA statement"
}
```

Behavior:

- Marks the payment as verified.
- Sets `paid_at` and `verified_by`.

### Reject Payment

```text
PATCH /owner/payments/:id/reject
```

Requires authentication and `owner` role.

Allowed transition:

- `submitted` → `failed`

Request body:

```json
{
  "rejection_reason": "Receipt image is unclear"
}
```

Notes:

- `rejection_reason` is required.
- The payment is marked as failed.

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

Marks the payment as refunded.

---

## Admin Endpoints

### Get All Payments

```text
GET /admin/payments
```

Requires authentication and `admin` role.

Query parameters:

- `status`
- `customer_id`
- `owner_id`

Returns all payments.

### Get Payment by ID

```text
GET /admin/payments/:id
```

Requires authentication and `admin` role.

Returns any payment by ID.

### Get Payment Proof

```text
GET /admin/payments/:id/proof
```

Requires authentication and `admin` role.

Returns proof metadata for any payment, including:

- `receipt_image_url`
- `payment_status`
- `rejection_reason`
- `verified_by`
- `verified_at`
- `paid_at`

### Get Payments Pending Verification

```text
GET /admin/payments/pending-verification
```

Requires authentication and `admin` role.

Returns payments with status `submitted`.

---

## Payment Status Workflow

```text
pending
  └─► submitted   (customer uploads receipt)
        ├─► paid       (owner verifies)
        └─► failed     (owner rejects)

paid
  └─► refunded   (owner refunds)
```

## Payment Status Values

- `pending`: Payment created, awaiting receipt upload.
- `submitted`: Receipt uploaded, awaiting owner review.
- `paid`: Payment verified.
- `failed`: Payment rejected.
- `refunded`: Payment refunded.
