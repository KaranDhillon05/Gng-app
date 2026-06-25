import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { AppButton } from '../../shared/components/AppButton';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { getLoyalty } from '../../core/api/pricingService';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { getCartTotal, useCartStore } from '../cart/useCartStore';

const INR = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 });
const INR2 = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', minimumFractionDigits: 2 });

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const items = useCartStore((s) => s.items);
  const pricing = useCartStore((s) => s.pricing);
  const isPricing = useCartStore((s) => s.isPricing);
  const promoCode = useCartStore((s) => s.promoCode);
  const redeemPoints = useCartStore((s) => s.redeemPoints);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const setRedeemPoints = useCartStore((s) => s.setRedeemPoints);
  const refreshPricing = useCartStore((s) => s.refreshPricing);
  const checkout = useCartStore((s) => s.checkout);
  const isCheckingOut = useCartStore((s) => s.isCheckingOut);
  const setCheckoutMethod = useCartStore((s) => s.setCheckoutMethod);

  const [selectedMethod] = useState<'cash'>('cash');
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [pointValue, setPointValue] = useState(1);

  const itemsKey = items.map((i) => `${i.product.id}x${i.quantity}`).join('|');
  useEffect(() => {
    void refreshPricing();
  }, [itemsKey, promoCode, redeemPoints, refreshPricing]);

  useEffect(() => {
    getLoyalty()
      .then((l) => {
        setBalance(l.balance);
        setPointValue(l.pointValue);
      })
      .catch(() => undefined);
  }, []);

  const total = pricing?.grandTotal ?? getCartTotal(items);
  const appliedPromo = (pricing?.appliedPromotions ?? []).some((p) => p.scope === 'ORDER' && p.value);

  const applyPromo = () => {
    const code = promoInput.trim();
    setPromoCode(code);
    setPromoMsg(code ? 'Checking code…' : null);
  };

  // Surface whether the entered code actually took effect once pricing returns.
  useEffect(() => {
    if (!promoCode) {
      setPromoMsg(null);
      return;
    }
    if (isPricing) return;
    const matched = (pricing?.appliedPromotions ?? []).some(
      (p) => p.scope === 'ORDER',
    );
    setPromoMsg(matched ? `Code applied ✓` : 'Code not applicable to this order.');
  }, [promoCode, isPricing, pricing]);

  const redeemOn = redeemPoints > 0;
  const toggleRedeem = (on: boolean) => setRedeemPoints(on ? balance : 0);

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Checkout</Text>
        <Text style={styles.pageSub}>Offers apply automatically. Add a code or redeem points for extra savings.</Text>

        {/* Promo code */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              value={promoInput}
              onChangeText={setPromoInput}
              placeholder="e.g. WELCOME50"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.promoInput}
            />
            <Pressable style={styles.applyBtn} onPress={applyPromo}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
          {promoMsg && (
            <Text style={[styles.promoMsg, appliedPromo ? styles.promoOk : undefined]}>{promoMsg}</Text>
          )}
        </View>

        {/* Loyalty */}
        {balance > 0 && (
          <View style={styles.card}>
            <View style={styles.loyaltyHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Loyalty Points</Text>
                <Text style={styles.loyaltySub}>
                  Balance {balance} pts · worth {INR.format(balance * pointValue)}
                </Text>
              </View>
              <Switch
                value={redeemOn}
                onValueChange={toggleRedeem}
                trackColor={{ true: colors.primary, false: colors.borderSolid }}
                thumbColor={colors.white}
              />
            </View>
            {pricing && pricing.loyaltyPointsRedeemed > 0 && (
              <Text style={styles.loyaltyApplied}>
                Redeeming {pricing.loyaltyPointsRedeemed} pts (− {INR.format(pricing.loyaltyDiscount)})
              </Text>
            )}
          </View>
        )}

        {/* Payment method — UPI deferred; cash at counter only */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <View style={[styles.paymentRow, styles.paymentRowSelected]}>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>✦ CASH</Text>
            </View>
            <View style={styles.paymentBody}>
              <Text style={styles.paymentName}>Cash at Counter</Text>
              <Text style={styles.paymentSub}>Generate a code and show the cashier</Text>
            </View>
          </View>
        </View>

        {/* Bill breakdown */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.cardTitle}>Bill Summary</Text>
            {isPricing && <ActivityIndicator size="small" color={colors.primary} />}
          </View>
          <BillRow label="Subtotal" value={INR2.format(pricing?.subtotal ?? 0)} />
          {pricing && pricing.promotionDiscount > 0 && (
            <BillRow label="Promotions" value={`− ${INR2.format(pricing.promotionDiscount)}`} good />
          )}
          {pricing && pricing.loyaltyDiscount > 0 && (
            <BillRow label="Points redeemed" value={`− ${INR2.format(pricing.loyaltyDiscount)}`} good />
          )}
          <BillRow label="GST" value={INR2.format(pricing?.totalGst ?? 0)} />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.cardTitle}>Total Payable</Text>
            <Text style={styles.totalAmount}>{INR.format(total)}</Text>
          </View>

          <AppButton
            disabled={isCheckingOut || items.length === 0}
            label={isCheckingOut ? 'Processing…' : 'Generate Cash Code'}
            onPress={async () => {
              try {
                setCheckoutMethod('CASH');
                const nextReceipt = await checkout();
                navigation.navigate('CashPayment', { total: nextReceipt.totalPaid, internalId: nextReceipt.internalId });
              } catch {
                Alert.alert('Checkout failed. Please try again.');
              }
            }}
            trailingIcon={isCheckingOut ? undefined : '→'}
          />
        </View>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BillRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <View style={styles.billRow}>
      <Text style={styles.billLabel}>{label}</Text>
      <Text style={[styles.billValue, good && styles.billValueGood]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  pageTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 36, lineHeight: 40 },
  pageSub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  cardTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 20, lineHeight: 28 },
  promoRow: { flexDirection: 'row', gap: spacing.sm },
  promoInput: {
    backgroundColor: colors.background,
    borderColor: colors.borderSolid,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  applyBtn: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  applyBtnText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 14 },
  promoMsg: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 13 },
  promoOk: { color: colors.success },
  loyaltyHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  loyaltySub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 13, marginTop: 2 },
  loyaltyApplied: { color: colors.success, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  paymentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  paymentRowSelected: { borderColor: colors.primary, backgroundColor: 'rgba(194,101,42,0.08)' },
  paymentBody: { flex: 1 },
  paymentBadge: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSolid,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  paymentBadgeText: { color: colors.primary, fontFamily: fonts.sansBold, fontSize: 12, letterSpacing: 1 },
  paymentName: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 24 },
  paymentSub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 18 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { color: colors.subtle, fontFamily: fonts.sansRegular, fontSize: 15 },
  billValue: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 15 },
  billValueGood: { color: colors.success },
  divider: { backgroundColor: 'rgba(216,208,200,0.6)', height: 1 },
  totalRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  totalAmount: { color: colors.primary, fontFamily: fonts.serif, fontSize: 28, letterSpacing: -0.7, lineHeight: 32 },
});
