import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';

type Props = {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  couponDiscount: number;
  savings: number;
  total: number;
};

export function CartSummary({
  subtotal,
  deliveryFee,
  platformFee,
  tax,
  couponDiscount,
  savings,
  total,
}: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View
      style={[
        styles.summary,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.lg,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
      <SummaryRow label="Delivery charges" value={formatPrice(deliveryFee)} />
      <SummaryRow label="Platform fee" value={formatPrice(platformFee)} />
      <SummaryRow label="Taxes" value={formatPrice(tax)} />
      {couponDiscount > 0 && <SummaryRow label="Coupon discount" value={`-${formatPrice(couponDiscount)}`} highlight />}
      {savings > 0 && <SummaryRow label="Total savings" value={formatPrice(savings)} highlight />}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <SummaryRow label="Final Total" value={formatPrice(total)} bold />
    </View>
  );
}

function SummaryRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
      <Text style={[bold ? typography.label : typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[bold ? typography.h3 : typography.bodySmall, { color: highlight ? colors.success : colors.text, fontWeight: bold ? '700' : '400' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {},
  divider: { height: 1, marginVertical: 12 },
});
