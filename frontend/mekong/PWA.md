# Mekong PWA — Progressive Web App Guide

This guide covers how to install the Mekong app on your iPhone, enable push
notifications, and how the underlying implementation works.

---

## Table of Contents

1. [Installing on iPhone (iOS)](#installing-on-iphone-ios)
2. [Enabling Push Notifications](#enabling-push-notifications)
3. [Testing the PWA Locally](#testing-the-pwa-locally)
4. [Backend Push Notification Setup](#backend-push-notification-setup)
5. [Architecture Overview](#architecture-overview)

---

## Installing on iPhone (iOS)

> **Requirements:** Safari on iOS 11.3+ for basic PWA support.  
> Push notifications require **iOS 16.4+** and the app must be installed to the
> Home Screen.

1. Open **Safari** on your iPhone and navigate to the Mekong URL.
2. Tap the **Share** icon (square with an arrow) at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**.
4. Give the app a name (defaults to "Mekong") and tap **Add**.

The app will now appear on your Home Screen and launch in full-screen mode,
just like a native app.

> **Chrome on iOS** also supports adding to the Home Screen via the Share menu,
> but push notifications in Chrome on iOS still require iOS 16.4+ and the
> installed (standalone) context.

---

## Enabling Push Notifications

> Push notifications on iOS require:
> - iOS **16.4** or later
> - The app installed to the Home Screen (standalone mode)
> - User grants notification permission in the browser prompt

Once the app is installed:

1. Open Mekong from your Home Screen.
2. Click the **bell icon** (🔔) in the top navigation bar.
3. When prompted, tap **Allow** to grant notification permission.
4. You will now receive push notifications when events occur in Mekong.

If the bell icon shows a strikethrough bell (🔕), notifications have been
blocked in iOS Settings. To re-enable:

1. Open **Settings → Notifications → Mekong**.
2. Toggle **Allow Notifications** on.

---

## Testing the PWA Locally

### Prerequisites

- Node.js 18+
- HTTPS is required for service workers and push notifications.
  Use [mkcert](https://github.com/FiloSottile/mkcert) or expose via a tunnel
  like [ngrok](https://ngrok.com/).

### Frontend

```bash
cd frontend/mekong
cp env.local.example .env.local
# Fill in NEXT_PUBLIC_VAPID_PUBLIC_KEY (see backend section)
pnpm install
pnpm run dev
```

Open `https://localhost:3000` in your browser.

Check the browser DevTools → Application → Manifest and Service Workers to
verify the PWA is registered correctly.

### Auditing with Lighthouse

In Chrome DevTools → Lighthouse → select "Progressive Web App" → Generate
report. Aim for a score of 90+.

---

## Backend Push Notification Setup

### 1. Generate VAPID Keys

Run this once and store the output securely:

```bash
node -e "
const webPush = require('web-push');
const keys = webPush.generateVAPIDKeys();
console.log(JSON.stringify(keys, null, 2));
"
```

### 2. Configure Environment Variables

**Backend** (`backend/sql-api/.env`):

```
VAPID_PUBLIC_KEY=<publicKey from above>
VAPID_PRIVATE_KEY=<privateKey from above>
VAPID_SUBJECT=mailto:admin@your-domain.com
```

**Frontend** (`frontend/mekong/.env.local`):

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same publicKey>
```

> ⚠️ The `VAPID_PRIVATE_KEY` must **never** be exposed to the frontend.

### 3. Start the Backend

```bash
cd backend/sql-api
cp env.example .env
# Fill in the database and VAPID values
npm install
npm run dev
```

### 4. Send a Test Push Notification

```bash
curl -X POST http://localhost:3001/api/push/send \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","body":"This is a test push from Mekong!"}'
```

> **Production note:** Secure the `/api/push/send` endpoint with authentication
> before deploying. In production, replace the in-memory subscription store
> with a database (e.g. PostgreSQL).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser / iPhone (iOS 16.4+)                                       │
│                                                                     │
│  ┌───────────────┐    registers    ┌────────────────────────────┐  │
│  │  React App    │ ─────────────▶  │  Service Worker (sw.js)    │  │
│  │  (layout.tsx) │                 │  • Offline caching         │  │
│  └───────────────┘                 │  • Push event handler      │  │
│                                    └────────────┬───────────────┘  │
│                                                 │ push event        │
│  ┌───────────────────────────────────────────────▼──────────────┐  │
│  │  Notification (system tray / lock screen)                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
            ▲ subscribe / unsubscribe
            │
┌───────────┴─────────────────────────────────────────────────────────┐
│  Backend (sql-api / Express)                                        │
│                                                                     │
│  POST /api/push/subscribe    – store PushSubscription               │
│  POST /api/push/unsubscribe  – remove PushSubscription              │
│  POST /api/push/send         – send push to all subscribers         │
│  GET  /api/push/vapid-public-key – serve VAPID public key           │
│                                                                     │
│  Uses: web-push (VAPID + APNs via Web Push protocol)                │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `frontend/mekong/public/manifest.webmanifest` | PWA identity & icons |
| `frontend/mekong/public/sw.js` | Service worker: caching + push |
| `frontend/mekong/public/icons/` | App icons (72–512 px) |
| `frontend/mekong/config/html.ejs` | HTML with PWA/iOS meta tags |
| `frontend/mekong/src/lib/pwa.ts` | SW registration, push utils |
| `frontend/mekong/src/components/pwa/install-prompt.tsx` | Install banner |
| `frontend/mekong/src/components/pwa/push-notification-manager.tsx` | Bell button |
| `backend/sql-api/src/routes/push-subscriptions.js` | Push API routes |

---

### Browser Support Matrix

| Browser | Install | Push Notifications |
|---------|---------|-------------------|
| Safari iOS 16.4+ (standalone) | ✅ | ✅ |
| Safari iOS < 16.4 | ✅ | ❌ |
| Chrome iOS 16.4+ (standalone) | ✅ | ✅ |
| Chrome Android | ✅ | ✅ |
| Firefox Android | ✅ | ✅ |
| Desktop Chrome | ✅ | ✅ |
| Desktop Safari | ✅ (macOS 14+) | ✅ (macOS 14+) |
