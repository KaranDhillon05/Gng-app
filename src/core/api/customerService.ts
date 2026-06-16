import { apiClient } from './apiClient';

export type CustomerProfile = {
  id: string;
  phone: string;
  name: string | null;
};

export async function updateCustomerProfile(name: string): Promise<CustomerProfile> {
  const { data } = await apiClient.patch('/customers/me', { name });
  return data;
}
