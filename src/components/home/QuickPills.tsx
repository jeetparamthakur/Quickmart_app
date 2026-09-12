import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

const PILLS = [
  { id: 'offers', emoji: '🏷', labelKey: 'offers' as const, to: '/(tabs)/search' },
  { id: 'fresh', emoji: '🥬', labelKey: 'freshPicks' as const, to: '/category/cat-2' },
  { id: 'dairy', emoji: '🥛', labelKey: 'dairy' as const, to: '/category/cat-3' },
  { id: 'snacks', emoji: '🍿', labelKey: 'snacks' as const, to: '/category/cat-4' },
  { id: 'bestsellers', emoji: '🔥', labelKey: 'bestSellers' as const, to: '/(tabs)/search' },
];

export function QuickPills() {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: 8 }}
    >
      {PILLS.map((pill) => (
        <TouchableOpacity
          key={pill.id}
          activeOpacity={0.85}
          onPress={() => router.push(pill.to as never)}
          style={[
            styles.pill,
            shadows.sm,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.full,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={{ fontSize: 14 }}>{pill.emoji}</Text>
          <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>{t(pill.labelKey)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
