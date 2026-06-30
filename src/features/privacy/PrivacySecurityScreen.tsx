import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { useAuthStore } from '../auth/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacySecurity'>;

export function PrivacySecurityScreen({ navigation }: Props) {
  const logout = useAuthStore((state) => state.logout);

  const onSignOutEverywhere = () => {
    Alert.alert(
      'Sign out everywhere',
      'This will sign you out of all devices. You will need to verify your phone number again to log back in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ],
    );
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'To permanently delete your account and data, please contact support — this action requires verification and cannot be undone from the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => Linking.openURL('mailto:support@grabngo.app?subject=Account%20Deletion%20Request') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.muted} />
          <Text style={styles.backText}>Back to Profile</Text>
        </Pressable>

        <Text style={styles.pageTitle}>Privacy & Security</Text>
        <Text style={styles.pageSub}>Manage how your data is used and keep your account secure.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Data</Text>
          <InfoRow
            icon="phone-check-outline"
            title="Phone Verification"
            subtitle="Your account is secured with OTP-based phone login. No passwords are stored."
          />
          <InfoRow
            icon="receipt-text-outline"
            title="Order History"
            subtitle="We keep a record of your orders to provide receipts, loyalty points, and reorder support."
          />
          <InfoRow
            icon="map-marker-outline"
            title="Store Selection"
            subtitle="We use your selected store to show relevant products, pricing, and offers."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <Pressable style={styles.actionRow} onPress={onSignOutEverywhere}>
            <MaterialCommunityIcons name="logout-variant" size={20} color={colors.ink} />
            <Text style={styles.actionText}>Sign out of all devices</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtle} />
          </Pressable>
          <Pressable style={[styles.actionRow, styles.actionRowLast]} onPress={onDeleteAccount}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionText, styles.actionTextDanger]}>Delete my account</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtle} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, title, subtitle }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoBody}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  backRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: spacing.xs },
  backText: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 14 },
  pageTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, marginTop: spacing.sm },
  pageSub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 20, lineHeight: 28 },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIconBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(194,101,42,0.08)',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  infoBody: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  infoSub: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionText: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  actionTextDanger: {
    color: colors.primary,
  },
});
