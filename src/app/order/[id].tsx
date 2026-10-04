import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, EmptyState, Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { ordersService } from '@/services/api/orders.service';
import type { CustomerOrderDetail } from '@/types/order';
import { formatPrice } from '@/utils/formatPrice';
import { isOrderTrackable } from '@/utils/orderTracking';
import { t } from '@/i18n';

function formatOrderDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography, radius } = useTheme();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const detail = await ordersService.getById(id);
      if (!detail) {
        setOrder(null);
        setNotFound(true);
      } else {
        setOrder(detail);
      }
    } catch {
      setOrder(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('orderDetails')} showBack />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : notFound || !order ? (
        <EmptyState
          icon="alert-circle-outline"
          title={t('orderNotFound')}
          subtitle={t('orderNotFoundSubtitle')}
          actionLabel={t('myOrders')}
          onAction={() => router.replace('/orders')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border },
            ]}
          >
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('orderId')}</Text>
            <Text style={[typography.h3, { color: colors.text, marginTop: spacing.xs }]}>#{order.orderNumber}</Text>
            <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.sm }]}>
              {formatOrderDateTime(order.createdAt)}
            </Text>
            <View style={[styles.statusRow, { marginTop: spacing.md }]}>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderRadius: radius.sm }]}>
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                  {order.statusLabel}
                </Text>
              </View>
              {order.paymentStatus ? (
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {t('payment')}: {order.paymentStatus}
                </Text>
              ) : null}
            </View>
            {isOrderTrackable(order.status) ? (
              <View style={{ marginTop: spacing.lg }}>
                <Button
                  title={t('trackOrderLive')}
                  onPress={() => router.push(`/order/${order.id}/track`)}
                  fullWidth
                  leftIcon="navigate-outline"
                />
              </View>
            ) : null}
          </View>

          {order.subOrders.map((group) => (
            <View
              key={group.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border },
              ]}
            >
              <View style={styles.groupHeader}>
                <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>
                  {group.storeName ?? t('storeOrder')}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{group.statusLabel}</Text>
              </View>
              {group.items.map((item) => (
                <View key={item.id} style={[styles.lineItem, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </Text>
                  </View>
                  <Text style={[typography.label, { color: colors.text, fontWeight: '600' }]}>
                    {formatPrice(item.lineTotal)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border },
            ]}
          >
            <Text style={[typography.label, { color: colors.text, fontWeight: '700', marginBottom: spacing.sm }]}>
              {t('billDetails')}
            </Text>
            <Row label={t('subtotal')} value={formatPrice(order.subtotal)} colors={colors} typography={typography} />
            {order.discountTotal > 0 ? (
              <Row
                label={t('couponDiscount')}
                value={`-${formatPrice(order.discountTotal)}`}
                colors={colors}
                typography={typography}
              />
            ) : null}
            <Row label={t('deliveryCharges')} value={formatPrice(order.deliveryFee)} colors={colors} typography={typography} />
            <Row label={t('taxes')} value={formatPrice(order.taxTotal)} colors={colors} typography={typography} />
            {order.platformFee > 0 ? (
              <Row label={t('platformFee')} value={formatPrice(order.platformFee)} colors={colors} typography={typography} />
            ) : null}
            <View style={[styles.totalRow, { borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
              <Text style={[typography.label, { color: colors.text, fontWeight: '800' }]}>{t('finalTotal')}</Text>
              <Text style={[typography.h3, { color: colors.primary, fontWeight: '800' }]}>
                {formatPrice(order.total)}
              </Text>
            </View>
          </View>

          <Button title={t('browseProducts')} onPress={() => router.replace('/(tabs)')} fullWidth />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
  typography,
}: {
  label: string;
  value: string;
  colors: { text: string; textSecondary: string };
  typography: { bodySmall: object };
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.bodySmall, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
