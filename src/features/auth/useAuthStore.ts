import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appConfig } from '../../config/appConfig';

type Customer = {
  id: string;
  phone: string;
  name: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  customer: Customer | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  requestSignupOtp: (name: string, phone: string) => Promise<void>;
  verifySignupOtp: (name: string, phone: string, otp: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  devLogin: () => void;
  logout: () => Promise<void>;
  setCustomerName: (name: string) => void;
  clearError: () => void;
};

type VerifyOtpResponse = {
  accessToken: string;
  refreshToken: string;
  user: Customer;
};

const authHttp = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 12000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      customer: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
      requestOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          await authHttp.post('/auth/customer/request-otp', { phone });
          set({ isLoading: false });
        } catch {
          set({ isLoading: false, error: 'Failed to send OTP. Try again.' });
          throw new Error('REQUEST_OTP_FAILED');
        }
      },
      verifyOtp: async (phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authHttp.post<VerifyOtpResponse>('/auth/customer/verify-otp', {
            phone,
            otp,
          });
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            customer: data.user,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          });
        } catch {
          set({ isLoading: false, error: 'Invalid or expired OTP.' });
          throw new Error('VERIFY_OTP_FAILED');
        }
      },
      requestSignupOtp: async (name, phone) => {
        set({ isLoading: true, error: null });
        try {
          await authHttp.post('/auth/customer/signup/request-otp', { name, phone });
          set({ isLoading: false });
        } catch {
          set({ isLoading: false, error: 'Failed to send signup OTP. Try again.' });
          throw new Error('REQUEST_SIGNUP_OTP_FAILED');
        }
      },
      verifySignupOtp: async (name, phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authHttp.post<VerifyOtpResponse>('/auth/customer/signup/verify-otp', {
            name,
            phone,
            otp,
          });
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            customer: data.user,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          });
        } catch {
          set({ isLoading: false, error: 'Invalid or expired OTP.' });
          throw new Error('VERIFY_SIGNUP_OTP_FAILED');
        }
      },
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      devLogin: () => {
        set({
          accessToken: 'dev-access-token',
          refreshToken: 'dev-refresh-token',
          customer: {
            id: 'dev-customer',
            phone: '9999999999',
            name: 'Dev User',
          },
          isLoggedIn: true,
          isLoading: false,
          error: null,
        });
      },
      logout: async () => {
        const { accessToken, refreshToken } = get();
        set({ isLoading: true });
        try {
          if (refreshToken && accessToken) {
            await authHttp.post(
              '/auth/customer/logout',
              { refreshToken },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
          }
        } catch {
          // Best effort logout by design.
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            customer: null,
            isLoggedIn: false,
            isLoading: false,
            error: null,
          });
        }
      },
      setCustomerName: (name) => {
        set((state) => (state.customer ? { customer: { ...state.customer, name } } : {}));
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'gng-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        customer: state.customer,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
