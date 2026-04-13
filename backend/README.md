# GNG OTP Backend (MSG91) — Legacy / Dev Only

> **For full app integration, use [grabngo-api](https://github.com/your-org/grabngo-api) instead.**
> Set `EXPO_PUBLIC_API_BASE_URL` to the grabngo-api URL. This local server only implements OTP auth (no catalog, checkout, or orders).

This backend provides the OTP auth endpoints used by the customer app:

- `POST /api/v1/auth/customer/request-otp`
- `POST /api/v1/auth/customer/verify-otp`
- `POST /api/v1/auth/customer/signup/request-otp`
- `POST /api/v1/auth/customer/signup/verify-otp`
- `POST /api/v1/auth/customer/logout`

## 1) Create MSG91 credentials

1. Create/login to your MSG91 account.
2. Create OTP route/template in MSG91 dashboard.
3. Copy your auth key.
4. (For production India SMS) complete DLT registration and approved template IDs.

## 2) Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

- `MSG91_AUTH_KEY`: required
- `MSG91_TEMPLATE_ID`: optional but usually needed for production
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: set strong random values

## 3) Install and run backend

```bash
cd backend
npm install
npm run dev
```

Backend default URL:

`http://localhost:4000/api/v1`

## 4) Point the mobile app to backend

Set Expo env variable for the app:

```bash
EXPO_PUBLIC_API_BASE_URL=192.168.1.9
```

You can place this in an Expo env file and restart Expo.

## 5) Test with curl

Request OTP (signup):

```bash
curl -X POST http://localhost:4000/api/v1/auth/customer/signup/request-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"Karan","phone":"9876543210"}'
```

Verify OTP (signup):

```bash
curl -X POST http://localhost:4000/api/v1/auth/customer/signup/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"name":"Karan","phone":"9876543210","otp":"123456"}'
```

## Notes

- Current storage is in-memory for demo only. Replace with a real database.
- OTP and refresh token records reset when server restarts.
- Add request throttling/rate limits before production.
