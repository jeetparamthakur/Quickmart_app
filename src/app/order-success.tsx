import { useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

const AUTO_TRACK_MS = 2000;

export default function OrderSuccessScreen() {
  const { orderId, orderNumber, total, etaMinutes } = useLocalSearchParams<{
    orderId: string;
    orderNumber?: string;
    total: string;
    etaMinutes?: string;
  }>();
  const { colors, spacing, typography, radius } = useTheme();
  const navigatedRef = useRef(false);

  const goToTrack = useCallback(() => {
    if (!orderId || navigatedRef.current) return;
    navigatedRef.current = true;
    router.replace(`/order/${orderId}/track`);
  }, [orderId]);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const timer = setTimeout(() => {
      goToTrack();
    }, AUTO_TRACK_MS);
    return () => clearTimeout(timer);
  }, [orderId, goToTrack]);

  const displayNumber = orderNumber ?? orderId;
  const eta = etaMinutes ? Number(etaMinutes) : 25;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={ZoomIn.duration(600)}
        style={[styles.iconWrap, { backgroundColor: colors.successLight, borderRadius: radius.lg }]}
      >
        <Ionicons name="checkmark-circle" size={72} color={colors.success} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(300).duration(500)}
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.xxl }]}
      >
        {t('orderSuccess')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t('orderId')}</Text>
        <Text style={[typography.h3, { color: colors.primary, marginTop: spacing.sm }]}>{displayNumber}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.lg }]}>Total Paid</Text>
        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.sm }]}>{formatPrice(Number(total))}</Text>
        <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.lg }]}>
          {t('trackEta', { minutes: eta })}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ padding: spacing.xl, marginTop: 'auto', width: '100%' }}>
        <Button title={t('trackOrderNow')} onPress={goToTrack} fullWidth size="lg" leftIcon="navigate-outline" />
        <View style={{ marginTop: spacing.md }}>
          <Button
            title={t('viewMyOrders')}
            onPress={() => router.push('/orders')}
            variant="secondary"
            fullWidth
            leftIcon="cube-outline"
          />
        </View>
        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Continue Shopping"
            onPress={() => router.replace('/(tabs)')}
            variant="secondary"
            fullWidth
            leftIcon="home-outline"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24 },
  iconWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
});
