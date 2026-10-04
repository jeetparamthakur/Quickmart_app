import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from '@/utils/haptics';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui';
import { AuthEnter, BrandMark, PhoneField, ShakeView } from '@/components/auth';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/auth.service';
import { useTheme } from '@/context/ThemeContext';
import { getErrorMessage } from '@/services/api/errors';
import { t } from '@/i18n';

export default function LoginScreen() {
  const { colors, spacing, typography } = useTheme();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [phone, setPhoneLocal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);

  const handleContinue = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError(t('invalidPhone'));
      setShake((n) => n + 1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError('');
    setLoading(true);
    const formatted = '+91 ' + cleaned;
    setPhone(formatted);
    try {
      await authService.sendOtp(formatted);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/(auth)/otp');
    } catch (err) {
      setError(getErrorMessage(err, t('sendOtpFailed')));
      setShake((n) => n + 1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[colors.primaryLight, colors.background]}
        locations={[0, 1]}
        style={styles.hero}
      >
        <View style={[styles.orb, styles.orbOne, { backgroundColor: colors.accentLight }]} />
        <View style={[styles.orb, styles.orbTwo, { backgroundColor: colors.primaryLight }]} />
      </LinearGradient>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inner}
          keyboardVerticalOffset={8}
        >
          <View style={styles.header}>
            <BrandMark />
            <AuthEnter delay={80}>
              <Text style={[typography.h1, styles.title, { color: colors.text }]}>{t('welcome')}</Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                {t('tagline')}
              </Text>
            </AuthEnter>
          </View>

          <AuthEnter delay={160} style={styles.form}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              {t('loginSubtitle')}
            </Text>
            <ShakeView trigger={shake}>
              <PhoneField value={phone} onChange={setPhoneLocal} error={!!error} />
            </ShakeView>
            {error ? (
              <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{error}</Text>
            ) : null}
          </AuthEnter>

          <View style={styles.footer}>
            <Button
              title={t('continue')}
              onPress={handleContinue}
              fullWidth
              size="lg"
              loading={loading}
            />
            <Text style={[typography.caption, styles.terms, { color: colors.textMuted, marginTop: spacing.md }]}>
              {t('loginTerms')}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 180,
    height: 180,
    top: -40,
    right: -30,
  },
  orbTwo: {
    width: 120,
    height: 120,
    top: 90,
    left: -40,
  },
  safe: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  header: { marginTop: 28, marginBottom: 28, gap: 16 },
  title: { marginTop: 4 },
  form: { flex: 1 },
  footer: { paddingBottom: 12 },
  terms: { textAlign: 'center', lineHeight: 18 },
});
