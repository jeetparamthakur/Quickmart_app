import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { ProductCard } from '@/components/home/ProductCard';
import { AdSlot, ScreenHeader, Skeleton, EmptyState, PressableScale } from '@/components/ui';
import { productService } from '@/services/api/product.service';
import { categories } from '@/services/mock/data';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';

type SortKey = 'default' | 'price_low' | 'price_high';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, spacing, typography, radius } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('default');

  const category = categories.find((c) => c.id === slug || c.slug === slug);

  useEffect(() => {
    if (!slug) return;
    const catId = category?.id ?? slug;
    productService.getByCategory(catId).then(setProducts).finally(() => setLoading(false));
  }, [slug, category?.id]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === 'price_low') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_high') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort]);

  const chips: { key: SortKey; label: string }[] = [
    { key: 'default', label: 'All' },
    { key: 'price_low', label: 'Price ↑' },
    { key: 'price_high', label: 'Price ↓' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title={category?.name ?? 'Category'} showBack gradient />
      <AdSlot placement="category_banner" />

      <View style={[styles.chips, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
        {chips.map((c) => (
          <PressableScale
            key={c.key}
            onPress={() => setSort(c.key)}
            haptic="selection"
            style={[
              styles.chip,
              {
                backgroundColor: sort === c.key ? colors.primaryLight : colors.surface,
                borderColor: sort === c.key ? colors.primary : colors.border,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                { color: sort === c.key ? colors.primary : colors.textSecondary, fontWeight: '700' },
              ]}
            >
              {c.label}
            </Text>
          </PressableScale>
        ))}
      </View>

      {loading ? (
        <View style={{ padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={140} height={200} borderRadius={12} />
          ))}
        </View>
      ) : sorted.length === 0 ? (
        <EmptyState icon="cube-outline" title="No products" subtitle="No products in this category yet" />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <FlashList
            data={sorted}
            renderItem={({ item }) => <ProductCard product={item} width={150} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
