import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartGroup } from '@/types/cart';
import { useTheme } from '@/context/ThemeContext';
import { CartItemRow } from './CartItem';
import { t } from '@/i18n';

type Props = {
  group: CartGroup;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

export function CartGroupSection({ group, onRemove, onUpdateQuantity }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const eta = Math.min(
    ...group.items.map((i) => i.product.sellers?.[0]?.deliveryMinutes ?? 10)
  );

  return (
    <View
      style={[
        styles.card,
        shadows.md,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          marginBottom: spacing.lg,
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md }]}>
        <View style={[styles.storeIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="storefront" size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>
            {group.storeName}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
            {group.items.length} {group.items.length === 1 ? t('item') : t('items')}
          </Text>
        </View>
        <View style={[styles.eta, { backgroundColor: colors.surface }]}>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '800' }]}>
            ⚡ {eta} {t('minutesShort')}
          </Text>
        </View>
      </View>

      {group.items.map((item, index) => (
        <CartItemRow
          key={item.id}
          item={item}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
          isLast={index === group.items.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  storeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eta: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
