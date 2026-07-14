# GNG Customer App

## Screenshots

> Replace these placeholder images with real app screenshots.

![Home Screen](docs/images/image1.png)
![Catalog / Scan Screen](docs/images/image2.png)
![Cart / Checkout Screen](docs/images/image3.png)

---

Expo + React Native customer application for **Grab&Go self-checkout**.

This repository contains:
- A mobile app (`/` root project)
- A legacy/dev-only OTP auth backend (`/backend`)

For full production app flows (catalog, checkout, orders), this app should target **grabngo-api** as noted below.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Install & Run (Mobile App)](#install--run-mobile-app)
- [Running on Devices](#running-on-devices)
- [Type Checking](#type-checking)
- [OTP Auth (Development)](#otp-auth-development)
- [Production Build (EAS)](#production-build-eas)
- [Backend (Legacy / Dev Only)](#backend-legacy--dev-only)
- [Troubleshooting](#troubleshooting)

## Features

- Phone OTP-based customer authentication flow
- Multi-screen mobile navigation architecture
- Camera/scanning capability (via Vision Camera)
- QR code generation support
- Styled UI with custom fonts (EB Garamond + Manrope)
- Persistent local storage support (AsyncStorage)
- Print + share support (`expo-print`, `expo-sharing`)

## Tech Stack

### Mobile App
- **Framework:** Expo (SDK 54), React Native 0.81, React 19
- **Language:** TypeScript
- **Navigation:** React Navigation (native stack)
- **State Management:** Zustand
- **Networking:** Axios
- **Device APIs:** Vision Camera, QR SVG, Printing/Sharing

### Backend (legacy in-repo)
- Node.js + Express (ESM)
- JWT authentication
- MSG91 OTP integration

## Project Structure

```text
Gng-app/
├── App.tsx                 # App entry (font loading + navigator bootstrap)
├── index.ts                # Expo entry point
├── src/                    # Main application source code
├── assets/                 # App assets
├── android/                # Native Android project files
├── backend/                # Legacy/dev-only OTP backend
├── app.json                # Expo app config
├── eas.json                # EAS build profiles and env overrides
├── .env.example            # App environment example
└── README.md
```

## Prerequisites

- Node.js **20+**
- npm
- Android Studio / Xcode (for native run commands)
- A running API backend

> Important: Do **not** rely on `backend/` for full app flows. It is auth-only. Use your full API service (`grabngo-api`) for complete customer workflows.

## Environment Configuration

1. Install dependencies and copy env file:

```bash
npm install
cp .env.example .env
```

2. Edit `.env` and set API URL:

```bash
# iOS Simulator / local machine
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

# Android emulator
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4000/api/v1

# Physical device (same Wi-Fi as backend)
# EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:4000/api/v1
```

## Install & Run (Mobile App)

```bash
npm install
npm start
```

Or run directly on platform:

```bash
npm run android
npm run ios
```

## Running on Devices

- **Android Emulator:** use `10.0.2.2` host mapping for localhost APIs.
- **iOS Simulator:** `localhost` usually works.
- **Physical Device:** use your machine's LAN IP and ensure both devices are on the same network.

## Type Checking

```bash
npm run typecheck
```

## OTP Auth (Development)

If your backend has mock SNS/OTP enabled, use:

- OTP: `123456`

## Production Build (EAS)

Build Android production binary:

```bash
npx eas build --profile production --platform android
```

`eas.json` can override API URL for production (currently configured to `https://api.grabngo.in/api/v1`).

## Backend (Legacy / Dev Only)

The `/backend` service is intended for OTP authentication development/testing only.

Implemented endpoints include:
- `POST /api/v1/auth/customer/request-otp`
- `POST /api/v1/auth/customer/verify-otp`
- `POST /api/v1/auth/customer/signup/request-otp`
- `POST /api/v1/auth/customer/signup/verify-otp`
- `POST /api/v1/auth/customer/logout`

Run backend locally:

```bash
cd backend
npm install
npm run dev
```

Backend env file:

```bash
cp .env.example .env
```

Set required keys:
- `MSG91_AUTH_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `MSG91_TEMPLATE_ID` (often needed for production SMS setups)

## Troubleshooting

- If the app opens but API calls fail, verify `EXPO_PUBLIC_API_BASE_URL` and device/network routing.
- If Android build fails locally, ensure JDK 17 and Android SDK are correctly installed.
- If fonts don’t appear immediately, confirm app has fully loaded after splash and no font-loading error is thrown.
- If camera/scanner features fail, verify runtime permissions on the device.

---

## Screenshots Folder

Store screenshots in:

- `docs/images/image1.png`
- `docs/images/image2.png`
- `docs/images/image3.png`

You can replace these files with your actual app screenshots while keeping the same names.
