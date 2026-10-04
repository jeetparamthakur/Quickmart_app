import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { PressableScale } from './PressableScale';
import { useTheme } from '@/context/ThemeContext';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  subtitle?: string;
  destructive?: boolean;
  showChevron?: boolean;
  accessibilityLabel?: string;
};

export function ListRow({
  label,
  icon,
  onPress,
  subtitle,
  destructive = false,
  showChevron = true,
  accessibilityLabel,
}: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const labelColor = destructive ? colors.error : colors.text;

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.row,
        {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: destructive ? colors.errorLight : colors.primaryLight }]}>
        <Ionicons name={icon} size={20} color={destructive ? colors.error : colors.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[typography.body, { color: labelColor, fontWeight: '600' }]}>{label}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
});
