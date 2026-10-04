export const colors = {
  light: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#E8F5E9',
    accent: '#8BC34A',
    accentLight: '#F1F8E9',
    background: '#F0FAF0',
    surface: '#FFFFFF',
    surfaceSecondary: '#E8F0E8',
    text: '#1A202C',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#D7E3D7',
    error: '#C62828',
    errorLight: '#FFEBEE',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#689F38',
    overlay: 'rgba(27,94,32,0.45)',
    skeleton: '#DCE8DC',
    skeletonHighlight: '#F0FAF0',
  },
  dark: {
    primary: '#66BB6A',
    primaryDark: '#2E7D32',
    primaryLight: '#1B3D1C',
    accent: '#9CCC65',
    accentLight: '#2A3B16',
    background: '#0F1A10',
    surface: '#152016',
    surfaceSecondary: '#1C2A1D',
    text: '#F1F8E9',
    textSecondary: '#A8B5A8',
    textMuted: '#7A8A7A',
    border: '#2E4A30',
    error: '#EF9A9A',
    errorLight: '#4A1C1C',
    success: '#81C784',
    successLight: '#1B3D1C',
    warning: '#AED581',
    overlay: 'rgba(0,0,0,0.7)',
    skeleton: '#2E4A30',
    skeletonHighlight: '#3D5C3F',
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
  lg: 18,
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
  tabContentHeight: 52,
  tabBarPaddingTop: 8,
  screenHeaderHeight: 52,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 26 },
  h3: { fontSize: 18, fontWeight: '800' as const, lineHeight: 22 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
};

export const shadows = {
  sm: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export type ThemeColors = typeof colors.light;
