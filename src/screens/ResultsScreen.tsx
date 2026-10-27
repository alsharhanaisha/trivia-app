import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fireworks } from '../components/Fireworks';
import { Stars } from '../components/Stars';
import { Replay } from '../Icons';
import { nativeDriver } from '../motion';
import type { Category } from '../triviaApi';
import { colors, fonts } from '../theme';

const SHOW_MS = 2000;

type Props = {
  category: Category;
  score: number;
  total: number;
  reduceMotion: boolean;
  onPlayAgain: () => void;
};

export function ResultsScreen({ category, score, total, reduceMotion, onPlayAgain }: Props) {
  const perfect = score === total;
  const [fireworks, setFireworks] = useState(perfect && !reduceMotion);
  const [showPlay, setShowPlay] = useState(false);
  const playIn = useRef(new Animated.Value(0)).current;

  // Fireworks run for 2 seconds; then Play again appears.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFireworks(false);
      setShowPlay(true);
      Animated.timing(playIn, { toValue: 1, duration: reduceMotion ? 0 : 360, useNativeDriver: nativeDriver }).start();
    }, SHOW_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.category}>{(category.group ? category.group + ' · ' : '') + category.name}</Text>

      <View style={styles.middle} accessibilityLiveRegion="polite">
        <Stars filled={score} total={total} size={52} gap={8} cascade reduceMotion={reduceMotion} />
        <Text style={styles.score}>
          {score} out of {total}
        </Text>
        {perfect && (
          <Text style={styles.congrats} accessibilityRole="header">
            Congratulations
          </Text>
        )}
      </View>

      <View style={styles.bottom}>
        {showPlay && (
          <Animated.View
            style={{ opacity: playIn, transform: [{ translateY: playIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}
          >
            <Pressable
              onPress={onPlayAgain}
              accessibilityRole="button"
              style={({ pressed }) => [styles.play, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <Replay color={colors.playFg} />
              <Text style={styles.playText}>Play again</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {fireworks && <Fireworks />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  category: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted, textAlign: 'center' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  score: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.note },
  congrats: { fontFamily: fonts.heading, fontSize: 34, color: colors.star, textAlign: 'center' },
  bottom: { width: '100%', maxWidth: 360, minHeight: 56, justifyContent: 'flex-end' },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 28,
    borderRadius: 9999,
    backgroundColor: colors.play,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  playText: { fontFamily: fonts.heading, fontSize: 18, color: colors.playFg },
});
