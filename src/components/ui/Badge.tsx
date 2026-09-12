import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'error' | 'neutral';
  style?: ViewStyle;
};

export function Badge({ label, variant = 'primary', style }: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  const variantColors = {
    primary: { bg: colors.primaryLight, text: colors.primary },
    accent: { bg: colors.accentLight, text: colors.primaryDark },
    success: { bg: colors.successLight, text: colors.success },
    error: { bg: colors.errorLight, text: colors.error },
    neutral: { bg: colors.surfaceSecondary, text: colors.textSecondary },
  };

  const v = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      <Text style={[typography.caption, { color: v.text, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});
