import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, EmptyState, Button } from '@/components/ui';
import { OrderTrackingMap, TrackingBottomSheet } from '@/components/tracking';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

export default function OrderTrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const { data, loading, error, headline } = useOrderTracking(id);

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('trackOrder')} showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <ScreenHeader title={t('trackOrder')} showBack />
      </SafeAreaView>

      <OrderTrackingMap snapshot={data} />

      <View style={styles.sheetWrap}>
        <TrackingBottomSheet snapshot={data} headline={headline} />
        {data.isTerminal ? (
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
            <Button
              title={t('viewOrderDetails')}
              onPress={() => router.push(`/order/${data.orderId}`)}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
