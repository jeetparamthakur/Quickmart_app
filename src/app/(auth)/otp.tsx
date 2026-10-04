import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from '@/utils/haptics';
import { Button } from '@/components/ui';
import { AuthEnter, OtpBoxes, ShakeView } from '@/components/auth';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/auth.service';
import { refreshAddressesFromApi } from '@/hooks/useAddressSync';
import { useTheme } from '@/context/ThemeContext';
import { getErrorMessage } from '@/services/api/errors';
import { t } from '@/i18n';

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const last2 = digits.slice(-2);
  return `+91 ••••••${last2}`;
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function OtpScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const phone = useAuthStore((s) => s.phone);
  const login = useAuthStore((s) => s.login);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((n) => n - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const verify = async (code: string) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyOtp(phone, code);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await login(result.token, result.user, result.refreshToken);
      try {
        await refreshAddressesFromApi();
      } catch {
        // keep local addresses
      }
      router.replace('/(onboarding)/location');
    } catch (err) {
      setError(getErrorMessage(err, t('invalidOtp')));
      setOtp(['', '', '', '', '', '']);
      setShake((n) => n + 1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    try {
      await authService.sendOtp(phone);
      setTimer(30);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setError(getErrorMessage(err, t('sendOtpFailed')));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
        keyboardVerticalOffset={8}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.back, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.full }]}
        >
          <Text style={[styles.backGlyph, { color: colors.text }]}>←</Text>
        </TouchableOpacity>

        <AuthEnter delay={40}>
          <Text style={[typography.h1, { color: colors.text }]}>{t('enterCode')}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('otpSent')} {maskPhone(phone)}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.sm }}>
            <Text style={[typography.label, { color: colors.primary }]}>{t('changeNumber')}</Text>
          </TouchableOpacity>
        </AuthEnter>

        <AuthEnter delay={140} style={styles.otpBlock}>
          <ShakeView trigger={shake}>
            <OtpBoxes value={otp} onChange={setOtp} onComplete={verify} disabled={loading} />
          </ShakeView>
          {error ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: spacing.md, textAlign: 'center' }]}>
              {error}
            </Text>
          ) : null}
        </AuthEnter>

        <View style={styles.footer}>
          <Button
            title={t('verifyOtp')}
            onPress={() => verify(otp.join(''))}
            fullWidth
            size="lg"
            loading={loading}
            disabled={otp.join('').length !== 6}
          />
          <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
            {timer > 0 ? (
              <View
                style={[
                  styles.timerPill,
                  { backgroundColor: colors.surfaceSecondary, borderRadius: radius.full },
                ]}
              >
                <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
                  {t('resendIn')} {formatTimer(timer)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[typography.label, { color: colors.primary }]}>{t('resendOtp')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  backGlyph: { fontSize: 20, fontWeight: '600' },
  otpBlock: { marginTop: 36, flex: 1 },
  footer: { paddingBottom: 12 },
  timerPill: { paddingHorizontal: 14, paddingVertical: 8 },
});
