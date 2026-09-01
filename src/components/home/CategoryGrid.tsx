import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Category } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  categories: Category[];
  horizontal?: boolean;
};

export function CategoryGrid({ categories, horizontal = true }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  const renderItem = (cat: Category) => (
    <TouchableOpacity
      key={cat.id}
      onPress={() => router.push(`/category/${cat.id}`)}
      style={[styles.item, horizontal ? { marginRight: spacing.md } : { width: '30%', marginBottom: spacing.lg }]}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: cat.color, borderRadius: radius.md }]}>
        <Image source={{ uri: cat.image }} style={styles.image} contentFit="cover" />
        <Text style={styles.emoji}>{cat.icon}</Text>
      </View>
      <Text style={[typography.caption, { color: colors.text, textAlign: 'center', marginTop: spacing.sm, fontWeight: '500' }]} numberOfLines={2}>
        {cat.name}
      </Text>
    </TouchableOpacity>
  );

  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {categories.map(renderItem)}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.grid, { paddingHorizontal: spacing.lg }]}>
      {categories.map(renderItem)}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', width: 72 },
  iconWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  image: { ...StyleSheet.absoluteFill, opacity: 0.3 },
  emoji: { fontSize: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
