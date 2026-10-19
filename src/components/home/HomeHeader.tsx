import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { PressableScale } from '@/components/ui/PressableScale';
import { t } from '@/i18n';

export function HomeHeader() {
  const { colors, spacing, typography, radius, fontFamily } = useTheme();
  const { selectedAddress, displayLocation } = useLocation();

  const label = selectedAddress?.label ?? t('deliverTo');
  const line = selectedAddress?.line1 ?? displayLocation;

  return (
    <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
      <PressableScale
        style={styles.location}
        onPress={() => router.push('/(onboarding)/location')}
        haptic="selection"
        accessibilityLabel={`Delivery location, ${label}`}
      >
        <View style={[styles.pin, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="location" size={16} color={colors.primary} />
        </View>
        <View style={styles.textCol}>
          <View style={styles.labelRow}>
            <Text style={[typography.caption, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              {t('deliverTo')}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textMuted} style={{ marginLeft: 2 }} />
          </View>
          <Text style={[typography.label, { color: colors.text, fontFamily: fontFamily.bold }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]} numberOfLines={1}>
            {line}
          </Text>
        </View>
      </PressableScale>
      <PressableScale
        onPress={() => router.push('/wishlist')}
        haptic="selection"
        accessibilityLabel="Wishlist"
        style={[styles.actionBtn, { backgroundColor: colors.surface, borderRadius: radius.full, borderColor: colors.borderSubtle }]}
      >
        <Ionicons name="heart-outline" size={20} color={colors.text} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  location: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textCol: { flex: 1, minWidth: 0 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
