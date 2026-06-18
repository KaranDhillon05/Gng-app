import { barcodeLookupVariants } from '../lib/barcode';
import { Category, Product, Promotion } from '../types/product';
import { apiClient } from './apiClient';
import { useStoreStore } from '../../features/selectstore/useStoreStore';
import axios from 'axios';

function requireStoreId(): string {
  const storeId = useStoreStore.getState().selectedStoreId;
  if (!storeId) {
    throw new Error('No store selected');
  }
  return storeId;
}

export async function findProductByBarcode(barcode: string): Promise<Product> {
  const storeId = requireStoreId();
  const variants = barcodeLookupVariants(barcode);

  let lastError: unknown;
  for (const candidate of variants) {
    try {
      const { data } = await apiClient.get('/customers/products/by-barcode', {
        params: { barcode: candidate, storeId },
      });
      return data as Product;
    } catch (error) {
      lastError = error;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error('Product not found');
}

export async function listProducts(options?: {
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const storeId = requireStoreId();
  const { data } = await apiClient.get('/customers/products', {
    params: { storeId, ...options },
  });
  return data as Product[];
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get(`/customers/products/${id}`);
  return data as Product;
}

export async function listCategories(): Promise<Category[]> {
  const storeId = requireStoreId();
  const { data } = await apiClient.get('/customers/categories', {
    params: { storeId },
  });
  return data as Category[];
}

export async function listPromotions(): Promise<Promotion[]> {
  const storeId = requireStoreId();
  const { data } = await apiClient.get('/customers/promotions', {
    params: { storeId },
  });
  return data as Promotion[];
}
