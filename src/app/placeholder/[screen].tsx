import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';

const screenTitles: Record<string, { title: string; subtitle: string; icon: string }> = {
  orders: { title: 'No Orders Yet', subtitle: "You haven't placed an order yet. Start shopping!", icon: '📦' },
  addresses: { title: 'Saved Addresses', subtitle: 'Manage your delivery addresses from location settings.', icon: '📍' },
  wishlist: { title: 'Wishlist Empty', subtitle: 'Save your favorite products and stores here.', icon: '❤️' },
  payments: { title: 'Payment Methods', subtitle: 'Add UPI, cards, or wallets for faster checkout.', icon: '💳' },
  coupons: { title: 'No Coupons', subtitle: 'Available coupons will appear here.', icon: '🎟️' },
  notifications: { title: 'Notification Settings', subtitle: 'Manage order updates and promotional notifications.', icon: '🔔' },
  help: { title: 'Help & Support', subtitle: 'Contact us at support@quickmart.app', icon: '❓' },
  about: { title: 'About QuickMart', subtitle: 'Multi-vendor hyperlocal marketplace. Version 1.0.0', icon: 'ℹ️' },
  privacy: { title: 'Privacy Policy', subtitle: 'Your data is protected and never shared without consent.', icon: '🔒' },
  terms: { title: 'Terms & Conditions', subtitle: 'By using QuickMart you agree to our terms of service.', icon: '📄' },
};

export default function PlaceholderScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  const { colors, spacing, typography } = useTheme();
  const info = screenTitles[screen ?? ''] ?? { title: 'Coming Soon', subtitle: 'This feature is under development.', icon: '🚀' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 24, color: colors.text }}>←</Text>
      </TouchableOpacity>
      <EmptyState
        icon={info.icon}
        title={info.title}
        subtitle={info.subtitle}
        actionLabel={screen === 'orders' ? 'Start Shopping' : undefined}
        onAction={screen === 'orders' ? () => router.replace('/(tabs)') : undefined}
      />
      {screen === 'addresses' && (
        <View style={{ padding: spacing.lg }}>
          <Button title="Manage Addresses" onPress={() => router.push('/(onboarding)/location')} fullWidth />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
