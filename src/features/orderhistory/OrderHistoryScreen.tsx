import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { getProduct } from '../../core/api/productService';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { useCartStore } from '../cart/useCartStore';
import { OrderHistoryItem, useOrderHistoryStore } from './useOrderHistoryStore';

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

type Props = NativeStackScreenProps<RootStackParamList, 'OrderHistory'>;

export function OrderHistoryScreen({ navigation }: Props) {
  const orders = useOrderHistoryStore((state) => state.orders);
  const isLoading = useOrderHistoryStore((state) => state.isLoading);
  const error = useOrderHistoryStore((state) => state.error);
  const fetchOrders = useOrderHistoryStore((state) => state.fetchOrders);
  const addProduct = useCartStore((state) => state.addProduct);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const onReorder = async (order: OrderHistoryItem) => {
    setReorderingId(order.orderId);
    let added = 0;
    let skipped = 0;
    try {
      for (const item of order.items) {
        try {
          const product = await getProduct(item.productId);
          if (product.stockCount <= 0) {
            skipped += 1;
            continue;
          }
          addProduct(product, item.qty);
          added += 1;
        } catch {
          skipped += 1;
        }
      }
      if (added === 0) {
        Alert.alert('Could not reorder', 'None of the items in this order are currently available.');
        return;
      }
      navigation.navigate('Cart');
      if (skipped > 0) {
        Alert.alert('Some items unavailable', `${skipped} item${skipped === 1 ? '' : 's'} could not be added (out of stock or no longer available).`);
      }
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar onAvatarPress={() => navigation.navigate('Profile')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Past Orders</Text>
        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {!isLoading && !error && orders.length === 0 ? (
          <Text style={styles.empty}>No past orders yet.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {orders.map((order) => {
          const amount = INR.format(order.totalPaid);
          const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const expanded = expandedOrderId === order.orderId;
          const isReordering = reorderingId === order.orderId;

          return (
            <View key={order.orderId} style={styles.card}>
              <Pressable
                style={styles.cardHeader}
                onPress={() => setExpandedOrderId(expanded ? null : order.orderId)}
                accessibilityRole="button"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>#{order.orderId}</Text>
                  <Text style={styles.meta}>{date} · {order.itemCount} items</Text>
                </View>
                <Text style={styles.amount}>{amount}</Text>
                <MaterialCommunityIcons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.subtle}
                />
              </Pressable>

              {expanded && (
                <View style={styles.detail}>
                  <View style={styles.divider} />
                  {order.items.map((item) => (
                    <View key={item.productId} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.productName} <Text style={styles.itemQty}>x{item.qty}</Text>
                      </Text>
                      <Text style={styles.itemPrice}>{INR.format(item.unitPrice * item.qty)}</Text>
                    </View>
                  ))}
                  <Pressable
                    style={[styles.reorderBtn, isReordering && styles.reorderBtnDisabled]}
                    onPress={() => onReorder(order)}
                    disabled={isReordering}
                  >
                    <MaterialCommunityIcons name="refresh" size={16} color={colors.white} />
                    <Text style={styles.reorderText}>{isReordering ? 'Adding…' : 'Reorder'}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 40,
  },
  empty: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: '#B3261E',
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadow.card,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  orderId: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  meta: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  amount: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
  },
  detail: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  divider: {
    backgroundColor: 'rgba(216,208,200,0.6)',
    height: 1,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  itemName: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  itemQty: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
  },
  itemPrice: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 19,
  },
  reorderBtn: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    ...shadow.cta,
  },
  reorderBtnDisabled: {
    opacity: 0.6,
  },
  reorderText: {
    color: colors.white,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
