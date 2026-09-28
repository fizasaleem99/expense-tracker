# Tally: Expense Tracker (MERN)

Log income and expenses, filter by month and category, and see where the money goes.
React + Recharts on the front, Node/Express + MongoDB aggregation pipelines + JWT (httpOnly cookie) on the back.

## Run it locally

You need Node 18+ and your MongoDB Atlas connection string.

**1. Backend** (terminal 1)
```bash
cd backend
npm install
# backend/.env is already included. Check that MONGO_URI and JWT_SECRET are yours.
npm run seed     # optional: creates demo@tally.app / demo1234 with 6 months of data
npm run dev      # http://localhost:5000
```
You should see `MongoDB connected` and `Server running on port 5000`.

**2. Frontend** (terminal 2)
```bash
cd frontend
npm install      # installs recharts, which was missing from your original package.json
npm run dev      # http://localhost:5173
```
Open http://localhost:5173, log in with the demo account (or register your own).

## What was wrong in the previous version

| Problem | Fix |
|---|---|
| `backend/.env` ended with `CLIENT_URL=http://localhost:5173node` (stray "node") | Corrected. CORS now also accepts several comma-separated origins. |
| `Auth.jsx` was never rendered, and after "Login successful" nothing happened | New auth flow: `AuthContext` restores the session via `GET /api/auth/me`; the app shows the login page or the dashboard. |
| `recharts` was not in `frontend/package.json`, so the dashboard could not compile | Added. |
| Dashboard called `/summary/categories`, `/summary/monthly-trend` | Renamed to the endpoints in the project brief (below). |
| Passwords hashed in the route, model hook removed | Kept hashing in the route (Mongoose 9 no longer supports `next` in hooks). Emails are now trimmed and lower-cased. |

## API

All routes except register/login need the login cookie. Every query is scoped to the logged-in user.

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | |
| GET | `/api/auth/me` | current user, used to restore the session |
| POST | `/api/transactions` | `{ amount, type, category, description, date }` |
| GET | `/api/transactions?category=&month=YYYY-MM&type=` | the list |
| PUT / DELETE | `/api/transactions/:id` | edit / delete own transactions |
| GET | `/api/summary/totals?month=&category=` | income, expense, balance, count |
| GET | `/api/summary/by-category?month=&category=&type=expense` | bar chart |
| GET | `/api/summary/monthly?category=` | line chart: `[{ month, income, expense, net }]`, gaps filled with zeros |
| GET | `/api/summary/months` | months that have data (fills the month filter) |

The list, totals and category chart all build their filter with the same helper (`backend/utils/filters.js`), so changing a filter updates the list and the charts consistently. The monthly trend ignores the month filter on purpose (a trend needs several months) and marks the selected month with a dashed line.

## Structure
```
backend/   app.js  server.js  seed.js
           config/db.js  middleware/authMiddleware.js  utils/filters.js
           models/{User,Transaction}.js
           routes/{authRoutes,transactionRoutes,summaryRoutes}.js
frontend/  src/pages/{Auth,Dashboard}.jsx
           src/components/{Header,FilterBar,SummaryHero,TransactionList,TransactionModal,EmptyState,Icons}.jsx
           src/components/Charts/{CategoryChart,TrendChart}.jsx
           src/context/AuthContext.jsx  src/api.js  src/utils.js  src/constants.js  src/index.css
```
Change the currency with `VITE_CURRENCY` (for example `PKR`, `EUR`) in `frontend/.env`.

## Deploy

**1. Database:** MongoDB Atlas. Under Network Access allow `0.0.0.0/0` (or Render's IPs).

**2. Backend on Render**
- New > Web Service, connect your GitHub repo, Root Directory `backend`.
- Build command `npm install`, start command `npm start`.
- Environment variables: `MONGO_URI`, `JWT_SECRET` (new long random string), `NODE_ENV=production`, `CLIENT_URL=https://your-app.vercel.app`.

**3. Frontend on Vercel**: Root Directory `frontend` (framework: Vite). Pick one:
- **A (recommended, works in Safari too):** copy `frontend/vercel.json.example` to `frontend/vercel.json`, put your Render URL in it, and leave `VITE_API_URL` empty. The browser then talks only to your Vercel domain, so the login cookie is first-party.
- **B:** set `VITE_API_URL=https://your-backend.onrender.com` in Vercel. This works in Chrome/Edge/Firefox, but Safari can block cross-site cookies.

Redeploy the backend after setting `CLIENT_URL` to the final Vercel URL. Render's free tier sleeps when idle, so the first request after a pause can take about 30 seconds.

## Security note
Your Atlas password and `JWT_SECRET` were shared in a chat/upload. Rotate both (Atlas > Database Access > edit user; generate a new JWT secret) before deploying, and never commit `backend/.env` (it is in `.gitignore`).
