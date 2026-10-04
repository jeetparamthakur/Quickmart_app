import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/home/ProductCard';
import { Badge, ScreenHeader, Skeleton, ErrorState } from '@/components/ui';
import { storeService } from '@/services/api/store.service';
import { productService } from '@/services/api/product.service';
import { Store } from '@/types/store';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice, formatDistance } from '@/utils/formatPrice';
import { Ionicons } from '@expo/vector-icons';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography, radius } = useTheme();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([storeService.getById(id), productService.getByStore(id)]).then(([s, p]) => {
      setStore(s);
      setProducts(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <ScreenHeader title="Store" showBack gradient />
        <View style={{ padding: spacing.lg, gap: 12 }}>
          <Skeleton height={180} borderRadius={16} />
          <Skeleton height={24} width="60%" />
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <ScreenHeader title="Store" showBack />
        <ErrorState icon="storefront-outline" title="Store not found" onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title={store.name} showBack subtitle={`${store.deliveryMinutes} min delivery`} gradient />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: store.image }} style={{ width: '100%', height: 160 }} contentFit="cover" />
        <View style={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Image source={{ uri: store.logo }} style={{ width: 52, height: 52, borderRadius: radius.md }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={14} color={colors.accent} />
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  {store.rating} ({store.reviewCount}) · {formatDistance(store.distanceKm)}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
            {!store.isOpen && <Badge label="Closed" variant="error" />}
            {store.offer && <Badge label={store.offer} variant="accent" />}
            <Badge
              label={(store.deliveryFee ?? 0) === 0 ? 'Free delivery' : `Delivery ${formatPrice(store.deliveryFee)}`}
              variant="neutral"
            />
          </View>

          <Text style={[typography.h3, { color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: '800' }]}>
            Products ({products.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
