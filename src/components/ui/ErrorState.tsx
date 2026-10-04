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
  onRetry?: () => void;
};

export function ErrorState({ icon = 'alert-circle-outline', title, subtitle, onRetry }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxxl }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.errorLight, borderRadius: radius.lg }]}>
        <Ionicons name={icon} size={40} color={colors.error} />
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
      {onRetry ? (
        <View style={{ marginTop: spacing.xxl }}>
          <Button title="Try Again" onPress={onRetry} variant="secondary" />
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
