import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  value: string;
  onChange: (digits: string) => void;
  error?: boolean;
};

function formatPhone(digits: string) {
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function PhoneField({ value, onChange, error }: Props) {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View>
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        {t('mobileNumber')}
      </Text>
      <View
        style={[
          styles.row,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderRadius: radius.lg,
          },
        ]}
      >
        <View
          style={[
            styles.chip,
            {
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>🇮🇳  +91</Text>
        </View>
        <TextInput
          value={formatPhone(value)}
          onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 10))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="98765 43210"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={11}
          style={[styles.input, typography.body, { color: colors.text }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 8,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    letterSpacing: 0.6,
    fontSize: 18,
    fontWeight: '600',
  },
});
