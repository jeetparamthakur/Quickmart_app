import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from './PressableScale';
import { IconButton } from './IconButton';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hints?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  editable?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'pill' | 'embedded';
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  hints,
  onFocus,
  onBlur,
  onSubmit,
  editable = true,
  onPress,
  variant = 'default',
  style,
}: Props) {
  const { colors, radius, spacing, typography, shadows, layout } = useTheme();
  const isPill = variant === 'pill';
  const isEmbedded = variant === 'embedded';
  const [hintIndex, setHintIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const cycling = Boolean(hints?.length) && !value;

  useEffect(() => {
    if (!hints?.length) return;
    const id = setInterval(() => setHintIndex((i) => (i + 1) % hints.length), 2400);
    return () => clearInterval(id);
  }, [hints]);

  const livePlaceholder = cycling ? hints![hintIndex] : placeholder;
  const height = isEmbedded ? 44 : isPill ? 42 : layout.minTouchTarget;
  const iconSize = isPill || isEmbedded ? 14 : 16;
  const iconWrapSize = isPill || isEmbedded ? 24 : 28;

  const content = (
    <View
      style={[
        styles.container,
        isPill ? styles.containerPill : null,
        isEmbedded ? styles.containerEmbedded : null,
        isPill ? shadows.md : null,
        style,
        {
          backgroundColor: isEmbedded ? 'transparent' : colors.surface,
          borderRadius: isPill ? radius.full : isEmbedded ? 0 : radius.md,
          paddingHorizontal: isEmbedded ? spacing.sm : spacing.md,
          borderColor: focused ? colors.primary : isPill ? colors.primary : colors.border,
          borderWidth: isEmbedded ? 0 : focused || isPill ? 1.5 : StyleSheet.hairlineWidth,
          height,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.primaryLight,
            width: iconWrapSize,
            height: iconWrapSize,
            borderRadius: iconWrapSize / 2,
          },
        ]}
      >
        <Ionicons name="search" size={iconSize} color={colors.primary} />
      </View>
      {cycling && !editable ? (
        <Animated.Text
          key={livePlaceholder}
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(180)}
          style={[typography.bodySmall, { color: colors.textMuted, fontWeight: '500', flex: 1 }]}
          numberOfLines={1}
        >
          {livePlaceholder}
        </Animated.Text>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={livePlaceholder}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, typography.bodySmall, { color: colors.text, fontWeight: '500' }]}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onSubmitEditing={onSubmit}
          editable={editable}
          returnKeyType="search"
          pointerEvents={onPress && !editable ? 'none' : 'auto'}
          accessibilityLabel="Search"
        />
      )}
      {value.length > 0 && editable ? (
        <IconButton
          name="close-circle"
          onPress={() => onChangeText('')}
          size={20}
          color={colors.textMuted}
          accessibilityLabel="Clear search"
          style={styles.clearBtn}
        />
      ) : null}
    </View>
  );

  if (onPress && !editable) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="selection"
        scaleTo={0.99}
        style={[styles.pressable, style]}
        accessibilityLabel="Search"
      >
        {content}
      </PressableScale>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  containerPill: {
    gap: 8,
  },
  containerEmbedded: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  clearBtn: {
    marginRight: -8,
  },
  pressable: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
});
