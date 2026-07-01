import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { useAuthStore } from '../auth/useAuthStore';
import { getLoyalty, LoyaltySummary } from '../../core/api/pricingService';
import { AppButton } from '../../shared/components/AppButton';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

const INR = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 });

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// ─── Small inline icons rendered with styled Views ───────────────────────────

function IconPerson() {
  return (
    <View style={iconStyles.wrapper}>
      <View style={iconStyles.head} />
      <View style={iconStyles.body} />
    </View>
  );
}

function IconClock() {
  return (
    <View style={iconStyles.wrapper}>
      <View style={iconStyles.circle}>
        <View style={iconStyles.clockHand} />
        <View style={iconStyles.clockMinute} />
      </View>
    </View>
  );
}

function IconCard() {
  return (
    <View style={iconStyles.wrapper}>
      <View style={iconStyles.card}>
        <View style={iconStyles.cardStripe} />
      </View>
    </View>
  );
}

function IconHelp() {
  return (
    <View style={iconStyles.wrapper}>
      <View style={iconStyles.helpBox}>
        <Text style={iconStyles.helpText}>?</Text>
      </View>
    </View>
  );
}

function IconShield() {
  return (
    <View style={iconStyles.wrapper}>
      <View style={iconStyles.shield}>
        <View style={iconStyles.shieldInner} />
      </View>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  head: {
    backgroundColor: colors.muted,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
    marginBottom: 2,
  },
  body: {
    backgroundColor: colors.muted,
    borderRadius: 3,
    height: 8,
    width: 14,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  circle: {
    borderColor: colors.muted,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 18,
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    position: 'absolute',
    backgroundColor: colors.muted,
    height: 6,
    width: 1.5,
    bottom: 7,
    left: 7.5,
    borderRadius: 1,
  },
  clockMinute: {
    position: 'absolute',
    backgroundColor: colors.muted,
    height: 1.5,
    width: 5,
    bottom: 8,
    left: 7,
    borderRadius: 1,
  },
  card: {
    borderColor: colors.muted,
    borderRadius: 3,
    borderWidth: 2,
    height: 13,
    width: 18,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  cardStripe: {
    backgroundColor: colors.muted,
    height: 3,
    width: '100%',
    marginTop: 3,
  },
  helpBox: {
    alignItems: 'center',
    borderColor: colors.muted,
    borderRadius: 5,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  helpText: {
    color: colors.muted,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    lineHeight: 13,
  },
  shield: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 16,
    backgroundColor: colors.muted,
    borderRadius: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  shieldInner: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});

// ─── Menu row component ───────────────────────────────────────────────────────

type MenuRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isLast?: boolean;
  onPress?: () => void;
};

function MenuRow({ icon, title, subtitle, isLast, onPress }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      accessibilityRole="button"
    >
      {icon}
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

// ─── Avatar with edit badge ───────────────────────────────────────────────────

function AvatarWithBadge() {
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarRing}>
        {/* Illustrated avatar placeholder */}
        <View style={styles.avatarBg}>
          {/* Suit body */}
          <View style={styles.avatarSuit} />
          {/* Head */}
          <View style={styles.avatarHead} />
        </View>
      </View>
      {/* Edit badge */}
      <View style={styles.editBadge}>
        <Text style={styles.editIcon}>✎</Text>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function ProfileScreen({ navigation }: Props) {
  const customer = useAuthStore((state) => state.customer);
  const logout = useAuthStore((state) => state.logout);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);

  useEffect(() => {
    getLoyalty()
      .then(setLoyalty)
      .catch(() => undefined);
  }, []);

  const lastTxn = loyalty?.transactions?.[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top app bar */}
      <View style={styles.appBar}>
        <View style={styles.brand}>
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIconText}>▦</Text>
          </View>
          <Text style={styles.brandName}>Grab N Go</Text>
        </View>
        <Pressable
          style={styles.notifButton}
          onPress={() => Alert.alert('No new notifications')}
        >
          <Text style={styles.notifIcon}>🔔</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <AvatarWithBadge />

        {/* Name */}
        <Text style={styles.name}>{customer?.name ?? customer?.phone ?? 'My Account'}</Text>

        {/* ── ACCOUNT ESSENTIALS ── */}
        <Text style={styles.sectionLabel}>ACCOUNT ESSENTIALS</Text>
        <View style={styles.card}>
          <MenuRow
            icon={<IconPerson />}
            title="Personal Information"
            subtitle="Update your details and preferences"
            onPress={() => navigation.navigate('PersonalInfo')}
          />
          <MenuRow
            icon={<IconClock />}
            title="Past Orders"
            subtitle="Manage your recent transactions"
            onPress={() => navigation.navigate('OrderHistory')}
          />
          <MenuRow
            icon={<IconCard />}
            title="Payment Methods"
            subtitle="Visa ending in 4242"
            isLast
            onPress={() => Alert.alert('Coming soon')}
          />
        </View>

        {/* ── LOYALTY REWARDS ── */}
        <Text style={styles.sectionLabel}>LOYALTY REWARDS</Text>
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyTop}>
            <View>
              <Text style={styles.loyaltyKicker}>POINTS BALANCE</Text>
              <Text style={styles.loyaltyPoints}>{loyalty ? loyalty.balance : '—'}</Text>
              <Text style={styles.loyaltyWorth}>
                {loyalty ? `Worth ${INR.format(loyalty.balance * loyalty.pointValue)} at checkout` : 'Loading…'}
              </Text>
            </View>
            <View style={styles.loyaltyBadge}>
              <Text style={styles.loyaltyBadgeEmoji}>★</Text>
            </View>
          </View>
          <View style={styles.loyaltyDivider} />
          <Text style={styles.loyaltyHint}>
            {lastTxn
              ? `${lastTxn.type === 'EARN' ? 'Earned' : lastTxn.type === 'REDEEM' ? 'Redeemed' : 'Adjusted'} ${Math.abs(
                  lastTxn.points,
                )} pts · ${lastTxn.note ?? ''}`
              : 'Earn 1 point for every ₹10 spent. Redeem at checkout.'}
          </Text>
        </View>

        {/* ── PREFERENCE & SUPPORT ── */}
        <Text style={styles.sectionLabel}>PREFERENCE & SUPPORT</Text>
        <View style={styles.card}>
          <MenuRow
            icon={<IconHelp />}
            title="Help & Support"
            subtitle="FAQs and direct chat with concierge"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          <MenuRow
            icon={<IconShield />}
            title="Privacy & Security"
            subtitle="Manage data and security keys"
            isLast
            onPress={() => navigation.navigate('PrivacySecurity')}
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <AppButton
            label="Logout"
            leadingIcon="⎋"
            onPress={async () => {
              await logout();
              navigation.replace('Login');
            }}
            variant="outline"
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>VERSION 4.2.1-SAHARA</Text>

        {/* Bottom nav spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} />
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
  notifButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notifIcon: {
    fontSize: 16,
  },

  // Scroll
  scroll: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: 8,
  },

  // Avatar
  avatarContainer: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  avatarRing: {
    borderColor: 'rgba(194,101,42,0.25)',
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 92,
    overflow: 'visible',
    width: 92,
  },
  avatarBg: {
    alignItems: 'center',
    backgroundColor: colors.imageAccent,
    borderRadius: radius.pill,
    height: 92,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingBottom: 0,
    width: 92,
  },
  avatarHead: {
    backgroundColor: '#D4A574',
    borderRadius: radius.pill,
    height: 34,
    position: 'absolute',
    top: 14,
    width: 34,
  },
  avatarSuit: {
    backgroundColor: '#2C3E50',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 36,
    width: 70,
  },
  editBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.background,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: 2,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 26,
  },
  editIcon: {
    color: colors.white,
    fontSize: 11,
  },

  // Name
  name: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 38,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Section labels
  sectionLabel: {
    alignSelf: 'flex-start',
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.8,
    marginBottom: 4,
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },

  // Cards
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow.card,
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  menuSubtitle: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  chevron: {
    color: colors.subtle,
    fontSize: 22,
    fontFamily: fonts.sansRegular,
  },

  // Latest purchase card
  purchaseCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: spacing.md,
    ...shadow.card,
  },
  purchaseContent: {
    flex: 1,
    gap: 6,
  },
  completedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedText: {
    color: colors.success,
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  purchaseTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 25,
  },
  purchaseMeta: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  reorderWrap: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  purchaseImageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  purchaseImageCircle: {
    alignItems: 'center',
    backgroundColor: colors.imageBg,
    borderRadius: radius.pill,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  purchaseImageEmoji: {
    fontSize: 36,
  },

  // Loyalty rewards card
  loyaltyCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadow.cta,
  },
  loyaltyTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  loyaltyKicker: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  loyaltyPoints: { color: colors.white, fontFamily: fonts.serif, fontSize: 44, lineHeight: 50 },
  loyaltyWorth: { color: 'rgba(255,255,255,0.9)', fontFamily: fonts.sansMedium, fontSize: 13 },
  loyaltyBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  loyaltyBadgeEmoji: { color: colors.white, fontSize: 26 },
  loyaltyDivider: { backgroundColor: 'rgba(255,255,255,0.25)', height: 1 },
  loyaltyHint: { color: 'rgba(255,255,255,0.92)', fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 18 },

  // Logout
  logoutWrap: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },

  // Version
  version: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: spacing.sm,
    opacity: 0.9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
