# AHA Interactive Video Player

An accessible, interactive video player built with Vimeo and vanilla JavaScript. Displays multiple-choice questions at timed moments during video playback, tracks answers, and shows a scored debrief at the end. Designed for embedding in Articulate Storyline as a Web Object.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Getting Started](#getting-started)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Adding & Editing Questions](#adding--editing-questions)
6. [Configuration Reference](#configuration-reference)
7. [Modules](#modules)
8. [State Machine](#state-machine)
9. [CSS & Theming](#css--theming)
10. [Accessibility](#accessibility)
11. [Articulate Storyline Integration](#articulate-storyline-integration)
12. [Browser Support](#browser-support)

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
├── index.html                    # Main HTML entry point
├── Questions.js                  # Auto-generated from Excel — DO NOT EDIT MANUALLY
├── package.json
│
├── scripts/
│   ├── script.js                 # Main orchestrator (init, event binding, game loop)
│   ├── stateManager.js           # Pure state logic (no DOM)
│   ├── questionRenderer.js       # Builds question overlay DOM
│   ├── debriefRenderer.js        # Builds debrief screen DOM
│   ├── questionsToPlayer.js      # Node.js build script: Excel → Questions.js
│   └── utils.js                  # Shared helpers
│
├── styles/
│   └── styles.css                # Full theme with CSS variables
│
├── excel/
│   └── Questions.xlsx            # Source of truth for all questions
│
├── img/
│   ├── Aha logo black.svg
│   ├── check.svg
│   ├── cross.svg
│   └── replay.svg
│
└── Web Object/                   # Ready-to-use distribution copy (no dev files)
    ├── index.html
    ├── Questions.js
    ├── scripts/
    ├── styles/
    └── img/
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
      → if hit (and not already dismissed):
            openQuestionNormal()   [first time]  or
            openQuestionReview()   [already answered, e.g. Watch Again]
```

### User flow

```
Start overlay
  → [Start] → video plays
      → [Question trigger] → question overlay (interactive)
          → [Submit]  → continue video
          → [Watch Again] → seek back to section start
      → [All questions answered + video ended] → debrief overlay
          → [Click question] → question overlay (readonly review)
              → [Return to Debrief] → debrief overlay
```

---

## Adding & Editing Questions

All question content lives in `excel/Questions.xlsx`. After editing, run `npm run import` to regenerate `Questions.js`.

### Sheet structure

- Sheets named `start` and `readme` are skipped.
- Every other sheet is treated as one question (e.g. `Q1 - 5s`, `Q2 - 10s`).

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
| `Option` | Short answer label (e.g. "0", "1", "A") |
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

### `scripts/debriefRenderer.js`

| Constant | Default | Description |
|----------|---------|-------------|
| `PASSING_SCORE` | `0.93` | Minimum fraction correct to pass (93%) |

### `index.html` — Vimeo iframe `src` parameters

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

### `styles/styles.css` — Color theme

All colors are CSS custom properties in `:root`:

```css
:root {
  --color-main:      #E8E8E8;   /* page background */
  --color-bg:        #4D4D4F;   /* button default */
  --color-hover:     #4298B5;   /* teal — hover/focus/selected */
  --color-correct:   #92B251;   /* green — correct answer */
  --color-incorrect: #D14242;   /* red — incorrect answer */
}
```

---

## Modules

### `scripts/script.js` — Orchestrator

Initializes the player, binds events, and drives the main game loop.

| Function | Description |
|----------|-------------|
| `init()` | Bootstrap entry point |
| `startActivity(dom, player)` | Hide start screen, begin playback |
| `checkForQuestions(currentTime, dom, player)` | Poll-based question detection |
| `openQuestionNormal(index, dom, player)` | Show interactive question overlay |
| `openQuestionReview(index, dom, player)` | Show read-only review overlay |
| `handleSubmit(dom, player)` | Process answer submission |
| `continueVideo(dom, player)` | Close overlay, resume playback |
| `watchSectionAgain(dom, player)` | Seek back to section, re-arm trigger |
| `openDebrief(dom, player)` | Show scored debrief screen |
| `passTimeToStoryline(currentTime)` | Write time to Storyline variable |
| `setBackgroundHidden(dom, hidden)` | Toggle `aria-hidden` + `tabindex` on background elements |
| `toggleFullscreen(wrapper)` | Enter/exit native fullscreen |

---

### `scripts/stateManager.js` — State

Pure logic, no DOM access. All state lives here.

| Function | Description |
|----------|-------------|
| `initState(questions)` | Reset all state with question array |
| `getMode()` / `setMode(mode)` | Current mode: `start` \| `playing` \| `question` \| `review` \| `debrief` |
| `findTriggeredQuestion(currentTime)` | Return question index if playhead is in its trigger window |
| `submitAnswer(index, answer)` | Commit an answer permanently |
| `getQuestionResult(index)` | Full result object: `{ question, userAnswer, isCorrect, correctOption }` |
| `areAllAnswered()` | Returns `true` when all questions have been submitted |
| `dismissQuestion(index)` | Suppress re-trigger while in the same trigger window |
| `getWatchAgainStartTime(index)` | Calculate seek target (0.6s after previous question's window) |
| `resetForReplay()` | Full state reset (all answers, all flags) |

---

### `scripts/questionRenderer.js` — Question DOM

Renders two modes of the question overlay.

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
| `renderDebrief(overlay, results, callbacks)` | Render scored debrief: title, score, question list |
| `hideDebrief(overlay)` | Hide debrief overlay |
| `buildQuestionListItem(result, index, onClick)` | Single question row: icon + label + badge + chevron |

Score calculation: `correct / total`. Pass threshold: **93%** (`PASSING_SCORE`).

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

```
'start'
  │  [Start button]
  ▼
'playing'
  │  [Question trigger window reached]
  ▼
'question'  ──[Submit]──►  'playing'
  │  [Watch Again]                │  [Last question answered
  └──────────────────────────────►│   + video ends]
                                  ▼
                               'debrief'
                                  │  [Click question row]
                                  ▼
                               'review'  ──[Return / Escape]──► 'debrief'
```

---

## CSS & Theming

### Layout strategy

The design uses CSS `zoom` to scale proportionally to the viewport instead of media queries. Each component is designed at a fixed "design size" and zoomed to fit:

| Component | Design size | Zoom formula |
|-----------|-------------|--------------|
| Start modal | 800 × 580 px | `min(70vw / 800px, 90vh / 580px)` |
| Question overlay | 1200 × 720 px | `min(100vw / 1200px, 100vh / 720px)` |
| Debrief container | 900 × 700 px | `min(70vw / 900px, 92vh / 700px)` |
| Fullscreen button | — | `max(0.75, min(100vw / 1200px, 100vh / 720px))` |

### Answer card states

Answer cards (in normal question mode) have four visual states driven by CSS variables:

| State | Background | Border | Number circle |
|-------|-----------|--------|---------------|
| Default | `#FFFFFF` | `#FFFFFF` | `#4D4D4F` |
| Hover/selected | `#F5F9FB` | `#4298B5` | `#4298B5` |
| Correct | `#F9FAF6` | `#92B251` | `#92B251` |
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

The player exposes the current video time to Storyline via the JavaScript API.

**Variable:** `VimeoTime` (configurable via `VAR_NAME` in `script.js`)
**Type:** Number
**Update frequency:** Every 200ms
**Value:** Current playhead position rounded to 0.1s (e.g. `5.6`, `12.3`)

```javascript
// Runs in every polling cycle
const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
if (sl) sl.SetVar('VimeoTime', Math.round(currentTime * 10) / 10);
```

To use in Storyline:
1. Create a **Number** variable named `VimeoTime` in the Storyline project.
2. Insert the player HTML file as a **Web Object**.
3. Use JavaScript triggers in Storyline that read `GetPlayer().GetVar("VimeoTime")` to react to the video position.

If not embedding in Storyline, the `passTimeToStoryline()` call is safely ignored (wrapped in `try/catch`, only runs when `GetPlayer()` is available).

---

## Browser Support

| Browser | Fullscreen | Notes |
|---------|-----------|-------|
| Chrome 80+ | Native Fullscreen API | Full support |
| Firefox 75+ | Native Fullscreen API | Full support |
| Safari 16.4+ (macOS/iPadOS) | Native Fullscreen API | Full support |
| Edge 80+ | Native Fullscreen API | Full support |
| iOS Safari (iPhone) | Not supported | Fullscreen button hidden via `@media (pointer: coarse)` |

The fullscreen button is automatically hidden on touch/pointer devices where the Fullscreen API is unavailable.

---

## Development Notes

- `Questions.js` is auto-generated — never edit it manually. Always edit the Excel file and re-run `npm run import`.
- The Vimeo polling loop runs at 200ms (`UPDATE_MS`). Lowering this may improve trigger accuracy at the cost of more API calls.
- The trigger window (`−0.3s / +0.5s`) is intentionally asymmetric to account for Vimeo's `getCurrentTime()` polling jitter.
- `dismissQuestion(index)` prevents a question from retriggering when the user is still inside the trigger window (e.g. after Submit + Continue).
