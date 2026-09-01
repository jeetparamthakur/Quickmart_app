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
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View>
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
      <View style={styles.dots}>
        {images.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === activeIndex ? colors.primary : colors.border }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
