import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { QuestionCard } from '../components/QuestionCard';
import { Slide } from '../components/Slide';
import { Stars } from '../components/Stars';
import { ArrowRight } from '../Icons';
import type { Category, Question } from '../triviaApi';
import { colors, fonts } from '../theme';

type Props = {
  category: Category;
  questions: Question[];
  index: number;
  // chosen option per question, -1 while unanswered
  answers: number[];
  recycled: boolean;
  reduceMotion: boolean;
  onPick: (choice: number) => void;
  onNext: () => void;
};

export function QuizScreen({ category, questions, index, answers, recycled, reduceMotion, onPick, onNext }: Props) {
  const score = answers.filter((a, i) => a === questions[i].a).length;
  const answered = answers[index] >= 0;
  const last = index === questions.length - 1;

  return (
    <View style={styles.screen}>
      <View style={styles.main}>
        {/* Quiz component: category and the 5-star score */}
        <View style={styles.quiz}>
          <Text style={styles.quizLabel}>{category.group || 'Category'}</Text>
          <Text style={styles.quizName} accessibilityRole="header">
            {category.name}
          </Text>
          <Stars filled={score} reduceMotion={reduceMotion} />
          {recycled && index === 0 ? (
            <Text style={styles.recycled}>You've played every question here, so they're starting over.</Text>
          ) : null}
        </View>

        {/* Question card, one per screen */}
        <View style={styles.cardArea}>
          <Slide id={String(index)} reduceMotion={reduceMotion}>
            <ScrollView contentContainerStyle={styles.cardScroll}>
              <QuestionCard question={questions[index]} chosen={answers[index]} onPick={onPick} />
            </ScrollView>
          </Slide>
        </View>

        {/* Next button with progress */}
        <Pressable
          onPress={onNext}
          disabled={!answered}
          accessibilityRole="button"
          accessibilityLabel={`${last ? 'See results' : 'Next question'}, question ${index + 1} of ${questions.length}`}
          accessibilityState={{ disabled: !answered }}
          style={({ pressed }) => [styles.next, !answered && styles.nextDisabled, pressed && answered && { transform: [{ scale: 0.97 }] }]}
        >
          <View style={styles.count}>
            <Text style={styles.countText}>
              {index + 1}
              <Text style={styles.countOf}> / {questions.length}</Text>
            </Text>
          </View>
          <Text style={styles.nextText}>{last ? 'See results' : 'Next'}</Text>
          <ArrowRight color={colors.playFg} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  main: { flex: 1, width: '100%', maxWidth: 640, gap: 16 },
  quiz: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  quizLabel: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  quizName: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, color: colors.white, textAlign: 'center', marginBottom: 6 },
  recycled: { fontFamily: fonts.body, fontSize: 12, color: colors.note, textAlign: 'center', marginTop: 6 },
  cardArea: { flex: 1, marginHorizontal: -16 },
  cardScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    paddingLeft: 8,
    paddingRight: 24,
    borderRadius: 9999,
    backgroundColor: colors.play,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  nextDisabled: { opacity: 0.4 },
  count: {
    position: 'absolute',
    left: 8,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.playFg,
    justifyContent: 'center',
  },
  countText: { fontFamily: fonts.heading, fontSize: 16, color: colors.white },
  countOf: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  nextText: { fontFamily: fonts.heading, fontSize: 18, color: colors.playFg },
});
