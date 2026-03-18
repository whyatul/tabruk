# Tabruk Store + Admin

This project now supports Neon PostgreSQL for products and orders storage.

## Neon database setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Set your Neon connection string in `.env`:

```env
DATABASE_URL=postgresql://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PAYTM_MID=your_mid
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_ENV=staging
FRONTEND_BASE_URL=http://localhost:5173
```

3. Start backend + frontend:

```bash
pnpm run dev:full
```

## Notes

- Backend auto-creates tables (`products`, `orders`) on startup when `DATABASE_URL` is present.
- If `DATABASE_URL` is missing or Neon is unreachable, backend falls back to local JSON files in `server/data/`.
- Admin panel login uses `ADMIN_USERNAME` and `ADMIN_PASSWORD` from env.
- Checkout uses Paytm: backend initiates and verifies payment before creating order.
- Paytm callback endpoint redirects users to `/payment-status` using `FRONTEND_BASE_URL`.
