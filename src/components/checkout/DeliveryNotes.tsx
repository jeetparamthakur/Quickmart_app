import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export function DeliveryNotes({ value, onChange }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={styles.head}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
        <Text style={[typography.label, { color: colors.text, fontSize: 15 }]}>{t('deliveryInstructions')}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t('deliveryInstructionsPlaceholder')}
        placeholderTextColor={colors.textMuted}
        multiline
        style={[
          styles.input,
          typography.bodySmall,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            color: colors.text,
            padding: spacing.md,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
