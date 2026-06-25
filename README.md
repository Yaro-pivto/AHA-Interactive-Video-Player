# AHA Interactive Video Player

An accessible, interactive video player built with Vimeo and vanilla JavaScript. Displays multiple-choice questions at timed moments during video playback, tracks answers, and shows a scored debrief at the end. Designed for embedding in Articulate Storyline as a Web Object.

> **Repository note (2026-06-25):** The repo was cleaned up to keep only the four shippable deliverables: `Web Object/`, `Practice Test/`, `Final Test/`, and `Practice Videos/`. The root build pipeline and "source of truth" copies (root `scripts/`, `styles/`, `Questions.js`, `index.html`, `excel/`, `package.json`, `node_modules/`) were removed. Each deliverable folder is now fully self-contained. The deleted build files remain recoverable from git history (e.g. `git restore --source=56eaab7 -- excel scripts package.json`) if the Excel-to-`Questions.js` workflow is ever needed again.

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
- **Questions source:** `Questions.js` inside each deliverable folder (edited directly — see [Adding & Editing Questions](#adding--editing-questions))
- **No frameworks:** Vanilla ES6 modules, no build step for the browser code
- **Self-contained:** Each of the four deliverable folders ships independently with its own scripts, styles, images, and `Questions.js`
- **Accessibility:** WCAG 2.1 compliant — keyboard navigation, screen reader support, focus management

---

## File Structure

```
AHA-Interactive-Video-Player/
├── README.md
│
├── Web Object/                   # Main player (case study)
│   ├── index.html
│   ├── Questions.js
│   ├── scripts/
│   │   ├── script.js             # Orchestrator
│   │   ├── stateManager.js       # State management
│   │   ├── questionRenderer.js   # Question DOM rendering
│   │   ├── summaryRenderer.js    # Summary screen DOM rendering (pre-debrief)
│   │   ├── debriefRenderer.js    # Debrief DOM rendering
│   │   ├── questionsToPlayer.js  # (legacy) Node build script — Excel source no longer in repo
│   │   └── utils.js              # Helpers
│   ├── styles/
│   └── img/
│
├── Practice Test/                # Practice mode player
│   ├── index.html
│   ├── Questions.js
│   ├── scripts/
│   ├── styles/
│   └── img/
│
├── Final Test/                   # Final Test — own scripts (3-attempt system)
│   ├── index.html
│   ├── debrief-preview.html      # Standalone debrief-state preview
│   ├── Questions.js
│   ├── scripts/
│   │   ├── script.js             # Extended: attempt counter + Storyline Fail variable
│   │   ├── stateManager.js
│   │   ├── questionRenderer.js
│   │   ├── summaryRenderer.js
│   │   ├── debriefRenderer.js    # Extended: debrief-header--no-list modifier
│   │   └── utils.js
│   ├── styles/
│   │   └── styles.css            # Extended: .debrief-header--no-list + summary overlay rules
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

> **No more root "source of truth".** Each deliverable folder is independent and edited in place. `Web Object/` and `Practice Test/` share the same base logic; `Final Test/` has extended logic (attempt counter + `Fail` variable). When you change shared logic, apply the same edit to each folder that needs it.

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

There is no build step. Each deliverable folder is static HTML/CSS/JS and can be opened or served directly.

### Run locally

Serve any deliverable folder with any static file server, for example:

```bash
# from inside a deliverable folder, e.g. "Web Object/"
npx serve .
```

Then open the printed URL (e.g. `http://localhost:3000`). A static server is recommended over opening `index.html` via `file://` because ES module imports require an `http(s)` origin.

### Deploy / embed

Upload the chosen folder as an Articulate Storyline **Web Object**, or host it on any static host. See [Articulate Storyline Integration](#articulate-storyline-integration).

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

`Practice Videos/generate.cjs` holds the question data inline and emits the 13 `Question N/` folders. **Note:** it copies shared assets from the old root (`../img` and `../styles/styles.css`), which were removed during the 2026-06-25 cleanup, so it will not run as-is. To regenerate, first restore those root assets from git history, then run the generator:

```bash
git restore --source=56eaab7 -- img styles
cd "Practice Videos"
node generate.cjs
```

Alternatively, edit each `Question N/` folder directly — they are fully standalone.

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
      → [All questions answered + video ended] → summary overlay (pre-debrief)
          → [Click question] → question overlay (re-answerable)
              → [Submit] → return to summary
          → [Submit Answers] → debrief overlay
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

Question content now lives directly in each deliverable's `Questions.js` (the Excel build pipeline was removed in the 2026-06-25 cleanup). Edit the file in place and keep the copies in sync across folders that share the same question set.

### Question object shape

`Questions.js` exports an array of question objects:

```js
{
  "id": "Q1",
  "time": 68.1,                 // trigger timecode in seconds
  "sheet": "1a LOC",            // heading label
  "text": "Question text…",
  "options": [
    { "text": "0", "description": "…", "rationale": "…", "correct": true,  "debrief": "…" },
    { "text": "1", "description": "…", "rationale": "…", "correct": false, "debrief": "…" }
  ]
}
```

| Field | Description |
|-------|-------------|
| `id` | Unique question id (e.g. `Q1`) |
| `time` | Trigger timecode in seconds |
| `sheet` | Heading label shown next to the question number |
| `text` | Question text |
| `options[].text` | Short answer label (e.g. "0", "1", "UN") |
| `options[].description` | Full description shown on the answer card |
| `options[].rationale` | Feedback text shown immediately after submit (optional) |
| `options[].correct` | `true` / `false` — marks the correct answer |
| `options[].debrief` | Rationale shown in the review panel |

### Chained questions (same timecode)

To add a chained pair, add the `chainTo` / `chained` fields:

```js
{ "id": "QX", ..., "chainTo": "QY" },   // first of pair
{ "id": "QY", ..., "chained": true }     // second of pair — same timecode
```

### Keeping folders in sync

`Web Object/`, `Practice Test/`, and `Final Test/` use the full question set. After editing one, copy it to the others:

```bash
cp "Web Object/Questions.js" "Practice Test/Questions.js"
cp "Web Object/Questions.js" "Final Test/Questions.js"
```

`Practice Videos/` question data is held inline in `generate.cjs` (or edited per `Question N/` folder) — see [Regenerating Practice Videos](#regenerating-practice-videos).

---

## Configuration Reference

All configurable constants are at the top of their respective files. Paths below are shown for `Web Object/`; the same files exist in `Practice Test/` and `Final Test/`.

### `Web Object/scripts/script.js`

| Constant | Default | Description |
|----------|---------|-------------|
| `UPDATE_MS` | `200` | Polling interval in milliseconds |
| `VAR_NAME` | `'VimeoTime'` | Storyline variable name for time sync |

### `Web Object/scripts/stateManager.js`

| Value | Location | Description |
|-------|----------|-------------|
| Trigger window start | `findTriggeredQuestion()` | `question.time - 0.3` seconds before cue |
| Trigger window end | `findTriggeredQuestion()` | `question.time + 0.5` seconds after cue |

### `Final Test/scripts/script.js`

| Constant | Default | Description |
|----------|---------|-------------|
| `MAX_ATTEMPTS` | `3` | Number of allowed attempts before Fail |
| `PASSING_SCORE` | `90` | Minimum % correct to pass (0–100) |

### `Web Object/scripts/debriefRenderer.js`

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

> Module paths below are written as `scripts/…` for brevity. Each deliverable folder (`Web Object/`, `Practice Test/`, `Final Test/`) has its own copy under that folder, e.g. `Web Object/scripts/script.js`.

### `scripts/script.js` — Orchestrator

| Function | Description |
|----------|-------------|
| `init()` | Bootstrap entry point |
| `startActivity(dom, player)` | Hide start screen, begin playback |
| `checkForQuestions(currentTime, dom, player)` | Poll-based question detection |
| `openQuestionNormal(index, dom, player)` | Show interactive question overlay |
| `openQuestionReview(index, dom, player)` | Show read-only review overlay (from Debrief) |
| `openQuestionFromSummary(index, dom, player)` | Show re-answerable overlay from Summary screen |
| `handleSubmit(dom, player)` | Process answer submission; handles `chainTo` chaining |
| `continueVideo(dom, player)` | Close overlay, resume playback |
| `watchSectionAgain(dom, player)` | Seek back to section start, re-arm trigger |
| `openSummary(dom, player)` | Show pre-debrief Summary screen |
| `openDebrief(dom, player)` | Show scored Debrief screen |
| `passTimeToStoryline(currentTime)` | Write playhead time to Storyline variable |
| `passAnswerCountToStoryline()` | Write answered question count to Storyline variable |
| `setBackgroundHidden(dom, hidden)` | Toggle `aria-hidden` + `tabindex` on background elements |
| `toggleFullscreen(wrapper)` | Enter/exit native fullscreen |

---

### `scripts/stateManager.js` — State

| Function | Description |
|----------|-------------|
| `initState(questions)` | Reset all state with question array |
| `getMode()` / `setMode(mode)` | Current mode: `start` \| `playing` \| `question` \| `review` \| `summary` \| `debrief` |
| `getQuestions()` | Returns the full question array |
| `findTriggeredQuestion(currentTime)` | Return question index if playhead is in its trigger window (skips `chained: true`) |
| `isAnswered(index)` | Returns `true` if the question at index has been submitted |
| `submitAnswer(index, answer)` | Commit an answer permanently |
| `getQuestionResult(index)` | Full result object: `{ question, userAnswer, isCorrect, correctOption }` |
| `getAllResults()` | Array of all result objects |
| `areAllAnswered()` | Returns `true` when all questions have been submitted |
| `dismissQuestion(index)` | Suppress re-trigger while in the same trigger window |
| `getWatchAgainStartTime(index)` | Calculate seek target (0.6s after previous question's window; chained questions look back 2 steps) |
| `setSummaryEditActive(val)` | When `true`, lifts the allDone lock so questions re-open as re-answerable (used during Summary editing) |
| `setWatchAgainIndex(index)` | Allow a specific answered question to re-trigger; also sets broadcast flag |
| `clearWatchAgainBroadcast()` | Clear the broadcast flag when returning to Summary or Debrief |
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

### `scripts/summaryRenderer.js` — Summary DOM

| Function | Description |
|----------|-------------|
| `renderSummary(overlay, results, callbacks)` | Render pre-debrief summary: points scored badge, question list, Submit Answers button |
| `hideSummary(overlay)` | Hide summary overlay |

The Summary screen shows each question with the user's selected point value (neutral — no correct/incorrect indication). Users can click any question to change their answer before submitting.

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
| Left | **Points Scored** — sum of the user's selected answer values | `#nihssScore` |
| Right | **Correct Score** — sum of all correct answer values | `#nihssCorrect` |

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

**Pass/fail messaging** — `renderDebrief` updates the title and result text dynamically:

| State | `#debriefTitle` | `#debriefResult` |
|-------|-----------------|------------------|
| Passed | `Congratulations!` | `You have passed the case study with a score of X%.` |
| Failed | `Debrief` / `Result` | `You have scored X%. You haven't achieved the passing score.` |

**Final Test only** — `debriefRenderer.js` also applies a CSS modifier when no full question list is shown:
```javascript
headerEl.classList.toggle('debrief-header--no-list', !showFull);
```

**`Final Test/debrief-preview.html`** — standalone preview of the Final Test debrief screen. Change these constants to simulate different states:
```javascript
const MOCK_ATTEMPT     = 2;    // 1 or 2 → shows Try Again; 3 → shows full question list
const MOCK_PCT_CORRECT = 0.85; // fraction correct (>= 0.9 = passed)
```

---

### `scripts/questionsToPlayer.js` — Build Script (legacy, Node.js only)

> **Legacy / non-functional.** This script read `excel/Questions.xlsx` → wrote `Questions.js`. The Excel source and root build setup were removed in the 2026-06-25 cleanup, so this script no longer has an input. It remains in `Web Object/scripts/` for reference only. To revive the Excel workflow, restore the source from git (`git restore --source=56eaab7 -- excel package.json package-lock.json`).

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
                                         'summary'  ──[Click question]──► 'question' (re-answerable)
                                            │  [Submit Answers]               └──[Submit]──► 'summary'
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
'summary'
  │  [Submit Answers]
  ▼
'debrief'
  │  score < 90% AND attemptCount < 3  →  [Try Again] → 'start' (attemptCount++)
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
| Summary inner | 1200 × 720 px | `min(100vw / 1200px, 100vh / 720px)` |
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

### Answer count (all players)

Updated silently after each question is submitted.

**Variable:** `AnsweredCount`
**Type:** Number
**Value:** Number of questions submitted so far (e.g. `3` after the third submit)

```javascript
function passAnswerCountToStoryline() {
  try {
    const sl    = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    const count = getQuestions().filter((_, i) => isAnswered(i)).length;
    if (sl) sl.SetVar('AnsweredCount', count);
  } catch (_) {}
}
```

To use in Storyline, create a **Number** variable named `AnsweredCount` (default `0`) and add triggers that react to its value.

---

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

- `Questions.js` is edited directly inside each deliverable folder (the Excel build pipeline was removed in the 2026-06-25 cleanup). Add `chainTo` / `chained` fields manually for paired questions.
- The Vimeo polling loop runs at 200ms (`UPDATE_MS`). Lowering this may improve trigger accuracy at the cost of more API calls.
- The trigger window (`−0.3s / +0.5s`) is intentionally asymmetric to account for Vimeo's `getCurrentTime()` polling jitter.
- `dismissQuestion(index)` prevents a question from retriggering when the user is still inside the trigger window (e.g. after Submit + Continue). Chained question pairs share the same trigger window, so submitting Q8 also suppresses Q7.
- Practice Video projects are fully standalone — each folder contains all necessary assets and has no dependency on the parent project.
- **No central source of truth anymore.** Each deliverable folder is independent. When you change shared logic, apply the edit to every folder that uses it (`Web Object/`, `Practice Test/`, and `Final Test/` for shared modules; `Final Test/` keeps extended `script.js` / `debriefRenderer.js` / `styles.css`).
