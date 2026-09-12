import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/i18n';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  color,
  outline,
  filled,
}: {
  focused: boolean;
  color: string;
  outline: IoniconName;
  filled: IoniconName;
}) {
  return <Ionicons name={focused ? filled : outline} size={22} color={color} />;
}

function CartTabIcon({ focused, color }: { focused: boolean; color: string }) {
  const { colors } = useTheme();
  const count = useCartStore((s) => s.getItemCount());

  return (
    <View>
      <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} size={22} color={color} />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="home-outline" filled="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('categories'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="grid-outline" filled="grid" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="search-outline" filled="search" />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart'),
          tabBarIcon: ({ focused, color }) => <CartTabIcon focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});
