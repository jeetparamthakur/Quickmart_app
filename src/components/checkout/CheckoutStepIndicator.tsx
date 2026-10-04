import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const STEPS = ['Address', 'Payment', 'Confirm'];

export function CheckoutStepIndicator() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
      {STEPS.map((label, i) => (
        <View key={label} style={styles.step}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>{label}</Text>
          {i < STEPS.length - 1 ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  line: {
    position: 'absolute',
    top: 3,
    left: '55%',
    right: '-45%',
    height: 2,
    zIndex: -1,
  },
});
