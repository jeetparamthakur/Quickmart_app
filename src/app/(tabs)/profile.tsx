import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { useTabScreenInsets } from '@/hooks/useTabScreenInsets';
import { ListRow } from '@/components/ui';
import { t } from '@/i18n';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type MenuItem = { icon: IoniconName; label: string; screen: string };

const SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-circle-outline', label: 'My Account', screen: 'my-account' },
      { icon: 'cube-outline', label: 'My Orders', screen: 'orders' },
      { icon: 'location-outline', label: 'Saved Addresses', screen: 'addresses' },
      { icon: 'heart-outline', label: 'Wishlist', screen: 'wishlist' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'help-circle-outline', label: t('helpSupport'), screen: 'help' },
    ],
  },
];

export default function ProfileScreen() {
  const { colors, spacing, typography } = useTheme();
  const { contentPaddingBottom } = useTabScreenInsets();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.pageHeader, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md }]}>
        <Text style={[typography.h2, { color: colors.text, fontWeight: '800', letterSpacing: -0.4 }]}>
          {t('profile')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, paddingBottom: contentPaddingBottom }}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.md }}>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, fontWeight: '700', marginBottom: spacing.sm, marginLeft: 4 },
              ]}
            >
              {section.title}
            </Text>
            {section.items.map((item) => (
              <ListRow
                key={item.screen}
                icon={item.icon}
                label={item.label}
                onPress={() => {
                  if (item.screen === 'addresses') router.push('/addresses');
                  else if (item.screen === 'my-account') router.push('/my-account');
                  else if (item.screen === 'wishlist') router.push('/wishlist');
                  else if (item.screen === 'orders') router.push('/orders');
                  else if (item.screen === 'help') router.push('/help-support');
                  else router.push(`/placeholder/${item.screen}`);
                }}
              />
            ))}
          </View>
        ))}

        <ListRow icon="log-out-outline" label={t('logout')} onPress={handleLogout} destructive showChevron={false} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: {},
});
