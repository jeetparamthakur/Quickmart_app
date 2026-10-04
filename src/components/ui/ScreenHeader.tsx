import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { IconButton } from './IconButton';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  trailing?: React.ReactNode;
  gradient?: boolean;
  style?: ViewStyle;
};

export function ScreenHeader({
  title,
  subtitle,
  showBack,
  onBack,
  trailing,
  gradient = false,
  style,
}: Props) {
  const { colors, spacing, typography, layout } = useTheme();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const content = (
    <View
      style={[
        styles.row,
        {
          paddingHorizontal: spacing.lg,
          minHeight: layout.screenHeaderHeight,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      {showBack ? (
        <IconButton
          name="chevron-back"
          onPress={handleBack}
          accessibilityLabel="Go back"
          style={styles.backBtn}
        />
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <View style={styles.center}>
        <Text
          style={[typography.h2, styles.title, { color: colors.text }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailing}>{trailing ?? <View style={styles.backPlaceholder} />}</View>
    </View>
  );

  if (!gradient) return content;

  return (
    <LinearGradient colors={[colors.primaryLight, colors.background]} style={styles.gradient}>
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginLeft: -8,
  },
  backPlaceholder: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  trailing: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
