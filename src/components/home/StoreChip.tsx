import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Store } from '@/types/store';
import { useTheme } from '@/context/ThemeContext';
import { PressableScale } from '@/components/ui/PressableScale';
import { t } from '@/i18n';

type Props = {
  store: Store;
};

export const StoreChip = memo(function StoreChip({ store }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();

  return (
    <PressableScale
      onPress={() => router.push(`/store/${store.id}`)}
      haptic="selection"
      style={[
        styles.chip,
        shadows.md,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderColor: store.isOpen ? colors.border : colors.error,
          padding: spacing.sm,
        },
      ]}
    >
      <Image source={{ uri: store.logo }} style={[styles.logo, { borderRadius: radius.md }]} contentFit="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
          {store.name}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.eta, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="flash" size={11} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '800', marginLeft: 3 }]}>
              {store.deliveryMinutes} {t('minutesShort')}
            </Text>
          </View>
          {!store.isOpen ? (
            <Text style={[typography.caption, { color: colors.error, fontWeight: '700' }]}>{t('closed')}</Text>
          ) : store.offer ? (
            <Text style={[typography.caption, { color: colors.accent, fontWeight: '700', flex: 1 }]} numberOfLines={1}>
              {store.offer}
            </Text>
          ) : (
            <View style={styles.rating}>
              <Ionicons name="star" size={11} color={colors.accent} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 2 }]}>{store.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  chip: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logo: { width: 46, height: 46 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rating: { flexDirection: 'row', alignItems: 'center' },
});
