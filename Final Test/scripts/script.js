/**
 * script.js
 * Orchestrator — wires Vimeo player, state, question renderer, debrief.
 * Runs in the browser as an ES module.
 */

import { QUESTIONS_DATA } from '../Questions.js';
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
const MAX_ATTEMPTS = 3;
const PASSING_SCORE = 90;

// ─── Attempt tracking ─────────────────────────────────────────────────────────

let attemptCount = 0;

// ─── DOM references ───────────────────────────────────────────────────────────

function resolveDom() {
  return {
    videoWrapper:     document.getElementById('videoWrapper'),
    iframe:           document.getElementById('vimeo'),
    fullscreenBtn:    document.getElementById('fullscreenBtn'),
    startOverlay:     document.getElementById('startOverlay'),
    startBtn:         document.getElementById('startBtn'),
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
  const dom    = resolveDom();
  const player = new Vimeo.Player(dom.iframe);

  loadQuestions();
  bindEvents(dom, player);
  startPlayer(dom, player);
}

function loadQuestions() {
  initState(QUESTIONS_DATA);
  console.log('✓ ' + getQuestions().length + ' questions loaded');
}

// ─── Start screen ─────────────────────────────────────────────────────────────

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

function startPlayer(dom, player) {
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
  });
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
    onSeeResults:    ()      => openDebrief(dom, player),
  });
}

function openQuestionFromSummary(index, dom, player) {
  setSummaryEditActive(true);
  hideSummary(dom.summaryOverlay);
  openQuestionNormal(index, dom, player);
}

// ─── Debrief ──────────────────────────────────────────────────────────────────

function openDebrief(dom, player) {
  setMode('debrief');
  clearWatchAgainBroadcast();
  player.pause().catch(() => {});

  hideSummary(dom.summaryOverlay);
  setBackgroundHidden(dom, true);
  dom.questionOverlay.classList.add('hidden');

  attemptCount += 1;

  // Notify Storyline on final failed attempt
  const results = getAllResults();
  const correct = results.filter(r => r.isCorrect).length;
  const pct     = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
  if (!( pct >= PASSING_SCORE ) && attemptCount >= MAX_ATTEMPTS) {
    notifyStorylineFail();
  }

  renderDebrief(dom.debriefOverlay, getAllResults(), {
    onQuestionClick: (index) => openQuestionReview(index, dom, player),
    attemptCount,
    onRestart: () => restartActivity(dom, player),
  });
}

// ─── Restart (Try Again) ──────────────────────────────────────────────────────

function restartActivity(dom, player) {
  hideDebrief(dom.debriefOverlay);
  setBackgroundHidden(dom, false);
  resetForReplay();
  setMode('playing');

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
