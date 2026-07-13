# AHA Interactive Video Player

An accessible, interactive video player built with Vimeo and vanilla JavaScript. Displays multiple-choice questions at timed moments during video playback, tracks answers, and shows a scored debrief at the end. Designed for embedding in Articulate Storyline as a Web Object.

> **Repository note (2026-06-25):** The repo contains one root-level deliverable (`Web Object/`) and a `Delivery/` folder with the four Storyline-embedded deliverables. The old root build pipeline was removed; each folder is fully self-contained. Deleted build files remain recoverable from git history (e.g. `git restore --source=56eaab7 -- excel scripts package.json`).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Getting Started](#getting-started)
4. [Extended Audio Description (EAD)](#extended-audio-description-ead)
5. [Regular Video Players](#regular-video-players)
6. [Practice Videos](#practice-videos)
7. [Architecture & Data Flow](#architecture--data-flow)
8. [Questions & Chaining](#questions--chaining)
9. [Adding & Editing Questions](#adding--editing-questions)
10. [Configuration Reference](#configuration-reference)
11. [Modules](#modules)
12. [State Machine](#state-machine)
13. [CSS & Theming](#css--theming)
14. [Accessibility](#accessibility)
15. [Articulate Storyline Integration](#articulate-storyline-integration)
16. [Browser Support](#browser-support)

---

## Project Overview

- **Video source:** Vimeo (embedded via iframe + Vimeo Player SDK)
- **Questions source:** `Questions.js` inside each deliverable folder (edited directly — see [Adding & Editing Questions](#adding--editing-questions))
- **No frameworks:** Vanilla ES6 modules, no build step for the browser code
- **Self-contained:** Each deliverable folder ships independently with its own scripts, styles, images, and `Questions.js`
- **Accessibility:** WCAG 2.1 compliant — keyboard navigation, screen reader support, focus management

---

## File Structure

```
AHA-Interactive-Video-Player/
├── README.md
│
├── Web Object/                   # Storyline Web Object — Practice Case 1
│   ├── index.html                # Vimeo id 1175973385
│   ├── Questions.js
│   ├── scripts/
│   │   ├── script.js             # Orchestrator
│   │   ├── stateManager.js       # State management
│   │   ├── questionRenderer.js   # Question DOM rendering
│   │   ├── summaryRenderer.js    # Summary screen DOM rendering (pre-debrief)
│   │   ├── debriefRenderer.js    # Debrief DOM rendering
│   │   ├── questionsToPlayer.js  # (legacy) Node build script
│   │   └── utils.js              # Helpers
│   ├── styles/
│   └── img/
│
└── Delivery/                     # Storyline-embedded deliverables
    │
    ├── 3._Practice_Test/         # Practice mode player — Practice Case 2
    │   ├── index.html            # Vimeo id 1209573495
    │   ├── Questions.js
    │   ├── scripts/               # Extended: save/resume via Practice_Case_Study_1
    │   ├── styles/
    │   └── img/
    │
    ├── 4._Final_Test/            # Final Test — 3-attempt system, 20 self-contained folders
    │   ├── 01._Test_1a/          # Vimeo id 1175973409 — case-study group 1
    │   ├── 02._Test_1b/          # Vimeo id 1175973423 — case-study group 1
    │   ├── ...                   # 03._Test_1c through 19._Test_4d (20 folders total)
    │   ├── 20._Test_4e/          # Vimeo id 1175973918 — case-study group 4
    │   │   # Each folder: index.html, Questions.js, scripts/, styles/, img/ — fully
    │   │   # standalone (no shared base template; the old top-level generator source
    │   │   # and pre-numbered "Test 1a".."Test 4e" folders were removed 2026-07-13).
    │   │   # scripts/script.js: attempt counter + Storyline Fail variable + save/resume
    │   │   # via one of 4 Final_Test_Case_Study_N variables (grouped by the digit in
    │   │   # the folder name — a-e variants of the same group share a variable).
    │   │   # index.html: data-case-study="N" on #videoWrapper selects that variable.
    │
    ├── 2._Practice_Videos/       # 13 standalone single-question Web Objects
    │   ├── generate.cjs          # Generator: rewrites index.html + script.js per question
    │   ├── Question_1/           # 1a LOC — Vimeo id 1175970664
    │   ├── Question_2/           # 1b LOC Questions — Vimeo id 1175970729
    │   ├── Question_3/           # 1c LOC Commands — Vimeo id 1175971157
    │   ├── Question_4/           # 2 Best Gaze — Vimeo id 1175971255
    │   ├── Question_5/           # 3 Visual — Vimeo id 1175971360
    │   ├── Question_6/           # 4 Facial Palsy — Vimeo id 1175972074
    │   ├── Question_7/           # 5 Motor Arm — Vimeo id 1175972173
    │   ├── Question_8/           # 6 Motor Leg — Vimeo id 1175972438 (placeholder)
    │   ├── Question_9/           # 7 Limb Ataxia — Vimeo id 1175972549
    │   ├── Question_10/          # 8 Sensory — Vimeo id 1175972632
    │   ├── Question_11/          # 9 Best Language — Vimeo id 1175972894
    │   ├── Question_12/          # 10 Dysarthria — Vimeo id 1175972992
    │   └── Question_13/          # 11 Extinction and Inattention — Vimeo id 1175973069
    │
    └── 1._Regular_Video/         # 68 non-interactive video pages + 13 tabbed players
        ├── generate.cjs          # Generator: reads video-manifest.json, emits one folder per video
        ├── generate-players.cjs  # Generator: creates/updates the 12 tabbed player folders below
        ├── Background .../       # 3 background videos
        ├── Intro .../            # 13 intro videos
        ├── Score .../            # 48 score videos
        ├── Special .../          # 4 special videos
        ├── Item_5_Motor_Arm_Player/          # Prototype (hand-authored; source of CSS for generator)
        │   ├── index.html
        │   ├── script.js
        │   └── styles.css
        ├── Item_1a_LOC_Player/               # Generated — same structure as prototype
        ├── Item_1b_LOC_Questions_Player/
        ├── Item_1c_LOC_Commands_Player/
        ├── Item_2_Best_Gaze_Player/
        ├── Item_3_Visual_Player/
        ├── Item_4_Facial_Palsy_Player/
        ├── Item_6_Motor_Leg_Player/          # All videos are placeholders
        ├── Item_7_Limb_Ataxia_Player/
        ├── Item_8_Sensory_Player/
        ├── Item_9_Best_Language_Player/
        ├── Item_10_Dysarthria_Player/
        └── Item_11_Extinction_and_Inattention_Player/
```

> Each deliverable folder is independent and edited in place. `Web Object/` and `Practice Test/` share the same base logic; `Final Test/` has extended logic (attempt counter + `Fail` variable). When you change shared logic, apply the same edit to each folder that needs it.

Each `Question_N/` folder is self-contained:
```
Question_N/
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

## Extended Audio Description (EAD)

Every video page reads the Storyline Boolean variable `Extended_Audio_Description_Track` and loads an Extended Audio Description version of the video when it is `true`, otherwise it loads the standard version. When Storyline is absent (local testing or static server), the page always loads the standard video.

### How it works

The Vimeo `<iframe>` carries no `src` attribute. Instead it carries three data attributes:

```html
<iframe
  id="vimeo"
  data-standard-id="STANDARD_VIDEO_ID"
  data-ead-id="EAD_VIDEO_ID"
  data-params="badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=0"
  ...>
</iframe>
```

An inline `<script>` placed immediately before the module script tag reads these attributes and sets `iframe.src` before the Vimeo Player SDK initializes:

```js
(function () {
  var f = document.getElementById('vimeo');
  var standard = f.getAttribute('data-standard-id');
  var ead      = f.getAttribute('data-ead-id') || standard;
  var params   = f.getAttribute('data-params');
  var extended = false;
  try {
    var sl = (window.parent && window.parent.GetPlayer && window.parent.GetPlayer()) ||
             (window.top && window.top.GetPlayer && window.top.GetPlayer());
    if (sl) {
      var v = sl.GetVar('Extended_Audio_Description_Track');
      extended = (v === true || v === 'true' || v === 'True');
    }
  } catch (e) { extended = false; }
  f.src = 'https://player.vimeo.com/video/' + (extended ? ead : standard) + '?' + params;
})();
```

### Current state

EAD master videos have not yet been delivered. Until they are, `data-ead-id === data-standard-id` for every page (both branches play the same video). When EAD masters arrive, update only the `data-ead-id` value in each page (or re-run the relevant generator with the updated manifest).

### Storyline variable

| Variable | Type | Values |
|----------|------|--------|
| `Extended_Audio_Description_Track` | Boolean | `true` = load EAD version, `false` / absent = load standard |

### video-manifest.json

All video ids are managed in `video-manifest.json` at the repo root. This file was generated from `NIHSS Video Playlist.xlsx` and is the authoritative source for `standardId` and `eadId` per video. `1._Regular_Video/generate.cjs` reads this manifest directly. Do not delete or move it.

### Generators

| Generator | Location | What it creates |
|-----------|----------|-----------------|
| `generate.cjs` | `1._Regular_Video/` | One folder per non-interactive video (types: background, intro, score, special) — 68 folders total |
| `generate-players.cjs` | `1._Regular_Video/` | 12 tabbed player folders (reads `Item_5_Motor_Arm_Player/styles.css` as the CSS source) |

> **Final Test's `generate-tests.cjs` was removed (2026-07-13 cleanup)**, along with the top-level base template and the old-style `Test 1a`…`Test 4e` folders it copied from. The 20 numbered folders (`01._Test_1a`…`20._Test_4e`) it had already generated are the live deliverables and are each edited directly now — there is no base template to regenerate from. It remains recoverable from git history (commit `064b317`) if the Excel-driven regeneration workflow is ever needed again.

To regenerate after updating `video-manifest.json`:
```bash
cd "Delivery/1._Regular_Video" && node generate.cjs
```

To regenerate the 12 tabbed players after changing design (e.g. edit `Item_5_Motor_Arm_Player/styles.css`):
```bash
cd "Delivery/1._Regular_Video" && node generate-players.cjs
```

---

## Regular Video Players

`Delivery/1._Regular_Video/` contains 13 **tabbed video selector** Web Objects — one per NIHSS item. Each player groups an item's Introduction video and its per-score videos (0, 1, 2 … UN) behind a pill/circle tab strip above a shared 16:9 video stage.

### Design specs

| Property | Value |
|----------|-------|
| Card design size | 1680 × 1436 px |
| Scaling | CSS `zoom: min(100vw / 1680px, 100vh / 1436px)` |
| Background | Fully transparent (Storyline slide bleeds through) |
| Card background | Gradient `#FFFFFF → #7CB8CC`, `border-radius: 30px` |
| Introduction pill | 152 × 152 px pill, font 60px |
| Score circles | 224 × 224 px circles, font 100px (UN: 74px) |
| Score row layout | `justify-content: center; gap: 50px` |
| Video stage | `aspect-ratio: 16/9`, `border-radius: 18px` |
| Cross-fade on tab switch | 160 ms opacity transition |

### Tab keyboard model (WAI-ARIA Tabs pattern)

- **Arrow keys / Home / End** — move between tabs and activate them immediately (no Enter needed).
- **Tab** — interleaved order: tab → video stop → next tab → video stop … → exit web object.
- **Shift+Tab** — reverse order.
- **Enter / Space** — replay the current tab's video.

### Vimeo controls scaling

Because the card uses CSS `zoom`, the Vimeo iframe's CSS dimensions remain at the full design size (1600 × 900 px) while being displayed smaller. `calibrateIframe()` in each `script.js` detects the actual zoom factor and resizes the iframe to the true visible pixel dimensions, applying an inverse `scale()` so it still fills the stage. Vimeo then renders controls sized for the real visible width.

### Placeholder videos

Tabs whose `standardId` is `null` show a "Video coming soon." panel instead of loading Vimeo. Item 6 Motor Leg has all videos as placeholders. Item 7 Limb Ataxia has a null UN. Item 10 Dysarthria has a real UN video.

### Source of truth

`Item_5_Motor_Arm_Player/` is the hand-authored prototype. `generate-players.cjs` (same directory) reads its `styles.css` and generates the other 12 folders. To update all players after a design change:

```bash
cd "Delivery/1._Regular_Video"
# 1. Edit Item_5_Motor_Arm_Player/styles.css
# 2. Re-run the generator
node generate-players.cjs
```

The generator also holds all Vimeo IDs. To update an ID, edit the `ITEMS` array in `generate-players.cjs` and re-run.

### Per-item tab count

| Player folder | Tabs |
|---------------|------|
| Item_1a_LOC_Player | Intro, 0, 1, 2, 3 |
| Item_1b_LOC_Questions_Player | Intro, 0, 1, 2 |
| Item_1c_LOC_Commands_Player | Intro, 0, 1, 2 |
| Item_2_Best_Gaze_Player | Intro, 0, 1, 2 |
| Item_3_Visual_Player | Intro, 0, 1, 2, 3 |
| Item_4_Facial_Palsy_Player | Intro, 0, 1, 2, 3 |
| Item_5_Motor_Arm_Player | Intro, 0, 1, 2, 3, 4, UN |
| Item_6_Motor_Leg_Player | Intro, 0, 1, 2, 3, 4, UN (all placeholders) |
| Item_7_Limb_Ataxia_Player | Intro, 0, 1, 2, UN (UN = placeholder) |
| Item_8_Sensory_Player | Intro, 0, 1, 2 |
| Item_9_Best_Language_Player | Intro, 0, 1, 2, 3 |
| Item_10_Dysarthria_Player | Intro, 0, 1, 2, UN |
| Item_11_Extinction_and_Inattention_Player | Intro, 0, 1, 2 |

---

## Practice Videos

The `Practice Videos/` folder contains 13 standalone Web Object projects — one per NIHSS item. Each project:

- Plays the KC (Knowledge Check) video for its NIHSS item (unique Vimeo id per question)
- Shows the relevant question when the video ends
- On Submit → displays **immediate Feedback** (correct/incorrect) instead of a Debrief screen
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

`2._Practice_Videos/generate.cjs` holds all question data inline. It rewrites `index.html` and `script.js` for each of the 13 `Question_N/` folders (asset copies are disabled since each folder already contains its own `img/` and `styles.css`):

```bash
cd "Delivery/2._Practice_Videos"
node generate.cjs
```

Alternatively, edit each `Question_N/` folder directly — they are fully standalone.

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

> The timecodes above are the shared/original set (used by `Web Object/` and `Final Test/`). **Practice Test (`3._Practice_Test`) diverges** — it plays its own video (Vimeo id `1209573495`, total length 12:55) and has its own marker timecodes. Each question fires just before its next section, and the last question fires near the end of the video. In Practice Test **every correct answer is `"0"`** (all `options[].correct` set on the "0" option). Its current timecodes:

| ID | Sheet | Practice Test timecode |
|----|-------|------------------------|
| Q1 | 1a LOC | 9s |
| Q2 | 1b LOC Q | 20s |
| Q3 | 1c LOC Commands | 48s |
| Q4 | 2 Best Gaze | 75s |
| Q5 | 3 Visual | 189s |
| Q6 | 4 Facial Palsy | 208s |
| Q7 / Q8 | 5 Motor Arm (L / R) | 269s (chained) |
| Q9 / Q10 | 6 Motor Leg (L / R) | 301s (chained) |
| Q11 | 7 Limb Ataxia | 416s |
| Q12 | 8 Sensory | 462s |
| Q13 | 9 Best Language | 611s |
| Q14 | 10 Dysarthria | 624s |
| Q15 | 11 Extinction and Inattention | 774s |

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
| `options[].rationale` | (data field, not currently displayed) |
| `options[].correct` | `true` / `false` — marks the correct answer |
| `options[].debrief` | (data field, not currently displayed) |

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

`2._Practice_Videos/` question data is held inline in `generate.cjs` (or edited per `Question_N/` folder) — see [Regenerating Practice Videos](#regenerating-practice-videos).

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

To change the video, update the `data-standard-id` and `data-ead-id` attributes on the iframe (the inline EAD script builds the `src` at runtime):

```html
data-standard-id="YOUR_VIDEO_ID"
data-ead-id="YOUR_EAD_VIDEO_ID"
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
| `_renderReviewMode(...)` | Read-only mode: feedback panel with user answer and correct answer |
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

> **Practice Test debrief label** — the visible row text is the sheet title only (e.g. `1a: Level of Consciousness`); the `Question N:` prefix was removed. The `aria-label` still includes the question number for screen-reader context.

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

> `Final Test/debrief-preview.html` (a standalone preview of the Final Test debrief screen, with `MOCK_ATTEMPT` / `MOCK_PCT_CORRECT` constants to simulate different states) was removed in the 2026-07-13 cleanup along with the rest of the top-level base template. Recoverable from git history (commit `064b317`) if needed.

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

### Save & resume progress (Practice Test only)

Practice Test (`3._Practice_Test`) persists all submitted answers into a single Storyline **Text** variable so progress survives leaving and returning to the course. On load it restores state and jumps to the right screen.

**Variable:** `Practice_Case_Study_1`
**Type:** Text
**Value:** JSON string — `{ v:1, n:<questionCount>, answers:{ index: optionText }, done:<finalized?> }`

- **Save after each submit** — `saveProgress(false)` runs in `handleSubmit` after every answer (including each chained submit), rewriting the variable with `done:false`.
- **Finalize** — `saveProgress(true)` runs in `openDebrief`, locking the attempt (`done:true`).
- **Restore on load** — `readSavedProgress()` (in `init()`) parses the variable; `restoreState()` re-commits answers; then `resumeFromSaved()` (inside `startPlayer`'s `player.ready()`) branches:
  - `done:true` → open **Debrief** directly.
  - all answered but not finalized → open **Summary**.
  - stopped mid-way → re-open the **last answered question** (video seeked to its timecode, answer pre-selected).
  - nothing saved, or a corrupt / mismatched payload (`n` differs from the current question count) → normal start.

```javascript
function saveProgress(done) {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (!sl) return;
    const answers = {};
    getQuestions().forEach((q, i) => {
      const a = getAnsweredAnswer(i);
      if (a) answers[i] = a.text;
    });
    sl.SetVar(CASE_VAR, JSON.stringify({ v: 1, n: getQuestions().length, answers, done: Boolean(done) }));
  } catch (_) {}
}
```

To use in Storyline:
1. Create a **Text** variable named `Practice_Case_Study_1` in the Storyline project.
2. **Publish with resume/suspend enabled** (LMS resume "always" or "prompt") — Storyline variables do not survive a relaunch otherwise, so nothing would restore. The payload is tiny (well under the SCORM 1.2 ~4096-char `suspend_data` cap).

---

### Save & resume progress (Final Test only)

All 20 Final Test folders (`4._Final_Test/01._Test_1a` … `20._Test_4e`) persist into one of **4** Storyline Text variables, grouped by the digit in the folder name — all 5 letter-variants (`a`–`e`) of a group share the same variable, since they use the same `Questions.js`.

**Variables:** `Final_Test_Case_Study_1`, `Final_Test_Case_Study_2`, `Final_Test_Case_Study_3`, `Final_Test_Case_Study_4`
**Type:** Text (all 4)
**Value:** JSON string — `{ v:1, n:<questionCount>, answers:{ index: optionText }, attempts:<attemptCount>, done:<terminal?>, stage:<'debrief'|null> }`

Each folder's `index.html` carries `data-case-study="N"` on `#videoWrapper` (`N` = 1–4); `script.js` reads it once at load to pick its variable:

```javascript
const CASE_GROUP = document.getElementById('videoWrapper')?.dataset.caseStudy || '1';
const CASE_VAR   = 'Final_Test_Case_Study_' + CASE_GROUP;
```

- **Save after each submit** — `saveProgress(false)` runs in `handleSubmit` after every answer.
- **Save on finalize/retry-pending** — `saveProgress(passed || finalFail, 'debrief')` runs in `openDebrief`. `done` is `true` only when the attempt is truly over (passed, or all 3 attempts exhausted); otherwise the attempt failed but a retry is still available, and `stage:'debrief'` records that the learner is sitting on that Debrief screen.
- **Save on restart** — `saveProgress(false)` runs in `restartActivity` ("Try Again"), clearing the stored answers/stage while keeping the attempt count.
- **`attemptCount` is part of the payload** — it used to live only in a module-level variable and reset to 0 on every reload; it's now restored from `saved.attempts` on load, so the 3-attempt cap survives a relaunch.
- **Restore on load** branches the same way as Practice Test, plus a `stage` check to tell "stopped on Summary" apart from "stopped on a non-final Debrief with Try Again pending" (both are `areAllAnswered() && !done`):
  - `done:true`, or (`all answered` and `stage:'debrief'`) → open **Debrief** directly (no attempt re-counted).
  - all answered, not done, stage isn't `'debrief'` → open **Summary**.
  - stopped mid-way → re-open the **last answered question**.
  - nothing saved, or a mismatched/corrupt payload → normal start.
- **Bug fix included:** `openDebrief` previously incremented `attemptCount` unconditionally, so clicking a question row to review it and returning to Debrief (`returnToDebrief`) silently counted as a *second* attempt. It now only increments when called with `{ isNewAttempt: true }`, which happens exactly once per real attempt — from Summary's "Submit Answers" button.

To use in Storyline:
1. Create all 4 **Text** variables (`Final_Test_Case_Study_1` … `_4`) in the Storyline project.
2. **Publish with resume/suspend enabled**, same requirement as Practice Test above.

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
- **Practice Test (`3._Practice_Test`) has diverged from the shared set:** its own video (`1209573495`) and timecodes, every correct answer set to `"0"`, save/resume via the `Practice_Case_Study_1` Storyline variable (in `script.js`), and a debrief question list that shows the sheet title without the `Question N:` prefix (in `debriefRenderer.js`). These changes are intentional and specific to Practice Test — do not copy them back to `Web Object/` or `Final Test/`.
- **Final Test (`4._Final_Test`) has its own save/resume, applied identically across all 20 folders:** `scripts/script.js` is byte-identical across every `01._Test_1a`…`20._Test_4e` folder (verify with a checksum before assuming a one-off edit is safe); the only per-folder difference is `data-case-study="N"` on `index.html`'s `#videoWrapper`, which selects one of the 4 `Final_Test_Case_Study_N` variables. If you edit the save/resume logic, apply the same edit to `scripts/script.js` in all 20 folders — there is no base template to regenerate from anymore (see Generators note above).
