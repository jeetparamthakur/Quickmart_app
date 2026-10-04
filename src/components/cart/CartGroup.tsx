import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartGroup } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { CartItemRow } from './CartItem';

type Props = {
  group: CartGroup;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

export function CartGroupSection({ group, onRemove, onUpdateQuantity }: Props) {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadows.md,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          marginBottom: spacing.lg,
          paddingTop: spacing.xs,
        },
      ]}
    >
      {group.items.map((item, index) => (
        <CartItemRow
          key={item.id}
          item={item}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
          isLast={index === group.items.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
