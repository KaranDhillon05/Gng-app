import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { AppButton } from '../../shared/components/AppButton';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { CartItem } from '../../core/types/product';
import { bottomNavClearance, colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import {
  getCartSubtotal,
  getCartTax,
  getCartTotal,
  useCartStore,
} from './useCartStore';

const INR = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 });

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const pricing = useCartStore((s) => s.pricing);
  const isPricing = useCartStore((s) => s.isPricing);
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const refreshPricing = useCartStore((s) => s.refreshPricing);

  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);

  // Keep server-side pricing (auto-promotions) in sync with the cart contents.
  const itemsKey = items.map((i) => `${i.product.id}x${i.quantity}`).join('|');
  useEffect(() => {
    void refreshPricing();
  }, [itemsKey, promoCode, refreshPricing]);

  // Surface whether the entered code actually took effect once pricing returns.
  useEffect(() => {
    if (!promoCode) {
      setPromoMsg(null);
      return;
    }
    if (isPricing) return;
    const matched = (pricing?.appliedPromotions ?? []).some((p) => p.scope === 'ORDER');
    setPromoMsg(matched ? 'Code applied ✓' : 'Code not applicable to this order.');
  }, [promoCode, isPricing, pricing]);

  const applyPromo = () => {
    const code = promoInput.trim();
    setPromoCode(code);
    setPromoMsg(code ? 'Checking code…' : null);
  };

  const subtotal = pricing?.subtotal ?? getCartSubtotal(items);
  const discount = pricing?.discountTotal ?? 0;
  const tax = pricing?.totalGst ?? getCartTax(items);
  const total = pricing?.grandTotal ?? getCartTotal(items);
  const appliedPromo = (pricing?.appliedPromotions ?? []).some((p) => p.scope === 'ORDER');

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar onAvatarPress={() => navigation.navigate('Profile')} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Your Cart</Text>
          <Text style={styles.pageCount}>{items.length} ITEMS</Text>
        </View>

        {/* Empty state */}
        {items.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>🛒</Text>
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Scan a product to start shopping.</Text>
            <View style={styles.emptyBtnWrap}>
              <AppButton
                label="Scan Product"
                leadingIcon="⌁"
                onPress={() => navigation.navigate('Scan')}
              />
            </View>
            <Text style={styles.emptyHint}>Tip: barcodes scan fastest in good lighting.</Text>
          </View>
        )}

        {/* Cart items */}
        {items.map((item) => (
          <CartItemRow
            key={item.product.id}
            item={item}
            onIncrement={() => increment(item.product.id)}
            onDecrement={() => decrement(item.product.id)}
            onRemove={() => removeItem(item.product.id)}
          />
        ))}

        {/* Promo code */}
        {items.length > 0 && (
          <View style={styles.promoCard}>
            <Text style={styles.promoTitle}>Promo Code</Text>
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
            {isPricing && promoMsg === 'Checking code…' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : promoMsg ? (
              <Text style={[styles.promoMsg, appliedPromo && styles.promoOk]}>{promoMsg}</Text>
            ) : null}
          </View>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <View style={styles.summary}>
            <SummaryRow label="Subtotal" value={INR.format(subtotal)} />
            {discount > 0 && <SummaryRow label="Offers & savings" value={`− ${INR.format(discount)}`} highlight />}
            <SummaryRow label="GST" value={INR.format(tax)} />
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{INR.format(total)}</Text>
            </View>
            {discount > 0 && (
              <Text style={styles.savingsNote}>You're saving {INR.format(discount)} on this order 🎉</Text>
            )}
          </View>
        )}

        <View style={{ height: items.length > 0 ? bottomNavClearance + 120 : bottomNavClearance + 20 }} />
      </ScrollView>

      {/* Sticky checkout footer */}
      {items.length > 0 && (
        <View style={styles.stickyFooter}>
          <Pressable
            onPress={() => navigation.navigate('Checkout')}
            style={styles.checkoutBtn}
          >
            <AppButton
              label="Proceed to Pay"
              onPress={() => navigation.navigate('Checkout')}
              trailingIcon="→"
            />
          </Pressable>
        </View>
      )}

      <BottomNavBar navigation={navigation} activeTab="Cart" />
    </SafeAreaView>
  );
}

function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const img = item.product.imageUrl;
  const INR = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 });

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemImageBg}>
        {img ? <Image source={{ uri: img }} style={styles.itemImage} /> : <Text style={styles.itemImageFallback}>🛒</Text>}
      </View>
      <View style={styles.itemInfo}>
        <View style={styles.itemTop}>
          <Text style={styles.itemName}>{item.product.name}</Text>
          <Pressable onPress={onRemove} accessibilityLabel="Remove item">
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.muted} />
          </Pressable>
        </View>
        <Text style={styles.itemMeta}>{item.product.category} · {item.product.unitLabel}</Text>
        <View style={styles.itemBottom}>
          <Text style={styles.itemPrice}>{INR.format(item.product.price * item.quantity)}</Text>
          <View style={styles.qtyRow}>
            <Pressable onPress={onDecrement} style={styles.qtyBtn}>
              <MaterialCommunityIcons name="minus" size={14} color={colors.ink} />
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable onPress={onIncrement} style={styles.qtyBtn}>
              <MaterialCommunityIcons name="plus" size={14} color={colors.ink} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, highlight && styles.summaryLabelHighlight]}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  pageHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pageTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 40,
  },
  pageCount: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    minHeight: 300,
    justifyContent: 'center',
    padding: spacing.xl,
    ...shadow.card,
  },
  emptyIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.imageAccent,
    borderColor: colors.borderMedium,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  emptyIcon: {
    fontSize: 34,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    maxWidth: '92%',
    textAlign: 'center',
  },
  emptySub: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyBtnWrap: {
    marginTop: spacing.sm,
    width: '100%',
  },
  emptyHint: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 20,
    padding: 25,
    ...shadow.card,
  },
  itemImageBg: {
    backgroundColor: colors.imageAccent,
    borderRadius: radius.sm,
    height: 96,
    overflow: 'hidden',
    width: 96,
  },
  itemImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    color: colors.ink,
    fontFamily: fonts.serifMedium,
    fontSize: 20,
    lineHeight: 25,
    width: '80%',
  },
  itemMeta: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  itemBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  itemPrice: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 28,
  },
  qtyRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.borderSolid,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  qtyBtn: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  qtyText: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    lineHeight: 24,
    minWidth: 14,
    textAlign: 'center',
  },
  promoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadow.card,
  },
  promoTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 24,
  },
  promoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
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
  applyBtnText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
  },
  promoMsg: {
    color: colors.muted,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  promoOk: {
    color: colors.success,
  },
  summary: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  summaryValue: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  summaryLabelHighlight: {
    color: colors.success,
  },
  summaryValueHighlight: {
    color: colors.success,
  },
  savingsNote: {
    color: colors.success,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  itemImageFallback: {
    fontSize: 36,
    lineHeight: 96,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: 'rgba(216,208,200,0.6)',
    height: 1,
  },
  totalLabel: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 28,
  },
  totalValue: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 32,
  },
  stickyFooter: {
    backgroundColor: 'rgba(250,245,238,0.95)',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    bottom: bottomNavClearance + 8,
    left: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'absolute',
    right: spacing.lg,
    zIndex: 5,
    ...shadow.nav,
  },
  checkoutBtn: {
    width: '100%',
  },
});
