import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { AppButton } from '../../shared/components/AppButton';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { listCategories, listPromotions } from '../../core/api/productService';
import { Category, Promotion } from '../../core/types/product';
import { useStoreStore } from '../selectstore/useStoreStore';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Friendly icons + tints per seeded category slug, with a sensible fallback.
const CATEGORY_ICON: Record<string, { emoji: string; bg: string }> = {
  dairy: { emoji: '🧈', bg: colors.iconBakery },
  staples: { emoji: '🌾', bg: colors.iconSnacks },
  snacks: { emoji: '🍪', bg: colors.iconSnacks },
  beverages: { emoji: '🥤', bg: colors.iconDrinks },
  bakery: { emoji: '🍞', bg: colors.iconBakery },
  household: { emoji: '🧴', bg: colors.iconFruits },
  fruits: { emoji: '🍎', bg: colors.iconFruits },
};

function iconFor(slug: string) {
  return CATEGORY_ICON[slug] ?? { emoji: '🛍️', bg: colors.iconFruits };
}

function promoTagline(p: Promotion): string {
  const amount = p.type === 'PERCENT' ? `${p.value}% off` : `₹${p.value} off`;
  if (p.code) return `${amount} · code ${p.code}`;
  if (p.scope === 'ORDER') return `${amount} your order`;
  return amount;
}

export function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const fetchStores = useStoreStore((state) => state.fetchStores);
  const selectedStoreId = useStoreStore((state) => state.selectedStoreId);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (!selectedStoreId) {
      navigation.replace('SelectStore');
      return;
    }
    listCategories()
      .then(setCategories)
      .catch(() => undefined);
    listPromotions()
      .then(setPromotions)
      .catch(() => undefined);
  }, [navigation, selectedStoreId]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar onAvatarPress={() => navigation.navigate('Profile')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Scan Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>IN-STORE EXPERIENCE</Text>
          <View style={styles.heroHeading}>
            <Text style={styles.heroTitle}>{'Shopping\nmade\neffortless.'}</Text>
          </View>
          <Text style={styles.heroBody}>
            Browse the aisles or scan items as you go, then check out instantly.
          </Text>
          <View style={styles.heroCtaWrap}>
            <AppButton label="Tap to Scan Items" leadingIcon="⌁" onPress={() => navigation.navigate('Scan')} size="lg" />
          </View>
          <Pressable style={styles.browseLink} onPress={() => navigation.navigate('Catalog')}>
            <Text style={styles.browseLinkText}>or browse all products →</Text>
          </Pressable>
        </View>

        {/* Offers */}
        {promotions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Today's Offers</Text>
                <Text style={styles.sectionSub}>Savings applied automatically at checkout.</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerRow}>
              {promotions.map((p) => (
                <View key={p.id} style={styles.offerCard}>
                  <Text style={styles.offerBadge}>OFFER</Text>
                  <Text style={styles.offerName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.offerTag}>{promoTagline(p)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <Text style={styles.sectionSub}>Artisan selections for your daily needs.</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Catalog')}>
              <Text style={styles.sectionLink}>VIEW ALL</Text>
            </Pressable>
          </View>

          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const icon = iconFor(cat.slug);
              return (
                <Pressable
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('Catalog', { categoryId: cat.id, categoryName: cat.name })}
                >
                  <View style={[styles.categoryIconBg, { backgroundColor: icon.bg }]}>
                    <Text style={styles.categoryEmoji}>{icon.emoji}</Text>
                  </View>
                  <Text style={styles.categoryLabel}>{cat.name}</Text>
                  <Text style={styles.categorySub}>
                    {cat.productCount} item{cat.productCount === 1 ? '' : 's'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  scroll: { gap: spacing.xxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.xl,
    ...shadow.card,
  },
  heroKicker: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  heroHeading: { marginTop: 8 },
  heroTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 48, letterSpacing: -1.2, lineHeight: 52 },
  heroBody: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 18, lineHeight: 29, marginTop: spacing.lg },
  heroCtaWrap: { marginTop: spacing.lg },
  browseLink: { alignSelf: 'center', marginTop: spacing.md },
  browseLinkText: { color: colors.primary, fontFamily: fonts.sansSemiBold, fontSize: 14 },
  section: { gap: spacing.xl },
  sectionHeader: {
    alignItems: 'flex-end',
    borderBottomColor: 'rgba(216,208,200,0.3)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 17,
  },
  sectionTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 30, lineHeight: 36 },
  sectionSub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 20, marginTop: spacing.xs },
  sectionLink: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  offerRow: { gap: spacing.md, paddingRight: spacing.lg },
  offerCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    gap: 6,
    padding: spacing.lg,
    width: 220,
    ...shadow.cta,
  },
  offerBadge: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  offerName: { color: colors.white, fontFamily: fonts.serifMedium, fontSize: 19, lineHeight: 24 },
  offerTag: { color: 'rgba(255,255,255,0.92)', fontFamily: fonts.sansSemiBold, fontSize: 13, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: 'rgba(216,208,200,0.4)',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 25,
    width: '46%',
  },
  categoryIconBg: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  categoryEmoji: { fontSize: 34 },
  categoryLabel: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 28,
    marginTop: 16,
    textAlign: 'center',
  },
  categorySub: { color: colors.muted, fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 16, textAlign: 'center' },
});
