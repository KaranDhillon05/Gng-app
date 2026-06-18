import { CartItem, PricingResult } from '../types/product';
import { apiClient } from './apiClient';
import { useStoreStore } from '../../features/selectstore/useStoreStore';

export async function previewPricing(
  items: CartItem[],
  options?: { promoCode?: string; redeemPoints?: number },
): Promise<PricingResult> {
  const storeId = useStoreStore.getState().selectedStoreId;
  if (!storeId) {
    throw new Error('No store selected');
  }
  const { data } = await apiClient.post('/pricing/preview', {
    storeId,
    items: items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      qty: item.quantity,
      unitPrice: item.product.price,
      gstRate: item.product.gstRate,
    })),
    promoCode: options?.promoCode || undefined,
    redeemPoints: options?.redeemPoints || undefined,
  });
  return data as PricingResult;
}

export type LoyaltyTransaction = {
  id: string;
  type: 'EARN' | 'REDEEM' | 'ADJUST';
  points: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
};

export type LoyaltySummary = {
  balance: number;
  pointValue: number;
  transactions: LoyaltyTransaction[];
};

export async function getLoyalty(): Promise<LoyaltySummary> {
  const { data } = await apiClient.get('/customers/loyalty');
  return data as LoyaltySummary;
}
