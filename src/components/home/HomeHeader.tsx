import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { PressableScale } from '@/components/ui/PressableScale';
import { t } from '@/i18n';

export function HomeHeader() {
  const { colors, spacing, typography } = useTheme();
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
        <View style={styles.locRow}>
          <View style={[styles.pin, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="location-outline" size={14} color={colors.primary} />
          </View>
          <Text style={[typography.label, { color: colors.text, maxWidth: '42%' }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={{ color: colors.textMuted, marginHorizontal: 4 }}>•</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
            {line}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { flex: 1, minWidth: 0 },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});
