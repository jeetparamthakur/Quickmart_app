import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onSubmit?: () => void;
  editable?: boolean;
  onPress?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onSubmit,
  editable = true,
  onPress,
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, typography.body, { color: colors.text }]}
        onFocus={onFocus}
        onSubmitEditing={onSubmit}
        editable={editable}
        returnKeyType="search"
      />
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
    height: 48,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
});
