import { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { Button } from '@/components/ui';
import { OrderConfirmationHero, OrderConfirmationSummaryCard } from '@/components/order-confirmation';
import { useCart } from '@/hooks/useCart';
import { useTheme } from '@/context/ThemeContext';
import { orderTrackingService } from '@/services/api/order-tracking.service';
import { parseDeliveryOverride } from '@/types/tracking-handoff';
import { t } from '@/i18n';
import type { PaymentMethod } from '@/types/cart';

const AUTO_TRACK_SECONDS = 5;

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber?: string;
    total: string;
    etaMinutes?: string;
    itemCount?: string;
    paymentMethod?: PaymentMethod;
    addressLabel?: string;
    addressLine?: string;
    deliveryLat?: string;
    deliveryLng?: string;
  }>();
  const {
    orderId,
    orderNumber,
    total,
    etaMinutes,
    itemCount,
    paymentMethod,
    addressLabel,
    addressLine,
  } = params;
  const { colors, spacing, typography, radius } = useTheme();
  const { clearCart } = useCart();
  const navigatedRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_TRACK_SECONDS);
  const progress = useSharedValue(0);

  const goToTrack = useCallback(() => {
    if (!orderId || navigatedRef.current) return;
    navigatedRef.current = true;
    router.replace({
      pathname: '/order/[id]/track',
      params: {
        id: orderId,
        fromCheckout: '1',
        orderNumber: orderNumber ?? orderId,
        total,
        etaMinutes,
        itemCount,
        paymentMethod,
        addressLabel,
        addressLine,
        deliveryLat: params.deliveryLat,
        deliveryLng: params.deliveryLng,
      },
    });
  }, [orderId, orderNumber, total, etaMinutes, itemCount, paymentMethod, addressLabel, addressLine, params.deliveryLat, params.deliveryLng]);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const override = parseDeliveryOverride(params);
    void orderTrackingService.getTracking(orderId, { deliveryOverride: override });
  }, [orderId, params.deliveryLat, params.deliveryLng, params.addressLine]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: AUTO_TRACK_SECONDS * 1000 });
  }, [progress]);

  useEffect(() => {
    if (!orderId) return;
    setSecondsLeft(AUTO_TRACK_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          goToTrack();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orderId, goToTrack]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const displayNumber = orderNumber ?? orderId;
  const eta = etaMinutes ? Number(etaMinutes) : 25;
  const count = itemCount ? Number(itemCount) : 1;
  const paidTotal = Number(total);
  const method: PaymentMethod =
    paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'wallet' || paymentMethod === 'cod'
      ? paymentMethod
      : 'cod';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <OrderConfirmationHero etaMinutes={eta} />

        <View style={{ paddingHorizontal: spacing.lg, width: '100%' }}>
          <OrderConfirmationSummaryCard
            orderNumber={displayNumber}
            total={paidTotal}
            itemCount={count}
            paymentMethod={method}
            addressLabel={addressLabel}
            addressLine={addressLine}
          />
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(600).duration(450)}
        style={[styles.footer, { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}
      >
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm }]}>
          {t('openingLiveTracking', { seconds: Math.max(secondsLeft, 0) })}
        </Text>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.borderSubtle, borderRadius: radius.full, marginBottom: spacing.lg },
          ]}
        >
          <Animated.View
            style={[progressStyle, styles.progressFill, { backgroundColor: colors.primary, borderRadius: radius.full }]}
          />
        </View>

        <Button title={t('trackOrderLive')} onPress={goToTrack} fullWidth size="lg" leftIcon="navigate-outline" />

        <View style={styles.linkRow}>
          <Pressable onPress={() => router.push('/orders')} accessibilityRole="button">
            <Text style={[typography.label, { color: colors.primary, fontWeight: '600' }]}>{t('viewMyOrders')}</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted }}>·</Text>
          <Pressable onPress={() => router.replace('/(tabs)')} accessibilityRole="button">
            <Text style={[typography.label, { color: colors.primary, fontWeight: '600' }]}>{t('continueShopping')}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 16 },
  footer: { width: '100%' },
  progressTrack: { height: 4, width: '100%', overflow: 'hidden' },
  progressFill: { height: '100%' },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
});
