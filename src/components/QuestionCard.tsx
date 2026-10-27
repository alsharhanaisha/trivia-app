import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Check, Cross } from '../Icons';
import type { Question } from '../triviaApi';
import { colors, fonts } from '../theme';

type Props = {
  question: Question;
  // index of the picked option, or -1 while unanswered
  chosen: number;
  onPick: (choice: number) => void;
};

export function QuestionCard({ question, chosen, onPick }: Props) {
  const answered = chosen >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.question} accessibilityRole="header">
        {question.q}
      </Text>
      <View style={styles.grid}>
        {question.o.map((label, k) => {
          const isCorrect = k === question.a;
          const isChosen = k === chosen;
          // After answering: the right answer is green, a wrong pick is red, the rest fade.
          const state = !answered ? 'idle' : isCorrect ? 'correct' : isChosen ? 'wrong' : 'dim';
          return (
            <Pressable
              key={k}
              onPress={() => onPick(k)}
              disabled={answered}
              accessibilityRole="button"
              accessibilityState={{ disabled: answered, selected: isChosen }}
              accessibilityLabel={
                state === 'correct' ? `${label}, correct answer` : state === 'wrong' ? `${label}, wrong` : label
              }
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
                state === 'correct' && styles.optionCorrect,
                state === 'wrong' && styles.optionWrong,
                state === 'dim' && styles.optionDim,
              ]}
            >
              <Text style={[styles.optionText, state === 'correct' && { color: colors.correctFg }]}>{label}</Text>
              {state === 'correct' && (
                <View style={styles.badge}>
                  <Check size={16} color={colors.correctFg} />
                </View>
              )}
              {state === 'wrong' && (
                <View style={styles.badge}>
                  <Cross size={15} color={colors.white} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    gap: 18,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  question: { fontFamily: fonts.bodyMedium, fontSize: 19, lineHeight: 27, color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 72,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: colors.answer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionPressed: { backgroundColor: colors.answerChosen },
  optionCorrect: { backgroundColor: colors.correct, borderColor: colors.correct },
  optionWrong: { backgroundColor: colors.wrong, borderColor: colors.wrong },
  optionDim: { opacity: 0.45 },
  optionText: { fontFamily: fonts.button, fontSize: 15, lineHeight: 19, color: colors.white, textAlign: 'center' },
  badge: { position: 'absolute', top: 6, right: 6 },
});
