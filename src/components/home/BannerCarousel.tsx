import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Banner } from '@/types/banner';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

type Props = {
  banners: Banner[];
};

export function BannerCarousel({ banners }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  const handlePress = (banner: Banner) => {
    if (banner.targetType === 'category') router.push(`/category/${banner.targetId}`);
    else if (banner.targetType === 'store') router.push(`/store/${banner.targetId}`);
    else if (banner.targetType === 'product') router.push(`/product/${banner.targetId}`);
  };

  if (!banners.length) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.95}
            onPress={() => handlePress(banner)}
            style={[styles.banner, { width: BANNER_WIDTH - spacing.lg, marginRight: spacing.lg, borderRadius: radius.lg, backgroundColor: banner.backgroundColor }]}
          >
            <Image source={{ uri: banner.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={[styles.overlay, { borderRadius: radius.lg }]}>
              <Text style={[typography.h2, { color: '#FFF' }]}>{banner.title}</Text>
              {banner.subtitle && (
                <Text style={[typography.body, { color: 'rgba(255,255,255,0.9)', marginTop: 4 }]}>{banner.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === activeIndex ? colors.primary : colors.border, width: i === activeIndex ? 20 : 6 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { height: 160, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', padding: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
});
