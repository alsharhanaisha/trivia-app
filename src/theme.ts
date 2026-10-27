import { Easing } from 'react-native';

export const colors = {
  bgTop: '#161638',
  bgMid: '#2a2347',
  bgBottom: '#563457',
  card: '#38667E',
  answer: '#563457',
  answerChosen: '#7D4C80',
  correct: '#19C26B',
  correctFg: '#04240F',
  wrong: '#E0243A',
  white: '#FFFFFF',
  muted: '#C9C3E6',
  note: '#D6D0EE',
  answersPrompt: '#E4DFF5',
  play: '#F4EFFF',
  playFg: '#241c45',
  star: '#FFC93C',
  starEmpty: 'rgba(255,255,255,0.35)',
  panel: 'rgba(255,255,255,0.08)',
  panelBorder: 'rgba(255,255,255,0.16)',
};

export const fonts = {
  heading: 'Lora_700Bold',
  button: 'Lora_600SemiBold',
  body: 'Poppins_400Regular',
  bodyMedium: 'Poppins_500Medium',
  bodySemi: 'Poppins_600SemiBold',
};

// cubic-bezier(.2, .8, .2, 1) from the design
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
