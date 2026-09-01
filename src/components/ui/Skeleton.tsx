import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 16, borderRadius, style }: Props) {
  const { colors, radius } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.4, 0.8, 0.4]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ShimmerCard({ style }: { style?: ViewStyle }) {
  const { spacing } = useTheme();
  return (
    <View style={[styles.shimmerCard, { gap: spacing.sm }, style]}>
      <Skeleton height={120} borderRadius={12} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="50%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerCard: {
    width: 140,
  },
});
