import { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, useWindowDimensions, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, EmptyState, Button } from '@/components/ui';
import { OrderTrackingMap, TrackingBottomSheet } from '@/components/tracking';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useTheme } from '@/context/ThemeContext';
import { parseDeliveryOverride } from '@/types/tracking-handoff';
import type { PaymentMethod } from '@/types/cart';
import { t } from '@/i18n';

const MAP_HEIGHT_RATIO = 0.56;

export default function OrderTrackScreen() {
  const params = useLocalSearchParams<{
    id: string;
    fromCheckout?: string;
    orderNumber?: string;
    etaMinutes?: string;
    total?: string;
    paymentMethod?: PaymentMethod;
    addressLine?: string;
    deliveryLat?: string;
    deliveryLng?: string;
  }>();
  const { id, fromCheckout } = params;
  const { colors, spacing, typography } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const mapHeight = Math.round(windowHeight * MAP_HEIGHT_RATIO);

  const postCheckout = fromCheckout === '1';
  const deliveryOverride = useMemo(
    () => parseDeliveryOverride(params),
    [params.deliveryLat, params.deliveryLng, params.addressLine],
  );
  const optimisticEta = params.etaMinutes ? Number(params.etaMinutes) : null;
  const fallbackTotal = params.total ? Number(params.total) : undefined;

  const paymentMethod: PaymentMethod | undefined =
    params.paymentMethod === 'upi' ||
    params.paymentMethod === 'card' ||
    params.paymentMethod === 'wallet' ||
    params.paymentMethod === 'cod'
      ? params.paymentMethod
      : undefined;

  const { data, orderDetail, loading, error, headline } = useOrderTracking(id, {
    deliveryOverride,
    postCheckoutRetry: postCheckout,
  });

  if (loading && !data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']}>
          <ScreenHeader
            title={t('trackOrder')}
            showBack
            backIcon={postCheckout ? 'close' : 'chevron-back'}
            onBack={postCheckout ? () => router.replace('/(tabs)') : undefined}
          />
        </SafeAreaView>
        <View style={[styles.mapPlaceholder, { height: mapHeight, backgroundColor: colors.surfaceSecondary }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
        <View style={[styles.sheetPlaceholder, { padding: spacing.lg }]}>
          <Text style={[typography.h3, { color: colors.text }]}>{t('orderSuccess')}</Text>
          {optimisticEta != null ? (
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              {t('trackEta', { minutes: optimisticEta })}
            </Text>
          ) : null}
          {params.addressLine ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]} numberOfLines={2}>
              {params.addressLine}
            </Text>
          ) : null}
          {params.orderNumber ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              #{params.orderNumber}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('trackOrder')} showBack />
        <EmptyState
          icon="map-outline"
          title={t('orderNotFound')}
          subtitle={t('orderNotFoundSubtitle')}
          actionLabel={t('myOrders')}
          onAction={() => router.replace('/orders')}
        />
      </SafeAreaView>
    );
  }

  const displaySnapshot =
    optimisticEta != null && data.etaMinutes == null
      ? { ...data, etaMinutes: optimisticEta }
      : data;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.headerBar} edges={['top']}>
        <ScreenHeader
          title={t('trackOrder')}
          showBack
          backIcon={postCheckout ? 'close' : 'chevron-back'}
          onBack={postCheckout ? () => router.replace('/(tabs)') : undefined}
        />
      </SafeAreaView>

      <View style={[styles.mapRegion, { height: mapHeight }]}>
        <OrderTrackingMap
          snapshot={displaySnapshot}
          deliveryOverride={deliveryOverride}
          bottomPadding={120}
        />
      </View>

      <View style={styles.sheetRegion}>
        <TrackingBottomSheet
          snapshot={displaySnapshot}
          headline={headline}
          orderDetail={orderDetail}
          paymentMethod={paymentMethod}
          fallbackTotal={fallbackTotal}
        />
        {displaySnapshot.isTerminal ? (
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
            <Button
              title={t('viewOrderDetails')}
              onPress={() => router.push(`/order/${displaySnapshot.orderId}`)}
              fullWidth
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { zIndex: 10 },
  mapRegion: { width: '100%', overflow: 'hidden' },
  mapPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  sheetRegion: { flex: 1 },
  sheetPlaceholder: { flex: 1 },
});
