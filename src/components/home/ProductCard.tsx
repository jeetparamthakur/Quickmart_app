import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { QuantityStepper } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatDiscount } from '@/utils/formatPrice';

const CARD_WIDTH = 150;

type Props = {
  product: Product;
  width?: number;
};

export const ProductCard = memo(function ProductCard({ product, width = CARD_WIDTH }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartStore((s) => s.getQuantity(product.id, product.storeId));

  const discount = product.originalPrice ? formatDiscount(product.originalPrice, product.price) : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.id}`)}
      style={[styles.card, shadows.sm, { width, backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}
    >
      <View style={[styles.imageWrap, { backgroundColor: colors.surfaceSecondary, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }]}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" transition={200} />
        {discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
            <Text style={[typography.caption, { color: '#FFF', fontWeight: '700' }]}>{discount}% OFF</Text>
          </View>
        )}
      </View>
      <View style={{ padding: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>{product.unit}</Text>
        <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600', marginTop: 2 }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Text style={[typography.label, { color: colors.text }]}>{formatPrice(product.price)}</Text>
          {product.originalPrice ? (
            <Text style={[typography.caption, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
              {formatPrice(product.originalPrice)}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end', marginTop: spacing.sm }}>
          <QuantityStepper
            quantity={quantity}
            onIncrease={() => {
              if (quantity === 0) addItem(product);
              else updateQuantity(`${product.id}-${product.storeId}`, quantity + 1);
            }}
            onDecrease={() => updateQuantity(`${product.id}-${product.storeId}`, quantity - 1)}
            size="sm"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { overflow: 'hidden', marginRight: 12 },
  imageWrap: { height: 120, position: 'relative' },
  image: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});
