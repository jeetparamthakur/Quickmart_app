import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon?: IoniconName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'cart-outline', title, subtitle, actionLabel, onAction }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxxl }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight, borderRadius: radius.lg }]}>
        <Ionicons name={icon} size={42} color={colors.primary} />
      </View>
      <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            typography.bodySmall,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.xxl, width: '100%' }}>
          <Button title={actionLabel} onPress={onAction} fullWidth />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
