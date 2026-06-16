import { CartItem, Receipt } from '../types/product';
import { apiClient } from './apiClient';
import { useStoreStore } from '../../features/selectstore/useStoreStore';

export async function createCheckout(
  items: CartItem[],
  totalPaid: number,
  paymentMethod: 'UPI' | 'CASH' = 'UPI',
  options?: { promoCode?: string; redeemPoints?: number },
): Promise<Receipt> {
  const storeId = useStoreStore.getState().selectedStoreId;
  if (!storeId) {
    throw new Error('No store selected');
  }
  const idempotencyKey = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const { data } = await apiClient.post('/customers/checkout', {
    storeId,
    items: items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      qty: item.quantity,
      unitPrice: item.product.price,
      gstRate: item.product.gstRate,
    })),
    paymentMethod,
    promoCode: options?.promoCode || undefined,
    redeemPoints: options?.redeemPoints || undefined,
    idempotencyKey,
  });

  return {
    orderId: data.orderId,
    internalId: data.internalId,
    createdAt: data.createdAt,
    paymentProvider: data.paymentMethod === 'CASH' ? 'Cash' : 'Razorpay',
    totalPaid: data.totalPaid ?? totalPaid,
    subtotal: data.subtotal,
    discountTotal: data.discountTotal,
    totalGst: data.totalGst,
    loyaltyPointsRedeemed: data.loyaltyPointsRedeemed,
    appliedPromotions: data.appliedPromotions,
    items,
  };
}

export async function pollOrderStatus(
  internalId: string,
): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED'; loyaltyPointsEarned: number }> {
  const { data } = await apiClient.get(`/customers/orders/${internalId}/status`);
  return {
    status: data.paymentStatus as 'PENDING' | 'PAID' | 'FAILED',
    loyaltyPointsEarned: data.loyaltyPointsEarned ?? 0,
  };
}
