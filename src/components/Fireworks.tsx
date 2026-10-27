import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

import { nativeDriver } from '../motion';
import { colors } from '../theme';

const BURSTS = 6;
const SPARKS = 18;
const BURST_MS = 1000;
const PALETTE = [colors.star, colors.correct, '#FF6B7A', '#7FD3FF', colors.play, '#C39BFF'];

type Burst = { x: number; y: number; delay: number; color: string; radius: number };

// Bursts are staggered so the whole show fits in about 2 seconds.
export function Fireworks() {
  const { width, height } = useWindowDimensions();
  const bursts = useMemo<Burst[]>(
    () =>
      Array.from({ length: BURSTS }, (_, i) => ({
        x: width * (0.15 + Math.random() * 0.7),
        y: height * (0.12 + Math.random() * 0.4),
        delay: i * 180,
        color: PALETTE[i % PALETTE.length],
        radius: Math.min(width, height) * (0.16 + Math.random() * 0.08),
      })),
    [],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bursts.map((b, i) => (
        <BurstView key={i} burst={b} />
      ))}
    </View>
  );
}

function BurstView({ burst }: { burst: Burst }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: BURST_MS,
      delay: burst.delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }).start();
  }, []);

  const opacity = t.interpolate({ inputRange: [0, 0.05, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] });

  return (
    <View style={[styles.origin, { left: burst.x, top: burst.y }]}>
      {Array.from({ length: SPARKS }, (_, k) => {
        const angle = (k / SPARKS) * Math.PI * 2;
        const dx = t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * burst.radius] });
        // a little gravity pulls the sparks down as they fade
        const dy = t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * burst.radius + 24] });
        return (
          <Animated.View
            key={k}
            style={[
              styles.spark,
              { backgroundColor: k % 3 === 0 ? colors.white : burst.color, opacity, transform: [{ translateX: dx }, { translateY: dy }, { scale }] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', width: 0, height: 0 },
  spark: { position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: 3.5 },
});
