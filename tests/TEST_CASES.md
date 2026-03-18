# Perimeter Test Cases

This matrix covers backend and payment gateway boundaries after adding Paytm environment variables.

## Scope

- Authentication/session boundaries
- Product CRUD validation and authorization
- Order validation and total calculation
- Payment gateway env permutations (configured vs unconfigured)
- Callback redirect behavior

## Test Matrix

1. Health check
- Endpoint: `GET /api/health`
- Expected: `200` with `{ ok: true }`

2. Admin auth required
- Endpoint: `GET /api/admin/products` without token
- Expected: `401 Unauthorized`

3. Admin login invalid credentials
- Endpoint: `POST /api/admin/login`
- Payload: wrong username/password
- Expected: `401 Invalid admin credentials`

4. Admin login valid credentials
- Endpoint: `POST /api/admin/login`
- Payload: env-backed admin credentials
- Expected: `200`, returns token and `expiresAt`

5. Admin session with bearer token
- Endpoint: `GET /api/admin/session`
- Expected: `200`, `authenticated: true`

6. Product create validation - missing name
- Endpoint: `POST /api/admin/products`
- Expected: `400 Product name is required`

7. Product create validation - invalid variation
- Endpoint: `POST /api/admin/products`
- Expected: `400 At least one valid variation is required`

8. Product create success and slug generation
- Endpoint: `POST /api/admin/products`
- Input: name without explicit id
- Expected: `201`, generated slug id

9. Product create duplicate detection
- Endpoint: `POST /api/admin/products`
- Input: same product twice
- Expected: `409 Product with this id already exists`

10. Product update unknown id
- Endpoint: `PUT /api/admin/products/:id`
- Expected: `404 Product not found`

11. Product delete unknown id
- Endpoint: `DELETE /api/admin/products/:id`
- Expected: `404 Product not found`

12. Order validation - empty items
- Endpoint: `POST /api/orders`
- Expected: `400 Order must have at least one item`

13. Order validation - missing customer fields
- Endpoint: `POST /api/orders`
- Expected: `400 Customer name, phone, and address are required`

14. Order creation success + totals
- Endpoint: `POST /api/orders`
- Input: multi-item cart
- Expected: `201`, `totalAmount` equals line-item sum

15. Admin orders includes new order
- Endpoint: `GET /api/admin/orders`
- Expected: created order present

16. Paytm initiate when env not configured
- Endpoint: `POST /api/payments/paytm/initiate`
- Env: missing `PAYTM_MID`/`PAYTM_MERCHANT_KEY`
- Expected: `400` with actionable env error

17. Paytm verify when env not configured
- Endpoint: `POST /api/payments/paytm/verify`
- Env: missing `PAYTM_MID`/`PAYTM_MERCHANT_KEY`
- Expected: `400` with config error

18. Paytm callback fallback without order id
- Endpoint: `POST /api/payments/paytm/callback`
- Expected: `302` redirect to `payment-status?status=failed`

19. Paytm callback fallback with order id but no config
- Endpoint: `POST /api/payments/paytm/callback`
- Expected: `302` failed redirect with `paymentOrderId`

20. Paytm configured - initiate amount boundary
- Endpoint: `POST /api/payments/paytm/initiate`
- Env: valid Paytm vars set
- Input: amount `0`
- Expected: `400 Invalid payment amount`

21. Paytm configured - verify orderId boundary
- Endpoint: `POST /api/payments/paytm/verify`
- Env: valid Paytm vars set
- Input: empty `orderId`
- Expected: `400 orderId is required`

22. Live Paytm initiate + token generation
- Endpoint: `POST /api/payments/paytm/initiate`
- Env: real staging `PAYTM_MID` + `PAYTM_MERCHANT_KEY`
- Input: valid positive amount
- Expected: `200` and non-empty `orderId`, `txnToken`, `checkoutScriptUrl`

23. Live Paytm verify on generated order
- Endpoint: `POST /api/payments/paytm/verify`
- Env: real staging credentials
- Input: `orderId` returned from live initiate
- Expected: `200` and Paytm `resultInfo` object present (status depends on checkout completion)

24. Checkout script URL validity
- Field: `checkoutScriptUrl` from initiate response
- Expected: URL host matches Paytm env (`securegw-stage.paytm.in` for staging)

25. Callback URL correctness
- Field: `callbackUrl` from initiate response
- Expected: points to configured callback or server fallback callback endpoint

## How To Run

```bash
node --test tests/api.perimeter.test.js
```

Live payment probe:

```bash
node tests/payment.gateway.live.check.js
```
