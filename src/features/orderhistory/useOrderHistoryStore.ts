import { create } from 'zustand';

import { apiClient } from '../../core/api/apiClient';

// Shape of items stored on the backend order (not CartItem format)
export type BackendOrderItem = {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  gstRate: number;
  lineTotal?: number;
  gstAmount?: number;
};

type BackendOrder = {
  orderId: string;
  createdAt?: string;
  paymentConfirmedAt?: string;
  grandTotal?: number;
  items?: BackendOrderItem[];
};

export type OrderHistoryItem = {
  orderId: string;
  createdAt: string;
  totalPaid: number;
  itemCount: number;
  items: BackendOrderItem[];
};

type OrderHistoryState = {
  orders: OrderHistoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
};

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<BackendOrder[]>('/customers/orders');
      const normalizedOrders: OrderHistoryItem[] = data.map((order) => ({
        orderId: order.orderId,
        createdAt: order.createdAt ?? order.paymentConfirmedAt ?? new Date().toISOString(),
        totalPaid: order.grandTotal ?? 0,
        itemCount: (order.items ?? []).reduce((sum, item) => sum + item.qty, 0),
        items: order.items ?? [],
      }));
      set({ orders: normalizedOrders, isLoading: false, error: null });
    } catch {
      set({ isLoading: false, error: 'Failed to load order history.' });
    }
  },
}));
