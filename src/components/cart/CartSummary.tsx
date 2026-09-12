import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

export type CartChargeLine = {
  name: string;
  amount: number;
};

type Props = {
  subtotal: number;
  deliveryFee: number;
  charges?: CartChargeLine[];
  platformFee?: number;
  tax: number;
  couponDiscount: number;
  savings: number;
  total: number;
};

export function CartSummary({
  subtotal,
  deliveryFee,
  charges,
  platformFee = 0,
  tax,
  couponDiscount,
  savings,
  total,
}: Props) {
  const chargeLines =
    charges && charges.length > 0
      ? charges
      : platformFee > 0
        ? [{ name: t('platformFee'), amount: platformFee }]
        : [];
  const { colors, spacing, typography, radius, shadows } = useTheme();

  return (
    <View
      style={[
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text style={[typography.label, { color: colors.text, fontSize: 15, marginBottom: spacing.md }]}>
        {t('billDetails')}
      </Text>

      <SummaryRow label={t('subtotal')} value={formatPrice(subtotal)} />
      <SummaryRow
        label={t('deliveryCharges')}
        value={deliveryFee === 0 ? t('free') : formatPrice(deliveryFee)}
        highlight={deliveryFee === 0}
      />
      {chargeLines.map((charge) => (
        <SummaryRow key={charge.name} label={charge.name} value={formatPrice(charge.amount)} />
      ))}
      <SummaryRow label={t('taxes')} value={formatPrice(tax)} />
      {couponDiscount > 0 && (
        <SummaryRow label={t('couponDiscount')} value={`−${formatPrice(couponDiscount)}`} highlight />
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <SummaryRow label={t('finalTotal')} value={formatPrice(total)} bold />

      {savings > 0 ? (
        <View style={[styles.savings, { backgroundColor: colors.successLight, marginTop: spacing.md }]}>
          <Ionicons name="pricetag" size={14} color={colors.success} />
          <Text style={[typography.caption, { color: colors.success, fontWeight: '700', flex: 1 }]}>
            {t('youSaved', { amount: formatPrice(savings) })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
      <Text style={[bold ? typography.label : typography.bodySmall, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[
          bold ? typography.h3 : typography.bodySmall,
          {
            color: highlight ? colors.success : colors.text,
            fontWeight: bold ? '800' : '500',
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  savings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
