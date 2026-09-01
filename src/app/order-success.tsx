import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/utils/formatPrice';
import { t } from '@/i18n';

export default function OrderSuccessScreen() {
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={ZoomIn.duration(600)} style={[styles.iconWrap, { backgroundColor: colors.successLight }]}>
        <Text style={{ fontSize: 64 }}>✅</Text>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(300).duration(500)}
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.xxl }]}
      >
        {t('orderSuccess')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Order ID</Text>
        <Text style={[typography.h3, { color: colors.primary, marginTop: spacing.sm }]}>{orderId}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.lg }]}>Total Paid</Text>
        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.sm }]}>{formatPrice(Number(total))}</Text>
        <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.lg }]}>
          Estimated delivery in 25 minutes
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ padding: spacing.xl, marginTop: 'auto', width: '100%' }}>
        <Button title="Continue Shopping" onPress={() => router.replace('/(tabs)')} fullWidth size="lg" />
        <View style={{ marginTop: spacing.md }}>
          <Button title="Track Order (Coming Soon)" onPress={() => router.push('/placeholder/orders')} variant="secondary" fullWidth />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24 },
  iconWrap: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
});
