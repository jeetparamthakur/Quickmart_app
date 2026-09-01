import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/home/ProductCard';
import { Badge } from '@/components/ui';
import { storeService } from '@/services/api/store.service';
import { productService } from '@/services/api/product.service';
import { Store } from '@/types/store';
import { Product } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice, formatDistance } from '@/utils/formatPrice';

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text }}>Store not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
      </TouchableOpacity>

      <ScrollView>
        <Image source={{ uri: store.image }} style={{ width: '100%', height: 180 }} contentFit="cover" />
        <View style={{ padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Image source={{ uri: store.logo }} style={{ width: 56, height: 56, borderRadius: 12 }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={[typography.h2, { color: colors.text }]}>{store.name}</Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                ⭐ {store.rating} ({store.reviewCount}) · {store.deliveryMinutes} min · {formatDistance(store.distanceKm)}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
            {!store.isOpen && <Badge label="Closed" variant="error" />}
            {store.offer && <Badge label={store.offer} variant="accent" />}
            <Badge label={store.deliveryFee === 0 ? 'Free delivery' : `Delivery ${formatPrice(store.deliveryFee)}`} variant="neutral" />
          </View>

          <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md }]}>
            Products ({products.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
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
