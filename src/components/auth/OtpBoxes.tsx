import { useEffect, useRef, useState } from 'react';
import { TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
};

function OtpDigit({
  digit,
  focused,
  autoFocus,
  onChangeText,
  onKeyPress,
  onFocus,
  inputRef,
  disabled,
}: {
  digit: string;
  focused: boolean;
  autoFocus?: boolean;
  onChangeText: (v: string) => void;
  onKeyPress: (key: string) => void;
  onFocus: () => void;
  inputRef: (ref: TextInput | null) => void;
  disabled?: boolean;
}) {
  const { colors, typography, radius } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!digit) return;
    scale.value = withSequence(withSpring(1.1, { damping: 12, stiffness: 220 }), withSpring(1));
  }, [digit, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderColor = focused ? colors.primary : digit ? colors.primary : colors.border;
  const backgroundColor = focused ? colors.primaryLight : colors.surface;

  return (
    <Animated.View style={animatedStyle}>
      <TextInput
        ref={inputRef}
        value={digit}
        onChangeText={onChangeText}
        onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        maxLength={6}
        editable={!disabled}
        selectTextOnFocus
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        style={[
          styles.box,
          typography.h2,
          {
            color: colors.text,
            borderColor,
            backgroundColor,
            borderRadius: radius.md,
          },
        ]}
      />
    </Animated.View>
  );
}

export function OtpBoxes({ value, onChange, onComplete, disabled }: Props) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const applyDigits = (digits: string, startIndex = 0) => {
    const cleaned = digits.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...value];
      next[startIndex] = '';
      onChange(next);
      return;
    }

    if (cleaned.length > 1) {
      const next = [...value];
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((d, i) => {
        next[i] = d;
      });
      onChange(next);
      const filled = next.join('');
      if (filled.length === 6) {
        inputs.current[5]?.blur();
        onComplete(filled);
      } else {
        inputs.current[chars.length]?.focus();
      }
      return;
    }

    const next = [...value];
    next[startIndex] = cleaned.slice(-1);
    onChange(next);
    if (cleaned && startIndex < 5) inputs.current[startIndex + 1]?.focus();
    const code = next.join('');
    if (next.every((d) => d) && code.length === 6) onComplete(code);
  };

  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        const empty = value.findIndex((d) => !d);
        inputs.current[empty === -1 ? 5 : empty]?.focus();
      }}
    >
      {value.map((digit, i) => (
        <OtpDigit
          key={i}
          digit={digit}
          focused={focusedIndex === i}
          autoFocus={i === 0}
          disabled={disabled}
          onFocus={() => setFocusedIndex(i)}
          inputRef={(ref) => {
            inputs.current[i] = ref;
          }}
          onChangeText={(v) => applyDigits(v, i)}
          onKeyPress={(key) => {
            if (key === 'Backspace' && !digit && i > 0) {
              const next = [...value];
              next[i - 1] = '';
              onChange(next);
              inputs.current[i - 1]?.focus();
            }
          }}
        />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 58,
    borderWidth: 2,
    textAlign: 'center',
    fontWeight: '700',
  },
});
