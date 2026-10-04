import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { useTheme } from '@/context/ThemeContext';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

export function MiniCartBar() {
  const { colors, typography, radius, shadows, spacing } = useTheme();
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const savings = items.reduce((sum, i) => {
    const orig = i.product.originalPrice ?? i.price;
    return sum + (orig - i.price) * i.quantity;
  }, 0);
  const thumbs = items.slice(0, 3).map((i) => i.product.image);

  if (count === 0) return null;

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(16)}
      style={[styles.wrap, { bottom: spacing.xs }]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(tabs)/cart');
        }}
        style={[shadows.lg, { borderRadius: radius.lg }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bar, { borderRadius: radius.lg }]}
        >
          <View style={styles.left}>
            <View style={styles.thumbs}>
              {thumbs.map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={[
                    styles.thumb,
                    { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i, borderColor: colors.primaryDark },
                  ]}
                  contentFit="cover"
                />
              ))}
            </View>
            <View>
              <Text style={[typography.label, { color: '#FFF' }]}>
                {count} {t('items')}
              </Text>
              {savings > 0 ? (
                <Text style={[typography.caption, { color: 'rgba(255,255,255,0.85)', marginTop: 2 }]}>
                  {t('youSaved', { amount: formatPrice(savings) })}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.cta}>
            <Text style={[typography.label, { color: '#FFF', fontWeight: '800' }]}>{t('viewCart')}</Text>
            <Text style={{ color: '#FFF', fontSize: 16 }}> →</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  thumbs: { flexDirection: 'row', alignItems: 'center' },
  thumb: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  cta: { flexDirection: 'row', alignItems: 'center' },
});
