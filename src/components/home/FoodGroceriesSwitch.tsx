import React, { useEffect } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { useTheme } from '@/context/ThemeContext';
import { HomeMode, useHomeModeStore } from '@/store/homeModeStore';
import { t } from '@/i18n';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const RAIL_HEIGHT = 36;
const COMPACT_RAIL_HEIGHT = 40;
const INSET = 3;

type FoodGroceriesSwitchProps = {
  variant?: 'standalone' | 'compact';
  style?: StyleProp<ViewStyle>;
};

export function FoodGroceriesSwitch({ variant = 'standalone', style }: FoodGroceriesSwitchProps) {
  const { colors, spacing, typography, radius, shadows, motion } = useTheme();
  const mode = useHomeModeStore((s) => s.mode);
  const setMode = useHomeModeStore((s) => s.setMode);

  const railWidth = useSharedValue(0);
  const puckX = useSharedValue(INSET);
  const groceriesLayer = useSharedValue(mode === 'groceries' ? 1 : 0);
  const foodLayer = useSharedValue(mode === 'food' ? 1 : 0);
  const leftIconScale = useSharedValue(mode === 'groceries' ? 1.08 : 0.92);
  const rightIconScale = useSharedValue(mode === 'food' ? 1.08 : 0.92);

  const puckWidth = useSharedValue(0);

  const snap = (next: HomeMode, width: number) => {
    const slot = (width - INSET * 2) / 2;
    puckWidth.value = slot - 2;
    const target = next === 'groceries' ? INSET : INSET + slot + 2;
    puckX.value = withSpring(target, motion.spring);
    groceriesLayer.value = withTiming(next === 'groceries' ? 1 : 0, { duration: motion.duration.fast });
    foodLayer.value = withTiming(next === 'food' ? 1 : 0, { duration: motion.duration.fast });
    leftIconScale.value = withSpring(next === 'groceries' ? 1.08 : 0.92, motion.springSoft);
    rightIconScale.value = withSpring(next === 'food' ? 1.08 : 0.92, motion.springSoft);
  };

  useEffect(() => {
    if (railWidth.value > 0) snap(mode, railWidth.value);
  }, [mode]);

  const onRailLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    railWidth.value = w;
    snap(mode, w);
  };

  const puckStyle = useAnimatedStyle(() => ({
    width: puckWidth.value,
    transform: [{ translateX: puckX.value }],
  }));

  const groceriesFill = useAnimatedStyle(() => ({ opacity: groceriesLayer.value }));
  const foodFill = useAnimatedStyle(() => ({ opacity: foodLayer.value }));

  const leftStationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftIconScale.value }],
    opacity: groceriesLayer.value * 0.35 + 0.45,
  }));

  const rightStationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightIconScale.value }],
    opacity: foodLayer.value * 0.35 + 0.45,
  }));

  const select = (next: HomeMode) => {
    if (next === mode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(next);
  };

  const groceriesLabel = t('homeModeGroceries');
  const foodLabel = t('homeModeFood');
  const isCompact = variant === 'compact';
  const railHeight = isCompact ? COMPACT_RAIL_HEIGHT : RAIL_HEIGHT;

  const rail = (
      <View
        onLayout={onRailLayout}
        style={[
          styles.rail,
          shadows.sm,
          isCompact ? styles.railCompact : null,
          {
            height: railHeight,
            borderRadius: radius.full,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
          },
        ]}
        accessibilityRole="radiogroup"
      >
        {!isCompact ? (
          <View
            pointerEvents="none"
            style={[styles.dashBridge, { borderColor: colors.border, left: 34, right: 34, top: RAIL_HEIGHT / 2 }]}
          />
        ) : null}

        <Animated.View style={[styles.station, styles.stationLeft, leftStationStyle, isCompact && styles.stationCompact]}>
          <Ionicons name="basket-outline" size={isCompact ? 17 : 16} color={colors.primary} />
        </Animated.View>
        <Animated.View style={[styles.station, styles.stationRight, rightStationStyle, isCompact && styles.stationCompact]}>
          <Ionicons name="restaurant-outline" size={isCompact ? 17 : 16} color={colors.accent} />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.puck, puckStyle, { top: INSET, bottom: INSET, borderRadius: radius.full }]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, groceriesFill]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius.full }]}
            />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, foodFill]}>
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radius.full }]}
            />
          </Animated.View>
          <View style={[styles.puckInner, isCompact && styles.puckInnerCompact]}>
            <Ionicons
              name={mode === 'groceries' ? 'basket' : 'restaurant'}
              size={isCompact ? 16 : 14}
              color="#FFF"
            />
            {!isCompact ? (
              <Text style={[typography.caption, styles.puckLabel]} numberOfLines={1}>
                {mode === 'groceries' ? groceriesLabel : foodLabel}
              </Text>
            ) : null}
          </View>
        </Animated.View>

        <Pressable
          style={styles.hitLeft}
          onPress={() => select('groceries')}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === 'groceries' }}
          accessibilityLabel={groceriesLabel}
        />
        <Pressable
          style={styles.hitRight}
          onPress={() => select('food')}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === 'food' }}
          accessibilityLabel={foodLabel}
        />
      </View>
  );

  if (isCompact) {
    return <View style={[styles.compactWrap, style]}>{rail}</View>;
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
      {rail}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  dashBridge: {
    position: 'absolute',
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  railCompact: {
    width: 88,
  },
  compactWrap: {
    flexShrink: 0,
  },
  stationCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  puckInnerCompact: {
    paddingHorizontal: 0,
  },
  station: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stationLeft: { left: 6 },
  stationRight: { right: 6 },
  puck: {
    position: 'absolute',
    left: 0,
    zIndex: 2,
    overflow: 'hidden',
  },
  puckInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  puckLabel: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
    maxWidth: 72,
  },
  hitLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 3,
  },
  hitRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 3,
  },
});
