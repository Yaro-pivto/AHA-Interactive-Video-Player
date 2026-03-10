/**
 * stateManager.js
 * Manages all runtime state for the interactive player.
 * No DOM access — pure logic only.
 */

// ─── Internal state ───────────────────────────────────────────────────────────

let _questions      = [];   // Full questions array loaded from Questions.js
let _currentIndex   = -1;  // Index of the question currently being shown (-1 = none)
let _answeredMap    = {};  // { questionIndex: answerObject } — submitted answers
let _selectedMap    = {};  // { questionIndex: answerObject } — pending (pre-submit) selections
let _isPausing      = false; // True while the player is mid-pause sequence
let _isAnswering    = false; // True while the question overlay is open
let _dismissedIndex = -1;  // Index of the last question that was dismissed (closed/submitted).
                            // Suppresses re-trigger while the playhead is still inside
                            // the same trigger window. Cleared when playhead leaves the window.
let _watchAgainIndex = -1; // When set, forces this question to re-trigger even if allDone.
                            // Used by "Watch Section Again" from review mode.

/**
 * Player mode:
 *   "start"    — start screen visible, activity not yet begun
 *   "playing"  — video running normally
 *   "question" — question overlay visible, first-time answering
 *   "review"   — question overlay visible, reviewing a past answer (from debrief)
 *   "debrief"  — debrief screen visible after video ends
 */
let _mode = 'start';

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Initialise state with the questions array.
 * @param {Array} questions
 */
export function initState(questions) {
  _questions       = questions;
  _currentIndex    = -1;
  _answeredMap     = {};
  _selectedMap     = {};
  _isPausing       = false;
  _isAnswering     = false;
  _dismissedIndex  = -1;
  _watchAgainIndex = -1;
  _mode            = 'start';
}

// ─── Mode ─────────────────────────────────────────────────────────────────────

export function getMode()         { return _mode; }
export function setMode(mode)     { _mode = mode; }

// ─── Questions ────────────────────────────────────────────────────────────────

export function getQuestions()          { return _questions; }
export function getQuestion(index)      { return _questions[index] ?? null; }
export function getCurrentQuestion()    { return _questions[_currentIndex] ?? null; }
export function getCurrentIndex()       { return _currentIndex; }
export function setCurrentIndex(index) { _currentIndex = index; }

// ─── Answers ──────────────────────────────────────────────────────────────────

/** Record a pending (pre-submit) selection */
export function setSelectedAnswer(index, answer) {
  _selectedMap[index] = answer;
}

/** Confirm and store the submitted answer */
export function submitAnswer(index, answer) {
  _answeredMap[index] = answer;
}

/** Has this question been submitted? */
export function isAnswered(index) {
  return Boolean(_answeredMap[index]);
}

/** Return previously submitted answer object, or null */
export function getAnsweredAnswer(index) {
  return _answeredMap[index] ?? null;
}

/** Return pending selection (pre-submit), or null */
export function getSelectedAnswer(index) {
  return _selectedMap[index] ?? null;
}

/**
 * Get whichever answer was last touched for this question
 * (submitted takes priority over pending).
 */
export function getPreviousAnswer(index) {
  return _answeredMap[index] ?? _selectedMap[index] ?? null;
}

// ─── userAnswers / results ────────────────────────────────────────────────────

/**
 * Returns a result object for the given question index:
 * {
 *   question,        // question object
 *   userAnswer,      // the answer object the user submitted (or null)
 *   isCorrect,       // boolean
 *   correctOption,   // the correct option object
 * }
 * @param {number} index
 */
export function getQuestionResult(index) {
  const question     = _questions[index] ?? null;
  const userAnswer   = _answeredMap[index] ?? null;
  const correctOption = question?.options?.find(o => o.correct) ?? null;
  const isCorrect    = userAnswer != null && userAnswer.text === correctOption?.text;

  return { question, userAnswer, isCorrect, correctOption };
}

/**
 * Returns result objects for ALL questions.
 * @returns {Array}
 */
export function getAllResults() {
  return _questions.map((_, i) => getQuestionResult(i));
}

/**
 * True when every question has a submitted answer.
 */
export function areAllAnswered() {
  return _questions.length > 0
    && _questions.every((_, i) => Boolean(_answeredMap[i]));
}

// ─── Flow flags ───────────────────────────────────────────────────────────────

export function getIsPausing()      { return _isPausing; }
export function setIsPausing(val)   { _isPausing = val; }
export function getIsAnswering()    { return _isAnswering; }
export function setIsAnswering(val) { _isAnswering = val; }

// ─── Navigation helpers ───────────────────────────────────────────────────────

/**
 * Find the question whose timecode the seekbar has just reached.
 *
 * Rules:
 *  - A question triggers when currentTime enters the window
 *    [q.time - 0.3, q.time + 0.5).
 *  - Only one question triggers at a time — the one whose timecode
 *    is closest to (and ≤) currentTime.
 *  - If the question was already answered AND all questions are done
 *    → do NOT re-trigger (debrief handles that case).
 *  - If the question was already answered but NOT all done
 *    → still trigger so user can change their answer (re-answerable).
 *  - If the question was NOT answered → always trigger.
 *
 * @param {number} currentTime  seconds
 * @returns {{ index: number, question: object } | null}
 */
export function findTriggeredQuestion(currentTime) {
  const allDone = _questions.length > 0
    && _questions.every((_, i) => Boolean(_answeredMap[i]));

  // If there's a dismissed question, check whether the playhead has left its
  // window yet. If it has, clear the suppression so the question can
  // trigger again on the next pass (e.g. after "Watch Section Again").
  if (_dismissedIndex >= 0) {
    const dq   = _questions[_dismissedIndex];
    const dLow = dq.time - 0.3;
    const dHigh = dq.time + 0.5;
    if (currentTime < dLow || currentTime >= dHigh) {
      // Playhead left the window → allow re-trigger in future
      _dismissedIndex = -1;
    } else {
      // Still inside the same window → suppress
      return null;
    }
  }

  // Find the question whose window currentTime is currently inside
  for (let i = 0; i < _questions.length; i++) {
    const q    = _questions[i];
    const low  = q.time - 0.3;
    const high = q.time + 0.5;

    if (currentTime >= low && currentTime < high) {
      // Already answered + all done → normally skip (debrief handles it).
      // Exception: user explicitly clicked "Watch Section Again" for this question.
      if (_answeredMap[i] && allDone && i !== _watchAgainIndex) return null;
      // Once triggered, clear the watch-again override
      if (i === _watchAgainIndex) _watchAgainIndex = -1;
      return { index: i, question: q };
    }
  }
  return null;
}

/**
 * True when this question has been submitted AND all questions are done.
 * Used to decide whether to show re-answerable overlay or readonly review.
 */
export function isLockedAnswer(index) {
  const allDone = _questions.length > 0
    && _questions.every((_, i) => Boolean(_answeredMap[i]));
  return Boolean(_answeredMap[index]) && allDone;
}

/**
 * Return the seek-back target when the user clicks "Watch Section Again".
 *
 * Seeks to 0.1 s AFTER the previous question's trigger window closes,
 * so the previous question's overlay is never re-opened on seek.
 *
 * Trigger window: [prevTime − 0.3, prevTime + 0.5)
 * Window end:      prevTime + 0.5
 * Seek target:     prevTime + 0.6   (0.1 s past window end)
 *
 *   prevTime = 5  → 5.6 s  ✓
 *   prevTime = 10 → 10.6 s ✓
 *   prevTime = 30 → 30.6 s ✓
 *
 * For Q1 (no previous question) → seeks to 0.
 *
 * @param {number} currentIndex
 * @returns {number} seconds
 */
export function getWatchAgainStartTime(currentIndex) {
  if (currentIndex <= 0) return 0;
  const prevTime = _questions[currentIndex - 1]?.time ?? 0;
  return prevTime + 0.6;
}

/**
 * Mark a question as dismissed so it won't re-trigger while the playhead
 * is still inside its trigger window. Call this whenever an overlay is closed.
 * @param {number} index  The question index that was just closed.
 */
export function dismissQuestion(index) {
  _dismissedIndex = index;
}

/**
 * Clear the dismissed suppression immediately — used when the user
 * intentionally seeks back (Watch Section Again) so the question
 * must re-trigger when the playhead arrives at it.
 */
export function clearDismissed() {
  _dismissedIndex = -1;
}

/**
 * Allow a specific already-answered question to re-trigger even when allDone.
 * Call this when the user clicks "Watch Section Again" from review mode.
 * @param {number} index
 */
export function setWatchAgainIndex(index) {
  _watchAgainIndex = index;
}

/**
 * Reset flow flags when closing the overlay (without resetting answer history).
 */
export function closeOverlay() {
  _currentIndex = -1;
  _isAnswering  = false;
  _isPausing    = false;
}

/**
 * Full reset — clears all answers and state for replay.
 */
export function resetForReplay() {
  _currentIndex    = -1;
  _answeredMap     = {};
  _selectedMap     = {};
  _isPausing       = false;
  _isAnswering     = false;
  _dismissedIndex  = -1;
  _watchAgainIndex = -1;
  _mode            = 'playing';
}
