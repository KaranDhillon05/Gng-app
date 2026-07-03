import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { useCartStore } from '../cart/useCartStore';
import { useStoreStore } from '../selectstore/useStoreStore';

const INR = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 });

type Props = NativeStackScreenProps<RootStackParamList, 'Receipt'>;

export function ReceiptScreen({ navigation }: Props) {
  const receipt = useCartStore((s) => s.receipt);
  const storeName = useStoreStore((state) => state.selectedStoreName);
  const storeAddress = useStoreStore(
    (state) => state.stores.find((store) => store.id === state.selectedStoreId)?.address ?? null,
  );

  const issuedAt = receipt
    ? new Date(receipt.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '—';

  const onDownloadReceipt = async () => {
    try {
      const html = `
        <html>
          <body>
            <h1>Grab N Go Receipt</h1>
            <p><strong>Order:</strong> ${receipt?.orderId ?? 'N/A'}</p>
            <p><strong>Issued:</strong> ${issuedAt}</p>
            <p><strong>Total:</strong> ₹${receipt ? receipt.totalPaid.toFixed(2) : '0.00'}</p>
            <h2>Items</h2>
            <ul>
              ${receipt?.items.map((item) => `<li>${item.product.name} x${item.quantity}</li>`).join('') ?? '<li>No items</li>'}
            </ul>
          </body>
        </html>
      `;

      const file = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error('Sharing unavailable');
      }
      await Sharing.shareAsync(file.uri);
    } catch {
      Alert.alert('Download unavailable on this device');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon + heading */}
        <View style={styles.successSection}>
          <View style={styles.successBadge}>
            <MaterialCommunityIcons name="check" size={40} color={colors.success} />
            <View style={styles.successBorder} />
          </View>
          <Text style={styles.successTitle}>{'Payment\nSuccessful'}</Text>
          <Text style={styles.successSub}>
            Your purchase is confirmed. Please keep this screen open for verification at the gate.
          </Text>
        </View>

        {/* Gate Pass / Order Summary Card */}
        <View style={styles.gateCard}>
          {/* Decorative top-right blob */}
          <View style={styles.gateBlobDecor} />

          {/* Header row */}
          <View style={styles.gateHeader}>
            <View>
              <Text style={styles.gateKicker}>EXIT AUTHORIZATION</Text>
              <Text style={styles.gateOrderId}>Order #{receipt?.orderId ?? 'GNG-8821'}</Text>
            </View>
            <MaterialCommunityIcons name="contactless-payment" size={28} color={colors.primary} />
          </View>

          {/* Order item list */}
          <View style={styles.orderSummaryBox}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            <View style={styles.divider} />
            {receipt?.items.map((item) => (
              <View key={item.product.id} style={styles.orderRow}>
                <Text style={styles.orderItemName}>
                  {item.product.name}{' '}
                  <Text style={styles.orderQty}>x{item.quantity}</Text>
                </Text>
                <Text style={styles.orderItemPrice}>
                  {INR.format(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
            {receipt && receipt.discountTotal != null && receipt.discountTotal > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.orderRow}>
                  <Text style={[styles.orderItemName, { color: colors.success }]}>Offers & points</Text>
                  <Text style={[styles.orderItemPrice, { color: colors.success }]}>
                    − {INR.format(receipt.discountTotal)}
                  </Text>
                </View>
                {receipt.loyaltyPointsRedeemed != null && receipt.loyaltyPointsRedeemed > 0 && (
                  <View style={styles.orderRow}>
                    <Text style={styles.orderItemName}>Points redeemed</Text>
                    <Text style={styles.orderItemPrice}>{receipt.loyaltyPointsRedeemed} pts</Text>
                  </View>
                )}
                {receipt.totalGst != null && (
                  <View style={styles.orderRow}>
                    <Text style={styles.orderItemName}>GST</Text>
                    <Text style={styles.orderItemPrice}>{INR.format(receipt.totalGst)}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Metadata row */}
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>TIME ISSUED</Text>
              <Text style={styles.metaValue}>{issuedAt}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRight}>
              <Text style={[styles.metaLabel, { textAlign: 'right' }]}>LOCATION</Text>
              <Text style={[styles.metaValue, { textAlign: 'right' }]} numberOfLines={2}>
                {storeName || 'Your selected store'}
              </Text>
              {storeAddress ? (
                <Text style={[styles.storeAddressText, { textAlign: 'right' }]} numberOfLines={2}>
                  {storeAddress}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Loyalty points earned */}
        {receipt?.loyaltyPointsEarned != null && receipt.loyaltyPointsEarned > 0 && (
          <View style={styles.loyaltyCard}>
            <MaterialCommunityIcons name="star-circle" size={28} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.loyaltyTitle}>+{receipt.loyaltyPointsEarned} points earned</Text>
              <Text style={styles.loyaltySub}>Added to your loyalty balance</Text>
            </View>
          </View>
        )}

        {/* Total paid card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <View style={styles.totalAmountRow}>
            <Text style={styles.rupeeSign}>₹</Text>
            <Text style={styles.totalAmount}>
              {receipt ? (receipt.totalPaid).toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={styles.paymentTag}>
            <MaterialCommunityIcons name="credit-card-outline" size={16} color={colors.ink} />
            <Text style={styles.paymentTagText}>{receipt?.paymentProvider ?? 'Razorpay'}</Text>
          </View>
        </View>

        {/* Download receipt */}
        <View style={styles.downloadCard}>
          <Pressable style={styles.downloadBtn} onPress={onDownloadReceipt}>
            <MaterialCommunityIcons name="download" size={18} color={colors.ink} />
            <Text style={styles.downloadText}>DOWNLOAD RECEIPT</Text>
          </Pressable>
        </View>

        {/* Return to Home */}
        <Pressable
          onPress={() => navigation.replace('Home')}
          style={styles.returnBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.muted} />
          <Text style={styles.returnText}>Return to Home</Text>
        </Pressable>

        <View style={{ height: spacing.xxl }} />
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
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  successSection: {
    alignItems: 'center',
    gap: 12,
  },
  successBadge: {
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  successBorder: {
    borderColor: colors.successBorder,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  successTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 48,
    letterSpacing: -1.2,
    lineHeight: 52,
    marginTop: 12,
    textAlign: 'center',
  },
  successSub: {
    color: colors.muted,
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  gateCard: {
    backgroundColor: colors.white,
    borderColor: 'rgba(216,208,200,0.4)',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadow.card,
  },
  gateBlobDecor: {
    backgroundColor: 'rgba(194,101,42,0.05)',
    borderRadius: radius.pill,
    height: 128,
    position: 'absolute',
    right: -64,
    top: -64,
    width: 128,
  },
  gateHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gateKicker: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  gateOrderId: {
    color: colors.ink,
    fontFamily: fonts.serifMedium,
    fontSize: 30,
    lineHeight: 36,
    marginTop: 4,
  },
  orderSummaryBox: {
    backgroundColor: 'rgba(242,236,228,0.2)',
    borderColor: 'rgba(216,208,200,0.4)',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 12,
    marginTop: spacing.xl,
    padding: 21,
  },
  orderSummaryTitle: {
    color: colors.ink,
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    lineHeight: 28,
  },
  divider: {
    backgroundColor: 'rgba(216,208,200,0.4)',
    height: 1,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItemName: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  orderQty: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  orderItemPrice: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  metaDivider: {
    backgroundColor: '#D8D0C8',
    height: 32,
    marginTop: 8,
    width: 1,
  },
  metaLabel: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  metaRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  storeAddressText: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  loyaltyCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(194,101,42,0.08)',
    borderColor: 'rgba(194,101,42,0.2)',
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  loyaltyTitle: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 15,
    lineHeight: 22,
  },
  loyaltySub: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    gap: 4,
    padding: spacing.xl,
    ...shadow.cta,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  totalAmountRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 4,
    paddingBottom: 20,
  },
  rupeeSign: {
    color: colors.white,
    fontFamily: fonts.sansRegular,
    fontSize: 24,
    lineHeight: 32,
  },
  totalAmount: {
    color: colors.white,
    fontFamily: fonts.serif,
    fontSize: 48,
    letterSpacing: -1.2,
    lineHeight: 52,
  },
  paymentTag: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  paymentTagText: {
    color: colors.white,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  downloadCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 25,
  },
  downloadBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  downloadText: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  returnBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  returnText: {
    color: colors.muted,
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
