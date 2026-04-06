# GNG Customer App

Expo/React Native customer app for Grab&Go self-checkout.

## Prerequisites

- Node.js 20+
- grabngo-api running (see `/Users/karandhillon/grabngo-api`)
- Do **not** use `Gng app/backend` for full app flows — it is auth-only. Point this app at grabngo-api.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```bash
# Simulator
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

# Android emulator
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4000/api/v1

# Physical device (use your machine's LAN IP)
# EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:4000/api/v1
```

## Run

```bash
npm start
# or
npm run android
npm run ios
```

## Auth (dev)

When grabngo-api has `MOCK_SNS_ENABLED=true`, use OTP `123456`.

## Production builds

```bash
npx eas build --profile production --platform android
```

API URL is set in `eas.json` → `https://api.grabngo.in/api/v1`.
