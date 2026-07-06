import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { useStoreStore } from './useStoreStore';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectStore'>;

const THUMB_COLORS = ['#4A6741', '#5C4A3A', '#3A4A5C', '#4A7C59'];

function StoreThumbnail({ color }: { color: string }) {
  return (
    <View style={thumbStyles.box}>
      <View style={[thumbStyles.inner, { backgroundColor: color }]}>
        <Text style={thumbStyles.icon}>🏪</Text>
      </View>
    </View>
  );
}

const thumbStyles = StyleSheet.create({
  box: { height: 56, width: 56 },
  inner: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
});

export function SelectStoreScreen({ navigation }: Props) {
  const stores = useStoreStore((state) => state.stores);
  const isLoading = useStoreStore((state) => state.isLoading);
  const fetchStores = useStoreStore((state) => state.fetchStores);
  const selectStore = useStoreStore((state) => state.selectStore);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const filteredStores = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return stores;
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(term) ||
        (store.address?.toLowerCase().includes(term) ?? false),
    );
  }, [searchQuery, stores]);

  const pickStore = (id: string, name: string) => {
    selectStore(id, name);
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.appBar}>
        <View style={styles.brand}>
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIconText}>▦</Text>
          </View>
          <Text style={styles.brandName}>Grab N Go</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headingBlock}>
          <Text style={styles.headingMain}>Find a store</Text>
          <Text style={styles.headingAccent}>near you.</Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or address..."
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
            accessibilityLabel="Search stores"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.nearbyTitle}>Nearby locations</Text>

        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!isLoading && filteredStores.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No stores found</Text>
            <Text style={styles.emptySub}>
              {stores.length === 0
                ? 'Could not load stores. Check your connection and try again.'
                : 'Try a different search term.'}
            </Text>
            {stores.length === 0 && (
              <Pressable style={styles.retryBtn} onPress={() => void fetchStores()}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            )}
          </View>
        )}

        {filteredStores.map((store, index) => (
          <View key={store.id} style={styles.storeCard}>
            <StoreThumbnail color={THUMB_COLORS[index % THUMB_COLORS.length]} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeAddress}>{store.address ?? 'Address unavailable'}</Text>
              <Pressable accessibilityRole="button" onPress={() => pickStore(store.id, store.name)}>
                <Text style={styles.selectLink}>START SHOPPING</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
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
  brand: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  brandIconBox: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  brandIconText: { color: colors.white, fontSize: 12 },
  brandName: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  headingBlock: { marginBottom: spacing.lg },
  headingMain: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 34,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  headingAccent: {
    color: colors.primary,
    fontFamily: fonts.serifMedium,
    fontSize: 34,
    fontStyle: 'italic',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...shadow.card,
  },
  searchIcon: { color: colors.muted, fontSize: 18, lineHeight: 22 },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
  },
  nearbyTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 24,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: spacing.md,
  },
  centered: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
    ...shadow.card,
  },
  emptyTitle: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 },
  emptySub: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  retryBtnText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 13 },
  storeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadow.card,
  },
  storeInfo: { flex: 1, gap: 4 },
  storeName: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 22 },
  storeAddress: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 18 },
  selectLink: {
    color: colors.primary,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
});
