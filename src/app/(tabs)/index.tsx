import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate, interpolateColor } from 'react-native-reanimated';
import { SearchBar, AdSlot, ErrorState } from '@/components/ui';
import { HomeHeader } from '@/components/home/HomeHeader';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { QuickPills } from '@/components/home/QuickPills';
import { StoreChip } from '@/components/home/StoreChip';
import { ProductSection } from '@/components/home/ProductSection';
import { MiniCartBar } from '@/components/home/MiniCartBar';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { homeService } from '@/services/api/home.service';
import { useLocationStore } from '@/store/locationStore';
import { useCartStore } from '@/store/cartStore';
import { Banner } from '@/types/banner';
import { Category, ProductSection as ProductSectionType } from '@/types/product';
import { Store } from '@/types/store';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [sections, setSections] = useState<ProductSectionType[]>([]);
  const scrollY = useSharedValue(0);

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

  const deliveryMinutes = (() => {
    const open = stores.filter((s) => s.isOpen);
    const source = open.length ? open : stores;
    if (!source.length) return 10;
    return Math.min(...source.map((s) => s.deliveryMinutes));
  })();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const chromeStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 24], [0, 0.08], 'clamp'),
    elevation: interpolate(scrollY.value, [0, 24], [0, 4], 'clamp'),
    borderBottomColor: interpolateColor(scrollY.value, [0, 24], ['transparent', colors.border]),
  }));

  if (error && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <HomeHeader deliveryMinutes={deliveryMinutes} />
        <ErrorState title="Something went wrong" subtitle="Unable to load home data" onRetry={loadData} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View style={[styles.chrome, chromeStyle, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[colors.primaryLight, colors.background]} style={styles.wash}>
          <HomeHeader deliveryMinutes={deliveryMinutes} />
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder={t('searchPlaceholder')}
              hints={[
                t('searchHint', { q: 'milk' }),
                t('searchHint', { q: 'bread' }),
                t('searchHint', { q: 'bananas' }),
                t('searchHint', { q: 'rice' }),
                t('searchHint', { q: 'snacks' }),
              ]}
              editable={false}
              variant="pill"
              onPress={() => router.push('/(tabs)/search')}
            />
          </View>
          <QuickPills />
        </LinearGradient>
      </Animated.View>

      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 88 : 24 }}
      >
        {loading ? (
          <HomeSkeleton />
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(420).delay(40)}>
              <BannerCarousel banners={banners} />
            </Animated.View>
            <AdSlot placement="home_top" />

            <Animated.View entering={FadeInDown.duration(420).delay(80)}>
              <View style={[styles.heading, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
                <Text style={[typography.h3, { color: colors.text, fontWeight: '800', flex: 1 }]}>
                  {t('shopByCategory')}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/categories')} hitSlop={8}>
                  <Text style={[typography.label, { color: colors.primary }]}>{t('seeAll')}</Text>
                </TouchableOpacity>
              </View>
              <CategoryGrid categories={categories} />
            </Animated.View>

            <AdSlot placement="home_middle" />

            {stores.length > 0 ? (
              <Animated.View entering={FadeInDown.duration(420).delay(120)} style={{ marginTop: spacing.xl }}>
                <Text
                  style={[
                    typography.h3,
                    { color: colors.text, fontWeight: '800', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
                  ]}
                >
                  {t('nearbyStores')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}
                >
                  {stores.map((store) => (
                    <StoreChip key={store.id} store={store} />
                  ))}
                </ScrollView>
              </Animated.View>
            ) : null}

            {sections.map((section, i) => (
              <Animated.View key={section.id} entering={FadeInDown.duration(400).delay(140 + i * 60)}>
                <ProductSection section={section} tint={i % 2 === 0 ? 'primary' : 'accent'} />
              </Animated.View>
            ))}
          </>
        )}
      </AnimatedScrollView>
      <MiniCartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chrome: {
    zIndex: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  wash: { paddingTop: 4 },
  heading: { flexDirection: 'row', alignItems: 'center' },
});
