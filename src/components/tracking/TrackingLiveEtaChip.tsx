import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  etaMinutes: number | null;
  showLive: boolean;
  topOffset?: number;
};

export function TrackingLiveEtaChip({ etaMinutes, showLive, topOffset = 56 }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const livePulse = useSharedValue(1);

  useEffect(() => {
    if (!showLive) return;
    livePulse.value = withRepeat(withTiming(0.35, { duration: 800 }), -1, true);
  }, [showLive, livePulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: showLive ? livePulse.value : 1,
  }));

  if (etaMinutes == null && !showLive) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.chip,
        shadows.md,
        {
          top: insets.top + topOffset,
          backgroundColor: colors.card,
          borderRadius: radius.full,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderColor: colors.borderSubtle,
        },
      ]}
      pointerEvents="none"
    >
      {showLive ? (
        <View style={styles.liveRow}>
          <Animated.View style={[styles.liveDot, dotStyle, { backgroundColor: colors.error }]} />
          <Text style={[typography.caption, { color: colors.error, fontWeight: '800', marginRight: spacing.sm }]}>
            {t('live')}
          </Text>
        </View>
      ) : null}
      {etaMinutes != null ? (
        <Text style={[typography.label, { color: colors.text, fontWeight: '700' }]}>
          {t('trackEta', { minutes: etaMinutes })}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
});
