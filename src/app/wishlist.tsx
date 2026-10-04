import { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, EmptyState } from '@/components/ui';
import { ProductCard } from '@/components/home/ProductCard';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { wishlistService } from '@/services/api/wishlist.service';
import { Product } from '@/types/product';
import { t } from '@/i18n';

const H_PAD = 16;
const GAP = 12;

export default function WishlistScreen() {
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const cardWidth = (width - H_PAD * 2 - GAP) / 2;

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await wishlistService.list();
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!authHydrated) return;
      void load();
    }, [authHydrated, load]),
  );

  if (!authHydrated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('wishlist')} showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('wishlist')} showBack />
        <EmptyState
          icon="heart-outline"
          title={t('signInToWishlist')}
          actionLabel={t('signIn')}
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('wishlist')} showBack />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={t('wishlistEmpty')}
          subtitle={t('wishlistEmptySubtitle')}
          actionLabel={t('browseProducts')}
          onAction={() => router.replace('/(tabs)')}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PAD }}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.xxl * 2, gap: GAP }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
