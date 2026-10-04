import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { QuantityStepper } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

const CARD_WIDTH = 158;

type Props = {
  product: Product;
  width?: number;
};

export const FoodProductCard = memo(function FoodProductCard({ product, width = CARD_WIDTH }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartStore((s) => s.getQuantity(product.id, product.storeId));
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const vegColor = product.isVeg ? '#2E7D32' : '#C62828';

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
          <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" transition={200} />
          <View style={[styles.vegDot, { borderColor: vegColor }]}>
            <View style={[styles.vegInner, { backgroundColor: vegColor }]} />
          </View>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={1}>
          {product.storeName}
        </Text>
        <Text style={[typography.label, { color: colors.text, fontWeight: '700', marginTop: 2 }]} numberOfLines={2}>
          {product.name}
        </Text>
        {product.prepTimeMinutes != null ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {product.prepTimeMinutes} {t('minutesShort')}
          </Text>
        ) : null}
        <View style={[styles.footer, { marginTop: spacing.sm }]}>
          <Text style={[typography.label, { color: colors.text, fontWeight: '800' }]}>
            {formatPrice(product.price)}
          </Text>
          <QuantityStepper
            quantity={quantity}
            size="sm"
            onIncrease={() => {
              if (quantity === 0) addItem(product);
              else updateQuantity(`${product.id}-${product.storeId}`, quantity + 1);
            }}
            onDecrease={() => updateQuantity(`${product.id}-${product.storeId}`, quantity - 1)}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: { marginRight: 12 },
  imageWrap: {
    height: 120,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  vegDot: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  vegInner: { width: 8, height: 8, borderRadius: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
