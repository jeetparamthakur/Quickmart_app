import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { AdSlot, ErrorState, EmptyState } from '@/components/ui';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeSearchModeBar } from '@/components/home/HomeSearchModeBar';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductSection } from '@/components/home/ProductSection';
import { MiniCartBar } from '@/components/home/MiniCartBar';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { homeService } from '@/services/api/home.service';
import { useLocationStore } from '@/store/locationStore';
import { useCartStore } from '@/store/cartStore';
import { useHomeModeStore } from '@/store/homeModeStore';
import { Banner } from '@/types/banner';
import { Category, ProductSection as ProductSectionType } from '@/types/product';
import { Store } from '@/types/store';
import { useTheme } from '@/context/ThemeContext';
import { useTabScreenInsets } from '@/hooks/useTabScreenInsets';
import { t } from '@/i18n';

const MINI_CART_SCROLL_EXTRA = 56;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { contentPaddingBottom } = useTabScreenInsets();
  const selectedAddress = useLocationStore((s) => s.selectedAddress);
  const homeMode = useHomeModeStore((s) => s.mode);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nearestStore, setNearestStore] = useState<Store | null>(null);
  const [sections, setSections] = useState<ProductSectionType[]>([]);
  const scrollY = useSharedValue(0);

  const loadData = useCallback(async () => {
    try {
      setError(false);
      const lat = selectedAddress?.latitude;
      const lng = selectedAddress?.longitude;
      const [b, c] = await Promise.all([homeService.getBanners(), homeService.getCategories()]);
      setBanners(b);
      setCategories(c);

      if (homeMode === 'groceries') {
        const feed = await homeService.getGroceriesFeed(lat, lng);
        setNearestStore(feed.nearestStore);
        setSections(feed.sections);
      } else {
        const feed = await homeService.getFoodFeed(lat, lng);
        setNearestStore(feed.nearestStore);
        setSections(feed.sections);
      }
    } catch {
      setError(true);
    }
  }, [selectedAddress?.latitude, selectedAddress?.longitude, homeMode]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const chromeStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(scrollY.value, [0, 32], [0, 0.1], 'clamp'),
    elevation: interpolate(scrollY.value, [0, 32], [0, 6], 'clamp'),
    borderBottomColor: interpolateColor(scrollY.value, [0, 32], ['transparent', colors.border]),
  }));

  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollY.value, [0, 120], [1, 0.98], 'clamp') }],
    opacity: interpolate(scrollY.value, [0, 160], [1, 0.94], 'clamp'),
  }));

  const feedEmpty = !loading && !nearestStore;

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
      <Animated.View style={[styles.chrome, chromeStyle, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primaryLight, colors.background, colors.background]}
          locations={[0, 0.55, 1]}
          style={styles.wash}
        >
          <HomeHeader />
          <HomeSearchModeBar animatedStyle={searchStyle} />
        </LinearGradient>
      </Animated.View>

      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.xs,
          paddingBottom: contentPaddingBottom + (cartCount > 0 ? MINI_CART_SCROLL_EXTRA : 0),
        }}
      >
        {loading ? (
          <HomeSkeleton />
        ) : feedEmpty ? (
          <EmptyState
            icon={homeMode === 'food' ? 'restaurant-outline' : 'cart-outline'}
            title={homeMode === 'food' ? t('noFoodTitle') : t('noGroceryStoreTitle')}
            subtitle={homeMode === 'food' ? t('noFoodSubtitle') : t('noGroceryStoreSubtitle')}
            actionLabel={t('changeAddress')}
            onAction={() => router.push('/(onboarding)/location')}
          />
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(380).delay(30)}>
              <BannerCarousel banners={banners} />
            </Animated.View>
            <AdSlot placement="home_top" />

            {homeMode === 'groceries' ? (
              <Animated.View entering={FadeInDown.duration(380).delay(70)}>
                <HomeSectionHeader
                  title={t('shopByCategory')}
                  subtitle={t('categories')}
                  onSeeAll={() => router.push('/(tabs)/categories')}
                />
                <CategoryGrid categories={categories} />
              </Animated.View>
            ) : null}

            <AdSlot placement="home_middle" />

            {sections.map((section, i) => (
              <Animated.View key={section.id} entering={FadeInDown.duration(360).delay(100 + i * 50)}>
                <ProductSection
                  section={section}
                  tint={i % 2 === 0 ? 'primary' : 'accent'}
                  variant={homeMode === 'food' ? 'food' : 'retail'}
                />
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
    shadowRadius: 10,
  },
  wash: { paddingTop: 2 },
});
