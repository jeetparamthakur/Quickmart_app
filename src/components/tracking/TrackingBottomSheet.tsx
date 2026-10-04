import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { OrderTrackingSnapshot } from '@/types/order-tracking';
import { OrderStageStepper } from './OrderStageStepper';
import { t } from '@/i18n';

type Props = {
  snapshot: OrderTrackingSnapshot;
  headline: string;
};

export function TrackingBottomSheet({ snapshot, headline }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const partnerOnTrip = snapshot.subOrders.find(
    (s) =>
      s.partner &&
      (s.status.toUpperCase() === 'PICKED_UP' ||
        s.status.toUpperCase() === 'OUT_FOR_DELIVERY' ||
        s.assignmentStatus === 'IN_PROGRESS'),
  );

  return (
    <View
      style={[
        styles.sheet,
        shadows.lg,
        {
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
        },
      ]}
    >
      <View style={[styles.handle, { backgroundColor: colors.border }]} />

      <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm }]}>{headline}</Text>
      {snapshot.etaMinutes != null && !snapshot.isTerminal ? (
        <Text style={[typography.body, { color: colors.primary, marginTop: spacing.xs, fontWeight: '700' }]}>
          {t('trackEta', { minutes: snapshot.etaMinutes })}
        </Text>
      ) : null}
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
        #{snapshot.orderNumber}
      </Text>

      {partnerOnTrip?.partner ? (
        <View
          style={[
            styles.partnerRow,
            {
              backgroundColor: colors.primaryLight,
              borderRadius: radius.md,
              marginTop: spacing.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Ionicons name="bicycle" size={28} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>
              {partnerOnTrip.partner.displayName}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('trackPartnerOnWay')}</Text>
          </View>
        </View>
      ) : null}

      <ScrollView
        style={{ maxHeight: 320, marginTop: spacing.lg }}
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
                      borderColor: colors.border,
                      borderRadius: radius.md,
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { maxHeight: '52%' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  partnerRow: { flexDirection: 'row', alignItems: 'center' },
  subCard: { borderWidth: StyleSheet.hairlineWidth },
  subHeader: { flexDirection: 'row', alignItems: 'center' },
});
