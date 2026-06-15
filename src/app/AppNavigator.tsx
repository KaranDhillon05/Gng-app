import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CartScreen } from '../features/cart/CartScreen';
import { CashPaymentScreen } from '../features/cashpayment/CashPaymentScreen';
import { CheckoutScreen } from '../features/checkout/CheckoutScreen';
import { CatalogScreen } from '../features/catalog/CatalogScreen';
import { HelpSupportScreen } from '../features/help/HelpSupportScreen';
import { HomeScreen } from '../features/home/HomeScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { OrderHistoryScreen } from '../features/orderhistory/OrderHistoryScreen';
import { useAuthStore } from '../features/auth/useAuthStore';
import { PersonalInfoScreen } from '../features/personalinfo/PersonalInfoScreen';
import { PrivacySecurityScreen } from '../features/privacy/PrivacySecurityScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { ProductDetailScreen } from '../features/productdetail/ProductDetailScreen';
import { ReceiptScreen } from '../features/receipt/ReceiptScreen';
import { ScanScreen } from '../features/scan/ScanScreen';
import { SelectStoreScreen } from '../features/selectstore/SelectStoreScreen';
import { colors } from '../shared/theme/tokens';
import { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Catalog" component={CatalogScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SelectStore" component={SelectStoreScreen} />
        <Stack.Screen name="CashPayment" component={CashPaymentScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
