import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import type { TrackingStep } from '@/types/order-tracking';

type Props = {
  steps: TrackingStep[];
  compact?: boolean;
};

function StepIcon({ step, compact }: { step: TrackingStep; compact: boolean }) {
  const { colors } = useTheme();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!step.active || step.done) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    );
  }, [step.active, step.done, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: step.active && !step.done ? pulse.value : 1 }],
    opacity: step.active && !step.done ? 0.85 + (pulse.value - 1) * 2 : 1,
  }));

  const dotColor = step.done ? colors.success : step.active ? colors.primary : colors.borderSubtle;
  const iconName = step.done ? 'checkmark-circle' : step.active ? 'radio-button-on' : 'ellipse-outline';

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={iconName} size={compact ? 18 : 22} color={dotColor} />
    </Animated.View>
  );
}

export function OrderStageStepper({ steps, compact = false }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ gap: compact ? spacing.sm : spacing.md }}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.iconCol}>
              <StepIcon step={step} compact={compact} />
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: step.done ? colors.success : colors.borderSubtle },
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
