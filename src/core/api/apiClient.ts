import axios, { InternalAxiosRequestConfig } from 'axios';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

import { appConfig } from '../../config/appConfig';
import { useAuthStore } from '../../features/auth/useAuthStore';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 12000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const original = error.config as RetryableRequest | undefined;
    if (!original || original._retry) {
      await useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    original._retry = true;
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      await useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${appConfig.apiBaseUrl}/auth/customer/refresh`,
        { refreshToken },
      );
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch {
      await useAuthStore.getState().logout();
      return Promise.reject(error);
    }
  },
);
