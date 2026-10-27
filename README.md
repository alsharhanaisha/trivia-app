# The Geography Trivia Game

A mobile trivia game built with [Expo](https://expo.dev) (React Native, SDK 58). Pick a category, answer five questions, and collect a star for each one you get right. Questions come live from [Open Trivia DB](https://opentdb.com), and you never see the same question twice.

## How it plays

1. **Home**: choose from Open Trivia DB's 24 categories, loaded from the API. Geography is the featured tile at the top.
2. **Questions**: one question per screen, each sliding in from the right.
   - At the top, the category name and five stars. A star fills yellow for each correct answer.
   - The question card has the question and four answers in a 2×2 grid. A right answer turns green. A wrong one turns red, and the correct answer turns green.
   - At the bottom, a **Next** button shows your progress (`1 / 5`). It unlocks once you've answered, and on the last question it reads **See results**.
3. **Results**: the stars you earned. At 5/5, "Congratulations" appears with 2 seconds of fireworks. After 2 seconds, **Play again** appears and takes you back to Home.

If Reduce Motion is turned on, the slide animations and fireworks are skipped.

## Run it

You need [Node.js](https://nodejs.org) 22.13 or later, which React Native 0.88 requires.

```bash
npm install
```

```bash
npx expo start
```

The terminal shows a QR code. Then:

- **On your phone:** install **Expo Go** from the App Store or Google Play. Then scan the QR code, using the Camera app on iPhone or Expo Go's scanner on Android. Your phone and computer need to be on the same Wi-Fi. If they can't be, run `npx expo start --tunnel` instead.
- **In a browser:** press **w** in the terminal, or run `npx expo start --web`.
- **In a simulator:** press **i** for the iOS Simulator (needs Xcode with an iOS 16+ runtime) or **a** for an Android emulator.

Saving a file reloads the app straight away. Press **r** in the terminal to reload by hand.

Before committing, run:

```bash
npx tsc --noEmit
```

```bash
npx expo-doctor
```

## How questions never repeat

The question logic lives in [`src/triviaApi.ts`](src/triviaApi.ts):

- **Session token:** the app asks Open Trivia DB for a session token, and the API never sends that token the same question twice.
- **Played questions are saved on the device** per category, using AsyncStorage. Tokens expire after 6 hours of not being used, so the app also skips any saved question that comes back. This holds across app restarts.
- **Batches of 50:** the API allows only one question request every 5 seconds, so the app fetches up to 50 questions at once and queues the unplayed ones per category. Most rounds need no network call, and the queue tops itself up in the background.
- **Small categories:** the API answers with code 4 whenever you ask for more questions than remain, even on a new token. The app then asks for just one round's worth and remembers that the category is small.
- **When a category runs out**, it starts over and the Question screen says so. Open Trivia DB has 300 multiple-choice Geography questions (60 rounds). Some categories have only around 30.

Questions are licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) by Open Trivia DB, which the Home screen credits.

## Project layout

```
App.tsx                      fonts, background, and navigation between screens
src/
  triviaApi.ts               Open Trivia DB client: categories, rounds, no-repeat logic
  screens/
    HomeScreen.tsx           category picker
    QuizScreen.tsx           star score, question card, Next button
    ResultsScreen.tsx        stars, Congratulations, fireworks, Play again
  components/
    QuestionCard.tsx         question and 2×2 answer grid
    Stars.tsx                five-star score with fill animation
    Fireworks.tsx            2-second celebration for 5/5
    Slide.tsx                slide-in/slide-out screen transition
  Icons.tsx                  SVG icons (globe, star, arrows, check, cross)
  theme.ts                   colours, fonts, easing
  motion.ts                  Reduce Motion hook, native-driver flag
```

## Visual identity

- Background: dark gradient `#161638` → `#563457`
- Question cards `#38667E`, answer buttons `#563457`. Correct is `#19C26B`, wrong is `#E0243A`, and stars are `#FFC93C`.
- Type: Lora for headings and buttons, Poppins for body text

## Earlier versions

- [`index.html`](index.html) is the original single-screen web game: five sliding question cards and a built-in bank of 50 Geography questions. Open it in any browser. It doesn't use the API.
- [`design/`](design/) holds the original phone, tablet and desktop design, exported from the Claude Design canvas: https://claude.ai/artifact/2h3ikRwAEb8G8V2Vur8Ui2. These `.dc.html` files run only in the canvas runtime. `The Geography Trivia Game – Phone · Game screen.html` is a standalone export of the phone screen.
