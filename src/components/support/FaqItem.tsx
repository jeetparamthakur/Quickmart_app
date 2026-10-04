import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from '@/utils/haptics';
import { PressableScale } from '@/components/ui/PressableScale';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
};

export function FaqItem({ question, answer, expanded, onToggle }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <PressableScale
      onPress={() => {
        void Haptics.selectionAsync();
        onToggle();
      }}
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.head}>
        <Text style={[typography.label, { color: colors.text, flex: 1, fontSize: 14 }]}>{question}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {expanded ? (
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 }]}>
          {answer}
        </Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
});
