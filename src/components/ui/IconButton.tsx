import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/context/ThemeContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  name: IoniconName;
  onPress: () => void;
  size?: number;
  color?: string;
  variant?: 'ghost' | 'surface';
  accessibilityLabel: string;
  style?: ViewStyle;
};

export function IconButton({
  name,
  onPress,
  size = 22,
  color,
  variant = 'ghost',
  accessibilityLabel,
  style,
}: Props) {
  const { colors, radius, layout, shadows } = useTheme();
  const iconColor = color ?? colors.primary;

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.hit,
        { minWidth: layout.minTouchTarget, minHeight: layout.minTouchTarget },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          variant === 'surface'
            ? [shadows.sm, { backgroundColor: colors.surface, borderRadius: radius.full }]
            : null,
        ]}
      >
        <Ionicons name={name} size={size} color={iconColor} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
