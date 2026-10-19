import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

type Props = {
  images: string[];
  height?: number;
};

export function ImageCarousel({ images, height = 320 }: Props) {
  const { colors, radius } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceSecondary }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16}
      >
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img }} style={{ width, height }} contentFit="contain" />
        ))}
      </ScrollView>
      <View style={[styles.dots, { backgroundColor: colors.card, borderRadius: radius.full }]}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.primary : colors.borderSubtle,
                width: i === activeIndex ? 18 : 6,
                borderRadius: radius.full,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 8 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: { height: 6 },
});
