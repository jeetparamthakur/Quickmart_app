import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Category } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';

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
    <TouchableOpacity
      key={cat.id}
      onPress={() => router.push(`/category/${cat.id}`)}
      style={[styles.item, { width }]}
      activeOpacity={0.82}
    >
      <View
        style={[
          styles.iconWrap,
          shadows.sm,
          {
            backgroundColor: cat.color || colors.primaryLight,
            borderRadius: radius.lg,
            width: width - 12,
            height: width - 4,
          },
        ]}
      >
        <Image source={{ uri: cat.image }} style={styles.image} contentFit="cover" />
        <View style={styles.emojiBadge}>
          <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
        </View>
      </View>
      <Text
        style={[typography.caption, { color: colors.text, textAlign: 'center', marginTop: 6, fontWeight: '700' }]}
        numberOfLines={2}
      >
        {cat.name}
      </Text>
    </TouchableOpacity>
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
    <View style={[styles.grid, { paddingHorizontal: spacing.lg }]}>
      {categories.map((cat) => renderItem(cat, (SCREEN_WIDTH - spacing.lg * 2) / 3))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', marginBottom: 14 },
  iconWrap: { overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  emojiBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
