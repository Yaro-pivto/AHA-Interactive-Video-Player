/**
 * debriefRenderer.js  — Final Test version
 * Supports 3-attempt logic:
 *   - Failed attempt 1 or 2 → show score + NIHSS + attempt count + "Try Again" button
 *   - Failed attempt 3 OR passed → show full debrief with question list
 */

const PASSING_SCORE = 90;  // Final Test uses 90% threshold
const MAX_ATTEMPTS  = 3;

// ─── renderDebrief ────────────────────────────────────────────────────────────

export function renderDebrief(debriefOverlay, results, { onQuestionClick, attemptCount = 1, onRestart = null }) {
  // ── Score calculation ──────────────────────────────────────────────────────
  const correct  = results.filter(r => r.isCorrect).length;
  const total    = results.length;
  const pct      = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed   = pct >= PASSING_SCORE;
  const showFull = passed || attemptCount >= MAX_ATTEMPTS;

  // NIHSS learner score: sum of selected answer values (UN = 0)
  const nihssTotal = results.reduce((sum, r) => {
    const text = r.userAnswer?.text ?? '0';
    const val  = text === 'UN' ? 0 : (parseInt(text, 10) || 0);
    return sum + val;
  }, 0);

  // NIHSS correct score: sum of correct answer values
  const nihssCorrect = results.reduce((sum, r) => {
    const text = r.correctOption?.text ?? '0';
    const val  = text === 'UN' ? 0 : (parseInt(text, 10) || 0);
    return sum + val;
  }, 0);

  // ── Title + result line ────────────────────────────────────────────────────
  const titleEl = debriefOverlay.querySelector('#debriefTitle');
  if (titleEl) titleEl.textContent = passed ? 'Congratulations!' : 'Result';

  const resultEl = debriefOverlay.querySelector('#debriefResult');
  if (resultEl) {
    resultEl.textContent = passed
      ? `You have passed the case study with a score of ${pct}%.`
      : `You have scored ${pct}%. You haven't achieved the passing score.`;
  }

  // ── NIHSS score badges ─────────────────────────────────────────────────────
  const nihssEl = debriefOverlay.querySelector('#nihssScore');
  if (nihssEl) nihssEl.textContent = `Learner's Score: ${nihssTotal}`;

  const nihssCorrectEl = debriefOverlay.querySelector('#nihssCorrect');
  if (nihssCorrectEl) nihssCorrectEl.textContent = `Total Score: ${nihssCorrect}`;

  // ── Attempt info (only on non-final failed attempts) ──────────────────────
  const attemptEl = debriefOverlay.querySelector('#attemptInfo');
  if (attemptEl) {
    if (!showFull) {
      attemptEl.textContent = `Attempt ${attemptCount} of ${MAX_ATTEMPTS}`;
      attemptEl.classList.remove('hidden');
    } else {
      attemptEl.classList.add('hidden');
    }
  }

  // ── Try Again button ───────────────────────────────────────────────────────
  const restartBtn = debriefOverlay.querySelector('#restartBtn');
  if (restartBtn) {
    if (!showFull && onRestart) {
      restartBtn.classList.remove('hidden');
      restartBtn.onclick = onRestart;
    } else {
      restartBtn.classList.add('hidden');
    }
  }

  // ── Header gap modifier ────────────────────────────────────────────────────
  const headerEl = debriefOverlay.querySelector('.debrief-header');
  if (headerEl) headerEl.classList.toggle('debrief-header--no-list', !showFull);

  // ── Subtitle + question list — only on full debrief ────────────────────────
  const subtitleEl = debriefOverlay.querySelector('.debrief-subtitle');
  if (subtitleEl) subtitleEl.classList.toggle('hidden', !showFull);

  const listWrap = debriefOverlay.querySelector('.debrief-list-wrap');
  if (listWrap) listWrap.classList.toggle('hidden', !showFull);

  if (showFull) {
    const list = debriefOverlay.querySelector('#debriefList');
    if (list) {
      list.innerHTML = '';
      results.forEach((result, index) => {
        list.appendChild(buildQuestionListItem(result, index, () => onQuestionClick(index)));
      });
    }
  }

  // ── Show overlay ───────────────────────────────────────────────────────────
  debriefOverlay.classList.remove('hidden');
  debriefOverlay.removeAttribute('aria-hidden');
  requestAnimationFrame(() => debriefOverlay.focus());
}

// ─── hideDebrief ─────────────────────────────────────────────────────────────

export function hideDebrief(debriefOverlay) {
  debriefOverlay.classList.add('hidden');
  debriefOverlay.setAttribute('aria-hidden', 'true');
}

// ─── buildQuestionListItem ────────────────────────────────────────────────────

function buildQuestionListItem(result, index, onClick) {
  const { isCorrect } = result;
  const state = isCorrect ? 'correct' : 'incorrect';

  const li = document.createElement('li');
  li.className = 'debrief-list__item';

  const btn = document.createElement('button');
  btn.type      = 'button';
  btn.className = `debrief-question-btn debrief-question-btn--${state}`;
  const sheet = result.question?.sheet ?? '';
  const label = sheet ? `Question ${index + 1}: ${sheet}` : `Question ${index + 1}`;
  btn.setAttribute('aria-label',
    `${label}: ${isCorrect ? 'Correct' : 'Incorrect'}. Click to review.`
  );
  btn.addEventListener('click', onClick);

  const icon = document.createElement('img');
  icon.src       = `img/${isCorrect ? 'check' : 'cross'}.svg`;
  icon.alt       = '';
  icon.className = `debrief-icon-img debrief-icon-img--${state}`;
  icon.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className   = 'debrief-question-btn__text';
  text.textContent = label;

  const badge = document.createElement('span');
  badge.className   = `debrief-badge debrief-badge--${state}`;
  badge.textContent = isCorrect ? 'Correct' : 'Incorrect';
  badge.setAttribute('aria-hidden', 'true');

  const arrow = document.createElement('span');
  arrow.className   = 'debrief-arrow';
  arrow.textContent = '›';
  arrow.setAttribute('aria-hidden', 'true');

  btn.appendChild(icon);
  btn.appendChild(text);
  btn.appendChild(badge);
  btn.appendChild(arrow);
  li.appendChild(btn);
  return li;
}
