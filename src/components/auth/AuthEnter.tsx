import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
};

export function AuthEnter({ children, delay = 0, style }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(480).springify()} style={style}>
      {children}
    </Animated.View>
  );
}
