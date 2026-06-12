import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.APP_ORIGIN || true,
  }),
);

const PORT = Number(process.env.PORT || 4000);
const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 300);
const OTP_MAX_VERIFY_ATTEMPTS = Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || 5);

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET in backend/.env');
}

/**
 * Demo-only in-memory stores:
 * - Replace with DB tables (customers, otp_challenges, refresh_tokens) in production.
 */
const customersByPhone = new Map();
const otpSessionsByPhone = new Map();
const refreshSessions = new Map();

function normalizePhone(input) {
  return String(input || '').replace(/\D/g, '').slice(-10);
}

function asE164IndianPhone(phone10Digit) {
  return `91${phone10Digit}`;
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function issueTokens(customer) {
  const accessToken = jwt.sign(
    { sub: customer.id, phone: customer.phone, type: 'access' },
    JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );
  const refreshToken = jwt.sign(
    { sub: customer.id, phone: customer.phone, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' },
  );
  refreshSessions.set(refreshToken, customer.id);
  return { accessToken, refreshToken };
}

async function sendOtpWithMsg91(phone10Digit, otpCode) {
  if (!MSG91_AUTH_KEY) {
    throw new Error('MSG91_AUTH_KEY missing');
  }

  const mobile = asE164IndianPhone(phone10Digit);

  const payload = {
    authkey: MSG91_AUTH_KEY,
    mobile,
    otp: otpCode,
  };

  if (MSG91_TEMPLATE_ID) {
    payload.template_id = MSG91_TEMPLATE_ID;
  }

  // MSG91 supports multiple OTP APIs. This endpoint works for common OTP route.
  const response = await axios.post('https://control.msg91.com/api/v5/otp', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  return response.data;
}

async function requestOtp({ phone, name, mode }) {
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone.length !== 10) {
    return { ok: false, status: 400, message: 'Phone must be a valid 10-digit Indian number.' };
  }

  if (mode === 'signup') {
    const normalizedName = String(name || '').trim();
    if (normalizedName.length < 2) {
      return { ok: false, status: 400, message: 'Name is required for signup.' };
    }
  }

  const otpCode = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;
  otpSessionsByPhone.set(normalizedPhone, {
    otpCode,
    expiresAt,
    attempts: 0,
    mode,
    name: String(name || '').trim() || null,
  });

  try {
    await sendOtpWithMsg91(normalizedPhone, otpCode);
    return { ok: true, status: 200 };
  } catch (error) {
    otpSessionsByPhone.delete(normalizedPhone);
    return {
      ok: false,
      status: 502,
      message: 'Failed to send OTP via MSG91.',
      providerError: axios.isAxiosError(error) ? error.response?.data || error.message : String(error),
    };
  }
}

function verifyOtp({ phone, otp, mode, name }) {
  const normalizedPhone = normalizePhone(phone);
  const providedOtp = String(otp || '').trim();
  const session = otpSessionsByPhone.get(normalizedPhone);

  if (!session || session.mode !== mode) {
    return { ok: false, status: 400, message: 'No active OTP request for this phone.' };
  }
  if (Date.now() > session.expiresAt) {
    otpSessionsByPhone.delete(normalizedPhone);
    return { ok: false, status: 400, message: 'OTP expired.' };
  }
  if (session.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
    otpSessionsByPhone.delete(normalizedPhone);
    return { ok: false, status: 429, message: 'Too many OTP attempts.' };
  }

  session.attempts += 1;
  otpSessionsByPhone.set(normalizedPhone, session);

  if (session.otpCode !== providedOtp) {
    return { ok: false, status: 400, message: 'Invalid OTP.' };
  }

  otpSessionsByPhone.delete(normalizedPhone);

  let customer = customersByPhone.get(normalizedPhone);
  if (mode === 'signup') {
    const signupName = String(name || '').trim() || session.name || null;
    if (!customer) {
      customer = {
        id: randomId('cus'),
        phone: normalizedPhone,
        name: signupName,
      };
      customersByPhone.set(normalizedPhone, customer);
    } else if (signupName && !customer.name) {
      customer = { ...customer, name: signupName };
      customersByPhone.set(normalizedPhone, customer);
    }
  } else {
    if (!customer) {
      // Auto-create on login OTP if customer does not exist.
      // Adjust this behavior if you want strict login-only for registered users.
      customer = {
        id: randomId('cus'),
        phone: normalizedPhone,
        name: null,
      };
      customersByPhone.set(normalizedPhone, customer);
    }
  }

  const { accessToken, refreshToken } = issueTokens(customer);
  return {
    ok: true,
    status: 200,
    body: {
      accessToken,
      refreshToken,
      user: customer,
    },
  };
}

app.get('/api/v1/health', (_req, res) => {
  res.json({ ok: true, service: 'gng-auth-backend' });
});

app.post('/api/v1/auth/customer/request-otp', async (req, res) => {
  const result = await requestOtp({
    phone: req.body?.phone,
    mode: 'login',
  });
  if (!result.ok) {
    return res.status(result.status).json({ error: result.message, details: result.providerError });
  }
  return res.json({ success: true });
});

app.post('/api/v1/auth/customer/verify-otp', (req, res) => {
  const result = verifyOtp({
    phone: req.body?.phone,
    otp: req.body?.otp,
    mode: 'login',
  });
  if (!result.ok) {
    return res.status(result.status).json({ error: result.message });
  }
  return res.json(result.body);
});

app.post('/api/v1/auth/customer/signup/request-otp', async (req, res) => {
  const result = await requestOtp({
    phone: req.body?.phone,
    name: req.body?.name,
    mode: 'signup',
  });
  if (!result.ok) {
    return res.status(result.status).json({ error: result.message, details: result.providerError });
  }
  return res.json({ success: true });
});

app.post('/api/v1/auth/customer/signup/verify-otp', (req, res) => {
  const result = verifyOtp({
    phone: req.body?.phone,
    otp: req.body?.otp,
    name: req.body?.name,
    mode: 'signup',
  });
  if (!result.ok) {
    return res.status(result.status).json({ error: result.message });
  }
  return res.json(result.body);
});

app.post('/api/v1/auth/customer/logout', (req, res) => {
  const refreshToken = String(req.body?.refreshToken || '');
  if (refreshToken) {
    refreshSessions.delete(refreshToken);
  }
  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Auth backend running at http://localhost:${PORT}/api/v1`);
});
