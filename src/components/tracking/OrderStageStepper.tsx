import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { TrackingStep } from '@/types/order-tracking';

type Props = {
  steps: TrackingStep[];
  compact?: boolean;
};

export function OrderStageStepper({ steps, compact = false }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ gap: compact ? spacing.sm : spacing.md }}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const dotColor = step.done ? colors.success : step.active ? colors.primary : colors.border;
        const iconName = step.done ? 'checkmark-circle' : step.active ? 'radio-button-on' : 'ellipse-outline';

        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.iconCol}>
              <Ionicons name={iconName} size={compact ? 18 : 22} color={dotColor} />
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: step.done ? colors.success : colors.border },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                compact ? typography.caption : typography.bodySmall,
                {
                  color: step.active ? colors.text : colors.textSecondary,
                  fontWeight: step.active ? '700' : '500',
                  flex: 1,
                  paddingBottom: isLast ? 0 : compact ? spacing.sm : spacing.md,
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconCol: { width: 28, alignItems: 'center' },
  line: { width: 2, flex: 1, minHeight: 16, marginTop: 2 },
});
