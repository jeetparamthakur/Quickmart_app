import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Category } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui/PressableScale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 16;
const COLS_VISIBLE = 4;
const TILE = Math.floor((SCREEN_WIDTH - H_PAD * 2) / COLS_VISIBLE);

type Props = {
  categories: Category[];
  horizontal?: boolean;
};

export function CategoryGrid({ categories, horizontal = true }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  const renderItem = (cat: Category, width: number) => (
    <PressableScale
      key={cat.id}
      onPress={() => router.push(`/category/${cat.id}`)}
      haptic="selection"
      accessibilityLabel={cat.name}
      style={[styles.item, { width }]}
    >
      <View
        style={[
          styles.iconWrap,
          shadows.sm,
          {
            backgroundColor: cat.color || colors.primaryLight,
            borderRadius: radius.md,
            width: width - 10,
            height: width - 8,
          },
        ]}
      >
        <Image source={{ uri: cat.image }} style={styles.image} contentFit="cover" />
        <View style={styles.emojiBadge}>
          <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
        </View>
      </View>
      <Text
        style={[typography.caption, { color: colors.text, textAlign: 'center', marginTop: 4, fontWeight: '700' }]}
        numberOfLines={2}
      >
        {cat.name}
      </Text>
    </PressableScale>
  );

  if (horizontal) {
    const colCount = Math.ceil(categories.length / 2);
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
      >
        <View style={{ width: colCount * TILE, flexDirection: 'row', flexWrap: 'wrap' }}>
          {categories.map((cat) => renderItem(cat, TILE))}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.grid, { paddingHorizontal: spacing.lg, gap: 4 }]}>
      {categories.map((cat) => renderItem(cat, (SCREEN_WIDTH - spacing.lg * 2) / 3))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', marginBottom: 10 },
  iconWrap: { overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  emojiBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
