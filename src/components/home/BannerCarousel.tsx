import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Linking } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Banner } from '@/types/banner';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE = 16;
const PEEK = 28;
const GAP = 12;
const BANNER_WIDTH = SCREEN_WIDTH - SIDE * 2 - PEEK;
const SNAP = BANNER_WIDTH + GAP;

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
        scrollRef.current?.scrollTo({ x: next * SNAP, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP);
    setActiveIndex(Math.min(Math.max(index, 0), banners.length - 1));
  };

  const handlePress = (banner: Banner) => {
    if (banner.targetType === 'category') router.push(`/category/${banner.targetId}`);
    else if (banner.targetType === 'store') router.push(`/store/${banner.targetId}`);
    else if (banner.targetType === 'product') router.push(`/product/${banner.targetId}`);
    else if (banner.targetType === 'url' && banner.targetId) {
      void Linking.openURL(banner.targetId);
    }
  };

  if (!banners.length) return null;

  return (
    <View style={{ marginBottom: spacing.md }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE }}
      >
        {banners.map((banner, i) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.95}
            onPress={() => handlePress(banner)}
            style={[
              styles.banner,
              {
                width: BANNER_WIDTH,
                marginRight: i === banners.length - 1 ? 0 : GAP,
                borderRadius: radius.lg,
                backgroundColor: banner.backgroundColor,
              },
            ]}
          >
            <Image source={{ uri: banner.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.62)']}
              style={[styles.overlay, { borderRadius: radius.lg }]}
            >
              <Text style={[typography.h3, { color: '#FFF', fontWeight: '800' }]}>{banner.title}</Text>
              {banner.subtitle ? (
                <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.92)', marginTop: 4 }]}>
                  {banner.subtitle}
                </Text>
              ) : null}
              <View style={styles.cta}>
                <Text style={[styles.ctaText, { color: colors.primary }]}>{t('shopNow')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.primary : colors.border,
                width: i === activeIndex ? 18 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { height: 180, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', padding: 16 },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ctaText: { fontWeight: '800', fontSize: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { height: 6, borderRadius: 3 },
});
