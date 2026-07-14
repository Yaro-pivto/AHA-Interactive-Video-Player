/**
 * script.js
 * Orchestrator — wires Vimeo player, state, question renderer, debrief.
 * Runs in the browser as an ES module.
 */

import { GROUP, CASES } from '../cases.js';
import {
  initState,
  getQuestions,
  getCurrentIndex,
  setCurrentIndex,
  setSelectedAnswer,
  submitAnswer,
  isAnswered,
  getPreviousAnswer,
  getAnsweredAnswer,
  areAllAnswered,
  getAllResults,
  getIsPausing,
  setIsPausing,
  getIsAnswering,
  setIsAnswering,
  getMode,
  setMode,
  findTriggeredQuestion,
  isLockedAnswer,
  dismissQuestion,
  clearDismissed,
  setWatchAgainIndex,
  setSummaryEditActive,
  clearWatchAgainBroadcast,
  getWatchAgainStartTime,
  closeOverlay,
  resetForReplay,
} from './stateManager.js';
import {
  renderQuestion,
  showFeedback,
} from './questionRenderer.js';
import {
  renderDebrief,
  hideDebrief,
} from './debriefRenderer.js';
import {
  renderSummary,
  hideSummary,
} from './summaryRenderer.js';

// ─── Configuration ────────────────────────────────────────────────────────────

const VAR_NAME     = 'VimeoTime';
const UPDATE_MS    = 200;
const MAX_ATTEMPTS = 3;      // attempts allowed per case
const PASSING_SCORE = 93;    // % correct required to pass a case
const MAX_CASES    = 3;      // max different cases a learner may receive per group

// This player owns ONE group and all of its cases (from cases.js). The active
// case letter is chosen at runtime (random 1-of-5), not encoded in the folder.
const CASE_GROUP  = GROUP || document.getElementById('videoWrapper')?.dataset.caseStudy || '1';
const GROUP_CASES = CASES.map(c => c.letter);   // the group's letter-variants, e.g. ['a'..'e']
const CASE_VAR    = 'Final_Test_Case_Study_' + CASE_GROUP;
const NAV_VAR     = 'Final_Test_Nav';   // cross-cutting navigation signal (not per-test state)

// The default Vimeo embed params (fallback if the iframe has no data-params).
const DEFAULT_PARAMS = 'badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=0';

// currentCase — the letter (a..e) of the case currently active in this player.
// Set by loadCaseData(); mutated when a new case is handed out.
let currentCase = GROUP_CASES[0] || 'a';

// The live Vimeo.Player instance (needed for in-place video swaps on Next Case).
let vimeoPlayer = null;

// ─── Attempt / group tracking ───────────────────────────────────────────────
//
// attemptCount  — attempts on the CURRENT case (0..3), persisted in the group var.
// usedCases     — letters already consumed in this group (includes currentCase), max 3.
// groupStatus   — 'in_progress' | 'passed' | 'failed' for this group.
// pendingAction — the decision surfaced on the Debrief and used for navigation:
//                 'retry' | 'newCase' | 'passGroup' | 'courseComplete' | 'failCourse'.
// pendingCase   — target letter when pendingAction === 'newCase'.

let attemptCount  = 0;
let usedCases     = [];      // seeded in init() once the first case is chosen
let groupStatus   = 'in_progress';
let pendingAction = null;
let pendingCase   = null;

// ─── DOM references ───────────────────────────────────────────────────────────

function resolveDom() {
  return {
    videoWrapper:     document.getElementById('videoWrapper'),
    iframe:           document.getElementById('vimeo'),
    fullscreenBtn:    document.getElementById('fullscreenBtn'),
    startOverlay:     document.getElementById('startOverlay'),
    startBtn:         document.getElementById('startBtn'),
    testIdBadge:      document.getElementById('testIdBadge'),
    questionOverlay:  document.getElementById('questionOverlay'),
    summaryOverlay:   document.getElementById('summaryOverlay'),
    debriefOverlay:   document.getElementById('debriefOverlay'),
    questionNumber:   document.getElementById('questionNumber'),   // H1 "Question X"
    questionText:     document.getElementById('questionText'),
    answersContainer: document.getElementById('answersContainer'),
    feedbackMessage:  document.getElementById('feedbackMessage'),
    submitBtn:        document.getElementById('submitBtn'),
    continueBtn:      document.getElementById('continueBtn'),
    watchAgainBtn:    document.getElementById('watchAgainBtn'),
    // videoFocusTarget: document.getElementById('videoFocusTarget'), // [COMMENTED OUT]
    frameSentinel:    document.getElementById('frameSentinel'),
  };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  const dom = resolveDom();

  // 1. Read any saved group progress (raw — the per-case n-check runs after we
  //    know which case's questions are loaded).
  const savedRaw = readSavedRaw();

  // 2. Decide the active case: resume the saved one if it's a valid letter for
  //    this group, otherwise randomly pick a fresh one.
  const resuming = savedRaw && GROUP_CASES.includes(savedRaw.currentCase);
  const letter   = resuming ? savedRaw.currentCase : pickInitialCase();

  // 3. Load that case's questions + label (seeds the state machine).
  loadCaseData(letter, dom);

  // 4. Now that questions are loaded, fully validate the save (question count).
  const validSaved = (resuming && savedRaw.n === getQuestions().length && savedRaw.answers)
    ? savedRaw : null;

  // 5. Seed attempt/group state.
  if (validSaved) {
    usedCases     = Array.isArray(validSaved.usedCases) && validSaved.usedCases.length
      ? validSaved.usedCases.slice() : [letter];
    groupStatus   = validSaved.groupStatus || 'in_progress';
    attemptCount  = Number.isFinite(validSaved.attempts) ? validSaved.attempts : 0;
    pendingAction = validSaved.nextAction || null;
    pendingCase   = validSaved.nextCase  || null;
  } else {
    usedCases     = [letter];
    groupStatus   = 'in_progress';
    attemptCount  = 0;
    pendingAction = null;
    pendingCase   = null;
  }

  // 6. Build the video src for the chosen case, then create the Vimeo player.
  dom.iframe.src = buildVideoSrc(getCaseByLetter(letter));
  const player = new Vimeo.Player(dom.iframe);
  vimeoPlayer = player;

  // 7. Fresh start → seed a clean payload so the group var is never empty.
  if (!validSaved) saveProgress(false);

  bindEvents(dom, player);
  startPlayer(dom, player, validSaved);
}

// ─── Case data / video helpers ────────────────────────────────────────────────

function getCaseByLetter(letter) {
  return CASES.find(c => c.letter === letter) || CASES[0];
}

// Random letter not yet consumed this group (universe minus usedCases).
function pickInitialCase() {
  const remaining = GROUP_CASES.filter(c => !usedCases.includes(c));
  const pool = remaining.length ? remaining : GROUP_CASES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Load a case's questions into state + update the visible test-id badge.
// (Does NOT touch the video — see loadCaseVideo for in-place switching.)
function loadCaseData(letter, dom) {
  currentCase = letter;
  const caseObj = getCaseByLetter(letter);
  initState(caseObj.questions);
  const badge = dom?.testIdBadge ?? document.getElementById('testIdBadge');
  if (badge) badge.textContent = 'Test ' + CASE_GROUP + letter.toUpperCase();
  console.log('✓ Case ' + CASE_GROUP + letter.toUpperCase() + ' — '
    + getQuestions().length + ' questions loaded');
}

// EAD-aware video id for a case (mirrors the old inline EAD switch).
function pickVideoId(caseObj) {
  let extended = false;
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (sl) {
      const v = sl.GetVar('Extended_Audio_Description_Track');
      extended = (v === true || v === 'true' || v === 'True');
    }
  } catch (_) { extended = false; }
  return extended ? (caseObj.eadId || caseObj.standardId) : caseObj.standardId;
}

// Full Vimeo embed URL for the initial iframe src.
function buildVideoSrc(caseObj) {
  const iframe = document.getElementById('vimeo');
  const params = iframe?.getAttribute('data-params') || DEFAULT_PARAMS;
  return 'https://player.vimeo.com/video/' + pickVideoId(caseObj) + '?' + params;
}

// ─── Start screen ─────────────────────────────────────────────────────────────

function hideStartOverlay(dom) {
  dom.startOverlay.classList.add('hidden');
  dom.startOverlay.setAttribute('aria-hidden', 'true');
}

function startActivity(dom, player) {
  dom.startOverlay.classList.add('hidden');
  dom.startOverlay.setAttribute('aria-hidden', 'true');

  // Restore iframe + videoFocusTarget to tabbable state now that the activity has begun.
  // setBackgroundHidden(false) checks startOverlay.hidden before enabling videoFocusTarget.
  setBackgroundHidden(dom, false);

  setMode('playing');
  player.play();

  // [COMMENTED OUT] videoFocusTarget focus
  // requestAnimationFrame(() => {
  //   dom.videoFocusTarget.setAttribute('aria-label', 'frame');
  //   dom.videoFocusTarget.focus();
  // });
  requestAnimationFrame(() => dom.frameSentinel.focus());
}

// ─── Event binding ────────────────────────────────────────────────────────────

function bindEvents(dom, player) {
  dom.fullscreenBtn.addEventListener('click', () => toggleFullscreen(dom.videoWrapper));
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
    .forEach(ev => document.addEventListener(ev, () => {
      updateFullscreenButton(dom);
      // In fullscreen, block Tab into the iframe so Shift+Tab cannot escape into Vimeo controls.
      const isFs = Boolean(document.fullscreenElement ?? document.webkitFullscreenElement);
      if (isFs) {
        dom.iframe.setAttribute('tabindex', '-1');
      } else {
        // Restore: setBackgroundHidden manages the overlay states; here we only
        // undo the fullscreen lock if no overlay is currently open.
        if (dom.questionOverlay.classList.contains('hidden') && dom.debriefOverlay.classList.contains('hidden')) {
          dom.iframe.removeAttribute('tabindex');
        }
      }
      // Always return focus to the fullscreen button after any fullscreen transition
      // so focus is never lost regardless of the current mode.
      requestAnimationFrame(() => dom.fullscreenBtn.focus());
    }));

  // Focus wrap-around: Tab from fullscreen button (last in DOM order) cycles back
  // to the first focusable element in the current context, preventing focus escape.
  dom.fullscreenBtn.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || e.shiftKey) return;
    // Only trap focus when in fullscreen mode; in normal mode let Tab escape naturally.
    const isFs = Boolean(document.fullscreenElement ?? document.webkitFullscreenElement);
    if (!isFs) return;
    e.preventDefault();
    if (!dom.questionOverlay.classList.contains('hidden')) {
      // Question is open → go to first radio (or dialog fallback)
      const firstRadio = dom.answersContainer.querySelector('input[type="radio"]');
      (firstRadio ?? dom.questionOverlay).focus();
      return;
    }
    // Video playing → go to frame sentinel (first tab stop before Vimeo)
    // dom.videoFocusTarget.focus(); // [COMMENTED OUT]
    dom.frameSentinel.focus();
  });

  // Shift+Tab on answersContainer first radio in fullscreen → wrap to fullscreen button
  dom.answersContainer.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !e.shiftKey) return;
    const isFs = Boolean(document.fullscreenElement ?? document.webkitFullscreenElement);
    if (!isFs) return;
    const firstRadio = dom.answersContainer.querySelector('input[type="radio"]');
    if (document.activeElement === firstRadio) {
      e.preventDefault();
      dom.fullscreenBtn.focus();
    }
  });

  dom.startBtn.addEventListener('click',         () => startActivity(dom, player));
  dom.submitBtn.addEventListener('click',        () => handleSubmit(dom, player));
  dom.continueBtn.addEventListener('click',      () => continueVideo(dom, player));
  dom.watchAgainBtn.addEventListener('click',    () => watchSectionAgain(dom, player));

  // [COMMENTED OUT] Shift+Tab on videoFocusTarget in fullscreen
  // dom.videoFocusTarget.addEventListener('keydown', e => {
  //   if (e.key === 'Tab' && e.shiftKey) {
  //     const isFs = Boolean(document.fullscreenElement ?? document.webkitFullscreenElement);
  //     if (isFs) { e.preventDefault(); dom.fullscreenBtn.focus(); }
  //     return;
  //   }
  // });

  // [COMMENTED OUT] Space/Enter on videoFocusTarget → toggle play/pause
  // dom.videoFocusTarget.addEventListener('keydown', e => {
  //   if (e.key !== ' ' && e.key !== 'Enter') return;
  //   e.preventDefault();
  //   const mode = getMode();
  //   if (getIsAnswering() || mode === 'debrief' || mode === 'review') return;
  //   player.getPaused().then(paused => {
  //     if (paused) player.play();
  //     else        player.pause();
  //   });
  // });

  document.addEventListener('keydown', e => handleKeyboardNavigation(e, dom, player));
}

// ─── Player loop ──────────────────────────────────────────────────────────────

function startPlayer(dom, player, saved) {
  // Block iframe from keyboard/AT while any overlay is still covering the player.
  setBackgroundHidden(dom, true);

  player.ready().then(() => {
    console.log('✓ Vimeo player ready — polling every ' + UPDATE_MS + 'ms, ' + getQuestions().length + ' questions loaded');

    // [COMMENTED OUT] aria-label sync — videoFocusTarget removed
    // player.on('play',  () => dom.videoFocusTarget.setAttribute('aria-label', 'Pause video'));
    // player.on('pause', () => dom.videoFocusTarget.setAttribute('aria-label', 'Play video'));
    player.on('ended', () => {
      // dom.videoFocusTarget.setAttribute('aria-label', 'Play video'); // [COMMENTED OUT]
      if (areAllAnswered()) {
        openSummary(dom, player);
      }
    });

    setInterval(() => {
      player.getCurrentTime().then(currentTime => {
        if (getIsAnswering()) { player.pause(); return; }
        const mode = getMode();
        if (mode === 'start' || mode === 'summary' || mode === 'debrief' || mode === 'review') return;

        passTimeToStoryline(currentTime);
        checkForQuestions(currentTime, dom, player);
      }).catch(() => {});
    }, UPDATE_MS);

    resumeFromSaved(dom, player, saved);
  });
}

// ─── Resume from saved Storyline progress ─────────────────────────────────────
//
// Attempt/group state (usedCases/groupStatus/attempts/pendingAction/pendingCase)
// and the active case were already seeded in init(). This step only restores the
// submitted answers and re-opens the right screen. `saved` is the fully-validated
// payload (or null for a fresh group entry → normal start with the overlay shown).
//
// saved.stage === 'debrief' disambiguates "stopped on a non-final Debrief with
// Try Again pending" from "stopped on Summary before the final submit" — both
// are areAllAnswered() && !saved.done, but need different resume targets.

function resumeFromSaved(dom, player, saved) {
  if (!saved) return;   // fresh group entry — normal start, overlay stays visible
  try {
    const hasAnswers = saved.answers && Object.keys(saved.answers).length > 0;
    if (hasAnswers && !restoreState(saved.answers)) return;   // bad payload, abort restore
    if (!hasAnswers) return;   // nothing to restore beyond the attempt count — normal start

    passAnswerCountToStoryline();
    hideStartOverlay(dom);

    if (saved.done || (areAllAnswered() && saved.stage === 'debrief')) {
      openDebrief(dom, player);                    // finalized, or retry-pending debrief
    } else if (areAllAnswered()) {
      openSummary(dom, player);                     // stopped on Summary
    } else {
      resumeToLastQuestion(dom, player);            // stopped mid-way
    }
  } catch (_) {
    // On any failure leave the start overlay visible and mode='start' (normal start).
    // Do NOT resetForReplay here — it would set mode='playing' and wipe answers.
  }
}

function resumeToLastQuestion(dom, player) {
  let last = -1;
  getQuestions().forEach((_, i) => { if (isAnswered(i)) last = i; });
  if (last < 0) return;

  openQuestionNormal(last, dom, player);   // mode='question', isAnswering=true, pre-fills answer

  // Lock the trigger engine while the seek is in flight (mirrors watchSectionAgain).
  setIsPausing(true);
  player.setCurrentTime(getQuestions()[last].time)
    .then(() => setIsPausing(false))
    .catch(() => setIsPausing(false));
}

// ─── Storyline integration ────────────────────────────────────────────────────

function passTimeToStoryline(currentTime) {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (sl) sl.SetVar(VAR_NAME, Math.round(currentTime * 10) / 10);
  } catch (_) {}
}

function passAnswerCountToStoryline() {
  try {
    const sl    = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    const count = getQuestions().filter((_, i) => isAnswered(i)).length;
    if (sl) sl.SetVar('AnsweredCount', count);
  } catch (_) {}
}

function notifyStorylineFail() {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (sl) sl.SetVar('Fail', true);
  } catch (_) {}
}

// Per-group pass flag. When this group is passed, set its Boolean slide variable
// true so Storyline can react. Mapping: group N → Scene_4_Slide_(3 + N)
//   group 1 → Scene_4_Slide_4 … group 4 → Scene_4_Slide_7.
function notifyStorylineGroupPass() {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (sl) sl.SetVar('Scene_4_Slide_' + (Number(CASE_GROUP) + 3), true);
  } catch (_) {}
}

// Navigation signal — a single cross-cutting Text variable (Final_Test_Nav) that
// Storyline watches to jump to the next slide. Set only when the learner clicks
// the Debrief's action button, never on debrief open, so the learner sees the
// result first. Case switching (newCase) is handled internally now (no signal).
// Tokens:
//   passGroup      → "group<n+1>"      (e.g. "group2") → enter the next group
//   courseComplete → "complete"        → course-complete slide
//   failCourse     → "fail"            → course-failure slide
function setNavSignal(action) {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (!sl) return;
    let token = '';
    if      (action === 'passGroup')      token = 'group' + (Number(CASE_GROUP) + 1);
    else if (action === 'courseComplete') token = 'complete';
    else if (action === 'failCourse')     token = 'fail';
    if (token) sl.SetVar(NAV_VAR, token);
  } catch (_) {}
}

// ─── Case / group outcome decision ───────────────────────────────────────────
//
// Mirrors the spec's submitCaseResult/loadNewCase/passCurrentGroup logic. Only
// called for a genuine new attempt; sets pendingAction/pendingCase + mutates
// groupStatus/usedCases. Navigation itself is deferred to the Debrief button.

function computeOutcome(passed) {
  if (passed) {
    groupStatus   = 'passed';
    pendingAction = (Number(CASE_GROUP) >= 4) ? 'courseComplete' : 'passGroup';
    pendingCase   = null;
    return;
  }
  if (attemptCount < MAX_ATTEMPTS) {
    pendingAction = 'retry';           // more attempts remain on this case
    pendingCase   = null;
    return;
  }
  // Case exhausted (all 3 attempts failed).
  if (!usedCases.includes(currentCase)) usedCases.push(currentCase);
  if (usedCases.length >= MAX_CASES) {
    groupStatus   = 'failed';          // 3 different cases each failed → group/course failed
    pendingAction = 'failCourse';
    pendingCase   = null;
  } else {
    pendingCase   = pickNextCase();    // hand off a different unused case
    pendingAction = 'newCase';
  }
}

// Random unused case letter from this group (universe minus usedCases).
function pickNextCase() {
  const remaining = GROUP_CASES.filter(c => !usedCases.includes(c));
  if (!remaining.length) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

// Map a pendingAction to the render outcome the Debrief uses.
function outcomeFromAction(action, passed) {
  if (action === 'passGroup' || action === 'courseComplete') return 'passed';
  if (action === 'newCase')    return 'newCase';
  if (action === 'failCourse') return 'failCourse';
  if (action === 'retry')      return 'retry';
  // Fallback for a resumed payload without an action.
  if (passed) return 'passed';
  return attemptCount >= MAX_ATTEMPTS ? 'failCourse' : 'retry';
}

// ─── Save / restore progress via Final_Test_Case_Study_<1-4> ─────────────────
//
// Persists the WHOLE group's state into a single Storyline Text variable (one of
// 4, chosen by CASE_VAR/CASE_GROUP) as JSON (schema v2):
// { v:2, n:<questionCount>, currentCase:<letter>, usedCases:[...], groupStatus,
//   attempts:<attemptCount>, answers:{ index: optionText }, done:<terminal?>,
//   stage:<'debrief'|null>, nextAction, nextCase }
// currentCase lets a freshly-navigated case tell itself apart from a resume of
// the same case; usedCases/groupStatus carry the cross-case progress.

function saveProgress(done, stage = null, extra = {}) {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (!sl) return;
    const answers = {};
    getQuestions().forEach((q, i) => {
      const a = getAnsweredAnswer(i);
      if (a) answers[i] = a.text;
    });
    sl.SetVar(CASE_VAR, JSON.stringify({
      v: 2,
      n: getQuestions().length,
      currentCase,
      usedCases,
      groupStatus,
      attempts: attemptCount,
      answers,
      done: Boolean(done),
      stage,
      nextAction: extra.nextAction ?? null,
      nextCase:   extra.nextCase   ?? null,
    }));
  } catch (_) {}
}

// Raw read of the group's save variable. Only guarantees the schema version;
// the per-case question-count (n) check is deferred to init() because it can
// only be validated once the saved case's questions are actually loaded.
function readSavedRaw() {
  try {
    const sl = window.parent?.GetPlayer?.() ?? window.top?.GetPlayer?.();
    if (!sl) return null;
    const raw = sl.GetVar(CASE_VAR);
    if (typeof raw !== 'string' || raw.trim() === '') return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 2) return null;
    return data;
  } catch (_) {
    return null;
  }
}

// Resolve each saved option .text back to its option object and commit via
// submitAnswer. Validates every entry before mutating so a bad payload never
// leaves state half-restored. Returns true on success, false if anything failed.
function restoreState(answers) {
  const qs = getQuestions();
  const entries = Object.entries(answers).map(([k, text]) => {
    const i   = Number(k);
    const opt = qs[i]?.options?.find(o => o.text === text);
    return opt ? [i, opt] : null;
  });
  if (entries.some(e => e === null)) return false;
  entries.forEach(([i, opt]) => submitAnswer(i, opt));
  return true;
}

// ─── Question trigger ─────────────────────────────────────────────────────────

function checkForQuestions(currentTime, dom, player) {
  if (getIsPausing() || getIsAnswering()) return;

  const hit = findTriggeredQuestion(currentTime);
  if (!hit) return;
  console.log('[q] Triggering Q' + (hit.index + 1) + ' at t=' + currentTime.toFixed(2) + 's'
    + (isLockedAnswer(hit.index) ? ' [review/locked]' : ''));

  setIsPausing(true);
  player.pause()
    .then(() => player.setCurrentTime(hit.question.time))
    .then(() => {
      if (isLockedAnswer(hit.index)) {
        // All questions answered + this one done → readonly review mode
        openQuestionReview(hit.index, dom, player);
      } else {
        // Not all done yet → user can re-select and re-submit
        openQuestionNormal(hit.index, dom, player);
      }
      setIsPausing(false);
    })
    .catch(() => setIsPausing(false));
}

// ─── Open question — normal mode (first answering) ────────────────────────────

function openQuestionNormal(index, dom, player) {
  const question = getQuestions()[index];
  if (!question) return;

  // Set "Question X" primary heading
  if (dom.questionNumber) {
    const sheet = getQuestions()[index]?.sheet ?? '';
    dom.questionNumber.textContent = sheet || `Question ${index + 1}`;
  }

  setCurrentIndex(index);
  setIsAnswering(true);
  setMode('question');

  setBackgroundHidden(dom, true);
  dom.questionOverlay.classList.remove('hidden');
  dom.questionOverlay.removeAttribute('aria-hidden');
  dom.watchAgainBtn.classList.remove('hidden');

  const previousAnswer = getPreviousAnswer(index);

  renderQuestion(question, dom, previousAnswer, (ans) => {
    setSelectedAnswer(index, ans);
    dom.submitBtn.disabled = false;
  }, { mode: 'normal' });
}

// ─── Open question — review mode (from Debrief) ───────────────────────────────

function openQuestionReview(index, dom, player) {
  const question = getQuestions()[index];
  if (!question) return;

  // Set "Question X" primary heading
  if (dom.questionNumber) {
    const sheet = getQuestions()[index]?.sheet ?? '';
    dom.questionNumber.textContent = sheet || `Question ${index + 1}`;
  }

  setCurrentIndex(index);
  setMode('review');

  // Seek video to question timecode (background preview)
  player.setCurrentTime(question.time).catch(() => {});

  hideDebrief(dom.debriefOverlay);
  setBackgroundHidden(dom, true);
  dom.questionOverlay.classList.remove('hidden');
  dom.questionOverlay.removeAttribute('aria-hidden');
  dom.watchAgainBtn.classList.remove('hidden');

  const userAnswer = getAnsweredAnswer(index);

  renderQuestion(question, dom, userAnswer, null, {
    mode: 'review',
    onReturnToDebrief: () => returnToDebrief(dom, player),
  });
}

// ─── Return to Debrief from review ───────────────────────────────────────────

function returnToDebrief(dom, player) {
  dom.questionOverlay.classList.add('hidden');
  dom.questionOverlay.setAttribute('aria-hidden', 'true');
  setBackgroundHidden(dom, false);

  // No dismissQuestion here — player isn't running in review mode,
  // so no re-trigger risk. Keeping _dismissedIndex clean lets
  // "Watch Section Again" work correctly if user goes there next.
  setMode('debrief');

  openDebrief(dom, player);
}

// ─── Summary (pre-debrief) ────────────────────────────────────────────────────

function openSummary(dom, player) {
  setMode('summary');
  setSummaryEditActive(false);
  clearWatchAgainBroadcast();
  player.pause().catch(() => {});

  setBackgroundHidden(dom, true);
  dom.questionOverlay.classList.add('hidden');
  dom.questionOverlay.setAttribute('aria-hidden', 'true');

  renderSummary(dom.summaryOverlay, getAllResults(), {
    onQuestionClick: (index) => openQuestionFromSummary(index, dom, player),
    onSeeResults:    ()      => openDebrief(dom, player, { isNewAttempt: true }),
  });
}

function openQuestionFromSummary(index, dom, player) {
  setSummaryEditActive(true);
  hideSummary(dom.summaryOverlay);
  openQuestionNormal(index, dom, player);
}

// ─── Debrief ──────────────────────────────────────────────────────────────────

function openDebrief(dom, player, opts = {}) {
  setMode('debrief');
  clearWatchAgainBroadcast();
  player.pause().catch(() => {});

  hideSummary(dom.summaryOverlay);
  setBackgroundHidden(dom, true);
  dom.questionOverlay.classList.add('hidden');

  // Only count as a new attempt when arriving fresh from Summary's "Submit
  // Answers". Reviewing a question and returning to Debrief, or resuming a
  // saved session, must NOT increment the counter or re-decide the outcome.
  if (opts.isNewAttempt) {
    attemptCount += 1;
  }

  const results = getAllResults();
  const correct = results.filter(r => r.isCorrect).length;
  const pct     = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
  const passed  = pct >= PASSING_SCORE;

  if (opts.isNewAttempt) {
    // Decide case/group/course outcome once per real attempt, then persist it.
    computeOutcome(passed);
    // Flag the Storyline outcome as soon as it is decided (learner still sees the
    // result first — these set variables, they do not navigate).
    if (passed)                         notifyStorylineGroupPass();   // group passed → Scene_4_Slide_N
    if (pendingAction === 'failCourse') notifyStorylineFail();        // course failed → Fail
    saveProgress(pendingAction !== 'retry', 'debrief',
      { nextAction: pendingAction, nextCase: pendingCase });
  }

  const outcome = outcomeFromAction(pendingAction, passed);

  renderDebrief(dom.debriefOverlay, results, {
    onQuestionClick: (index) => openQuestionReview(index, dom, player),
    attemptCount,
    outcome,
    onRestart: () => restartActivity(dom, player),   // retry same case (in-JS)
    onAdvance: () => handleAdvance(dom, player),      // newCase = in-JS swap; others = Storyline nav
  });
}

// ─── Advance from Debrief (action button) ─────────────────────────────────────
//
// 'newCase' is now handled entirely in-JS (swap to another case in this same
// player). The group-level transitions still hand off to Storyline via the nav
// signal.

function handleAdvance(dom, player) {
  if (pendingAction === 'newCase') {
    startNewCase(dom, player);
  } else {
    setNavSignal(pendingAction);   // passGroup / courseComplete / failCourse
  }
}

// ─── Next Case (in-JS) ────────────────────────────────────────────────────────
//
// Swap this player to a different, unused case: load its questions + video in
// place, reset the attempt counter, and start playing from 0. No page reload and
// no Storyline slide jump.

function startNewCase(dom, player) {
  const nextLetter = pendingCase || pickNextCase();
  if (!nextLetter) { setNavSignal('failCourse'); return; }   // safety: nothing left to hand out

  if (!usedCases.includes(nextLetter)) usedCases.push(nextLetter);
  attemptCount  = 0;
  pendingAction = null;
  pendingCase   = null;

  hideDebrief(dom.debriefOverlay);
  setBackgroundHidden(dom, false);
  resetForReplay();
  loadCaseData(nextLetter, dom);   // sets currentCase, re-seeds questions, updates badge
  setMode('playing');
  saveProgress(false);             // persist the new active case + cleared answers

  // Swap the video in place, then restart from the top.
  const caseObj = getCaseByLetter(nextLetter);
  player.loadVideo(Number(pickVideoId(caseObj)))
    .then(() => player.setCurrentTime(0))
    .then(() => player.play())
    .catch(() => { player.play().catch(() => {}); });

  requestAnimationFrame(() => dom.frameSentinel.focus());
}

// ─── Restart (Try Again) ──────────────────────────────────────────────────────

function restartActivity(dom, player) {
  hideDebrief(dom.debriefOverlay);
  setBackgroundHidden(dom, false);
  resetForReplay();
  setMode('playing');
  saveProgress(false);   // clear answers/stage in storage, keep attemptCount

  player.setCurrentTime(0).then(() => player.play());
  requestAnimationFrame(() => dom.frameSentinel.focus());
}

// ─── Replay video ─────────────────────────────────────────────────────────────

function replayVideo(dom, player) {
  hideDebrief(dom.debriefOverlay);
  setBackgroundHidden(dom, false);
  resetForReplay();   // clears answers + mode so questions trigger again

  player.setCurrentTime(0).then(() => player.play());
  // requestAnimationFrame(() => dom.videoFocusTarget.focus()); // [COMMENTED OUT]
  requestAnimationFrame(() => dom.frameSentinel.focus());
}

// ─── Submit ───────────────────────────────────────────────────────────────────

function handleSubmit(dom, player) {
  if (getMode() !== 'question') return;
  const index  = getCurrentIndex();
  const answer = getPreviousAnswer(index);
  if (!answer) return;

  submitAnswer(index, answer);
  passAnswerCountToStoryline();
  saveProgress(false);

  // If this question chains to another, open it immediately
  const chainToId = getQuestions()[index]?.chainTo;
  if (chainToId) {
    const chainIndex = getQuestions().findIndex(q => q.id === chainToId);
    if (chainIndex >= 0) {
      openQuestionNormal(chainIndex, dom, player);
      return;
    }
  }

  // If this was the last question → open Summary screen
  if (areAllAnswered()) {
    dismissQuestion(index);
    closeOverlay();
    openSummary(dom, player);
  } else {
    continueVideo(dom, player);
  }
}

// ─── Continue / close question overlay ───────────────────────────────────────

function continueVideo(dom, player) {
  const index = getCurrentIndex();   // capture before closeOverlay resets it

  dom.questionOverlay.classList.add('hidden');
  dom.questionOverlay.setAttribute('aria-hidden', 'true');
  setBackgroundHidden(dom, false);

  if (index >= 0) dismissQuestion(index);  // suppress re-trigger inside same window
  closeOverlay();
  setMode('playing');
  player.play();

  // requestAnimationFrame(() => dom.videoFocusTarget.focus()); // [COMMENTED OUT]
  requestAnimationFrame(() => dom.frameSentinel.focus());
}

// ─── Watch section again ──────────────────────────────────────────────────────

function watchSectionAgain(dom, player) {
  const index     = getCurrentIndex();
  const startTime = getWatchAgainStartTime(index);

  dom.questionOverlay.classList.add('hidden');
  dom.questionOverlay.setAttribute('aria-hidden', 'true');
  setBackgroundHidden(dom, false);

  // Tell the trigger engine that this specific question must re-fire
  // even if allDone (covers the case where user comes from debrief review).
  setWatchAgainIndex(index);
  // Clear dismissed suppression so the question isn't blocked.
  clearDismissed();
  closeOverlay();   // resets _isPausing → false, _isAnswering → false
  setMode('playing');

  // Lock the trigger engine while the seek is in flight.
  // Without this the poller fires on the old timecode (still inside the
  // question's trigger window) and immediately re-opens the overlay.
  // The lock is released only after setCurrentTime resolves, i.e. once
  // the player's reported time has actually moved to startTime.
  setIsPausing(true);
  player.setCurrentTime(startTime)
    .then(() => {
      setIsPausing(false);    // unlock — safe to trigger questions again
      return player.play();
    })
    .catch(() => {
      setIsPausing(false);    // always release, even on error
      player.play().catch(() => {});
    });

  // requestAnimationFrame(() => dom.videoFocusTarget.focus()); // [COMMENTED OUT]
  requestAnimationFrame(() => dom.frameSentinel.focus());
}

// ─── Keyboard navigation ──────────────────────────────────────────────────────

function handleKeyboardNavigation(e, dom, player) {
  const mode = getMode();

  if (mode === 'review') {
    if (e.key === 'Escape') returnToDebrief(dom, player);
    return;
  }

  if (!getIsAnswering()) return;

  if (e.key === 'Escape' && !dom.continueBtn.classList.contains('hidden')) {
    continueVideo(dom, player);
  }
  if (e.key === 'Enter' && document.activeElement === dom.submitBtn && !dom.submitBtn.disabled) {
    handleSubmit(dom, player);
  }
  if (e.key === 'Enter' && document.activeElement === dom.continueBtn) {
    continueVideo(dom, player);
  }
}

// ─── Fullscreen ───────────────────────────────────────────────────────────────

function toggleFullscreen(wrapper) {
  const isFs = document.fullscreenElement === wrapper
            || document.webkitFullscreenElement === wrapper;
  if (!isFs) {
    (wrapper.requestFullscreen?.() ?? wrapper.webkitRequestFullscreen?.())
      ?.catch(err => console.error('Fullscreen error:', err));
  } else {
    (document.exitFullscreen?.() ?? document.webkitExitFullscreen?.())
      ?.catch(err => console.error('Exit fullscreen error:', err));
  }
}

function updateFullscreenButton(dom) {
  const isFs = Boolean(document.fullscreenElement ?? document.webkitFullscreenElement);
  dom.fullscreenBtn.setAttribute('aria-label',   isFs ? 'Exit fullscreen' : 'Enter fullscreen');
  dom.fullscreenBtn.setAttribute('aria-pressed', String(isFs));
}

// ─── Helper: toggle background visibility + focus trap ────────────────────────
//
// When an overlay (question / debrief) is open:
//   - aria-hidden  removes background elements from the screen-reader tree
//   - tabindex="-1" removes them from the keyboard Tab cycle (focus trap)
//
// When the overlay closes, both are restored. videoFocusTarget is only
// returned to tabindex="0" if the activity has already started (i.e. the
// start overlay has been dismissed).

function setBackgroundHidden(dom, hidden) {
  if (hidden) {
    dom.iframe.setAttribute('aria-hidden', 'true');
    dom.iframe.setAttribute('tabindex', '-1');        // exclude from Tab while overlay open
    // dom.videoFocusTarget.setAttribute('tabindex', '-1'); // [COMMENTED OUT]
    dom.frameSentinel.setAttribute('tabindex', '-1');
    // fullscreenBtn stays tabbable — z-index 1001 keeps it above the overlay
  } else {
    dom.iframe.removeAttribute('aria-hidden');
    dom.iframe.removeAttribute('tabindex');           // restore to natural tabbable state
    // [COMMENTED OUT] videoFocusTarget tabindex restore
    // if (dom.startOverlay.classList.contains('hidden')) {
    //   dom.videoFocusTarget.setAttribute('tabindex', '0');
    // }
    if (dom.startOverlay.classList.contains('hidden')) {
      dom.frameSentinel.setAttribute('tabindex', '0');
    }
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
