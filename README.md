# AHA Interactive Video Player

An accessible, interactive video player built with Vimeo and vanilla JavaScript. Displays multiple-choice questions at timed moments during video playback, tracks answers, and shows a scored debrief at the end. Designed for embedding in Articulate Storyline as a Web Object.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Getting Started](#getting-started)
4. [Practice Videos](#practice-videos)
5. [Architecture & Data Flow](#architecture--data-flow)
6. [Questions & Chaining](#questions--chaining)
7. [Adding & Editing Questions](#adding--editing-questions)
8. [Configuration Reference](#configuration-reference)
9. [Modules](#modules)
10. [State Machine](#state-machine)
11. [CSS & Theming](#css--theming)
12. [Accessibility](#accessibility)
13. [Articulate Storyline Integration](#articulate-storyline-integration)
14. [Browser Support](#browser-support)

---

## Project Overview

- **Video source:** Vimeo (embedded via iframe + Vimeo Player SDK)
- **Questions source:** Excel file (`excel/Questions.xlsx`) → auto-generated `Questions.js`
- **No frameworks:** Vanilla ES6 modules, no build step for the browser code
- **Accessibility:** WCAG 2.1 compliant — keyboard navigation, screen reader support, focus management

---

## File Structure

```
AHA-Interactive-Video-Player/
├── index.html                    # Dev entry point
├── Questions.js                  # Auto-generated from Excel — DO NOT EDIT MANUALLY
├── package.json
│
├── excel/
│   └── Questions.xlsx            # Source of truth for all questions
│
├── scripts/
│   ├── script.js                 # Orchestrator (root — source of truth)
│   ├── stateManager.js           # State management
│   ├── questionRenderer.js       # Question DOM rendering
│   ├── debriefRenderer.js        # Debrief DOM rendering
│   ├── questionsToPlayer.js      # Node build script (Excel → Questions.js)
│   └── utils.js                  # Helpers
│
├── styles/
│   └── styles.css                # Full theme (root — source of truth)
│
├── Web Object/                   # Main player — synced from root
│   ├── index.html
│   ├── Questions.js
│   ├── scripts/
│   ├── styles/
│   └── img/
│
├── Practice Test/                # Practice mode player — synced from root
│   ├── index.html
│   ├── Questions.js
│   ├── scripts/
│   ├── styles/
│   └── img/
│
├── Final Test/                   # Final Test — own scripts (3-attempt system)
│   ├── index.html
│   ├── Questions.js
│   ├── scripts/
│   │   ├── script.js             # Extended: attempt counter + Storyline Fail variable
│   │   ├── stateManager.js
│   │   ├── questionRenderer.js
│   │   ├── debriefRenderer.js    # Extended: debrief-header--no-list modifier
│   │   └── utils.js
│   ├── styles/
│   │   └── styles.css            # Extended: .debrief-header--no-list rule
│   └── img/
│
└── Practice Videos/              # 13 standalone single-question Web Objects
    ├── Question 1/               # 1a LOC — Level of Consciousness
    ├── Question 2/               # 1b LOC Q — LOC Questions
    ├── Question 3/               # 1c LOC Commands
    ├── Question 4/               # 2 Best Gaze
    ├── Question 5/               # 3 Visual
    ├── Question 6/               # 4 Facial Palsy
    ├── Question 7/               # 5 Motor Arm
    ├── Question 8/               # 6 Motor Leg
    ├── Question 9/               # 7 Limb Ataxia
    ├── Question 10/              # 8 Sensory
    ├── Question 11/              # 9 Best Language
    ├── Question 12/              # 10 Dysarthria
    └── Question 13/              # 11 Extinction and Inattention
```

> **Source of truth rule:** `root/` is the canonical copy. After editing root scripts or styles, sync manually to `Web Object/` and `Practice Test/` (these are identical). `Final Test/` has extended logic and is maintained separately.

Each `Question N/` folder is self-contained:
```
Question N/
├── index.html    # Start screen + video + question overlay
├── script.js     # All logic + question data inline (no dependencies)
├── styles.css    # Full theme
└── img/          # Logo + icons
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Import questions from Excel

Reads `excel/Questions.xlsx` and generates `Questions.js`:

```bash
npm run import
```

### Start dev server

```bash
npm run serve
```

Opens at `http://localhost:3000`.

### Import + serve in one command

```bash
npm start
```

---

## Practice Videos

The `Practice Videos/` folder contains 13 standalone Web Object projects — one per NIHSS item. Each project:

- Plays the same Vimeo video (ID `1179338166`)
- Shows the relevant question when the video ends
- On Submit → displays **immediate Feedback** (correct/incorrect + rationale) instead of a Debrief screen
- Includes a **Watch Again** button (↺) to replay the video from the beginning
- The feedback heading changes to **"Correct!"** or **"Incorrect!"** with a color-coded badge

### Feedback badge classes

```css
.Correct_Title   { background-color: #B0D361; }   /* green */
.Incorrect_Title { background-color: #D14242; color: #ffffff; }   /* red */
```

### Flow

```
Start screen
  → [Start] → video plays
      → [Video ends] → question overlay appears
          → [Select answer + Submit] → Feedback panel (correct/incorrect + rationale)
          → [↺ Watch Again] → video restarts
```

### Regenerating Practice Videos

If question data changes, re-run the generator after updating `Questions.js`:

```bash
cd "Practice Videos"
node generate.cjs
```

---

## Architecture & Data Flow

### Initialization

```
DOMContentLoaded
  → init()
    → new Vimeo.Player(iframe)
    → loadQuestions()  →  initState(QUESTIONS_DATA)
    → bindEvents(dom, player)
    → startPlayer(dom, player)  →  setInterval polling (200ms)
```

### Runtime polling loop

Every 200ms the player queries the current playhead position:

```
player.getCurrentTime()
  → passTimeToStoryline(currentTime)   [optional, for Storyline]
  → checkForQuestions(currentTime)
      → findTriggeredQuestion(currentTime)
            Trigger window: [question.time − 0.3, question.time + 0.5) seconds
            Skips questions with chained: true (those open via chainTo only)
      → if hit (and not already dismissed):
            openQuestionNormal()   [first time]  or
            openQuestionReview()   [already answered, e.g. Watch Again]
```

### User flow (main player)

```
Start overlay
  → [Start] → video plays
      → [Question trigger] → question overlay (interactive)
          → [Submit]  → (if chainTo) open next question instantly
                      → (otherwise) continue video
          → [Watch Again] → seek back to section start
      → [All questions answered + video ended] → debrief overlay
          → [Click question] → question overlay (readonly review)
              → [Return to Debrief] → debrief overlay
```

---

## Questions & Chaining

The player supports **15 NIHSS questions**. Two pairs of questions share the same video timecode and are linked via chaining:

| ID | Sheet | Timecode | Notes |
|----|-------|----------|-------|
| Q1 | 1a LOC | 68.1s | |
| Q2 | 1b LOC Q | 77.1s | |
| Q3 | 1c LOC Commands | 87.2s | |
| Q4 | 2 Best Gaze | 99.2s | |
| Q5 | 3 Visual | 160.1s | |
| Q6 | 4 Facial Palsy | 172.1s | |
| Q7 | 5 Motor Arm (Left) | 202.3s | `chainTo: "Q8"` |
| Q8 | 5 Motor Arm (Right) | 202.3s | `chained: true` |
| Q9 | 6 Motor Leg (Left) | 230s | `chainTo: "Q10"` |
| Q10 | 6 Motor Leg (Right) | 230s | `chained: true` |
| Q11 | 7 Limb Ataxia | 282.1s | |
| Q12 | 8 Sensory | 327.3s | |
| Q13 | 9 Best Language | 411.1s | |
| Q14 | 10 Dysarthria | 428.1s | |
| Q15 | 11 Extinction and Inattention | 478.1s | |

### How chaining works

- `chainTo: "QX"` on the first question of a pair: after Submit, the next question opens **instantly** (no video seek, no timecode trigger).
- `chained: true` on the second question: `findTriggeredQuestion()` skips it — it can only be opened via `chainTo`.
- `getWatchAgainStartTime()` for a chained question looks back **2 steps** to find the correct seek point.

### Question heading format

All question screens display the sheet name alongside the question number:

```
Question 7: 5 Motor Arm (Left)
```

---

## Adding & Editing Questions

All question content lives in `excel/Questions.xlsx`. After editing, run `npm run import` to regenerate `Questions.js`.

### Sheet structure

- Sheets named `start` and `readme` are skipped.
- Every other sheet is treated as one question (e.g. `1a LOC`, `2 Best Gaze`).

```
Cell A1        Question text (can be a merged cell)
Cell B2        Timecode — accepts: "5", "5 sec", "00:05", or numeric 5

Row 5          Header row (case-insensitive):
               Option | Option Description | Feedback Rationale | Correct | Debrief Rationale

Rows 6+        One answer option per row (stop when "Option" column is empty)
```

### Column definitions

| Column | Description |
|--------|-------------|
| `Option` | Short answer label (e.g. "0", "1", "UN") |
| `Option Description` | Full description shown on the answer card |
| `Feedback Rationale` | Text shown immediately after submit (optional) |
| `Correct` | `TRUE` / `FALSE` (or `1` / `0`) — marks the correct answer |
| `Debrief Rationale` | Rationale shown in the review panel |

### Timecode formats

All of these are equivalent for a question at 5 seconds:

```
5
5 sec
00:05
5.0
```

### Chained questions (same timecode)

To add a chained pair, manually add to `Questions.js` after importing:

```js
{ "id": "QX", ..., "chainTo": "QY" },   // first of pair
{ "id": "QY", ..., "chained": true }     // second of pair — same timecode
```

After editing `Questions.js`, sync it to all Web Objects:

```bash
cp Questions.js "Web Object/Questions.js"
cp Questions.js "Practice Test/Questions.js"
cp Questions.js "Final Test/Questions.js"
```

---

## Configuration Reference

All configurable constants are at the top of their respective files.

### `scripts/script.js`

| Constant | Default | Description |
|----------|---------|-------------|
| `UPDATE_MS` | `200` | Polling interval in milliseconds |
| `VAR_NAME` | `'VimeoTime'` | Storyline variable name for time sync |

### `scripts/stateManager.js`

| Value | Location | Description |
|-------|----------|-------------|
| Trigger window start | `findTriggeredQuestion()` | `question.time - 0.3` seconds before cue |
| Trigger window end | `findTriggeredQuestion()` | `question.time + 0.5` seconds after cue |

### `Final Test/scripts/script.js`

| Constant | Default | Description |
|----------|---------|-------------|
| `MAX_ATTEMPTS` | `3` | Number of allowed attempts before Fail |
| `PASSING_SCORE` | `90` | Minimum % correct to pass (0–100) |

### `scripts/debriefRenderer.js`

| Constant | Default | Description |
|----------|---------|-------------|
| `PASSING_SCORE` | `0.93` | Minimum fraction correct to pass (93%) — main player |

### Vimeo iframe `src` parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `badge` | `0` | Hide Vimeo badge |
| `autopause` | `0` | Don't pause when player loses focus |
| `quality_selector` | `1` | Show quality selector |
| `progress_bar` | `1` | Show scrubber/progress bar |
| `fullscreen` | `0` | Hide Vimeo's own fullscreen button (custom button used) |

To change the video, replace the video ID in the iframe `src`:

```html
src="https://player.vimeo.com/video/YOUR_VIDEO_ID?badge=0&autopause=0&..."
```

### Color theme

All colors are CSS custom properties in `:root`:

```css
:root {
  --color-main:      #E8E8E8;   /* page background */
  --color-bg:        #4D4D4F;   /* button default */
  --color-hover:     #4298B5;   /* teal — hover/focus/selected */
  --color-correct:   #B0D361;   /* green — correct answer */
  --color-incorrect: #D14242;   /* red — incorrect answer */
}
```

---

## Modules

### `scripts/script.js` — Orchestrator

| Function | Description |
|----------|-------------|
| `init()` | Bootstrap entry point |
| `startActivity(dom, player)` | Hide start screen, begin playback |
| `checkForQuestions(currentTime, dom, player)` | Poll-based question detection |
| `openQuestionNormal(index, dom, player)` | Show interactive question overlay |
| `openQuestionReview(index, dom, player)` | Show read-only review overlay |
| `handleSubmit(dom, player)` | Process answer submission; handles `chainTo` chaining |
| `continueVideo(dom, player)` | Close overlay, resume playback |
| `watchSectionAgain(dom, player)` | Seek back to section start, re-arm trigger |
| `openDebrief(dom, player)` | Show scored debrief screen |
| `passTimeToStoryline(currentTime)` | Write time to Storyline variable |
| `setBackgroundHidden(dom, hidden)` | Toggle `aria-hidden` + `tabindex` on background elements |
| `toggleFullscreen(wrapper)` | Enter/exit native fullscreen |

---

### `scripts/stateManager.js` — State

| Function | Description |
|----------|-------------|
| `initState(questions)` | Reset all state with question array |
| `getMode()` / `setMode(mode)` | Current mode: `start` \| `playing` \| `question` \| `review` \| `debrief` |
| `getQuestions()` | Returns the full question array |
| `findTriggeredQuestion(currentTime)` | Return question index if playhead is in its trigger window (skips `chained: true`) |
| `isAnswered(index)` | Returns `true` if the question at index has been submitted |
| `submitAnswer(index, answer)` | Commit an answer permanently |
| `getQuestionResult(index)` | Full result object: `{ question, userAnswer, isCorrect, correctOption }` |
| `getAllResults()` | Array of all result objects |
| `areAllAnswered()` | Returns `true` when all questions have been submitted |
| `dismissQuestion(index)` | Suppress re-trigger while in the same trigger window |
| `getWatchAgainStartTime(index)` | Calculate seek target (0.6s after previous question's window; chained questions look back 2 steps) |
| `resetForReplay()` | Full state reset (all answers, all flags) |

---

### `scripts/questionRenderer.js` — Question DOM

| Function | Description |
|----------|-------------|
| `renderQuestion(question, dom, previousAnswer, onSelect, options)` | Main entry — routes to normal or review |
| `_renderNormalMode(...)` | Interactive mode: radio answer cards + Submit button |
| `_renderReviewMode(...)` | Read-only mode: feedback panel with correct answer + rationale |
| `renderOptions(...)` | Build individual answer cards (used in normal mode) |
| `buildReviewFeedbackPanel(...)` | Full-width feedback panel (green/red) |

---

### `scripts/debriefRenderer.js` — Debrief DOM

| Function | Description |
|----------|-------------|
| `renderDebrief(overlay, results, callbacks)` | Render scored debrief: title, NIHSS score badge, question list |
| `hideDebrief(overlay)` | Hide debrief overlay |
| `buildQuestionListItem(result, index, onClick)` | Single question row: icon + label + badge + chevron |

**NIHSS score badges** — two badges displayed side by side in the debrief header:

| Badge | Content | Element ID |
|-------|---------|------------|
| Left | **Learner's Score** — sum of the user's selected answer values | `#nihssScore` |
| Right | **Total Score** — sum of all correct answer values | `#nihssCorrect` |

Both badges share the same `.debrief-nihss-score` class and are wrapped in `.debrief-nihss-row`:
```css
.debrief-nihss-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
}
.debrief-nihss-score {
  padding: 10px;
  border-radius: 10px;
  background-color: #4298B5;
  color: #000000;
}
```

Score calculation: `correct / total`. Pass threshold: **93%** (`PASSING_SCORE`) in the main player; **90%** in Final Test.

**Final Test only** — `debriefRenderer.js` also applies a CSS modifier when no full question list is shown:
```javascript
headerEl.classList.toggle('debrief-header--no-list', !showFull);
```

---

### `scripts/questionsToPlayer.js` — Build Script (Node.js only)

Reads `excel/Questions.xlsx` → writes `Questions.js`.

```
run()
  → readExcel()
  → parseAllSheets()    [skips 'start' and 'readme' sheets]
      → parseSheet()
          → readQuestionText()   [cell A1]
          → readTimecode()       [cell B2]
          → readOptionsTable()   [rows 5+]
          → buildQuestionObject()
  → writeQuestionsFile()  →  Questions.js
```

---

### `scripts/utils.js` — Helpers

| Function | Description |
|----------|-------------|
| `formatTime(seconds)` | `65` → `"1:05"` |
| `parseBoolean(val)` | Accepts `true/false`, `1/0`, `"TRUE"/"yes"` |
| `sanitizeSheetName(name)` | Remove Excel-illegal characters, max 31 chars |

---

## State Machine

### Main player / Practice Test

```
'start'
  │  [Start button]
  ▼
'playing'
  │  [Question trigger window reached]
  ▼
'question'  ──[Submit + chainTo]──► 'question' (next chained)
  │  [Submit (no chain)]                │
  └──────────────────────────────────► 'playing'
  │  [Watch Again]                          │  [Last question answered
  └─────────────────────────────────────────►│   + video ends]
                                            ▼
                                         'debrief'
                                            │  [Click question row]
                                            ▼
                                         'review'  ──[Return / Escape]──► 'debrief'
```

### Final Test (3-attempt system)

```
'start'
  │  [Start button]         attemptCount persists across restarts
  ▼
'playing'
  │  [All questions + video ends]
  ▼
'debrief'
  │  score < 90% AND attemptCount < 3  →  [Restart] → 'start' (attemptCount++)
  │  score >= 90%                       →  pass (no Storyline signal needed)
  │  score < 90% AND attemptCount >= 3  →  notifyStorylineFail() → SetVar('Fail', true)
```

### Practice Videos

```
'start'
  │  [Start button]
  ▼
'playing'
  │  [Video ends]
  ▼
'question'
  │  [Submit]
  ▼
'feedback'   (inline — no separate screen; heading becomes "Correct!" / "Incorrect!")
```

---

## CSS & Theming

### Layout strategy

The design uses CSS `zoom` to scale proportionally to the viewport instead of media queries. Each component is designed at a fixed "design size" and zoomed to fit:

| Component | Design size | Zoom formula |
|-----------|-------------|--------------|
| Start modal | 800 × 580 px | `min(70vw / 800px, 90vh / 580px)` |
| Question overlay | 1200 × 720 px | `min(100vw / 1200px, 100vh / 720px)` |
| Debrief inner | 1200 × 720 px | `min(100vw / 1200px, 100vh / 720px)` |
| Fullscreen button | — | `max(0.75, min(100vw / 1200px, 100vh / 720px))` |

### Debrief layout

The debrief overlay uses a `.debrief-inner` wrapper (1200 × 720 px, `flex-direction: column`) that all inner elements are scoped to. This is required for the `flex: 1` question list to fill the remaining height correctly.

```html
<div class="debrief-overlay" id="debrief-overlay">
  <div class="debrief-inner">
    <!-- header, list-wrap, etc. -->
  </div>
</div>
```

### Answer card states

| State | Background | Border | Number circle |
|-------|-----------|--------|---------------|
| Default | `#FFFFFF` | `#FFFFFF` | `#4D4D4F` |
| Hover/selected | `#F5F9FB` | `#4298B5` | `#4298B5` |
| Correct | `#F9FAF6` | `#B0D361` | `#B0D361` |
| Incorrect | `#FCF5F5` | `#D14242` | `#D14242` |

### Media queries

| Query | Effect |
|-------|--------|
| `(prefers-reduced-motion: reduce)` | All transitions set to `0.01ms` |
| `(prefers-contrast: high)` | Borders 3px, focus outlines 4px |
| `(pointer: coarse)` | Fullscreen button hidden (touch devices) |

---

## Accessibility

- **Dialogs:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- **Answer options:** `role="radiogroup"` on container; native `<input type="radio">` (visually hidden, styled via `<label>`)
- **Live regions:** `aria-live="polite"` on feedback messages and status announcements
- **Focus management:**
  - Dialog opens → focus moves to dialog element → SR announces heading first
  - First radio focused on open; `:focus-visible` ring suppressed until first interaction
  - Fullscreen toggle → focus returns to fullscreen button
  - Tab wrap-around enforced in fullscreen mode to prevent focus escape
- **Fullscreen button:** `aria-pressed` updated on every state change
- **Decorative icons:** `alt=""` + `aria-hidden="true"`
- **Hidden text:** `.sr-only` (1×1px absolute) for keyboard hints and SR-only instructions

---

## Articulate Storyline Integration

### Time sync (all players)

The main player exposes the current video time to Storyline via the JavaScript API.

**Variable:** `VimeoTime` (configurable via `VAR_NAME` in `script.js`)
**Type:** Number
**Update frequency:** Every 200ms
**Value:** Current playhead position rounded to 0.1s (e.g. `5.6`, `12.3`)

```javascript
const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
if (sl) sl.SetVar('VimeoTime', Math.round(currentTime * 10) / 10);
```

To use in Storyline:
1. Create a **Number** variable named `VimeoTime` in the Storyline project.
2. Insert the player HTML file as a **Web Object**.
3. Use JavaScript triggers in Storyline that read `GetPlayer().GetVar("VimeoTime")` to react to the video position.

### Fail signal (Final Test only)

When the user exhausts all 3 attempts without passing, the Final Test sets a Storyline variable:

**Variable:** `Fail`
**Type:** Boolean
**Value:** `true`

```javascript
function notifyStorylineFail() {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (sl) sl.SetVar('Fail', true);
  } catch (_) {}
}
```

To use in Storyline:
1. Create a **Boolean** variable named `Fail` (default `false`) in the Storyline project.
2. Add a trigger that reacts when `Fail == true` (e.g. jump to a failure slide).

If not embedding in Storyline, all `GetPlayer()` calls are safely ignored (wrapped in `try/catch`).

---

## Browser Support

| Browser | Fullscreen | Notes |
|---------|-----------|-------|
| Chrome 80+ | Native Fullscreen API | Full support |
| Firefox 75+ | Native Fullscreen API | Full support |
| Safari 16.4+ (macOS/iPadOS) | Native Fullscreen API | Full support |
| Edge 80+ | Native Fullscreen API | Full support |
| iOS Safari (iPhone) | Not supported | Fullscreen button hidden via `@media (pointer: coarse)` |

---

## Development Notes

- `Questions.js` is auto-generated — never edit it manually. Always edit the Excel file and re-run `npm run import`. Exception: `chainTo` / `chained` fields for paired questions must be added manually after import.
- The Vimeo polling loop runs at 200ms (`UPDATE_MS`). Lowering this may improve trigger accuracy at the cost of more API calls.
- The trigger window (`−0.3s / +0.5s`) is intentionally asymmetric to account for Vimeo's `getCurrentTime()` polling jitter.
- `dismissQuestion(index)` prevents a question from retriggering when the user is still inside the trigger window (e.g. after Submit + Continue). Chained question pairs share the same trigger window, so submitting Q8 also suppresses Q7.
- Practice Video projects are fully standalone — each folder contains all necessary assets and has no dependency on the parent project.
- **Source of truth:** root `scripts/` and `styles/` are the canonical copies. Sync to `Web Object/` and `Practice Test/` after every change. `Final Test/` has its own extended copies — sync only `Questions.js` and shared modules (stateManager, questionRenderer, utils).
