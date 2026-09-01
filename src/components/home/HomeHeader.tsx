import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/hooks/useLocation';

export function HomeHeader() {
  const { colors, spacing, typography } = useTheme();
  const { selectedAddress, displayLocation } = useLocation();

  return (
    <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
      <TouchableOpacity
        style={styles.location}
        onPress={() => router.push('/(onboarding)/location')}
      >
        <Text style={{ fontSize: 16 }}>📍</Text>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Deliver to</Text>
          <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>
            {displayLocation}
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary }}>▼</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={{ fontSize: 18 }}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  location: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
