import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CartItem } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { QuantityStepper } from '@/components/ui';
import { formatPrice, formatDiscount } from '@/utils/formatPrice';
import { t } from '@/i18n';

type Props = {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  isLast?: boolean;
};

export function CartItemRow({ item, onRemove, onUpdateQuantity, isLast }: Props) {
  const { colors, spacing, typography } = useTheme();
  const swipeRef = useRef<Swipeable>(null);
  const orig = item.product.originalPrice;
  const discount = orig ? formatDiscount(orig, item.price) : 0;
  const lineTotal = item.price * item.quantity;

  const handleRemove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeRef.current?.close();
    onRemove(item.id);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      layout={LinearTransition.springify().damping(18)}
    >
      <Swipeable
        ref={swipeRef}
        friction={2}
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            onPress={handleRemove}
            style={[styles.deleteAction, { backgroundColor: colors.error }]}
            accessibilityRole="button"
            accessibilityLabel={t('removeItem')}
          >
            <Ionicons name="trash-outline" size={22} color="#FFF" />
            <Text style={styles.deleteLabel}>{t('remove')}</Text>
          </Pressable>
        )}
      >
        <View
          style={[
            styles.item,
            {
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              borderBottomColor: colors.border,
              borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push(`/product/${item.productId}`);
            }}
            style={[styles.imageWrap, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Image source={{ uri: item.product.image }} style={styles.image} contentFit="contain" transition={180} />
            {discount > 0 ? (
              <View style={[styles.offBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.offText}>{discount}%</Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Pressable
                onPress={() => router.push(`/product/${item.productId}`)}
                style={{ flex: 1 }}
              >
                <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '700' }]} numberOfLines={2}>
                  {item.product.name}
                </Text>
              </Pressable>
              <Pressable onPress={handleRemove} hitSlop={10} style={styles.trash}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {item.product.unit}
            </Text>

            <View style={styles.bottomRow}>
              <View>
                <View style={styles.priceRow}>
                  <Text style={[typography.label, { color: colors.text, fontSize: 15 }]}>
                    {formatPrice(item.price)}
                  </Text>
                  {orig && orig > item.price ? (
                    <Text style={[typography.caption, styles.strike, { color: colors.textMuted }]}>
                      {formatPrice(orig)}
                    </Text>
                  ) : null}
                </View>
                {item.quantity > 1 ? (
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {formatPrice(lineTotal)}
                  </Text>
                ) : null}
              </View>
              <QuantityStepper
                quantity={item.quantity}
                onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
                onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
                size="sm"
              />
            </View>
          </View>
        </View>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center' },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 68, height: 68 },
  offBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 8,
  },
  offText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  body: { flex: 1, marginLeft: 12, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  trash: { padding: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strike: { textDecorationLine: 'line-through' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  deleteAction: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteLabel: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
