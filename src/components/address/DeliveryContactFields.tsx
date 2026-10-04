import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';
import { normalizePhoneDigits } from '@/types/location';

type Props = {
  receiverName: string;
  receiverPhone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  nameError?: string;
  phoneError?: string;
};

export function DeliveryContactFields({
  receiverName,
  receiverPhone,
  onNameChange,
  onPhoneChange,
  nameError,
  phoneError,
}: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.sm,
            borderColor: nameError ? colors.error : 'transparent',
          },
        ]}
      >
        <Ionicons name="person-outline" size={18} color={colors.textMuted} />
        <TextInput
          placeholder={t('receiverName')}
          placeholderTextColor={colors.textMuted}
          value={receiverName}
          onChangeText={onNameChange}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
      {nameError ? <Text style={[typography.caption, { color: colors.error }]}>{nameError}</Text> : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.sm,
            borderColor: phoneError ? colors.error : 'transparent',
          },
        ]}
      >
        <Text style={[typography.label, { color: colors.textSecondary, fontWeight: '700' }]}>+91</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Ionicons name="call-outline" size={18} color={colors.textMuted} />
        <TextInput
          placeholder={t('receiverPhone')}
          placeholderTextColor={colors.textMuted}
          value={receiverPhone}
          onChangeText={(v) => onPhoneChange(normalizePhoneDigits(v))}
          keyboardType="number-pad"
          maxLength={10}
          style={[styles.input, { color: colors.text, flex: 1 }]}
        />
      </View>
      {phoneError ? <Text style={[typography.caption, { color: colors.error }]}>{phoneError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {},
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1.5,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  divider: { width: 1, height: 22 },
});
