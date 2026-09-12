import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from '@/hooks/useLocation';
import { t } from '@/i18n';

type Props = {
  deliveryMinutes?: number;
};

export function HomeHeader({ deliveryMinutes = 10 }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { selectedAddress, displayLocation } = useLocation();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false
    );
  }, [pulse]);

  const boltStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const label = selectedAddress?.label ?? t('deliverTo');
  const line = selectedAddress?.line1 ?? displayLocation;

  return (
    <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
      <TouchableOpacity
        style={styles.location}
        onPress={() => router.push('/(onboarding)/location')}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <Animated.Text style={[styles.bolt, boltStyle]}>⚡</Animated.Text>
          <Text style={[typography.h2, { color: colors.text, fontWeight: '800', letterSpacing: -0.4 }]}>
            {t('deliveryInMinutes', { minutes: deliveryMinutes })}
          </Text>
        </View>
        <View style={styles.locRow}>
          <Text style={[typography.label, { color: colors.text, maxWidth: '42%' }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={{ color: colors.textMuted, marginHorizontal: 4 }}>•</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
            {line}
          </Text>
          <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: 9 }}>▼</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.7}
        hitSlop={8}
        style={styles.avatar}
      >
        <Ionicons name="person-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  location: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bolt: { fontSize: 18 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  avatar: {
    paddingTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
