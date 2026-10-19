export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const colors = {
  light: {
    primary: '#1B8A3E',
    primaryDark: '#0F5C28',
    primaryLight: '#E6F7EC',
    accent: '#2ECC71',
    accentLight: '#F0FBF4',
    cta: '#1B8A3E',
    background: '#F4FAF6',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    surfaceSecondary: '#EEF5F0',
    tabBar: '#FFFFFF',
    searchFill: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    error: '#DC2626',
    errorLight: '#FEF2F2',
    success: '#1B8A3E',
    successLight: '#E6F7EC',
    warning: '#D97706',
    overlay: 'rgba(15, 23, 42, 0.45)',
    skeleton: '#E2E8F0',
    skeletonHighlight: '#F8FAFC',
  },
  dark: {
    primary: '#4ADE80',
    primaryDark: '#1B8A3E',
    primaryLight: '#14532D',
    accent: '#86EFAC',
    accentLight: '#166534',
    cta: '#4ADE80',
    background: '#0C1210',
    surface: '#141C18',
    card: '#1A2420',
    surfaceSecondary: '#1F2B26',
    tabBar: '#141C18',
    searchFill: '#1A2420',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#2D3B35',
    borderSubtle: '#243029',
    error: '#F87171',
    errorLight: '#450A0A',
    success: '#4ADE80',
    successLight: '#14532D',
    warning: '#FBBF24',
    overlay: 'rgba(0, 0, 0, 0.72)',
    skeleton: '#2D3B35',
    skeletonHighlight: '#3D4F47',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const motion = {
  pressScale: 0.97,
  spring: { damping: 18, stiffness: 320 },
  springSoft: { damping: 14, stiffness: 240 },
  duration: {
    fast: 180,
    normal: 280,
    slow: 400,
  },
};

export const layout = {
  minTouchTarget: 44,
  tabContentHeight: 48,
  tabBarPaddingTop: 6,
  screenHeaderHeight: 52,
};

const ff = fontFamily;

export const typography = {
  h1: { fontSize: 28, fontFamily: ff.bold, lineHeight: 34 },
  h2: { fontSize: 22, fontFamily: ff.bold, lineHeight: 28 },
  h3: { fontSize: 18, fontFamily: ff.extraBold, lineHeight: 24 },
  body: { fontSize: 16, fontFamily: ff.regular, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontFamily: ff.regular, lineHeight: 20 },
  caption: { fontSize: 12, fontFamily: ff.medium, lineHeight: 16 },
  label: { fontSize: 14, fontFamily: ff.semiBold, lineHeight: 18 },
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export type ThemeColors = typeof colors.light;
