import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
};

export function Card({ children, style, padding }: Props) {
  const { colors, radius, shadows, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadows.md,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: padding ?? spacing.lg,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
