import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const FAQS = [
  {
    question: 'How does Scan & Go work?',
    answer:
      'Open the Scan tab, point your camera at a product barcode, and it\'s instantly added to your cart. Review your cart anytime before checkout.',
  },
  {
    question: 'How do I pay for my order?',
    answer:
      'At checkout, tap "Generate Cash Code" to get a QR code and transaction ID. Show this to the cashier at the counter to complete payment.',
  },
  {
    question: 'How do loyalty points work?',
    answer:
      'You earn 1 point for every ₹10 spent on paid orders. Points can be redeemed at checkout for up to 50% of your order value, with 1 point = ₹1.',
  },
  {
    question: 'Can I use a promo code?',
    answer:
      'Yes — enter your promo code on the Cart or Checkout screen and tap Apply. Eligible discounts are applied automatically to your total.',
  },
  {
    question: 'What if an item is out of stock?',
    answer:
      'Out-of-stock items are marked on the product page and can\'t be added to your cart. Check back later or ask a store associate for availability.',
  },
  {
    question: 'How do I view my past orders?',
    answer:
      'Go to Profile → Past Orders to see your order history, view receipts, and reorder items from a previous purchase.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.faqItem} onPress={() => setOpen((o) => !o)}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </Pressable>
  );
}

export function HelpSupportScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={colors.muted} />
          <Text style={styles.backText}>Back to Profile</Text>
        </Pressable>

        <Text style={styles.pageTitle}>Help & Support</Text>
        <Text style={styles.pageSub}>Find answers to common questions or reach out to our team.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Us</Text>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@grabngo.app')}
          >
            <View style={styles.contactIconBox}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactBody}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSub}>support@grabngo.app</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtle} />
          </Pressable>
          <Pressable
            style={[styles.contactRow, styles.contactRowLast]}
            onPress={() => Linking.openURL('tel:+911800000000')}
          >
            <View style={styles.contactIconBox}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.contactBody}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSub}>1800-000-000 (toll-free)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtle} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 20, lineHeight: 28, marginBottom: spacing.xs },
  faqItem: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
  },
  faqHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 21,
    paddingRight: spacing.sm,
  },
  faqAnswer: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  contactRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  contactRowLast: {
    borderBottomWidth: 0,
  },
  contactIconBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(194,101,42,0.08)',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  contactBody: {
    flex: 1,
    gap: 2,
  },
  contactTitle: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  contactSub: {
    color: colors.muted,
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 18,
  },
});
