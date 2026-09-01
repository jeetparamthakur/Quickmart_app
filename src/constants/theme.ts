export const colors = {
  light: {
    primary: '#0D7A5F',
    primaryDark: '#065A46',
    primaryLight: '#E8F5F1',
    accent: '#F5A623',
    accentLight: '#FFF4E0',
    background: '#FAFBFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.5)',
    skeleton: '#E5E7EB',
    skeletonHighlight: '#F3F4F6',
  },
  dark: {
    primary: '#14B88A',
    primaryDark: '#0D7A5F',
    primaryLight: '#1A3D34',
    accent: '#F5A623',
    accentLight: '#3D3018',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceSecondary: '#2A2A2A',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#374151',
    error: '#F87171',
    errorLight: '#450A0A',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    overlay: 'rgba(0,0,0,0.7)',
    skeleton: '#374151',
    skeletonHighlight: '#4B5563',
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
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export type ThemeColors = typeof colors.light;
