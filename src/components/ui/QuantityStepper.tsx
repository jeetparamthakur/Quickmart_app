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
  size?: 'sm' | 'md';
};

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
  size = 'md',
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const isSmall = size === 'sm';

  const handleIncrease = () => {
    if (quantity < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrease();
    }
  };

  const handleDecrease = () => {
    if (quantity > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrease();
    }
  };

  if (quantity === 0) {
    return (
      <TouchableOpacity
        onPress={handleIncrease}
        style={[
          styles.addBtn,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.sm,
            paddingHorizontal: isSmall ? spacing.sm : spacing.md,
            paddingVertical: isSmall ? 4 : spacing.sm,
          },
        ]}
      >
        <Text style={[typography.label, { color: '#FFF', fontSize: isSmall ? 12 : 14 }]}>ADD</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.stepper,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.xs,
        },
      ]}
    >
      <TouchableOpacity onPress={handleDecrease} style={styles.stepBtn}>
        <Text style={[styles.stepText, { fontSize: isSmall ? 16 : 18 }]}>−</Text>
      </TouchableOpacity>
      <Text style={[typography.label, { color: '#FFF', minWidth: 20, textAlign: 'center', fontSize: isSmall ? 13 : 15 }]}>
        {quantity}
      </Text>
      <TouchableOpacity onPress={handleIncrease} style={styles.stepBtn}>
        <Text style={[styles.stepText, { fontSize: isSmall ? 16 : 18 }]}>+</Text>
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
    gap: 4,
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
