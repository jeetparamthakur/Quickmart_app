import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/auth.service';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

export default function OtpScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const phone = useAuthStore((s) => s.phone);
  const login = useAuthStore((s) => s.login);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (newOtp.every((d) => d) && newOtp.join('').length === 6) {
      verify(newOtp.join(''));
    }
  };

  const verify = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyOtp(phone, code);
      await login(result.token, result.user, result.refreshToken);
      router.replace('/(onboarding)/location');
    } catch {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await authService.sendOtp(phone);
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        <Text style={[typography.h2, { color: colors.text }]}>{t('verifyOtp')}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          {t('otpSent')} {phone}
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit && i > 0) {
                  inputs.current[i - 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpBox,
                typography.h2,
                {
                  color: colors.text,
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                },
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.md }]}>{error}</Text>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : (
          <View style={{ marginTop: spacing.xxl }}>
            <Button
              title={t('verifyOtp')}
              onPress={() => verify(otp.join(''))}
              fullWidth
              size="lg"
              disabled={otp.join('').length !== 6}
            />
          </View>
        )}

        <View style={[styles.footer, { marginTop: spacing.xxl }]}>
          {timer > 0 ? (
            <Text style={[typography.bodySmall, { color: colors.textMuted }]}>
              {t('resendOtp')} in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[typography.label, { color: colors.primary }]}>{t('resendOtp')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{t('changeNumber')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  otpRow: { flexDirection: 'row', gap: 10, marginTop: 32, justifyContent: 'center' },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    textAlign: 'center',
  },
  footer: { alignItems: 'center' },
});
