import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/home/ProductCard';
import { useTheme } from '@/context/ThemeContext';

const CARD_WIDTH = 162;

type Props = {
  products: Product[];
};

export function ProductResultList({ products }: Props) {
  const { spacing } = useTheme();

  if (!products.length) return null;

  return (
    <View style={[styles.list, { paddingHorizontal: spacing.lg }]}>
      <FlashList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} width={150} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, minHeight: 200 },
});
