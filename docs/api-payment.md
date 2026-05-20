## Payment Endpoints

### Create Payment (Customer)

```text
POST /payments
```

Requires authentication and `customer` role.

Body:

```json
{
  "reservation_id": 1,
  "payment_method_id": 2,
  "transaction_reference": "TXN-ABC123"
}
```

- `reservation_id`: must belong to the authenticated customer
- `payment_method_id`: must be an active payment method
- `transaction_reference`: optional bank reference or memo
- Amount is automatically taken from `reservations.total_amount`
- Payment starts with status `pending`

Returns:

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": 1,
    "reservation_id": 1,
    "customer_id": 5,
    "owner_id": 2,
    "amount": 500.00,
    "currency": "USD",
    "transaction_reference": "TXN-ABC123",
    "receipt_image_url": null,
    "payment_status": "pending",
    "payment_method": "ABA",
    "payment_method_id": 2,
    "payment_status_id": 1,
    "verified_by": null,
    "verified_by_name": null,
    "verified_at": null,
    "paid_at": null,
    "customer_name": "Jane Customer",
    "customer_email": "jane@example.com",
    "room_name": "Deluxe Suite",
    "property_name": "Ocean View Hotel",
    "property_id": 3,
    "check_in_date": "2026-06-01",
    "check_out_date": "2026-06-05",
    "total_nights": 4,
    "reservation_status": "confirmed",
    "created_at": "2026-05-18T08:00:00.000Z",
    "updated_at": "2026-05-18T08:00:00.000Z"
  }
}
```

### Upload Receipt (Customer)

```text
POST /payments/:id/receipt
```

Requires authentication and `customer` role.

Content-Type: `multipart/form-data`

key: `receipt` (file)

- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max size: 5 MB
- File is stored in `uploads/receipts/`
- Status transitions from `pending` → `submitted` on first upload
- Re-upload allowed while status is `pending` or `submitted`

Returns updated payment with `receipt_image_url` set and `payment_status: "submitted"`.

### Payment Proof Endpoints (Customer)

#### Upload or Replace Proof

```text
POST /payments/:id/proof
PATCH /payments/:id/proof
```

Requires authentication and `customer` role.

Content-Type: `multipart/form-data`

Form field: `receipt` (file)

- Works for both initial proof upload and proof replacement
- Allowed when payment status is `pending` or `submitted`
- On success, payment status becomes `submitted`
- Returns the updated payment object with `receipt_image_url`

#### View Proof Details

```text
GET /payments/:id/proof
```

Requires authentication.

Access rules:
- `customer`: own payment only
- `owner`: own property payments
- `admin`: any payment

Returns proof metadata, including `receipt_image_url`, `payment_status`, `rejection_reason`, `verified_by`, and timestamps.

### Get My Payments (Customer)

```text
GET /payments/my
```

Requires authentication and `customer` role.

Query parameters:

- `status`: filter by status (`pending`, `submitted`, `paid`, `failed`, `refunded`)

Returns:

```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [ /* array of payment objects */ ]
}
```

### Get Payment by ID

```text
GET /payments/:id
```

Requires authentication.

Access rules:
- `customer`: can only view their own payments
- `owner`: can only view payments for their properties
- `admin`: can view any payment

### Get All Payments (Admin)

```text
GET /admin/payments
```

Requires authentication and `admin` role.

Query parameters:

- `status`: filter by status
- `customer_id`: filter by customer
- `owner_id`: filter by property owner

### Get Payments Pending Verification (Admin)

```text
GET /admin/payments/pending-verification
```

Requires authentication and `admin` role.

Returns payments with status `submitted` that are waiting for verification.

### Verify Payment (Admin)

```text
PATCH /admin/payments/:id/verify
```

Requires authentication and `admin` role.

Allowed transition: `submitted` → `paid`

Body (optional):

```json
{
  "notes": "Verified via ABA statement"
}
```

### Reject Payment (Admin)

```text
PATCH /admin/payments/:id/reject
```

Requires authentication and `admin` role.

Allowed transition: `submitted` → `failed`

Body:

```json
{
  "rejection_reason": "Receipt image is unclear"
}
```

`rejection_reason` is required. It is stored in `rejection_reason`.

### Refund Payment (Admin)

```text
PATCH /admin/payments/:id/refund
```

Requires authentication and `admin` role.

Allowed transition: `paid` → `refunded`

Body (optional):

```json
{
  "notes": "Customer cancelled before check-in"
}
```

## Payment Status Workflow

```
pending
  └─► submitted   (customer uploads receipt)
        ├─► paid       (admin verify)
        └─► failed     (admin reject)
              
paid
  └─► refunded   (admin refund)
```

Invalid transitions return `400` with a descriptive error.

## Payment Status Values

- `pending`: Payment record created, awaiting receipt
- `submitted`: Customer uploaded receipt, awaiting admin review
- `paid`: Admin verified — payment confirmed
- `failed`: Admin rejected — proof was invalid
- `refunded`: Admin issued a refund