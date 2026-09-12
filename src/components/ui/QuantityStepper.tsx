import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  const { colors, radius, spacing, typography } = useTheme();
  const isSmall = size === 'sm';
  const isOverlay = size === 'overlay';

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
        activeOpacity={0.85}
        style={[
          styles.addBtn,
          {
            backgroundColor: isOverlay ? colors.surface : colors.primary,
            borderRadius: isOverlay ? 10 : radius.sm,
            paddingHorizontal: isOverlay ? 14 : isSmall ? spacing.sm : spacing.md,
            paddingVertical: isOverlay ? 6 : isSmall ? 4 : spacing.sm,
            borderWidth: isOverlay ? 2 : 0,
            borderColor: colors.primary,
            opacity: disabled ? 0.45 : 1,
          },
          isOverlay ? styles.overlayShadow : null,
        ]}
      >
        <Text
          style={[
            typography.label,
            {
              color: isOverlay ? colors.primary : '#FFF',
              fontSize: isOverlay ? 13 : isSmall ? 12 : 14,
              fontWeight: '800',
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
        isOverlay ? styles.overlayShadow : null,
        {
          backgroundColor: colors.primary,
          borderRadius: isOverlay ? radius.md : radius.sm,
          paddingHorizontal: isOverlay ? 2 : spacing.xs,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <TouchableOpacity onPress={handleDecrease} style={styles.stepBtn} disabled={disabled}>
        <Text style={[styles.stepText, { fontSize: isOverlay || isSmall ? 16 : 18 }]}>−</Text>
      </TouchableOpacity>
      <Text
        style={[
          typography.label,
          { color: '#FFF', minWidth: 18, textAlign: 'center', fontSize: isOverlay || isSmall ? 13 : 15 },
        ]}
      >
        {quantity}
      </Text>
      <TouchableOpacity onPress={handleIncrease} style={styles.stepBtn} disabled={disabled}>
        <Text style={[styles.stepText, { fontSize: isOverlay || isSmall ? 16 : 18 }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stepBtn: {
    padding: 6,
    minWidth: 28,
    alignItems: 'center',
  },
  stepText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
