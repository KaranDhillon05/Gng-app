export type Product = {
  id: string;
  name: string;
  barcode: string;
  category: string;
  price: number;
  mrp?: number;
  gstRate: number;
  unitLabel: string;
  imageUrl?: string | null;
  stockCount: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  iconKey?: string | null;
  imageUrl?: string | null;
  productCount: number;
};

export type Promotion = {
  id: string;
  name: string;
  type: 'PERCENT' | 'FLAT';
  scope: 'PRODUCT' | 'CATEGORY' | 'ORDER';
  value: number;
  code?: string | null;
  productId?: string | null;
  categoryId?: string | null;
  minOrderValue?: number | null;
};

export type AppliedPromotion = {
  id: string;
  name: string;
  type: 'PERCENT' | 'FLAT';
  scope: 'PRODUCT' | 'CATEGORY' | 'ORDER';
  value: number;
  amount: number;
};

export type PricingResult = {
  items: Array<{
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
    gstRate: number;
    lineTotal: number;
    discountAmount: number;
    gstAmount: number;
  }>;
  subtotal: number;
  discountTotal: number;
  promotionDiscount: number;
  loyaltyDiscount: number;
  loyaltyPointsRedeemed: number;
  totalGst: number;
  grandTotal: number;
  appliedPromotions: AppliedPromotion[];
  loyaltyPointValue: number;
  loyaltyBalance: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Receipt = {
  orderId: string;
  internalId?: string;
  createdAt: string;
  paymentProvider: string;
  totalPaid: number;
  subtotal?: number;
  discountTotal?: number;
  totalGst?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyPointsEarned?: number;
  appliedPromotions?: AppliedPromotion[];
  items: CartItem[];
};
