import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';
import { SearchBar } from '@/components/ui';
import { FoodGroceriesSwitch } from '@/components/home/FoodGroceriesSwitch';
import { useTheme } from '@/context/ThemeContext';
import { useHomeModeStore } from '@/store/homeModeStore';
import { t } from '@/i18n';

type Props = {
  animatedStyle?: StyleProp<ViewStyle>;
};

export function HomeSearchModeBar({ animatedStyle }: Props) {
  const { spacing } = useTheme();
  const homeMode = useHomeModeStore((s) => s.mode);

  const groceryHints = ['milk', 'bread', 'bananas', 'rice', 'snacks'];
  const foodHints = ['biryani', 'pizza', 'burger', 'thali', 'dessert'];
  const hints = (homeMode === 'food' ? foodHints : groceryHints).map((q) => t('searchHint', { q }));

  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(40)}
      style={[
        {
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
          gap: spacing.sm,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.row}>
        <SearchBar
          value=""
          onChangeText={() => {}}
          placeholder={t('searchPlaceholder')}
          hints={hints}
          editable={false}
          variant="pill"
          onPress={() => router.push('/(tabs)/search')}
        />
        <FoodGroceriesSwitch variant="compact" style={styles.modeSwitch} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modeSwitch: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
