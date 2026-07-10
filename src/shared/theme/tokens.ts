// Design tokens extracted directly from Figma (file: lD2FgtYv8QL48ESIyqayCQ)
export const colors = {
  // Backgrounds
  background: '#FAF5EE',     // warm cream canvas
  surface: '#F6F0E8',        // card/section surface
  navBar: '#ECE6DC',         // bottom nav pill

  // Brand
  primary: '#C2652A',        // terracotta CTA, brand text
  primaryShadow: 'rgba(194,101,42,0.2)',
  primaryShadowStrong: 'rgba(194,101,42,0.4)',

  // Ink
  ink: '#3A302A',            // primary text
  muted: '#605850',          // secondary text
  subtle: '#78706A',         // tertiary text / labels
  placeholder: '#6B7280',

  // Borders
  border: 'rgba(216,208,200,0.3)',
  borderSolid: '#D8D0C8',
  borderMedium: 'rgba(216,208,200,0.6)',

  // Surfaces
  white: '#FFFFFF',
  imageBg: '#F2ECE4',
  imageAccent: '#ECE6DC',

  // States
  success: '#4A7C59',
  successBg: '#F0F4F1',
  successBorder: 'rgba(74,124,89,0.2)',

  // Icon backgrounds
  iconFruits: 'rgba(251,232,216,0.5)',
  iconSnacks: 'rgba(234,226,218,0.5)',
  iconBakery: 'rgba(252,224,224,0.5)',
  iconDrinks: 'rgba(224,136,80,0.2)',
};

export const fonts = {
  serif: 'EBGaramond_700Bold',
  serifMedium: 'EBGaramond_500Medium',
  sansBlack: 'Manrope_800ExtraBold',
  sansBold: 'Manrope_700Bold',
  sansSemiBold: 'Manrope_600SemiBold',
  sansMedium: 'Manrope_500Medium',
  sansRegular: 'Manrope_400Regular',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 9999,
};

// BottomNavBar's tallest element (the FAB cutout) sits `bottom: 36` with
// `height: 92` inside a wrapper pinned to `bottom: 24` — so it occupies the
// bottom 152px of the screen. Floating elements above it should clear that.
export const bottomNavClearance = 152;

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  nav: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  cta: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
};
