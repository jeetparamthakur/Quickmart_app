import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

export default function LoginScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const setPhone = useAuthStore((s) => s.setPhone);
  const [phone, setPhoneLocal] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setPhone('+91 ' + cleaned);
    router.push('/(auth)/otp');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🛍️</Text>
          <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>
            {t('welcome')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('loginSubtitle')}
          </Text>
        </View>

        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
          <View style={[styles.countryCode, { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm }]}>
            <Text style={[typography.body, { color: colors.text }]}>🇮🇳 +91</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(v) => setPhoneLocal(v.replace(/\D/g, '').slice(0, 10))}
            placeholder="Mobile number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            style={[styles.input, typography.body, { color: colors.text }]}
            maxLength={10}
          />
        </View>

        {error ? (
          <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{error}</Text>
        ) : null}

        <View style={{ marginTop: spacing.xxl }}>
          <Button title={t('continue')} onPress={handleContinue} fullWidth size="lg" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 40, alignItems: 'center' },
  logo: { fontSize: 56 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 8,
    gap: 8,
  },
  countryCode: { paddingHorizontal: 12, paddingVertical: 10 },
  input: { flex: 1, paddingVertical: 10 },
});
