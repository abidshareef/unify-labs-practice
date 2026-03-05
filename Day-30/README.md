# TITAN — The Digital Marketplace

### Full-Stack Capstone Portfolio Project

A high-performance e-commerce platform built with **HTML/CSS/JS**, **Node.js Serverless Functions**, and **MongoDB Atlas** — deployed on **Vercel**.

---

## 🏗️ Project Structure

```
titan-marketplace/
├── index.html              ← Full storefront (frontend)
├── api/
│   ├── products.js         ← GET /api/products (with filtering + search)
│   └── orders.js           ← POST /api/orders  (secure checkout)
├── lib/
│   └── db.js               ← MongoDB connection (cached for serverless)
├── scripts/
│   └── seed.js             ← One-time product seeding script
├── .env.local              ← Environment variables (never commit this)
├── .gitignore
├── package.json
└── vercel.json             ← Vercel deployment config
```

---

## ✅ Features Built

### Frontend

- **Persistent Shopping Cart** — survives refresh via `localStorage`
- **Real-time Search** — debounced 280ms input filtering
- **Category Filtering** — dynamic pills built from live DB data
- **Checkout Form** — full validation with Name, Email, Address
- **Loading Skeletons** — smooth shimmer while fetching products
- **Empty States** — friendly messages when cart or search is empty
- **Toast Notifications** — non-blocking feedback for all actions
- **Cart Animations** — badge pop + slide-in on item add
- **100% Mobile Responsive** — mobile-first CSS breakpoints

### Backend (Vercel Serverless)

- `GET /api/products` — optional `?category=` and `?search=` query params
- `POST /api/orders` — full order persistence to MongoDB
- **NoSQL Injection Prevention** — all inputs sanitized (strips `$`, `{`, `}`)
- **Server-side Price Recalculation** — never trusts frontend totals
- **Input Validation** — required fields, email regex, array bounds
- **Cached DB Connection** — single client reused across serverless calls

---

## 🚀 Deployment Guide

### Step 1 — Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new **cluster** (M0 Free Tier is fine)
3. Under **Database Access** → Add a database user with a strong password
4. Under **Network Access** → Add IP Address → `0.0.0.0/0` (allow all, required for Vercel)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Step 2 — Seed Your Database

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.local .env.local  # then edit it with your real MONGODB_URI

# Run the seed script (one-time only)
npm run seed
```

You should see:

```
✅ Inserted 15 products into 'titan_marketplace.products'
📑 Database indexes created
🚀 TITAN database ready!
```

### Step 3 — Test Locally with Vercel Dev

```bash
# Install Vercel CLI
npm install -g vercel

# Start local development server (serves both API + frontend)
npm run dev
# → Open http://localhost:3000
```

### Step 4 — Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (follow the prompts)
vercel

# Set environment variables in Vercel dashboard:
# Project Settings → Environment Variables
# MONGODB_URI = your connection string
# DB_NAME     = titan_marketplace
```

Or deploy via **Vercel Dashboard**:

1. Push your project to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Add environment variables in project settings
4. Click Deploy ✓

---

## 🔗 API Reference

### `GET /api/products`

Fetch products with optional filtering.

| Query Param | Type   | Description                          |
| ----------- | ------ | ------------------------------------ |
| `category`  | string | Filter by category (exact match)     |
| `search`    | string | Full-text search on name/description |
| `limit`     | number | Max results (default: 50, max: 100)  |
| `skip`      | number | Pagination offset (default: 0)       |

**Example:**

```
GET /api/products?category=Hardware&limit=10
GET /api/products?search=keyboard
```

**Response:**

```json
{
  "products": [...],
  "meta": { "total": 4, "returned": 4, "skip": 0, "limit": 50 }
}
```

---

### `POST /api/orders`

Submit a new order. Prices are **recalculated server-side** from MongoDB — never from the request body.

**Request Body:**

```json
{
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "United States",
    "notes": "Leave at door"
  },
  "items": [
    { "productId": "65abc123...", "quantity": 2 },
    { "productId": "65abc456...", "quantity": 1 }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "orderId": "65abc789...",
  "total": 489.97,
  "message": "Order placed successfully"
}
```

---

## 🔒 Security Notes

1. **NoSQL Injection** — All query string params and body fields are sanitized by stripping MongoDB operators (`$`, `{`, `}`)
2. **Price Tampering** — The `total` field from the frontend is **ignored**. Prices are fetched from MongoDB and recalculated
3. **Input Limits** — String fields are capped at max lengths; cart limited to 50 items max; qty capped at 99
4. **Email Validation** — RFC 5321 regex applied server-side
5. **Environment Variables** — `MONGODB_URI` is never exposed to the browser

---

## 🎨 Design System

| Token        | Value            | Use                |
| ------------ | ---------------- | ------------------ |
| `--gold`     | `#C9A84C`        | Primary accent     |
| `--bg-void`  | `#09090B`        | Page background    |
| `--bg-card`  | `#16161A`        | Product cards      |
| `--text-1`   | `#F2EFE8`        | Headings           |
| `--text-2`   | `#9B9690`        | Body text          |
| `--success`  | `#3DB87A`        | Confirmations      |
| `--danger`   | `#E05252`        | Errors             |
| Font Display | Bebas Neue       | Headers, prices    |
| Font Body    | Barlow           | Body, descriptions |
| Font UI      | Barlow Condensed | Labels, buttons    |

---

## 📦 Switch from Demo → Live Mode

In `index.html`, find line:

```js
const DEMO_MODE = true; // ← Change this to false
```

The app will then:

- Fetch products from `GET /api/products`
- Submit orders to `POST /api/orders`
- Use your real MongoDB Atlas database

---

Built with ❤️ as a Full-Stack Capstone Portfolio Project.
