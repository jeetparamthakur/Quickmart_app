import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/home/ProductCard';
import { AdSlot } from '@/components/ui';
import { productService } from '@/services/api/product.service';
import { categories } from '@/services/mock/data';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, spacing, typography } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = categories.find((c) => c.id === slug || c.slug === slug);

  useEffect(() => {
    if (!slug) return;
    const catId = category?.id ?? slug;
    productService.getByCategory(catId).then(setProducts).finally(() => setLoading(false));
  }, [slug, category?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
        <Text style={{ fontSize: 28 }}>{category?.icon ?? '📦'}</Text>
        <Text style={[typography.h2, { color: colors.text }]}>{category?.name ?? 'Category'}</Text>
      </TouchableOpacity>

      <AdSlot placement="category_banner" />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 24 }}>
          {products.length === 0 ? (
            <Text style={[typography.body, { color: colors.textSecondary }]}>No products in this category</Text>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
