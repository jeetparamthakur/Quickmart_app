import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Banner } from '@/types/banner';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui/PressableScale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_MS = 5200;
const BANNER_HEIGHT = 176;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type Props = {
  banners: Banner[];
};

type BannerSlideProps = {
  banner: Banner;
  index: number;
  scrollX: SharedValue<number>;
  snap: number;
  bannerWidth: number;
  borderRadius: number;
  isLast: boolean;
  gap: number;
  onPress: () => void;
};

function BannerSlide({
  banner,
  index,
  scrollX,
  snap,
  bannerWidth,
  borderRadius,
  isLast,
  gap,
  onPress,
}: BannerSlideProps) {
  const { shadows } = useTheme();

  const cardStyle = useAnimatedStyle(() => {
    const center = index * snap;
    const scale = interpolate(
      scrollX.value,
      [center - snap, center, center + snap],
      [0.94, 1, 0.94],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [center - snap, center, center + snap],
      [0.72, 1, 0.72],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          width: bannerWidth,
          marginRight: isLast ? 0 : gap,
        },
      ]}
    >
      <PressableScale
        onPress={onPress}
        haptic="selection"
        scaleTo={0.985}
        style={[
          styles.banner,
          shadows.md,
          {
            borderRadius,
            backgroundColor: banner.backgroundColor,
          },
        ]}
      >
        <Image
          source={{ uri: banner.image }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
          contentFit="cover"
          transition={280}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={[styles.imageFade, { borderRadius }]}
          pointerEvents="none"
        />
      </PressableScale>
    </Animated.View>
  );
}

type StoryProgressProps = {
  count: number;
  activeIndex: number;
  progress: SharedValue<number>;
  trackWidth: number;
};

function StoryProgress({ count, activeIndex, progress, trackWidth }: StoryProgressProps) {
  const { radius } = useTheme();

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(0, trackWidth * progress.value),
  }));

  if (count <= 1) return null;

  return (
    <View style={styles.progressRow}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressTrack,
            {
              backgroundColor: 'rgba(255,255,255,0.35)',
              borderRadius: radius.full,
            },
          ]}
        >
          {i < activeIndex ? (
            <View style={[styles.progressFill, { width: '100%', backgroundColor: '#FFF' }]} />
          ) : null}
          {i === activeIndex ? (
            <Animated.View style={[styles.progressFill, fillStyle, { backgroundColor: '#FFF' }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function BannerCarousel({ banners }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const scrollX = useSharedValue(0);
  const progress = useSharedValue(0);

  const { bannerWidth, snap, sideInset, gap } = useMemo(() => {
    const sideInset = spacing.lg;
    const gap = spacing.sm;
    const bannerWidth = SCREEN_WIDTH - sideInset * 2;
    return { bannerWidth, snap: bannerWidth + gap, sideInset, gap };
  }, [spacing.lg, spacing.sm]);

  const goToIndex = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.min(Math.max(index, 0), banners.length - 1);
      scrollRef.current?.scrollTo({ x: clamped * snap, animated });
      setActiveIndex(clamped);
    },
    [banners.length, snap],
  );

  const restartProgress = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (banners.length <= 1 || paused) return;
    progress.value = withTiming(1, { duration: AUTO_MS });
  }, [banners.length, paused, progress]);

  useEffect(() => {
    restartProgress();
    if (banners.length <= 1 || paused) return undefined;

    const timer = setTimeout(() => {
      goToIndex((activeIndex + 1) % banners.length);
    }, AUTO_MS);

    return () => clearTimeout(timer);
  }, [activeIndex, banners.length, goToIndex, paused, restartProgress]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / snap);
    setActiveIndex(Math.min(Math.max(index, 0), banners.length - 1));
    setPaused(false);
  };

  const onScrollBeginDrag = () => {
    setPaused(true);
    cancelAnimation(progress);
  };

  const handlePress = (banner: Banner) => {
    if (banner.targetType === 'category') router.push(`/category/${banner.targetId}`);
    else if (banner.targetType === 'store') router.push(`/store/${banner.targetId}`);
    else if (banner.targetType === 'product') router.push(`/product/${banner.targetId}`);
    else if (banner.targetType === 'url' && banner.targetId) {
      void Linking.openURL(banner.targetId);
    }
  };

  const onProgressRowLayout = (e: LayoutChangeEvent) => {
    const total = e.nativeEvent.layout.width;
    if (banners.length <= 1) return;
    const gapTotal = (banners.length - 1) * 6;
    setTrackWidth((total - gapTotal) / banners.length);
  };

  if (!banners.length) return null;

  const showChrome = banners.length > 1;

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ paddingHorizontal: sideInset }}>
        <View style={styles.sliderShell}>
          <AnimatedScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={snap}
            decelerationRate="fast"
            onScrollBeginDrag={onScrollBeginDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            {banners.map((banner, i) => (
              <BannerSlide
                key={banner.id}
                banner={banner}
                index={i}
                scrollX={scrollX}
                snap={snap}
                bannerWidth={bannerWidth}
                borderRadius={radius.lg}
                isLast={i === banners.length - 1}
                gap={gap}
                onPress={() => handlePress(banner)}
              />
            ))}
          </AnimatedScrollView>

          {showChrome ? (
            <View style={styles.chrome} pointerEvents="none">
              <View style={styles.progressWrap} onLayout={onProgressRowLayout}>
                <StoryProgress
                  count={banners.length}
                  activeIndex={activeIndex}
                  progress={progress}
                  trackWidth={trackWidth}
                />
              </View>
              <View style={[styles.counter, { backgroundColor: colors.overlay, borderRadius: radius.full }]}>
                <Text style={[typography.caption, styles.counterText]}>
                  {activeIndex + 1}
                  <Text style={styles.counterMuted}> / {banners.length}</Text>
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderShell: {
    position: 'relative',
  },
  banner: {
    height: BANNER_HEIGHT,
    overflow: 'hidden',
  },
  imageFade: {
    ...StyleSheet.absoluteFillObject,
    top: '55%',
  },
  chrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  progressWrap: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
  counter: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    color: '#FFF',
    fontWeight: '800',
  },
  counterMuted: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
});
