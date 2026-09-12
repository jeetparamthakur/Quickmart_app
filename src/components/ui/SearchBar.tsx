import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  hints?: string[];
  onFocus?: () => void;
  onSubmit?: () => void;
  editable?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'pill';
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  hints,
  onFocus,
  onSubmit,
  editable = true,
  onPress,
  variant = 'default',
}: Props) {
  const { colors, radius, spacing, typography, shadows } = useTheme();
  const isPill = variant === 'pill';
  const [hintIndex, setHintIndex] = useState(0);
  const cycling = Boolean(hints?.length) && !value;

  useEffect(() => {
    if (!hints?.length) return;
    const id = setInterval(() => setHintIndex((i) => (i + 1) % hints.length), 2400);
    return () => clearInterval(id);
  }, [hints]);

  const livePlaceholder = cycling ? hints![hintIndex] : placeholder;

  const content = (
    <View
      style={[
        styles.container,
        isPill ? shadows.md : null,
        {
          backgroundColor: colors.surface,
          borderRadius: isPill ? radius.full : radius.md,
          paddingHorizontal: spacing.lg,
          borderColor: isPill ? colors.primary : colors.border,
          borderWidth: isPill ? 1.5 : StyleSheet.hairlineWidth,
          height: isPill ? 52 : 48,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
        <Text style={styles.searchIcon}>🔍</Text>
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
          onFocus={onFocus}
          onSubmitEditing={onSubmit}
          editable={editable}
          returnKeyType="search"
          pointerEvents={onPress && !editable ? 'none' : 'auto'}
        />
      )}
      {value.length > 0 && editable ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (onPress && !editable) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
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
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 13,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
});
