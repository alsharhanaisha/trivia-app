import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Star } from '../Icons';
import { nativeDriver } from '../motion';
import { colors } from '../theme';

type Props = {
  filled: number;
  total?: number;
  size?: number;
  gap?: number;
  reduceMotion?: boolean;
  // stagger the fill-in on mount, one star after another (results screen)
  cascade?: boolean;
};

export function Stars({ filled, total = 5, size = 28, gap = 6, reduceMotion, cascade }: Props) {
  return (
    <View
      style={[styles.row, { gap }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${filled} of ${total} stars`}
    >
      {Array.from({ length: total }, (_, i) => (
        <AnimatedStar
          key={i}
          filled={i < filled}
          size={size}
          delay={cascade ? 250 + i * 180 : 0}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

function AnimatedStar({ filled, size, delay, reduceMotion }: { filled: boolean; size: number; delay: number; reduceMotion?: boolean }) {
  const pop = useRef(new Animated.Value(1)).current;
  const wasFilled = useRef(delay > 0 ? false : filled);
  const showFilled = useRef(new Animated.Value(wasFilled.current ? 1 : 0)).current;

  useEffect(() => {
    if (filled && !wasFilled.current) {
      wasFilled.current = true;
      if (reduceMotion) {
        showFilled.setValue(1);
        return;
      }
      pop.setValue(0.4);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(showFilled, { toValue: 1, duration: 1, useNativeDriver: nativeDriver }),
          Animated.spring(pop, { toValue: 1, friction: 4, tension: 160, useNativeDriver: nativeDriver }),
        ]),
      ]).start();
    }
  }, [filled]);

  return (
    <View style={{ width: size, height: size }}>
      <View style={StyleSheet.absoluteFill}>
        <Star size={size} emptyColor={colors.starEmpty} />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: showFilled, transform: [{ scale: pop }] }]}>
        <Star size={size} filled color={colors.star} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
