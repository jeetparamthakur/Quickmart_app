import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import type { CustomerOrderDetail } from '@/types/order';
import type { PaymentMethod } from '@/types/cart';
import { t } from '@/i18n';

type Props = {
  order: CustomerOrderDetail;
  paymentMethod?: PaymentMethod;
  fallbackTotal?: number;
};

function paymentLabel(method: PaymentMethod): string {
  switch (method) {
    case 'upi':
      return t('payUpi');
    case 'card':
      return t('payCard');
    case 'wallet':
      return t('payWallet');
    case 'cod':
    default:
      return t('payCod');
  }
}

export function TrackingOrderDetailsCard({ order, paymentMethod, fallbackTotal }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const lineItems = order.subOrders.flatMap((sub) => sub.items);
  const total = order.total || fallbackTotal || 0;
  const method: PaymentMethod =
    paymentMethod === 'upi' ||
    paymentMethod === 'card' ||
    paymentMethod === 'wallet' ||
    paymentMethod === 'cod'
      ? paymentMethod
      : 'cod';

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.borderSubtle,
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.lg,
          marginTop: spacing.lg,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={[styles.header, { padding: spacing.md }]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={[typography.label, { color: colors.text, fontWeight: '700', flex: 1 }]}>
          {t('viewOrderDetails')}
        </Text>
        <Text style={[typography.label, { color: colors.primary, fontWeight: '700' }]}>
          {formatPrice(total)}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
          style={{ marginLeft: spacing.sm }}
        />
      </Pressable>

      {expanded ? (
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
          {lineItems.map((item) => (
            <View key={item.id} style={[styles.lineRow, { marginBottom: spacing.sm }]}>
              <Text style={[typography.bodySmall, { color: colors.text, flex: 1 }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: spacing.sm }]}>
                ×{item.quantity}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600' }]}>
                {formatPrice(item.lineTotal)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.sm }]} />

          <View style={styles.metaRow}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{t('payment')}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{paymentLabel(method)}</Text>
          </View>
          <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{t('totalPaid')}</Text>
            <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>{formatPrice(total)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: StyleSheet.hairlineWidth },
  header: { flexDirection: 'row', alignItems: 'center' },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
