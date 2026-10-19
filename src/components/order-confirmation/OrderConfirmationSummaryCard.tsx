import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';
import type { PaymentMethod } from '@/types/cart';

type Props = {
  orderNumber: string;
  total: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
  addressLabel?: string;
  addressLine?: string;
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

export function OrderConfirmationSummaryCard({
  orderNumber,
  total,
  itemCount,
  paymentMethod,
  addressLabel,
  addressLine,
}: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(520).duration(450)} style={styles.wrap}>
      <Card variant="elevated" padding={spacing.lg}>
        <View style={styles.row}>
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{t('orderId')}</Text>
            <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>#{orderNumber}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{t('totalPaid')}</Text>
            <Text style={[typography.h3, { color: colors.text }]}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.md }]} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={18} color={colors.textSecondary} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {t('itemsCount', { count: itemCount })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {paymentLabel(paymentMethod)}
            </Text>
          </View>
        </View>

        {addressLine ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{t('deliveringTo')}</Text>
            {addressLabel ? (
              <Text style={[typography.label, { color: colors.text, marginTop: 2 }]}>{addressLabel}</Text>
            ) : null}
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
              {addressLine}
            </Text>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
});
