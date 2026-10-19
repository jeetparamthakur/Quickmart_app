import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import type { OrderTrackingSnapshot } from '@/types/order-tracking';
import type { CustomerOrderDetail } from '@/types/order';
import type { PaymentMethod } from '@/types/cart';
import { OrderStageStepper } from './OrderStageStepper';
import { TrackingOrderDetailsCard } from './TrackingOrderDetailsCard';
import { t } from '@/i18n';

type Props = {
  snapshot: OrderTrackingSnapshot;
  headline: string;
  orderDetail?: CustomerOrderDetail | null;
  paymentMethod?: PaymentMethod;
  fallbackTotal?: number;
};

function findPartnerSub(snapshot: OrderTrackingSnapshot) {
  return snapshot.subOrders.find((s) => {
    if (!s.partner) return false;
    const status = s.status.toUpperCase();
    const assignment = s.assignmentStatus?.toUpperCase();
    return (
      status === 'DELIVERY_ASSIGNED' ||
      status === 'PICKED_UP' ||
      status === 'OUT_FOR_DELIVERY' ||
      assignment === 'ACCEPTED' ||
      assignment === 'IN_PROGRESS'
    );
  });
}

export function TrackingBottomSheet({
  snapshot,
  headline,
  orderDetail,
  paymentMethod,
  fallbackTotal,
}: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const activeStep = snapshot.stages.steps.find((s) => s.active) ?? snapshot.stages.steps.find((s) => !s.done);
  const partnerSub = findPartnerSub(snapshot);
  const etaMinutes = snapshot.etaMinutes;
  const showLiveEta = !snapshot.isTerminal && etaMinutes != null;

  return (
    <View
      style={[
        styles.sheet,
        shadows.lg,
        {
          backgroundColor: colors.card,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
        },
      ]}
    >
      <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />

      {showLiveEta ? (
        <View style={[styles.etaBlock, { marginTop: spacing.sm }]}>
          {snapshot.isTerminal ? null : (
            <View style={styles.liveRow}>
              <View style={[styles.liveDot, { backgroundColor: colors.error }]} />
              <Text style={[typography.caption, { color: colors.error, fontWeight: '800' }]}>{t('live')}</Text>
            </View>
          )}
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {t('trackEstimatedArrival')}
          </Text>
          <Text style={[typography.h1, { color: colors.text, fontWeight: '800', marginTop: spacing.xs }]}>
            {t('trackEta', { minutes: etaMinutes })}
          </Text>
        </View>
      ) : null}

      <Animated.Text
        key={headline}
        entering={FadeInDown.duration(280)}
        style={[typography.h3, { color: colors.text, marginTop: spacing.md }]}
      >
        {headline}
      </Animated.Text>

      {snapshot.delivery.addressLine ? (
        <Text
          style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}
          numberOfLines={2}
        >
          {snapshot.delivery.addressLine}
        </Text>
      ) : null}

      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
        #{snapshot.orderNumber}
      </Text>

      {activeStep && !snapshot.isTerminal ? (
        <View
          style={[
            styles.activeRow,
            {
              backgroundColor: colors.primaryLight,
              borderRadius: radius.md,
              marginTop: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          <Ionicons name="pulse" size={22} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>{activeStep.label}</Text>
            {partnerSub?.partner ? (
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {t('trackPartnerOnWay')}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {partnerSub?.partner ? (
        <View
          style={[
            styles.partnerRow,
            {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.md,
              marginTop: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          <Ionicons name="bicycle" size={28} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>
              {partnerSub.partner.displayName}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('trackPartnerOnWay')}</Text>
          </View>
        </View>
      ) : null}

      <ScrollView
        style={{ flexGrow: 0, maxHeight: 280, marginTop: spacing.lg }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <OrderStageStepper steps={snapshot.stages.steps} />

        {snapshot.subOrders.length > 1 ? (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              {t('trackStores')}
            </Text>
            {snapshot.subOrders.map((sub) => {
              const open = expandedSubId === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  onPress={() => setExpandedSubId(open ? null : sub.id)}
                  style={[
                    styles.subCard,
                    {
                      borderColor: colors.borderSubtle,
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: radius.lg,
                      marginBottom: spacing.sm,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View style={styles.subHeader}>
                    <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600', flex: 1 }]}>
                      {sub.storeName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.primary }]}>{sub.statusLabel}</Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textMuted}
                      style={{ marginLeft: spacing.xs }}
                    />
                  </View>
                  {open ? (
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                      {sub.pickup.addressLine}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {orderDetail ? (
          <TrackingOrderDetailsCard
            order={orderDetail}
            paymentMethod={paymentMethod}
            fallbackTotal={fallbackTotal}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  etaBlock: { alignItems: 'flex-start' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  activeRow: { flexDirection: 'row', alignItems: 'center' },
  partnerRow: { flexDirection: 'row', alignItems: 'center' },
  subCard: { borderWidth: StyleSheet.hairlineWidth },
  subHeader: { flexDirection: 'row', alignItems: 'center' },
});
