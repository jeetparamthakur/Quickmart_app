import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductSeller } from '@/types/product';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';

type Props = {
  sellers: ProductSeller[];
  selectedStoreId: string;
  onSelect: (seller: ProductSeller) => void;
};

export function SellerPicker({ sellers, selectedStoreId, onSelect }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  if (sellers.length <= 1) return null;

  return (
    <View style={{ marginTop: spacing.xxl }}>
      <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Available From</Text>
      {sellers.map((seller) => (
        <TouchableOpacity
          key={seller.storeId}
          onPress={() => onSelect(seller)}
          style={[
            styles.card,
            shadows.sm,
            {
              backgroundColor: selectedStoreId === seller.storeId ? colors.primaryLight : colors.surface,
              borderRadius: radius.md,
              padding: spacing.lg,
              marginBottom: spacing.sm,
              borderColor: selectedStoreId === seller.storeId ? colors.primary : colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { color: colors.text }]}>{seller.storeName}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Delivery in {seller.deliveryMinutes} min
            </Text>
          </View>
          <Text style={[typography.h3, { color: colors.primary }]}>{formatPrice(seller.price)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
});
