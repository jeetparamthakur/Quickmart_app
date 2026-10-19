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
  const { colors, layout } = useTheme();

  return (
    <View
      style={[styles.iconWrap, { height: layout.tabContentHeight }]}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      {focused ? (
        <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
      ) : null}
      <Ionicons name={focused ? filled : outline} size={22} color={color} />
    </View>
  );
}

function CartTabIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
  const { colors, layout } = useTheme();
  const count = useCartStore((s) => s.getItemCount());

  return (
    <View
      style={[styles.iconWrap, { height: layout.tabContentHeight }]}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={t('cart')}
    >
      {focused ? (
        <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
      ) : null}
      <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} size={22} color={color} />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.tabBar }]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { colors, layout, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: layout.tabContentHeight + tabBarPaddingBottom + layout.tabBarPaddingTop,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: layout.tabBarPaddingTop,
          ...shadows.sm,
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.04,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 0 },
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
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 4,
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
