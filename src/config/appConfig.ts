export const appConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  useRemoteApi: true,
  currencyCode: 'INR',
  defaultPaymentProvider: 'Razorpay Ready',
};
