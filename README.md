# Kuefy ✦ Virtual Queue System

<div align="center">

[![CI Pipeline](https://github.com/Anivesh91/kuefy/actions/workflows/ci.yml/badge.svg)](https://github.com/Anivesh91/kuefy/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Frontend: Vercel](https://img.shields.io/badge/Frontend-Vercel%20Production-black?logo=vercel)](https://vercel.com)
[![Backend: Render](https://img.shields.io/badge/Backend-Render%20Web%20Service-46E3B7?logo=render)](https://render.com)

**Eliminate physical waiting lines forever.**  
Kuefy is a real-time, zero-app-install virtual queue management platform designed for clinics, salons, repair centers, and high-footfall counters.

[Explore Live Demo](https://kuefv-7bxdrb8u5-aniveshs-projects-0a0881d0.vercel.app) • [API Endpoint](https://queue-test.onrender.com/api/v1/health) • [Report Issue](https://github.com/Anivesh91/kuefy/issues)

</div>

---

## ⚡ Architectural Highlights

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SYSTEM TOPOLOGY                                 │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  Client Tier (Vercel)         │ React 18 • Vite • Tailwind • Framer Motion  │
│  Real-Time Gateway (Render)   │ Express • Socket.IO Rooms • Web-Push VAPID │
│  Persistence Tier (Atlas)     │ MongoDB Atlas (Partial Unique Indexes)      │
│  Fast Cache (In-Memory/Cloud) │ Redis FIFO Lists & Atomic Sequences (NX)    │
│  Automated CI/CD (GitHub)     │ Parallel 24 Unit & Concurrency Tests        │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 🌟 Key Features

### 1. 🎫 Airline-Style Virtual Boarding Pass
* **Zero Registration for Guests**: Customers simply enter their name & phone to receive a live virtual boarding pass.
* **Real-time Queue Pulse**: Dynamic people-ahead gauge, live estimated wait time calculation, and automated position recalculations.
* **Synthesized Web Audio Chime**: In-browser airport/doorbell chime triggered via Web Audio API (0 KB audio file download) with audio-context activation guards.
* **Phone Lookup Recovery**: Returning customers can search active tickets by phone number across any business without remembering URLs.

### 2. 🏪 In-Store Counter QR Standee & Poster Generator
* **Client-Side Vector QR Generation**: High-resolution QR codes pointing directly to the store's remote customer storefront (`/customer/organizations/:slug`).
* **Dual Format Display**:
  * **Table Tent (4×6)**: Compact desk display for counter acrylic frames.
  * **Wall Poster (A4)**: Full-page layout for clinic entrance doors and waiting rooms.
* **1-Click High-Res PNG Export**: Offscreen canvas renders a 300 DPI, 1200×1600 px printable poster for WhatsApp distribution or print shops.
* **Direct Print CSS**: Custom `@media print` rules isolate the standee and strip app chrome for crisp A4 paper printing.

### 3. 📲 Lock-Screen Native Web Push Notifications
* **W3C Push API + VAPID Protocol**: Standardized push notifications delivering alerts directly through Google FCM and Apple APNs.
* **Screen-Off & Browser-Closed Delivery**: Background Service Worker (`sw.js`) wakes up the device even when the phone is locked in a pocket or the browser is minimized.
* **Tactile Feedback**: Custom vibration cadence `[300ms, 100ms, 300ms, 100ms, 300ms]` and interactive lock-screen banner.
* **Smart Tab Focus**: Tapping the notification automatically focuses an existing tab or reopens the customer's live boarding pass.

### 4. 🌅 Daily Morning Queue & Sequence Reset
* **Smart Calendar Day Reset**: Subah queue open hote hi sequence automatically `#001` par reset ho jata hai agar kal ka din beet chuka ho.
* **MongoDB Partial Unique Index**:
  ```javascript
  ticketSchema.index(
    { queueId: 1, ticketNumber: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ['WAITING', 'CALLED', 'SERVING'] } } }
  );
  ```
  Prevents `E11000 duplicate key` collisions when ticket numbers cycle each day, preserving historical analytics and customer records indefinitely.
* **Manual Operational Reset**: Store managers can reset sequence counters at shift change with a single confirmation click.

### 5. 🔒 Atomic Concurrency & Anti-Race Dispatch Guards
* **10-Second Auto-Expiring Dispatch Lock**: Eliminates double-call race conditions when multiple counter agents click "Call Next" simultaneously.
* **Atomic Redis Sequence (`SET ... NX` + `INCR`)**: Memory-speed monotonic ticket incrementation with resilient MongoDB `$max` sequence safeguards against out-of-order writes.
* **Smart Graceful Fallback**: If Redis is offline or unconfigured, the system automatically falls back to atomic MongoDB operations without throwing errors or dropping requests.

### 6. 🛡️ Tenant-Isolated WebSockets (Zero PII Leaks)
* **Isolated Room Partitions**: Events are broadcast strictly to scoped channels (`owner:${ownerId}`, `service:${serviceId}`, `org:${orgId}`, `directory`).
* **PII Sanitization**: Customer names and phone numbers are stripped from all public channels and delivered exclusively to authenticated owner sockets.
* **Auto-Reconnect State Resubscription**: Network interruptions trigger automatic resubscription to all active rooms without silent socket drops.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide React, Canvas Confetti, QRCode.react |
| **Backend** | Node.js 20, Express, Socket.IO, Web-Push (VAPID), JSON Web Tokens (JWT), Bcrypt.js |
| **Databases** | MongoDB Atlas (Mongoose ODM), Redis / Upstash (IORedis) |
| **CI / CD** | GitHub Actions (Ubuntu VM, Parallel Automated Test Runners) |
| **Hosting** | Vercel (Frontend CDN), Render (Backend Service), MongoDB Atlas (Cloud Database) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js `>= 18.0.0`
* MongoDB (Local instance or MongoDB Atlas URI)
* Redis *(Optional: app automatically falls back to MongoDB if Redis is absent)*

### 1. Clone & Setup
```bash
git clone https://github.com/Anivesh91/kuefy.git
cd kuefy
```

### 2. Backend Environment Configuration
Navigate to `backend` and install dependencies:
```bash
cd backend
npm install
```

Create `.env` inside `backend/`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/kuefy

# Security Secrets
JWT_SECRET=super_secret_jwt_key_kuefy_2026
COOKIE_SECRET=super_secret_cookie_key_kuefy_2026

# Optional: High-Throughput Redis Cache
REDIS_URL=redis://127.0.0.1:6379

# Optional: Web Push VAPID Configuration (Generate via: npx web-push generate-vapid-keys)
VAPID_EMAIL=mailto:support@kuefy.com
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

Run backend server:
```bash
npm run dev
```

### 3. Frontend Environment Configuration
In a separate terminal, navigate to `frontend`:
```bash
cd frontend
npm install
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SERVER_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

Kuefy includes an automated invariant and integration test suite executing via Node.js native test runner:

```bash
cd backend
npm test
```

### Test Coverage (24/24 Tests Passing)
* **Concurrency & Phone Normalization**: Standardizes Indian phone variations (`+91`, `91`, leading `0`, hyphens) and verifies Mongo `$max` invariants.
* **Daily Sequence Reset**: Tests cross-day timestamp detection, sequence restart at `#001`, and partial index uniqueness.
* **Security & Hardening**: Validates CORS whitelist enforcement, ReDoS query escaping, and route rate limits.
* **Socket & Privacy Invariants**: Confirms customer PII is never broadcasted to public/directory rooms.
* **Ticket State Machine**: Strictly verifies allowed state progressions (`WAITING` ➔ `CALLED` ➔ `SERVING` ➔ `COMPLETED`).
* **Web Push Delivery**: Confirms VAPID cryptographic signatures and payload serialization.

---

## 📦 Production Build & Code Splitting

Frontend routes are lazily loaded using `React.lazy` and `Suspense`, ensuring the core JavaScript bundle remains under **415 kB**:

```bash
cd frontend
npm run build
```

```
✓ 2042 modules transformed.
dist/assets/index-*.js              414.98 kB │ gzip: 135.50 kB
dist/assets/QrStandeeModal-*.js      29.49 kB │ gzip:  10.11 kB
dist/assets/TicketTrackerPage-*.js   39.35 kB │ gzip:  12.03 kB
✓ built in ~11s (0 errors, 0 warnings)
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with care by <a href="https://github.com/Anivesh91">Anivesh</a> and the open-source community.</sub>
</div>
