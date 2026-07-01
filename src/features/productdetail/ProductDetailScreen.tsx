import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { useCartStore } from '../cart/useCartStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ navigation, route }: Props) {
  const product = route.params.product;
  const addProduct = useCartStore((state) => state.addProduct);
  const [quantity, setQuantity] = useState(1);

  const outOfStock = product.stockCount <= 0;
  const maxQty = Math.max(product.stockCount, 0);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(product.price);

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar onAvatarPress={() => navigation.navigate('Profile')} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageBg}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
          ) : (
            <Text style={styles.imageFallback}>🛒</Text>
          )}
          {outOfStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Out of stock</Text>
            </View>
          )}
        </View>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.card}>
          <DetailRow label="Unit" value={product.unitLabel} />
          <DetailRow label="Price" value={formattedPrice} />
          {typeof product.mrp === 'number' && product.mrp > product.price ? (
            <DetailRow label="MRP" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.mrp)} />
          ) : null}
          <DetailRow label="GST" value={`${product.gstRate}%`} />
          <DetailRow
            label="In stock"
            value={outOfStock ? 'Out of stock' : `${product.stockCount}`}
            valueStyle={outOfStock ? styles.outOfStockValue : undefined}
          />
        </View>

        {!outOfStock && (
          <View style={styles.qtyCard}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                disabled={quantity <= 1}
              >
                <MaterialCommunityIcons name="minus" size={18} color={colors.ink} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                style={[styles.qtyBtn, quantity >= maxQty && styles.qtyBtnDisabled]}
                disabled={quantity >= maxQty}
              >
                <MaterialCommunityIcons name="plus" size={18} color={colors.ink} />
              </Pressable>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.primaryButton, outOfStock && styles.primaryButtonDisabled]}
          disabled={outOfStock}
          onPress={() => {
            addProduct(product, quantity);
            navigation.navigate('Cart');
          }}
        >
          <Text style={styles.primaryButtonText}>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, valueStyle }: { label: string; value: string; valueStyle?: object }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  imageBg: {
    alignItems: 'center',
    backgroundColor: colors.imageBg,
    borderRadius: radius.xl,
    height: 240,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(58,48,42,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  outOfStockBadgeText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  outOfStockValue: {
    color: colors.primary,
  },
  image: { height: '100%', resizeMode: 'cover', width: '100%' },
  imageFallback: { fontSize: 64 },
  category: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 38,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  value: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  qtyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    ...shadow.card,
  },
  qtyLabel: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  qtyRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.borderSolid,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  qtyBtn: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  qtyBtnDisabled: {
    opacity: 0.3,
  },
  qtyValue: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 18,
    lineHeight: 24,
    minWidth: 24,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 56,
    ...shadow.cta,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.borderSolid,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.borderSolid,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
});
