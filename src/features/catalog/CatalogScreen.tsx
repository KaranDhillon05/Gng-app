import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../app/navigationTypes';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { TopAppBar } from '../../shared/components/TopAppBar';
import { listCategories, listProducts } from '../../core/api/productService';
import { Category, Product } from '../../core/types/product';
import { bottomNavClearance, colors, fonts, radius, shadow, spacing } from '../../shared/theme/tokens';
import { getCartCount, useCartStore } from '../cart/useCartStore';

const INR = new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 });

type Props = NativeStackScreenProps<RootStackParamList, 'Catalog'>;

export function CatalogScreen({ navigation, route }: Props) {
  const initialCategoryId = route.params?.categoryId;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategoryId);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addProduct = useCartStore((s) => s.addProduct);
  const cartCount = useCartStore((s) => getCartCount(s.items));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const load = useCallback(async (categoryId?: string, searchTerm?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts({ categoryId, search: searchTerm || undefined });
      setProducts(data);
    } catch {
      setError('Could not load products. Pull to retry.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void load(activeCategory, search);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeCategory, search, load]);

  const headerTitle = useMemo(() => {
    if (route.params?.categoryName) return route.params.categoryName;
    const match = categories.find((c) => c.id === activeCategory);
    return match ? match.name : 'Shop the Aisles';
  }, [route.params?.categoryName, categories, activeCategory]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopAppBar onAvatarPress={() => navigation.navigate('Profile')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>{headerTitle}</Text>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products…"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <CategoryChip label="All" active={!activeCategory} onPress={() => setActiveCategory(undefined)} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              active={activeCategory === c.id}
              onPress={() => setActiveCategory(c.id)}
            />
          ))}
        </ScrollView>

        {/* Products */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onPress={() => navigation.navigate('ProductDetail', { product: p })}
                onAdd={() => addProduct(p)}
              />
            ))}
          </View>
        )}

        <View style={{ height: bottomNavClearance + (cartCount > 0 ? 70 : 10) }} />
      </ScrollView>

      {cartCount > 0 && (
        <View style={styles.cartPeek}>
          <Pressable style={styles.cartPeekBtn} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.cartPeekText}>View Cart · {cartCount} item{cartCount === 1 ? '' : 's'}</Text>
            <Text style={styles.cartPeekArrow}>→</Text>
          </Pressable>
        </View>
      )}

      <BottomNavBar navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

function CategoryChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ProductCard({ product, onPress, onAdd }: { product: Product; onPress: () => void; onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardImageBg}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
        ) : (
          <Text style={styles.cardImageFallback}>🛒</Text>
        )}
      </View>
      <Text style={styles.cardCategory}>{product.category}</Text>
      <Text style={styles.cardName} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.cardBottom}>
        <Text style={styles.cardPrice}>{INR.format(product.price)}</Text>
        <Pressable style={[styles.addBtn, added && styles.addBtnAdded]} onPress={handleAdd} hitSlop={6}>
          <Text style={styles.addBtnText}>{added ? '✓' : '+'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  pageTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 32, lineHeight: 38 },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  searchIcon: { color: colors.subtle, fontSize: 18 },
  searchInput: { color: colors.ink, flex: 1, fontFamily: fonts.sansRegular, fontSize: 16, paddingVertical: 12 },
  searchClear: { color: colors.subtle, fontSize: 14, paddingHorizontal: 4 },
  chipRow: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSolid,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  chipTextActive: { color: colors.white },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyText: { color: colors.muted, fontFamily: fonts.sansRegular, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 6,
    padding: spacing.md,
    width: '47.5%',
    ...shadow.card,
  },
  cardImageBg: {
    alignItems: 'center',
    backgroundColor: colors.imageBg,
    borderRadius: radius.md,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  cardImage: { height: '100%', resizeMode: 'cover', width: '100%' },
  cardImageFallback: { fontSize: 40 },
  cardCategory: {
    color: colors.subtle,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  cardName: { color: colors.ink, fontFamily: fonts.serifMedium, fontSize: 16, lineHeight: 20, minHeight: 40 },
  cardBottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardPrice: { color: colors.primary, fontFamily: fonts.serif, fontSize: 18 },
  addBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
    ...shadow.cta,
  },
  addBtnAdded: { backgroundColor: colors.success },
  addBtnText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 20 },
  cartPeek: { bottom: bottomNavClearance + 8, left: spacing.lg, position: 'absolute', right: spacing.lg, zIndex: 6 },
  cartPeekBtn: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    ...shadow.nav,
  },
  cartPeekText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 15 },
  cartPeekArrow: { color: colors.white, fontSize: 16 },
});
