import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenRoute() {
  const { colors, typography, spacing } = useTheme();
  const { isAuthenticated, isHydrated: authHydrated } = useAuthStore();
  const { hasLocation, isHydrated: locHydrated } = useLocationStore();
  const [step, setStep] = useState<'logo' | 'location' | 'done'>('logo');

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!authHydrated || !locHydrated) return;

    const timer1 = setTimeout(() => setStep('location'), 1200);
    const timer2 = setTimeout(() => {
      setStep('done');
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (!hasLocation()) {
        router.replace('/(onboarding)/location');
      } else {
        router.replace('/(tabs)');
      }
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [authHydrated, locHydrated, isAuthenticated, hasLocation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Animated.View entering={FadeIn.duration(800)} style={styles.logoContainer}>
        <View style={[styles.logoCircle, { backgroundColor: '#FFF' }]}>
          <Text style={styles.logoEmoji}>🛍️</Text>
        </View>
        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          style={[typography.h1, { color: '#FFF', marginTop: spacing.xxl }]}
        >
          {t('appName')}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(600).duration(600)}
          style={[typography.body, { color: 'rgba(255,255,255,0.85)', marginTop: spacing.sm }]}
        >
          {t('tagline')}
        </Animated.Text>
      </Animated.View>

      {step === 'location' && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.loadingContainer}>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 200)}
                style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.8)' }]}
              />
            ))}
          </View>
          <Text style={[typography.bodySmall, { color: 'rgba(255,255,255,0.7)', marginTop: spacing.md }]}>
            Detecting your location...
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
