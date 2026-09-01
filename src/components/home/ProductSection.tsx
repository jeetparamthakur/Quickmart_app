import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ProductSection as ProductSectionType } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { ProductCard } from './ProductCard';

type Props = {
  section: ProductSectionType;
};

export function ProductSection({ section }: Props) {
  const { colors, spacing, typography } = useTheme();

  if (!section.products.length) return null;

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={[typography.h3, { color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
        {section.title}
      </Text>
      <View style={{ height: 240, paddingLeft: spacing.lg }}>
        <FlashList
          data={section.products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
