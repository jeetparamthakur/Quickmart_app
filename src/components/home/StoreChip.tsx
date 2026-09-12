import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Store } from '@/types/store';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  store: Store;
};

export const StoreChip = memo(function StoreChip({ store }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/store/${store.id}`)}
      style={[
        styles.chip,
        shadows.md,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: store.isOpen ? colors.border : colors.errorLight,
          padding: spacing.sm,
        },
      ]}
    >
      <Image source={{ uri: store.logo }} style={[styles.logo, { borderRadius: radius.md }]} contentFit="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>
          {store.name}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.eta, { backgroundColor: colors.primaryLight }]}>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '800' }]}>
              ⚡ {store.deliveryMinutes} {t('minutesShort')}
            </Text>
          </View>
          {!store.isOpen ? (
            <Text style={[typography.caption, { color: colors.error, fontWeight: '700' }]}>{t('closed')}</Text>
          ) : store.offer ? (
            <Text style={[typography.caption, { color: colors.accent, fontWeight: '700', flex: 1 }]} numberOfLines={1}>
              {store.offer}
            </Text>
          ) : (
            <Text style={[typography.caption, { color: colors.textMuted }]}>⭐ {store.rating}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chip: {
    width: 210,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logo: { width: 48, height: 48 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  eta: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
});
