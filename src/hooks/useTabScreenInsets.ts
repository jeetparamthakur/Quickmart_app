import { useContext } from 'react';
import { BottomTabBarHeightContext } from 'expo-router/build/react-navigation/bottom-tabs/utils/BottomTabBarHeightContext';
import { useTheme } from '@/context/ThemeContext';

function useOptionalBottomTabBarHeight() {
  return useContext(BottomTabBarHeightContext) ?? 0;
}

export function useTabScreenInsets(extra?: number) {
  const { spacing } = useTheme();
  const paddingExtra = extra ?? spacing.md;
  const tabBarHeight = useOptionalBottomTabBarHeight();

  return {
    tabBarHeight,
    contentPaddingBottom: tabBarHeight + paddingExtra,
  };
}
