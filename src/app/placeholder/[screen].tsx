import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Button, ScreenHeader } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const screenTitles: Record<string, { title: string; subtitle: string; icon: IoniconName }> = {
  orders: { title: 'No Orders Yet', subtitle: "You haven't placed an order yet. Start shopping!", icon: 'cube-outline' },
  addresses: { title: 'Saved Addresses', subtitle: 'Manage your delivery addresses from location settings.', icon: 'location-outline' },
  wishlist: { title: 'Wishlist Empty', subtitle: 'Save your favorite products and stores here.', icon: 'heart-outline' },
};

export default function PlaceholderScreen() {
  const { screen } = useLocalSearchParams<{ screen: string }>();
  const { colors, spacing } = useTheme();
  const info = screenTitles[screen ?? ''] ?? {
    title: 'Coming Soon',
    subtitle: 'This feature is under development.',
    icon: 'rocket-outline' as IoniconName,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title={info.title} showBack />
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
