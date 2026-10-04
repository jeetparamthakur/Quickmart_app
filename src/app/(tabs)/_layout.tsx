import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, type ColorValue } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useCartStore } from '@/store/cartStore';
import { t } from '@/i18n';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  color,
  outline,
  filled,
  label,
}: {
  focused: boolean;
  color: ColorValue;
  outline: IoniconName;
  filled: IoniconName;
  label: string;
}) {
  const { colors, radius } = useTheme();

  return (
    <View
      style={[
        styles.iconWrap,
        focused ? { backgroundColor: colors.primaryLight, borderRadius: radius.full } : null,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Ionicons name={focused ? filled : outline} size={22} color={color} />
    </View>
  );
}

function CartTabIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
  const { colors, radius } = useTheme();
  const count = useCartStore((s) => s.getItemCount());

  return (
    <View
      style={[
        styles.iconWrap,
        focused ? { backgroundColor: colors.primaryLight, borderRadius: radius.full } : null,
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={t('cart')}
    >
      <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} size={22} color={color} />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { colors, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: layout.tabContentHeight + tabBarPaddingBottom + layout.tabBarPaddingTop,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: layout.tabBarPaddingTop,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="home-outline"
              filled="home"
              label={t('home')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('categories'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="grid-outline"
              filled="grid"
              label={t('categories')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="search-outline"
              filled="search"
              label={t('search')}
            />
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
          title: t('profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              outline="person-outline"
              filled="person"
              label={t('profile')}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
});
