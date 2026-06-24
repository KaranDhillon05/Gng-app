import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pollOrderStatus } from '../../core/api/checkoutService';
import { useCartStore } from '../cart/useCartStore';
import { useStoreStore } from '../selectstore/useStoreStore';
import { RootStackParamList } from '../../app/navigationTypes';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'CashPayment'>;

const EXPIRY_SECONDS = 14 * 60 + 52; // 14:52 in seconds

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const reset = () => setSeconds(initialSeconds);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return { display: `${mm}:${ss}`, reset, expired: seconds === 0 };
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function CashPaymentScreen({ navigation, route }: Props) {
  const total = route.params.total ?? 42.5;
  const internalId = route.params.internalId;
  const latestReceipt = useCartStore((state) => state.receipt);
  const setLoyaltyPointsEarned = useCartStore((state) => state.setLoyaltyPointsEarned);
  const storeName = useStoreStore((state) => state.selectedStoreName);
  const storeAddress = useStoreStore(
    (state) => state.stores.find((store) => store.id === state.selectedStoreId)?.address ?? null,
  );
  const { display, reset, expired } = useCountdown(EXPIRY_SECONDS);
  const transactionId = latestReceipt?.orderId ?? 'PENDING';

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(total);

  useEffect(() => {
    if (!internalId) {
      return;
    }

    const interval = setInterval(() => {
      void pollOrderStatus(internalId)
        .then(({ status, loyaltyPointsEarned }) => {
          if (status === 'PAID') {
            clearInterval(interval);
            setLoyaltyPointsEarned(loyaltyPointsEarned);
            navigation.replace('Receipt');
            return;
          }
          if (status === 'FAILED') {
            clearInterval(interval);
            Alert.alert('Payment failed');
            navigation.goBack();
          }
        })
        .catch(() => {
          // Keep polling on transient errors.
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [internalId, navigation, setLoyaltyPointsEarned]);

  const onRefresh = async () => {
    if (!internalId) {
      reset();
      return;
    }
    try {
      const { status, loyaltyPointsEarned } = await pollOrderStatus(internalId);
      if (status === 'PAID') {
        setLoyaltyPointsEarned(loyaltyPointsEarned);
        navigation.replace('Receipt');
        return;
      }
      if (status === 'FAILED') {
        Alert.alert('Payment failed');
        navigation.goBack();
        return;
      }
      // Only reset countdown if server still considers payment pending.
      reset();
    } catch {
      Alert.alert('Unable to refresh payment status');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* App bar */}
      <View style={styles.appBar}>
        <View style={styles.brand}>
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIconText}>▦</Text>
          </View>
          <Text style={styles.brandName}>Grab N Go</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status badge */}
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingDot}>⬡</Text>
          <Text style={styles.pendingText}>PAYMENT PENDING</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Show to cashier</Text>
        <Text style={styles.subheading}>
          Please present this code to the cashier to{'\n'}finalize your cash payment.
        </Text>

        {/* Main payment card */}
        <View style={styles.paymentCard}>
          {/* Total amount */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalAmount}>{formattedTotal}</Text>
          </View>

          <View style={styles.divider} />

          {/* QR code — encodes the order ID; the POS Verify screen scans this
              (or the cashier types the transaction ID below). */}
          <View style={styles.qrSection}>
            {latestReceipt?.orderId ? (
              <QRCode value={latestReceipt.orderId} size={176} quietZone={8} />
            ) : (
              <Text style={styles.qrPendingText}>Generating code…</Text>
            )}
          </View>

          {/* Transaction ID */}
          <View style={styles.txSection}>
            <Text style={styles.txId}>{transactionId}</Text>
            <Text style={styles.txLabel}>TRANSACTION ID</Text>
          </View>

          <View style={styles.divider} />

          {/* Expires row */}
          <View style={styles.expiresRow}>
            <Text style={styles.clockIcon}>🕐</Text>
            <View style={styles.expiresLeft}>
              <Text style={styles.expiresLabel}>{expired ? 'STATUS' : 'EXPIRES IN'}</Text>
              <Text style={[styles.expiresTime, expired && styles.expiresExpired]}>
                {expired ? 'Code expiring soon — tap refresh to check status' : display}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void onRefresh();
              }}
              style={styles.refreshBtn}
            >
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>
        </View>

        {/* Store card */}
        <View style={styles.storeCard}>
          <View style={styles.storeIconBox}>
            <Text style={styles.storeEmoji}>🏪</Text>
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{storeName || 'Your selected store'}</Text>
            {storeAddress ? <Text style={styles.storeAddress}>{storeAddress}</Text> : null}
          </View>
        </View>

        {/* Cancel */}
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>✕  CANCEL PAYMENT</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },

  // App bar
  appBar: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: colors.borderMedium,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  brandIconBox: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  brandIconText: {
    color: colors.white,
    fontSize: 12,
  },
  brandName: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: colors.imageAccent,
    borderColor: 'rgba(194,101,42,0.2)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarEmoji: {
    fontSize: 18,
  },

  // Scroll
  scroll: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },

  // Status badge
  pendingBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(194,101,42,0.08)',
    borderColor: 'rgba(194,101,42,0.2)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  pendingDot: {
    color: colors.primary,
    fontSize: 12,
  },
  pendingText: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Heading
  heading: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 38,
    textAlign: 'center',
  },
  subheading: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  // Payment card
  paymentCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderColor: colors.borderMedium,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow.card,
  },
  totalSection: {
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  totalLabel: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  totalAmount: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 48,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginHorizontal: spacing.lg,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  qrPendingText: {
    color: colors.muted,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    paddingVertical: spacing.xl,
  },
  txSection: {
    alignItems: 'center',
    gap: 2,
    paddingBottom: spacing.md,
  },
  txId: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    letterSpacing: 1,
    lineHeight: 22,
  },
  txLabel: {
    color: colors.subtle,
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  expiresRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  clockIcon: {
    fontSize: 18,
  },
  expiresLeft: {
    flex: 1,
    gap: 1,
  },
  expiresLabel: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  expiresTime: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  expiresExpired: {
    color: colors.primary,
  },
  refreshBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  refreshText: {
    color: colors.primary,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },

  // Store card
  storeCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadow.card,
  },
  storeIconBox: {
    alignItems: 'center',
    backgroundColor: colors.imageBg,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  storeEmoji: {
    fontSize: 24,
  },
  storeInfo: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  storeAddress: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  // Cancel
  cancelBtn: {
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.muted,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
