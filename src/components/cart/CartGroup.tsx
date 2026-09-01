import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartGroup } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { CartItemRow } from './CartItem';
import { formatPrice } from '@/utils/formatPrice';

type Props = {
  group: CartGroup;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

export function CartGroupSection({ group, onRemove, onUpdateQuantity }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={[typography.label, { color: colors.primary, marginBottom: spacing.md }]}>
        {group.storeName}
      </Text>
      {group.items.map((item) => (
        <CartItemRow key={item.id} item={item} onRemove={onRemove} onUpdateQuantity={onUpdateQuantity} />
      ))}
      <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'right' }]}>
        Subtotal: {formatPrice(group.subtotal)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
