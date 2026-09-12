import { Text, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

export function BrandMark() {
  const { colors, shadows, radius } = useTheme();

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(14)}
      style={[
        styles.mark,
        shadows.lg,
        { backgroundColor: colors.surface, borderRadius: radius.lg },
      ]}
    >
      <Text style={[styles.letter, { color: colors.primary }]}>Q</Text>
      <View style={[styles.dot, { backgroundColor: colors.accent }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  dot: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
