import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from './PressableScale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: IoniconName;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  style,
  textStyle,
  accessibilityLabel,
}: Props) {
  const { colors, radius, spacing, shadows } = useTheme();

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: '#FFFFFF' },
    secondary: { bg: colors.primaryLight, text: colors.primary },
    ghost: { bg: 'transparent', text: colors.primary, border: colors.border },
    danger: { bg: colors.errorLight, text: colors.error },
  };

  const sizeStyles: Record<ButtonSize, { py: number; px: number; fontSize: number }> = {
    sm: { py: spacing.sm, px: spacing.lg, fontSize: 14 },
    md: { py: spacing.md, px: spacing.xl, fontSize: 16 },
    lg: { py: spacing.lg, px: spacing.xxl, fontSize: 17 },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      haptic="medium"
      accessibilityLabel={accessibilityLabel ?? title}
      style={[
        styles.base,
        variant === 'primary' ? shadows.sm : null,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? v.bg,
          borderWidth: variant === 'ghost' ? 1 : 0,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          borderRadius: radius.md,
          opacity: isDisabled ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.labelRow}>
          {leftIcon ? <Ionicons name={leftIcon} size={18} color={v.text} style={styles.leftIcon} /> : null}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }, textStyle]}>{title}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
});
