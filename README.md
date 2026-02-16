# 💖 Love Strands

A Valentine’s Day project I made for my girlfriend 💘 — she loves the New York Times puzzle game **“Strands”**, so I built a small Strands-inspired game with a love-themed puzzle 🧩

Play it here 🎮: **`https://love-strands.vercel.app`**

## 🧩 What it is

- **Strands-inspired word grid game**: drag (or click/drag) across adjacent letters to form words ✨
- **Theme words + a spangram**: theme words are validated by matching the exact path solution 🎯
- **Bonus words**: non-theme words can still score points if they’re valid English words 📚
- **Hints**: bonus-word points can be spent to reveal a theme word path 🔎
- **Valentine’s finish**: when the puzzle is complete, a Valentine’s Day overlay appears 🌹

## 📜 Gameplay rules (current implementation)

- **Adjacency**: you can only extend selection to one of the 8 neighboring cells (including diagonals) 🧭
- **No reusing cells**: a selection path can’t include the same cell twice 🚫
- **Minimum length**: words must be at least 4 letters ✍️
- **Scoring**:
  - Theme word found: added to the theme progress list ✅
  - Valid bonus word: +1 point ⭐
  - Hint: costs 3 points 💡

## 🧰 Tech stack

- **Framework**: Next.js (App Router) ⚡
- **UI**: React + TypeScript 🧠
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`) + a few custom CSS animations in `app/globals.css` 🎨
- **Word validation**: Next.js Route Handler backed by the `word-list` dictionary 📖

## 🏗️ Project architecture

The app is intentionally simple and mostly client-side (fast to play, easy to tweak) 🏎️

- **Entry point**
  - `app/page.tsx` renders the game component 🧩
  - `app/layout.tsx` sets metadata + loads fonts via `next/font` 🧵

- **Game UI / interaction**
  - `app/components/StrandsGame.tsx` is the main client component (pointer-driven selection, scoring, hints, completion state) 🖱️
  - `app/components/LetterGrid.tsx` renders the letter buttons and visual state (selected/found/spangram/hinted) 🔤
  - `app/components/TrailOverlay.tsx` draws the selection/found “trails” using an SVG overlay 🧵

- **Game logic / data**
  - `app/lib/puzzle.ts` defines the puzzle data (`STATIC_PUZZLE`) and grid dimensions (currently **6×8**) 🧊
  - `app/lib/selectionRules.ts` encodes adjacency rules (8-directional neighbors) 🧭
  - `app/lib/solveWordPath.ts` includes a small path-finding helper (useful for deriving a path for a given word) 🗺️

- **Server API**
  - `app/api/validate-word/route.ts` exposes `POST /api/validate-word` which checks a submitted word against a preloaded dictionary 🧾
  - **Technical note**: this route uses Node’s `fs` to load the word list (`word-list`), so it runs on the Node.js runtime (not Edge) 🧰

## 🧑‍💻 Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and start swiping letters like a genius 🧠✨

## 🚀 Deployment

This project is deployed on Vercel at **`https://love-strands.vercel.app`**.

Other scripts:

```bash
npm run build
npm start
npm run lint
```

## ✍️ Customizing the puzzle

Edit `app/lib/puzzle.ts`:

- Change `theme` 🏷️
- Update the `grid` letters 🔤
- Update `themeEntries` 🧩:
  - Each entry contains a `word` and an exact `solution` path (list of `{row, col}`) 🧵
  - The **last** `themeEntries` item is treated as the **spangram** by the current game logic ⭐

## 🙏 Credits / disclaimer

This project is **inspired by** the NYT “Strands” format, but it is **not affiliated with or endorsed by** The New York Times.
