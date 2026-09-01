import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar, ShimmerCard, AdSlot, ErrorState } from '@/components/ui';
import { HomeHeader } from '@/components/home/HomeHeader';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { StoreCard } from '@/components/home/StoreCard';
import { ProductSection } from '@/components/home/ProductSection';
import { homeService } from '@/services/api/home.service';
import { useLocationStore } from '@/store/locationStore';
import { Banner } from '@/types/banner';
import { Category, ProductSection as ProductSectionType } from '@/types/product';
import { Store } from '@/types/store';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [sections, setSections] = useState<ProductSectionType[]>([]);

  const loadData = useCallback(async () => {
    try {
      setError(false);
      const lat = selectedAddress?.latitude;
      const lng = selectedAddress?.longitude;
      const [b, c, s, sec] = await Promise.all([
        homeService.getBanners(),
        homeService.getCategories(),
        homeService.getNearbyStores(lat, lng),
        homeService.getProductSections(),
      ]);
      setBanners(b);
      setCategories(c);
      setStores(s);
      setSections(sec);
    } catch {
      setError(true);
    }
  }, [selectedAddress?.latitude, selectedAddress?.longitude]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (error && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <HomeHeader />
        <ErrorState title="Something went wrong" subtitle="Unable to load home data" onRetry={loadData} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeHeader />
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <SearchBar
          value=""
          onChangeText={() => {}}
          placeholder={t('searchPlaceholder')}
          editable={false}
          onPress={() => router.push('/(tabs)/search')}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <View style={{ width: '100%' }}><ShimmerCard /></View>
            {[1, 2, 3, 4].map((i) => <ShimmerCard key={i} />)}
          </View>
        ) : (
          <>
            <BannerCarousel banners={banners} />
            <AdSlot placement="home_top" />

            <Text style={[typography.h3, { color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
              {t('categories')}
            </Text>
            <CategoryGrid categories={categories} />

            <AdSlot placement="home_middle" />

            <Text style={[typography.h3, { color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md }]}>
              {t('nearbyStores')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </ScrollView>

            {sections.map((section) => (
              <ProductSection key={section.id} section={section} />
            ))}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
