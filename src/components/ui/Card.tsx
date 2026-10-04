import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from './PressableScale';

type CardVariant = 'elevated' | 'outline' | 'flat';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: CardVariant;
  onPress?: () => void;
};

export function Card({ children, style, padding, variant = 'elevated', onPress }: Props) {
  const { colors, radius, shadows, spacing } = useTheme();

  const shellStyle = [
    styles.card,
    variant === 'elevated' ? shadows.md : null,
    variant === 'outline' ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border } : null,
    variant === 'flat' ? { borderWidth: 0 } : null,
    {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: padding ?? spacing.lg,
    },
    style,
  ];

  if (onPress) {
    return (
      <PressableScale onPress={onPress} haptic="selection" style={shellStyle}>
        {children}
      </PressableScale>
    );
  }

  return <View style={shellStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
