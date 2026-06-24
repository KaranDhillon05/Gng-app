import axios from 'axios';
import { create } from 'zustand';

import { createCheckout } from '../../core/api/checkoutService';
import { previewPricing } from '../../core/api/pricingService';
import { findProductByBarcode } from '../../core/api/productService';
import { CartItem, PricingResult, Product, Receipt } from '../../core/types/product';

type CartState = {
  items: CartItem[];
  lastScannedProduct?: Product;
  receipt?: Receipt;
  checkoutMethod: 'UPI' | 'CASH';
  promoCode: string;
  redeemPoints: number;
  pricing?: PricingResult;
  isPricing: boolean;
  isAddingProduct: boolean;
  isCheckingOut: boolean;
  error: string | null;
  pricingError: string | null;
  addProduct: (product: Product, quantity?: number) => void;
  addProductByBarcode: (barcode: string) => Promise<Product>;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  setCheckoutMethod: (method: 'UPI' | 'CASH') => void;
  setPromoCode: (code: string) => void;
  setRedeemPoints: (points: number) => void;
  refreshPricing: () => Promise<void>;
  checkout: () => Promise<Receipt>;
  setLoyaltyPointsEarned: (points: number) => void;
  clearError: () => void;
  clearCart: () => void;
};

const upsertProduct = (items: CartItem[], product: Product, quantity = 1): CartItem[] => {
  const existing = items.find((item) => item.product.id === product.id);
  if (!existing) {
    return [...items, { product, quantity }];
  }

  return items.map((item) =>
    item.product.id === product.id
      ? { ...item, quantity: item.quantity + quantity }
      : item,
  );
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  checkoutMethod: 'CASH',
  promoCode: '',
  redeemPoints: 0,
  isPricing: false,
  isAddingProduct: false,
  isCheckingOut: false,
  error: null,
  pricingError: null,
  addProduct: (product, quantity = 1) => {
    set((state) => ({ items: upsertProduct(state.items, product, quantity) }));
  },
  addProductByBarcode: async (barcode) => {
    set({ isAddingProduct: true, error: null });
    try {
      const product = await findProductByBarcode(barcode);
      set((state) => ({
        items: upsertProduct(state.items, product),
        lastScannedProduct: product,
        isAddingProduct: false,
      }));
      return product;
    } catch (error) {
      let message = 'Product not found. Try scanning again.';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          message = 'Select a store first, then scan again.';
        } else if (error.message === 'No store selected') {
          message = 'Select a store before scanning.';
        }
      } else if (error instanceof Error && error.message === 'No store selected') {
        message = 'Select a store before scanning.';
      }
      set({ isAddingProduct: false, error: message });
      throw error;
    }
  },
  increment: (productId) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    }));
  },
  decrement: (productId) => {
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    }));
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },
  setCheckoutMethod: (method) => set({ checkoutMethod: method }),
  setPromoCode: (code) => set({ promoCode: code }),
  setRedeemPoints: (points) => set({ redeemPoints: Math.max(0, Math.floor(points || 0)) }),
  refreshPricing: async () => {
    const { items, promoCode, redeemPoints } = get();
    if (items.length === 0) {
      set({ pricing: undefined, pricingError: null });
      return;
    }
    set({ isPricing: true, pricingError: null });
    try {
      const pricing = await previewPricing(items, { promoCode, redeemPoints });
      set({ pricing, isPricing: false });
    } catch {
      // Fall back to local estimate if the preview call fails (e.g. offline).
      set({ isPricing: false, pricingError: 'Could not refresh offers. Showing estimate.' });
    }
  },
  checkout: async () => {
    const { items, promoCode, redeemPoints } = get();
    const totalPaid = get().pricing?.grandTotal ?? getCartTotal(items);
    set({ isCheckingOut: true, error: null });
    try {
      const receipt = await createCheckout(items, totalPaid, get().checkoutMethod, {
        promoCode,
        redeemPoints,
      });
      set({ receipt, items: [], pricing: undefined, promoCode: '', redeemPoints: 0, isCheckingOut: false });
      return receipt;
    } catch (error) {
      set({ isCheckingOut: false, error: 'Checkout failed. Please try again.' });
      throw error;
    }
  },
  setLoyaltyPointsEarned: (points) => {
    set((state) => (state.receipt ? { receipt: { ...state.receipt, loyaltyPointsEarned: points } } : {}));
  },
  clearError: () => set({ error: null }),
  clearCart: () =>
    set({ items: [], lastScannedProduct: undefined, pricing: undefined, promoCode: '', redeemPoints: 0, error: null }),
}));

// Local estimates (used as a fallback before the server pricing preview loads).
export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const getCartTax = (items: CartItem[]) =>
  items.reduce((total, item) => total + (item.product.price * item.quantity * (item.product.gstRate ?? 0)) / 100, 0);

export const getCartTotal = (items: CartItem[]) =>
  getCartSubtotal(items) + getCartTax(items);

export const getCartCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);
