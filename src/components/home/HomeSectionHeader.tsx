import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui/PressableScale';
import { t } from '@/i18n';

type Props = {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  accentColor?: string;
};

export function HomeSectionHeader({ title, subtitle, onSeeAll, accentColor }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const accent = accentColor ?? colors.primary;

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
      <View style={styles.left}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: colors.text, fontWeight: '800', letterSpacing: -0.3 }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {onSeeAll ? (
        <PressableScale
          onPress={onSeeAll}
          haptic="selection"
          style={[styles.seeAll, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.full }]}
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '800' }]}>{t('seeAll')}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  accentBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginTop: 2,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
