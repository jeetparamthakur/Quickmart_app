import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import type { OrderSummary } from '@/types/order';
import { parentStatusLabel } from '@/services/api/orderMappers';

type Props = {
  order: OrderSummary;
  onPress: () => void;
};

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function OrderSummaryCard({ order, onPress }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const storeLabel = order.storeNames.join(' · ');
  const statusLabel = parentStatusLabel(order.status.toUpperCase());

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>
            #{order.orderNumber}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {formatOrderDate(order.createdAt)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>{statusLabel}</Text>
        </View>
      </View>

      <Text
        style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.md }]}
        numberOfLines={1}
      >
        {storeLabel}
      </Text>

      <View style={[styles.footer, { marginTop: spacing.md }]}>
        <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
        </Text>
        <View style={styles.totalRow}>
          <Text style={[typography.label, { color: colors.text, fontWeight: '800' }]}>
            {formatPrice(order.total)}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
