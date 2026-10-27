import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';

import { nativeDriver } from '../motion';
import { ease } from '../theme';

type Props = {
  // Changing id slides the new children in from the right and the old ones out to the left.
  id: string;
  children: ReactNode;
  reduceMotion?: boolean;
};

export function Slide({ id, children, reduceMotion }: Props) {
  const { width } = useWindowDimensions();
  const progress = useRef(new Animated.Value(1)).current;
  const last = useRef({ id, node: children });
  const [outgoing, setOutgoing] = useState<{ id: string; node: ReactNode } | null>(null);

  useLayoutEffect(() => {
    if (last.current.id === id) return;
    setOutgoing(last.current);
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: reduceMotion ? 0 : 420, easing: ease, useNativeDriver: nativeDriver }).start(
      () => setOutgoing(null),
    );
  }, [id]);

  // Runs after the effect above, so that one still sees the previous screen.
  useLayoutEffect(() => {
    last.current = { id, node: children };
  });

  const incomingX = progress.interpolate({ inputRange: [0, 1], outputRange: [width, 0] });
  const outgoingX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });

  return (
    <View style={styles.fill}>
      {outgoing && (
        <Animated.View key={outgoing.id} style={[styles.layer, { transform: [{ translateX: outgoingX }] }]} pointerEvents="none">
          {outgoing.node}
        </Animated.View>
      )}
      <Animated.View key={id} style={[styles.layer, outgoing && { transform: [{ translateX: incomingX }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  layer: { ...StyleSheet.absoluteFill },
});
