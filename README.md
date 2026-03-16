# AHA Interactive Video Player

A browser-based interactive video player built for the American Heart Association. Plays a Vimeo video and displays quiz questions at specific timecodes. After all questions are answered, a Debrief screen shows the final score and lets the user review each answer.

---

## Features

- **Embedded Vimeo player** — video loads via the Vimeo Player JS SDK.
- **Timecode-triggered questions** — video pauses automatically at defined moments and a question overlay appears.
- **Answer modes:**
  - *Normal* — first-time answering; selection can be changed before submitting.
  - *Review* — read-only review opened from the Debrief screen.
- **"Watch Section Again"** — rewinds to just after the previous question's timecode so the user can re-watch the segment before answering.
- **Debrief screen** — shown after all questions are answered; displays the score (passing threshold: 93%) and a list of results with links to review each question.
- **Fullscreen support** — custom fullscreen button with cross-browser support.
- **Articulate Storyline integration** — current video time is passed to the `VimeoTime` variable via `GetPlayer().SetVar()`.
- **Accessibility (WCAG)** — full keyboard navigation, ARIA roles, focus trap inside overlays, and screen reader announcements.

---

## Project Structure

```
/
├── index.html                  # Main page
├── Questions.js                # Auto-generated from Excel — do not edit manually
├── excel/
│   └── Questions.xlsx          # Question data source — edited by the content team
├── scripts/
│   ├── script.js               # Orchestrator: init, events, state transitions
│   ├── stateManager.js         # Runtime state (answers, mode, flags)
│   ├── questionRenderer.js     # DOM rendering for the question overlay
│   ├── debriefRenderer.js      # DOM rendering for the Debrief screen
│   ├── questionsToPlayer.js    # Node.js build script: Excel → Questions.js
│   └── utils.js                # Shared utilities
├── styles/
│   └── styles.css              # All styles (CSS custom properties)
├── img/
│   ├── Aha logo black.svg
│   ├── check.svg
│   ├── cross.svg
│   └── replay.svg
└── package.json
```

---

## Quick Start

### Requirements

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Build + serve (recommended)

```bash
npm start
```

This runs two steps in sequence:
1. Reads `excel/Questions.xlsx` and generates `Questions.js`.
2. Starts a local server at `http://localhost:3000`.

### Regenerate questions only (no server)

```bash
npm run import
```

### Start the server only

```bash
npm run serve
```

> **Important:** always open the player over `http://`, not `file://` — ES modules do not work without an HTTP server.

---

## Excel File Format

`excel/Questions.xlsx` contains one sheet per question. Sheets named `start` or `readme` are skipped.

### Sheet layout

| Cell | Content |
|------|---------|
| `A1` | Question text (merged cell) |
| `B2` | Timecode (e.g. `30`, `30 sec`, `00:30`) |
| Row 5 | Column headers for the answer options table |
| Rows 6+ | Answer options |

### Column headers (row 5)

| Header | Description |
|--------|-------------|
| `Option` | Option letter (A, B, C, D) |
| `Option Description` | Answer text shown to the user |
| `Feedback Rationale` | Feedback text shown after submitting |
| `Correct` | `TRUE` / `1` / `yes` — marks the correct answer |
| `Debrief Rationale` | Explanation shown in the Debrief review panel |

---

## Player Modes

| Mode | Description |
|------|-------------|
| `start` | Start screen before the user clicks Start |
| `playing` | Video is playing |
| `question` | Question overlay is open (first-time answering) |
| `review` | Question overlay is open (read-only, from Debrief) |
| `debrief` | Summary screen after all questions are answered |

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Play / pause video (via native Vimeo controls) |
| `↑` `↓` (or `←` `→`) | Move between answer options |
| `Tab` / `Shift+Tab` | Move between interface elements |
| `Enter` / `Space` | Submit or Continue (when button is focused) |
| `Escape` | Close question (Continue) or return to Debrief (review mode) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla JS (ES modules), HTML5, CSS3 |
| Video | [Vimeo Player JS SDK](https://developer.vimeo.com/player/sdk) |
| Fonts / styles | CSS custom properties, Aktiv Grotesk (Adobe Fonts) |
| Build | Node.js, `xlsx` (Excel parsing) |
| Dev server | `serve` (npx) |

---

## Changing the Video

The Vimeo video ID is set directly in `index.html` in the iframe `src` attribute:

```html
<iframe
  id="vimeo"
  src="https://player.vimeo.com/video/XXXXXXXXX?badge=0&autopause=0&..."
  ...
></iframe>
```

Replace `XXXXXXXXX` with the new Vimeo video ID.

---

## Passing Score Threshold

The threshold for "You passed!" is defined in `scripts/debriefRenderer.js`:

```js
const PASSING_SCORE = 93; // percentage
```
