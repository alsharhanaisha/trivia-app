import { Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Slide } from './src/components/Slide';
import { useReduceMotion } from './src/motion';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { TriviaSource, type Category, type Question } from './src/triviaApi';
import { colors } from './src/theme';

const ROUND_SIZE = 5;

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; category: Category; questions: Question[]; index: number; answers: number[]; recycled: boolean }
  | { name: 'results'; category: Category; score: number };

export default function App() {
  const [fontsLoaded] = useFonts({ Lora_600SemiBold, Lora_700Bold, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={styles.fill}
      >
        <StatusBar style="light" />
        <SafeAreaView style={styles.fill} edges={['top', 'bottom', 'left', 'right']}>
          {fontsLoaded && <Game />}
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

function Game() {
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const source = useRef(new TriviaSource(AsyncStorage)).current;
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  // bumps on every screen change so the slide always runs, even home → home after Play again
  const [visit, setVisit] = useState(0);

  const go = (next: Screen) => {
    setScreen(next);
    setVisit((v) => v + 1);
  };

  const startQuiz = async (category: Category) => {
    const round = await source.nextRound(category.id, ROUND_SIZE);
    go({
      name: 'quiz',
      category,
      questions: round.questions,
      index: 0,
      answers: round.questions.map(() => -1),
      recycled: round.recycled,
    });
  };

  const pick = (choice: number) =>
    setScreen((s) => {
      if (s.name !== 'quiz' || s.answers[s.index] >= 0) return s;
      const answers = s.answers.slice();
      answers[s.index] = choice;
      return { ...s, answers };
    });

  const next = () => {
    if (screen.name !== 'quiz' || screen.answers[screen.index] < 0) return;
    if (screen.index < screen.questions.length - 1) {
      // same screen, next card: only the question card slides
      setScreen({ ...screen, index: screen.index + 1 });
      return;
    }
    const score = screen.answers.filter((a, i) => a === screen.questions[i].a).length;
    go({ name: 'results', category: screen.category, score });
  };

  const titleSize = Math.min(34, Math.max(26, width * 0.07));

  return (
    <Slide id={`${screen.name}-${visit}`} reduceMotion={reduceMotion}>
      {screen.name === 'home' ? (
        <HomeScreen loadCategories={() => source.categories()} onStart={startQuiz} titleSize={titleSize} />
      ) : screen.name === 'quiz' ? (
        <QuizScreen
          category={screen.category}
          questions={screen.questions}
          index={screen.index}
          answers={screen.answers}
          recycled={screen.recycled}
          reduceMotion={reduceMotion}
          onPick={pick}
          onNext={next}
        />
      ) : (
        <ResultsScreen
          category={screen.category}
          score={screen.score}
          total={ROUND_SIZE}
          reduceMotion={reduceMotion}
          onPlayAgain={() => go({ name: 'home' })}
        />
      )}
    </Slide>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
