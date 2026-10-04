import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { ScreenHeader, Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { customerService } from '@/services/api/customer.service';
import { getErrorMessage } from '@/services/api/errors';
import { formatDisplayPhone } from '@/types/location';

const PLACEHOLDER_NAME = 'User';

function isDefaultName(name?: string | null) {
  const trimmed = name?.trim();
  return !trimmed || trimmed === PLACEHOLDER_NAME;
}

export default function MyAccountScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const user = useAuthStore((s) => s.user);
  const storedPhone = useAuthStore((s) => s.phone);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await customerService.getProfile();
      const displayPhone = formatDisplayPhone(profile.phone ?? user?.phone ?? storedPhone);
      setPhone(displayPhone);
      const initialName = profile.fullName ?? user?.name;
      setName(isDefaultName(initialName) ? '' : (initialName?.trim() ?? ''));
      if (profile.fullName && !isDefaultName(profile.fullName)) {
        updateUser({ name: profile.fullName, phone: profile.phone ?? user?.phone });
      }
    } catch (err) {
      setPhone(formatDisplayPhone(user?.phone ?? storedPhone));
      const fallback = user?.name;
      setName(isDefaultName(fallback) ? '' : (fallback?.trim() ?? ''));
      Alert.alert('My Account', getErrorMessage(err, 'Could not load your profile'));
    } finally {
      setLoading(false);
    }
  }, [storedPhone, updateUser, user?.name, user?.phone]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Please enter your name');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      const result = await customerService.updateProfile(trimmed);
      updateUser({ name: result.fullName });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Your name has been updated.');
    } catch (err) {
      Alert.alert('My Account', getErrorMessage(err, 'Could not update your name'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader title="My Account" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <View
            style={[
              styles.fieldBlock,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.md,
                padding: spacing.md,
                gap: spacing.md,
              },
            ]}
          >
            <View style={styles.readOnlyRow}>
              <Ionicons name="call-outline" size={18} color={colors.textMuted} />
              <View style={styles.fieldText}>
                <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
                  Mobile number
                </Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginTop: 2 }]}>
                  {loading ? '…' : phone || '—'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.sm,
                  borderColor: nameError ? colors.error : 'transparent',
                },
              ]}
            >
              <Ionicons name="person-outline" size={18} color={colors.textMuted} />
              <TextInput
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  if (nameError) setNameError('');
                }}
                style={[styles.input, typography.body, { color: colors.text }]}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
            {nameError ? (
              <Text style={[typography.caption, { color: colors.error }]}>{nameError}</Text>
            ) : (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                This name is used for orders and delivery updates.
              </Text>
            )}
          </View>

          <Button title="Save changes" onPress={save} loading={saving} disabled={loading} fullWidth />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  fieldBlock: {},
  readOnlyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  fieldText: { flex: 1 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { flex: 1, padding: 0 },
});
