import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Globe } from '../Icons';
import { GEOGRAPHY, type Category } from '../triviaApi';
import { colors, fonts } from '../theme';

type Props = {
  loadCategories: () => Promise<Category[]>;
  // resolves once the first round is ready (the app then slides to it), rejects on failure
  onStart: (category: Category) => Promise<void>;
  titleSize: number;
};

export function HomeScreen({ loadCategories, onStart, titleSize }: Props) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [listError, setListError] = useState('');
  const [starting, setStarting] = useState<number | null>(null);
  const [startError, setStartError] = useState('');

  const fetchList = () => {
    setListError('');
    loadCategories().then(setCategories, (e: Error) => setListError(e.message));
  };

  useEffect(fetchList, []);

  const start = (c: Category) => {
    if (starting !== null) return;
    setStarting(c.id);
    setStartError('');
    onStart(c).catch((e: Error) => {
      setStarting(null);
      setStartError(e.message + ' Check your connection and try again.');
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.main}>
        <View style={styles.header}>
          <View style={styles.eyebrow}>
            <Globe color={colors.muted} />
            <Text style={styles.eyebrowText}>5 questions · 5 stars</Text>
          </View>
          <Text style={[styles.title, { fontSize: titleSize }]} accessibilityRole="header">
            The Geography Trivia Game
          </Text>
          <Text style={styles.subtitle}>Choose a category to start</Text>
        </View>

        {startError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {startError}
          </Text>
        ) : null}

        {categories ? (
          <View style={styles.grid}>
            {categories.map((c) => {
              const busy = starting === c.id;
              const featured = c.id === GEOGRAPHY;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => start(c)}
                  disabled={starting !== null}
                  accessibilityRole="button"
                  accessibilityLabel={(c.group ? c.group + ': ' : '') + c.name}
                  accessibilityState={{ busy, disabled: starting !== null && !busy }}
                  style={({ pressed }) => [
                    styles.tile,
                    featured && styles.tileFeatured,
                    pressed && styles.tilePressed,
                    starting !== null && !busy && styles.tileDim,
                  ]}
                >
                  {featured && <Globe size={22} color={colors.white} />}
                  {c.group ? <Text style={styles.tileGroup}>{c.group}</Text> : null}
                  <Text style={[styles.tileName, featured && styles.tileNameFeatured]}>{c.name}</Text>
                  {busy && (
                    <View style={styles.tileBusy}>
                      <ActivityIndicator color={colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : listError ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>{listError}</Text>
            <Pressable onPress={fetchList} accessibilityRole="button" style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.status}>
            <ActivityIndicator color={colors.white} />
            <Text style={styles.statusText}>Loading categories…</Text>
          </View>
        )}

        <Text style={styles.credit}>Questions from Open Trivia DB · CC BY-SA 4.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20 },
  main: { width: '100%', maxWidth: 640, gap: 20 },
  header: { gap: 6 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowText: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  title: { fontFamily: fonts.heading, color: colors.white },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.note },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 92,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    justifyContent: 'flex-end',
    gap: 2,
  },
  tileFeatured: {
    flexBasis: '100%',
    backgroundColor: colors.card,
    borderColor: colors.card,
    minHeight: 104,
    gap: 6,
  },
  tilePressed: { backgroundColor: colors.answerChosen, borderColor: colors.answerChosen },
  tileDim: { opacity: 0.45 },
  tileGroup: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  tileName: { fontFamily: fonts.button, fontSize: 16, lineHeight: 21, color: colors.white },
  tileNameFeatured: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  tileBusy: { position: 'absolute', top: 12, right: 12 },
  status: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  statusText: { fontFamily: fonts.body, fontSize: 14, color: colors.note, textAlign: 'center' },
  retry: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 9999, backgroundColor: colors.play },
  retryText: { fontFamily: fonts.heading, fontSize: 15, color: colors.playFg },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.white,
    backgroundColor: 'rgba(224,36,58,0.35)',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  credit: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, opacity: 0.7, textAlign: 'center' },
});
