import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { QuantityStepper } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatDiscount } from '@/utils/formatPrice';
import { t } from '@/i18n';

const CARD_WIDTH = 148;

type Props = {
  product: Product;
  width?: number;
};

export const ProductCard = memo(function ProductCard({ product, width = CARD_WIDTH }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartStore((s) => s.getQuantity(product.id, product.storeId));
  const scale = useSharedValue(1);

  const discount = product.originalPrice ? formatDiscount(product.originalPrice, product.price) : 0;
  const outOfStock = product.inStock === false;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.card, animStyle, { width }]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          router.push(`/product/${product.id}`);
        }}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 240 });
        }}
      >
        <View
          style={[
            styles.imageWrap,
            { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderColor: colors.border },
          ]}
        >
          <Image
            source={{ uri: product.image }}
            style={[styles.image, outOfStock ? { opacity: 0.4 } : null]}
            contentFit="contain"
            transition={200}
          />
          {discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
          {product.tags?.includes('bestseller') ? (
            <View style={[styles.tag, { backgroundColor: colors.primary }]}>
              <Text style={styles.tagText}>{t('bestTag')}</Text>
            </View>
          ) : null}
          {outOfStock ? (
            <View style={styles.oos}>
              <Text style={[typography.caption, { color: colors.error, fontWeight: '800' }]}>{t('outOfStock')}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ paddingTop: spacing.sm, paddingHorizontal: 2 }}>
          <Text style={[typography.caption, { color: colors.textMuted, fontWeight: '600' }]} numberOfLines={1}>
            {product.unit}
          </Text>
          <Text
            style={[typography.bodySmall, { color: colors.text, fontWeight: '700', marginTop: 2, minHeight: 36 }]}
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text style={[typography.label, { color: colors.text, fontSize: 15 }]}>{formatPrice(product.price)}</Text>
            {product.originalPrice ? (
              <Text style={[typography.caption, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.stepperWrap}>
        <QuantityStepper
          quantity={quantity}
          disabled={outOfStock}
          onIncrease={() => {
            if (quantity === 0) addItem(product);
            else updateQuantity(`${product.id}-${product.storeId}`, quantity + 1);
          }}
          onDecrease={() => updateQuantity(`${product.id}-${product.storeId}`, quantity - 1)}
          size="overlay"
        />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { marginRight: 12 },
  imageWrap: { height: 148, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomRightRadius: 10,
  },
  discountText: { color: '#FFFFFF', fontWeight: '800', fontSize: 10 },
  tag: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 72,
  },
  tagText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  oos: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  stepperWrap: { position: 'absolute', right: 8, top: 108 },
});
