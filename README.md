# Tabruk Store + Admin

This project is a decoupled e-commerce platform with a React/Vite frontend and an Express/Node.js backend, using a Neon PostgreSQL database. It features a custom manual QR payment flow via WhatsApp verification and easy sharing directly embedded on the product pages.

---

## 🚀 Deployment Instructions

This repository is built for **Decoupled Architecture**, meaning you must deploy the Backend and Frontend to separate services.

### Step 1: Deploy Backend to RENDER
Deploy the Node.js backend to Render to handle your database connections and orders API securely.

1. Create a new **Web Service** on Render and connect this repository.
2. Configure settings:
   * **Root Directory:** `.` (leave empty)
   * **Build Command:** `npm install` (or `pnpm install`)
   * **Start Command:** `npm run server`
3. Add the following **Environment Variables**:
   * `DATABASE_URL` = `<your_neon_postgres_db_url>`
   * `ADMIN_USERNAME` = `admin` (or any custom username)
   * `ADMIN_PASSWORD` = `admin123` (or any secure password)
4. Deploy the backend and copy its public API URL (e.g., `https://tabruk-backend.onrender.com`).

*(Note: The server auto-creates the necessary tables on startup when `DATABASE_URL` is present. No manual migrations needed!)*

### Step 2: Deploy Frontend to VERCEL
Now deploy the user-facing React application to Vercel.

1. Create a new **Project** on Vercel and import this repository.
2. Vercel should auto-detect Vite. Ensure the configuration is:
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. **⚠️ CRITICAL: Environment Dashboard:**
   Before hitting deploy, expand the Environment Variables section and add:
   * **Name:** `VITE_API_BASE_URL`
   * **Value:** The deployed URL from Step 1 (e.g., `https://tabruk-backend.onrender.com`). Do **NOT** put a trailing slash `/`.
4. Click **Deploy**. Vercel will build the frontend, and it will now successfully reach your Render backend for checking out and payments!

---

## 🛠 Local Development Setup

If you wish to test the site locally:

1. Copy the `.env` template:
```bash
cp .env.example .env
```
2. Setup your local `.env` with your Neon database string. (You do not need to set `VITE_API_BASE_URL` locally, as Vite automatically proxies `/api` traffic to port `4000` via `vite.config.js`).
3. Start both the frontend and backend concurrently:
```bash
npm run dev
# OR: pnpm run dev
```

## 📦 Key Features
* **Manual QR Checkout:** Customers generate their cart, fill out shipping details, and scan a dynamic UPI QR code. Verification happens manually via WhatsApp.
* **Native Product Sharing:** Users can share products quickly directly via WhatsApp and other platforms with customized URLs.
* **Fallback Storage:** If the Neon database goes offline, the backend writes to local `server/data/*.json` files automatically to preserve sales.
* **Admin Dashboard:** Access standard order metrics locally with simple HTTP POST authentication based on the environmental credentials.

---

## 🔐 Accessing the Admin Panel

To securely view and manage your orders, you can access the built-in Admin Dashboard directly from your deployed frontend (or local environment).

1. Open your browser and navigate to the `/admin` route on your frontend URL. 
   * Local: `http://localhost:5173/admin`
   * Production: `https://your-frontend-domain.vercel.app/admin`
2. You will be prompted to log in. Use the credentials configured in your backend `.env`:
   * **Username:** `admin` (or your custom `ADMIN_USERNAME`)
   * **Password:** `admin123` (or your custom `ADMIN_PASSWORD`)
3. Once logged in, you can view incoming orders, track their payment statuses, and manage your e-commerce presence!
