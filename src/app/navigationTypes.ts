import { Product } from '../core/types/product';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Catalog: { categoryId?: string; categoryName?: string } | undefined;
  Scan: undefined;
  Cart: undefined;
  Checkout: undefined;
  Receipt: undefined;
  Profile: undefined;
  SelectStore: undefined;
  CashPayment: { total: number; internalId?: string };
  ProductDetail: { product: Product };
  OrderHistory: undefined;
  PersonalInfo: undefined;
  HelpSupport: undefined;
  PrivacySecurity: undefined;
};
