import { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, EmptyState } from '@/components/ui';
import { OrderSummaryCard } from '@/components/orders/OrderSummaryCard';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { ordersService } from '@/services/api/orders.service';
import type { OrderSummary } from '@/types/order';
import { isOrderTrackable } from '@/utils/orderTracking';
import { t } from '@/i18n';

export default function OrdersScreen() {
  const { colors, spacing } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await ordersService.list();
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!authHydrated) return;
      void load();
    }, [authHydrated, load]),
  );

  if (!authHydrated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('myOrders')} showBack />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title={t('myOrders')} showBack />
        <EmptyState
          icon="cube-outline"
          title={t('signInToOrders')}
          actionLabel={t('signIn')}
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={t('myOrders')} showBack />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title={t('noOrdersYet')}
          subtitle={t('noOrdersSubtitle')}
          actionLabel={t('startShopping')}
          onAction={() => router.replace('/(tabs)')}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OrderSummaryCard
              order={item}
              onPress={() =>
                router.push(
                  isOrderTrackable(item.status) ? `/order/${item.id}/track` : `/order/${item.id}`,
                )
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
