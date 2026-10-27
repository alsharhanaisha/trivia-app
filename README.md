# The Geography Trivia Game

A single-screen geography trivia game: five question cards, tap a card to slide it aside and reveal four answers, and the card turns green (correct) or red (wrong). Score out of 5 sits top right; "Play again" unlocks once all five are answered and deals five unseen questions.

## Play

Open [`index.html`](index.html) in any browser. It's a standalone page with no build step and no dependencies, apart from Google Fonts. It's sized for phones and scales up to tablet and desktop. The bank holds 50 questions, so the first 10 rounds never repeat a question; after that the deck reshuffles.

## Design

The interactive design lives in [`design/`](design/), exported from the Claude Design canvas:
https://claude.ai/artifact/2h3ikRwAEb8G8V2Vur8Ui2

- `Main.dc.html` — phone game screen (390×844), holds all game logic and the 35-question bank
- `Tablet.dc.html`, `Desktop.dc.html` — the same screen at 834×1112 and 1280×832
- `canvas.json` — canvas layout index

These `.dc.html` files are Design Component sources that run in the canvas runtime (they load `./support.js` from it), so they don't open as standalone web pages.

## Visual identity

- Background: dark gradient `#161638` → `#563457`
- Question cards `#38667E`, answer buttons `#563457`; correct `#19C26B`, wrong `#E0243A`
- Type: Lora (headings, buttons), Poppins (body)
