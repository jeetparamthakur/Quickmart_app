import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

const menuItems = [
  { icon: '📦', label: 'My Orders', screen: 'orders' },
  { icon: '📍', label: 'Saved Addresses', screen: 'addresses' },
  { icon: '❤️', label: 'Wishlist', screen: 'wishlist' },
  { icon: '💳', label: 'Payment Methods', screen: 'payments' },
  { icon: '🎟️', label: 'Coupons', screen: 'coupons' },
  { icon: '🔔', label: 'Notification Settings', screen: 'notifications' },
  { icon: '❓', label: 'Help & Support', screen: 'help' },
  { icon: 'ℹ️', label: 'About', screen: 'about' },
  { icon: '🔒', label: 'Privacy Policy', screen: 'privacy' },
  { icon: '📄', label: 'Terms & Conditions', screen: 'terms' },
];

export default function ProfileScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const user = useAuthStore((s) => s.user);
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
      <ScrollView>
        <View style={[styles.header, { backgroundColor: colors.primary, padding: spacing.xl }]}>
          <View style={[styles.avatar, { backgroundColor: '#FFF' }]}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={[typography.h2, { color: '#FFF', marginTop: spacing.md }]}>{user?.name ?? 'Customer'}</Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.8)' }]}>{user?.phone ?? ''}</Text>
        </View>

        <View style={{ padding: spacing.lg }}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              onPress={() => router.push(`/placeholder/${item.screen}`)}
              style={[styles.menuItem, shadows.sm, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.sm, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: spacing.md }]}>{item.label}</Text>
              <Text style={{ color: colors.textMuted }}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.menuItem, { backgroundColor: colors.errorLight, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md }]}
          >
            <Text style={{ fontSize: 20 }}>🚪</Text>
            <Text style={[typography.label, { color: colors.error, flex: 1, marginLeft: spacing.md }]}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center' },
});
