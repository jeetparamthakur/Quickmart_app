import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ProductSection as ProductSectionType } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { ProductCard } from './ProductCard';
import { t } from '@/i18n';

type Props = {
  section: ProductSectionType;
  tint?: 'primary' | 'accent' | 'none';
};

export function ProductSection({ section, tint = 'none' }: Props) {
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
        marginBottom: spacing.lg,
        marginHorizontal: tint === 'none' ? 0 : spacing.sm,
        backgroundColor: bg,
        paddingVertical: tint === 'none' ? 0 : spacing.md,
        borderRadius: tint === 'none' ? 0 : radius.lg,
      }}
    >
      <View style={[styles.heading, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={[styles.accent, { backgroundColor: accent }]} />
          <Text style={[typography.h3, { color: colors.text, fontWeight: '800' }]}>{section.title}</Text>
        </View>
        {seeAllCategory ? (
          <TouchableOpacity
            onPress={() => router.push(`/category/${seeAllCategory}`)}
            hitSlop={8}
            style={[styles.seeAll, { backgroundColor: colors.surface }]}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '800' }]}>{t('seeAll')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={{ height: 268, paddingLeft: spacing.lg }}>
        <FlashList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
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
  accent: { width: 28, height: 3, borderRadius: 2, marginBottom: 6 },
  seeAll: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
});
