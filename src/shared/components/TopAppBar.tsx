import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useStoreStore } from '../../features/selectstore/useStoreStore';
import { colors, fonts, shadow, spacing } from '../theme/tokens';

type Props = {
  storeName?: string;
  onAvatarPress?: () => void;
};

export function TopAppBar({ storeName = 'DOWNTOWN MARKET', onAvatarPress }: Props) {
  const selectedStoreName = useStoreStore((state) => state.selectedStoreName);
  const resolvedStoreName = selectedStoreName || storeName;

  return (
    <View style={styles.bar}>
      <View style={styles.brand}>
        <View style={styles.brandIconBox}>
          <MaterialCommunityIcons name="basket-outline" size={14} color={colors.white} />
        </View>
        <View>
          <Text style={styles.brandName}>Grab N Go</Text>
          <Text style={styles.storeName}>{resolvedStoreName}</Text>
        </View>
      </View>
      <Pressable onPress={onAvatarPress} style={styles.avatarRing}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={22} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: colors.borderMedium,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  brandIconBox: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  brandName: {
    color: colors.primary,
    fontFamily: fonts.serif,
    fontSize: 24,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  storeName: {
    color: colors.muted,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  avatarRing: {
    backgroundColor: colors.imageAccent,
    borderColor: 'rgba(194,101,42,0.2)',
    borderRadius: 9999,
    borderWidth: 2,
    height: 40,
    overflow: 'hidden',
    padding: 2,
    width: 40,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 9999,
    flex: 1,
    justifyContent: 'center',
  },
});
