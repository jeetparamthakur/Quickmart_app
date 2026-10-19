import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { Button } from '@/components/ui';
import { AuthEnter } from '@/components/auth';
import { useAuthStore } from '@/store/authStore';
import { customerService } from '@/services/api/customer.service';
import { useTheme } from '@/context/ThemeContext';
import { getErrorMessage } from '@/services/api/errors';
import { t } from '@/i18n';

export default function YourNameScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearRequiresNameSetup = useAuthStore((s) => s.clearRequiresNameSetup);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const continueToLocation = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('yourNameRequired'));
      return;
    }
    if (trimmed.length < 2) {
      setNameError(t('yourNameTooShort'));
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      const result = await customerService.updateProfile(trimmed);
      updateUser({ name: result.fullName });
      clearRequiresNameSetup();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(onboarding)/location');
    } catch (err) {
      setNameError(getErrorMessage(err, t('yourNameSaveFailed')));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
        keyboardVerticalOffset={8}
      >
        <AuthEnter delay={40}>
          <Text style={[typography.h1, { color: colors.text }]}>{t('yourNameTitle')}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('yourNameSubtitle')}
          </Text>
        </AuthEnter>

        <AuthEnter delay={140} style={styles.fieldBlock}>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                borderColor: nameError ? colors.error : colors.borderSubtle,
              },
            ]}
          >
            <Ionicons name="person-outline" size={20} color={colors.textMuted} />
            <TextInput
              placeholder={t('yourNamePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (nameError) setNameError('');
              }}
              style={[styles.input, typography.body, { color: colors.text }]}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => void continueToLocation()}
            />
          </View>
          {nameError ? (
            <Text style={[typography.caption, { color: colors.error, marginTop: spacing.sm }]}>{nameError}</Text>
          ) : null}
        </AuthEnter>

        <View style={styles.footer}>
          <Button
            title={t('continue')}
            onPress={() => void continueToLocation()}
            fullWidth
            size="lg"
            loading={saving}
            disabled={!name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  fieldBlock: { marginTop: 36, flex: 1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { flex: 1, padding: 0 },
  footer: { paddingBottom: 12 },
});
