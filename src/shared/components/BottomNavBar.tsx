import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, shadow } from '../theme/tokens';

type Props = {
  navigation: { navigate: (screen: string) => void };
  activeTab?: 'Home' | 'Cart';
};

export function BottomNavBar({ navigation, activeTab }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.fabCutout}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan item"
          onPress={() => navigation.navigate('Scan')}
          style={styles.fab}
        >
          <MaterialCommunityIcons color={colors.white} name="barcode-scan" size={26} />
        </Pressable>
      </View>

      <View style={styles.pill}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Home')}
          style={[
            styles.tab,
            activeTab === 'Home' ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <MaterialCommunityIcons
            color={activeTab === 'Home' ? colors.primary : colors.subtle}
            name="home-variant"
            size={22}
          />
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>
            Home
          </Text>
          {activeTab === 'Home' && <View style={styles.activeDot} />}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Cart')}
          style={[
            styles.tab,
            activeTab === 'Cart' ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <MaterialCommunityIcons
            color={activeTab === 'Cart' ? colors.primary : colors.subtle}
            name="cart-outline"
            size={22}
          />
          <Text style={[styles.tabLabel, activeTab === 'Cart' && styles.tabLabelActive]}>
            Cart
          </Text>
          {activeTab === 'Cart' && <View style={styles.activeDot} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    bottom: 24,
    left: 24,
    position: 'absolute',
    right: 24,
    zIndex: 10,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: colors.navBar,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 41,
    width: '100%',
    ...shadow.nav,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.md,
    gap: 2,
    justifyContent: 'center',
    minWidth: 78,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabInactive: {
    opacity: 0.95,
  },
  tabActive: {
    backgroundColor: 'rgba(194,101,42,0.12)',
  },
  tabLabel: {
    color: colors.subtle,
    fontSize: 11,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 5,
    marginTop: 2,
    width: 24,
  },
  fabCutout: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    bottom: 36,
    height: 92,
    justifyContent: 'center',
    position: 'absolute',
    width: 92,
    zIndex: 1,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 64,
    justifyContent: 'center',
    width: 64,
    ...shadow.fab,
  },
});
