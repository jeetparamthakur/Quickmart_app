import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from '@/utils/haptics';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'overlay';
  disabled?: boolean;
};

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
  size = 'md',
  disabled = false,
}: Props) {
  const { colors, radius, spacing, typography, fontFamily, shadows } = useTheme();
  const isSmall = size === 'sm';
  const isOverlay = size === 'overlay';
  const pillRadius = radius.full;

  const handleIncrease = () => {
    if (disabled || quantity >= max) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIncrease();
  };

  const handleDecrease = () => {
    if (disabled || quantity <= min) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecrease();
  };

  if (quantity === 0) {
    return (
      <TouchableOpacity
        onPress={handleIncrease}
        disabled={disabled}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        style={[
          styles.addBtn,
          shadows.sm,
          {
            backgroundColor: isOverlay ? colors.surface : colors.cta,
            borderRadius: pillRadius,
            paddingHorizontal: isOverlay ? 16 : isSmall ? spacing.md : spacing.lg,
            paddingVertical: isOverlay ? 7 : isSmall ? 5 : 7,
            borderWidth: isOverlay ? 2 : 0,
            borderColor: colors.cta,
            opacity: disabled ? 0.45 : 1,
            minWidth: isSmall ? 56 : 64,
          },
        ]}
      >
        <Text
          style={[
            typography.label,
            {
              color: isOverlay ? colors.cta : '#FFF',
              fontSize: isOverlay ? 12 : isSmall ? 11 : 13,
              fontFamily: fontFamily.extraBold,
              letterSpacing: 0.6,
            },
          ]}
        >
          ADD
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.stepper,
        shadows.sm,
        {
          backgroundColor: colors.cta,
          borderRadius: pillRadius,
          paddingHorizontal: isOverlay ? 4 : spacing.xs,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleDecrease}
        style={styles.stepBtn}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Text style={[styles.stepText, { fontSize: isOverlay || isSmall ? 16 : 18, fontFamily: fontFamily.bold }]}>−</Text>
      </TouchableOpacity>
      <Text
        style={[
          typography.label,
          {
            color: '#FFF',
            minWidth: 20,
            textAlign: 'center',
            fontSize: isOverlay || isSmall ? 13 : 15,
            fontFamily: fontFamily.bold,
          },
        ]}
      >
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={handleIncrease}
        style={styles.stepBtn}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Text style={[styles.stepText, { fontSize: isOverlay || isSmall ? 16 : 18, fontFamily: fontFamily.bold }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  stepBtn: {
    padding: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  stepText: {
    color: '#FFF',
  },
});
