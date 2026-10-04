import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useTabScreenInsets } from '@/hooks/useTabScreenInsets';

/** Bottom padding for sticky CTAs: home indicator + tab bar when mounted. */
export function useBottomActionInset(extra?: number) {
  const { spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const { tabBarHeight } = useTabScreenInsets();
  const pad = extra ?? spacing.md;

  const tabBarClearance =
    tabBarHeight > 0
      ? tabBarHeight
      : Platform.OS === 'android'
        ? layout.tabContentHeight + layout.tabBarPaddingTop
        : 0;

  const paddingBottom = Math.max(insets.bottom, pad) + tabBarClearance;

  return { paddingBottom, tabBarHeight, insetsBottom: insets.bottom };
}
