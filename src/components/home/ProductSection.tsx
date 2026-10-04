import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ProductSection as ProductSectionType } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { ProductCard } from './ProductCard';
import { FoodProductCard } from './FoodProductCard';
import { t } from '@/i18n';

type Props = {
  section: ProductSectionType;
  tint?: 'primary' | 'accent' | 'none';
  variant?: 'retail' | 'food';
};

export function ProductSection({ section, tint = 'none', variant = 'retail' }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  const products = section.products.slice(0, 10);

  if (!products.length) return null;

  const bg =
    tint === 'primary' ? colors.primaryLight : tint === 'accent' ? colors.accentLight : 'transparent';
  const accent = tint === 'accent' ? colors.accent : colors.primary;

  const seeAllCategory = products[0]?.categoryId;

  return (
    <View
      style={{
        marginBottom: spacing.md,
        marginHorizontal: tint === 'none' ? 0 : spacing.sm,
        backgroundColor: bg,
        paddingVertical: tint === 'none' ? 0 : spacing.sm,
        borderRadius: tint === 'none' ? 0 : radius.lg,
        borderWidth: tint === 'none' ? 0 : StyleSheet.hairlineWidth,
        borderColor: tint === 'none' ? 'transparent' : colors.border,
      }}
    >
      <View style={[styles.heading, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
        <View style={{ flex: 1, paddingRight: 8, flexDirection: 'row', gap: 10 }}>
          <View style={[styles.accent, { backgroundColor: accent }]} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { color: colors.text, fontWeight: '800', letterSpacing: -0.3 }]}>
              {section.title}
            </Text>
            {section.subtitle ? (
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {section.subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {seeAllCategory ? (
          <PressableScale
            onPress={() => router.push(`/category/${seeAllCategory}`)}
            haptic="selection"
            style={[styles.seeAll, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '800' }]}>{t('seeAll')}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </PressableScale>
        ) : null}
      </View>
      <View style={{ height: 252, paddingLeft: spacing.lg }}>
        <FlashList
          data={products}
          renderItem={({ item }) =>
            variant === 'food' ? <FoodProductCard product={item} /> : <ProductCard product={item} />
          }
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center' },
  accent: { width: 4, height: 32, borderRadius: 2 },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
