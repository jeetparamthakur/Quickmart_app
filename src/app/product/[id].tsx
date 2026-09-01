import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Skeleton, Badge, QuantityStepper, ErrorState } from '@/components/ui';
import { ProductCard } from '@/components/home/ProductCard';
import { ImageCarousel } from '@/components/product/ImageCarousel';
import { SellerPicker } from '@/components/product/SellerPicker';
import { productService } from '@/services/api/product.service';
import { Product, ProductSeller } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice, formatDiscount } from '@/utils/formatPrice';
import { t } from '@/i18n';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<ProductSeller | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    productService
      .getById(id)
      .then((p) => {
        if (!p) setError(true);
        setProduct(p);
        if (p?.sellers?.length) setSelectedSeller(p.sellers[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    productService.getSimilar(id).then(setSimilar);
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Skeleton height={300} borderRadius={16} />
        <Skeleton height={24} style={{ marginTop: 16 }} />
        <Skeleton height={16} width="60%" style={{ marginTop: 8 }} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorState
          icon="📦"
          title="Product unavailable"
          subtitle="This product is out of stock or no longer available"
          onRetry={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const price = selectedSeller?.price ?? product.price;
  const originalPrice = selectedSeller?.originalPrice ?? product.originalPrice;
  const discount = originalPrice ? formatDiscount(originalPrice, price) : 0;
  const storeId = selectedSeller?.storeId ?? product.storeId;
  const storeName = selectedSeller?.storeName ?? product.storeName;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, 1, storeId, storeName, price);
    }
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.lg }}>
          <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
        </TouchableOpacity>

        <ImageCarousel images={product.images} />

        <View style={{ padding: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{product.brand}</Text>
          <Text style={[typography.h2, { color: colors.text, marginTop: 4 }]}>{product.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <Text style={{ color: colors.accent }}>⭐ {product.rating}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>({product.reviewCount} reviews)</Text>
            {discount > 0 && <Badge label={`${discount}% OFF`} variant="accent" />}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
            <Text style={[typography.h1, { color: colors.text }]}>{formatPrice(price)}</Text>
            {originalPrice && (
              <Text style={[typography.body, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                {formatPrice(originalPrice)}
              </Text>
            )}
            <Text style={[typography.caption, { color: colors.textMuted }]}>{product.unit}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl }}>
            <Text style={[typography.label, { color: colors.text }]}>Quantity:</Text>
            <QuantityStepper
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              min={1}
            />
          </View>

          {product.sellers && (
            <SellerPicker
              sellers={product.sellers}
              selectedStoreId={selectedSeller?.storeId ?? product.storeId}
              onSelect={setSelectedSeller}
            />
          )}

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl }]}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              🚚 Delivery in {selectedSeller?.deliveryMinutes ?? 15}-{(selectedSeller?.deliveryMinutes ?? 15) + 10} min from {storeName}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              ↩️ Easy 7-day return policy
            </Text>
          </View>

          <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xxl }]}>Description</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>{product.description}</Text>

          <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xl }]}>Specifications</Text>
          {Object.entries(product.specifications).map(([key, val]) => (
            <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
              <Text style={[typography.bodySmall, { color: colors.textMuted }]}>{key}</Text>
              <Text style={[typography.bodySmall, { color: colors.text }]}>{val}</Text>
            </View>
          ))}

          {similar.length > 0 && (
            <>
              <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md }]}>Similar Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similar.map((p) => <ProductCard key={p.id} product={p} />)}
              </ScrollView>
            </>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View entering={FadeInDown.duration(400)} style={[styles.footer, shadows.lg, { backgroundColor: colors.surface, padding: spacing.lg, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <Button title={t('addToCart')} onPress={handleAddToCart} fullWidth size="lg" />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoBox: {},
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});
