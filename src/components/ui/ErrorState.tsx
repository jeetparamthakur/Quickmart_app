import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  onRetry?: () => void;
};

export function ErrorState({ icon = '⚠️', title, subtitle, onRetry }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxxl }]}>
      <Text style={styles.icon}>{icon}</Text>
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
  icon: {
    fontSize: 56,
  },
});
