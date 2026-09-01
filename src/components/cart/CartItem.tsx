import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { CartItem } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { QuantityStepper } from '@/components/ui';
import { formatPrice } from '@/utils/formatPrice';

type Props = {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

export function CartItemRow({ item, onRemove, onUpdateQuantity }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  return (
    <View
      style={[
        styles.item,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Image source={{ uri: item.product.image }} style={styles.image} contentFit="cover" />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600' }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{item.product.unit}</Text>
        <Text style={[typography.label, { color: colors.text, marginTop: 4 }]}>{formatPrice(item.price)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => onRemove(item.id)}>
          <Text style={{ color: colors.error, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
        <QuantityStepper
          quantity={item.quantity}
          onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center' },
  image: { width: 64, height: 64, borderRadius: 8 },
});
