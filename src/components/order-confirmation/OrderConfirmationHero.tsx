import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  ZoomIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  etaMinutes: number;
};

export function OrderConfirmationHero({ etaMinutes }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <LinearGradient
      colors={[colors.successLight, colors.primaryLight, colors.background]}
      locations={[0, 0.45, 1]}
      style={[styles.gradient, { paddingBottom: spacing.xl }]}
    >
      <Animated.View
        entering={ZoomIn.duration(550)}
        style={[
          iconStyle,
          styles.iconWrap,
          {
            backgroundColor: colors.card,
            borderRadius: radius.full,
            marginTop: spacing.xxl,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={76} color={colors.success} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(450)}
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}
      >
        {t('orderSuccess')}
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(320).duration(450)}
        style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}
      >
        {t('orderConfirmationSubtitle')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(440).duration(450)} style={{ marginTop: spacing.xl, alignItems: 'center' }}>
        <Text style={[typography.caption, { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }]}>
          ETA
        </Text>
        <Text style={[typography.h1, { color: colors.primary, marginTop: spacing.xs, fontWeight: '800' }]}>
          {t('trackEta', { minutes: etaMinutes })}
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
