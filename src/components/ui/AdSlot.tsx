import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { featureFlags } from '@/constants/featureFlags';
import { AdPlacement } from '@/types/ad';
import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import { t } from '@/i18n';

type Props = {
  placement: AdPlacement;
  onPress?: () => void;
};

export function AdSlot({ placement, onPress }: Props) {
  const { colors, radius, spacing, shadows, typography } = useTheme();

  if (!featureFlags.ads_enabled) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          marginHorizontal: spacing.lg,
          marginVertical: spacing.sm,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.label, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{t('sponsored')}</Text>
      </View>
      <Image
        source={{ uri: 'https://picsum.photos/seed/ad-' + placement + '/400/120' }}
        style={{ width: '100%', height: 100, borderRadius: radius.md }}
        contentFit="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
