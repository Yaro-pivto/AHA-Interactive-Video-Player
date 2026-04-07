/**
 * debriefRenderer.js
 * Builds and manages the Debrief screen shown after all questions are answered.
 * Pure DOM — no state imports.
 */

const PASSING_SCORE = 93; // percentage threshold for "You passed!"

// ─── renderDebrief ────────────────────────────────────────────────────────────

/**
 * Populate the debrief overlay with the results summary.
 *
 * @param {Element}  debriefOverlay   #debriefOverlay element
 * @param {Array}    results          Array of result objects from getAllResults()
 *                                   Each: { question, userAnswer, isCorrect, correctOption }
 * @param {object}   callbacks
 * @param {Function} callbacks.onQuestionClick(index)  — user clicks a question row
 */
export function renderDebrief(debriefOverlay, results, { onQuestionClick }) {
  // ── Score calculation ──────────────────────────────────────────────────────
  const correct = results.filter(r => r.isCorrect).length;
  const total   = results.length;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed  = pct >= PASSING_SCORE;

  // NIHSS learner score: sum of each user's selected answer value (UN = 0)
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

  // ── Result line ────────────────────────────────────────────────────────────
  const resultEl = debriefOverlay.querySelector('#debriefResult');
  if (resultEl) {
    resultEl.textContent = passed
      ? `You have scored ${pct}%. You passed!`
      : `You have scored ${pct}%. You haven't achieved the passing score.`;
  }

  // ── NIHSS score badges ─────────────────────────────────────────────────────
  const nihssEl = debriefOverlay.querySelector('#nihssScore');
  if (nihssEl) nihssEl.textContent = `Learner's Score: ${nihssTotal}`;

  const nihssCorrectEl = debriefOverlay.querySelector('#nihssCorrect');
  if (nihssCorrectEl) nihssCorrectEl.textContent = `Total Score: ${nihssCorrect}`;

  // ── Questions list ─────────────────────────────────────────────────────────
  const list = debriefOverlay.querySelector('#debriefList');
  if (list) {
    list.innerHTML = '';
    results.forEach((result, index) => {
      list.appendChild(buildQuestionListItem(result, index, () => onQuestionClick(index)));
    });
  }

  // ── Show overlay ───────────────────────────────────────────────────────────
  debriefOverlay.classList.remove('hidden');
  debriefOverlay.removeAttribute('aria-hidden');

  // Focus the dialog itself so SR announces: "dialog → Debrief"
  // before the user navigates to the question list.
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

  // Icon — check.svg for correct, cross.svg for incorrect
  const icon = document.createElement('img');
  icon.src       = `img/${isCorrect ? 'check' : 'cross'}.svg`;
  icon.alt       = '';
  icon.className = `debrief-icon-img debrief-icon-img--${state}`;
  icon.setAttribute('aria-hidden', 'true');

  // "Question N" label
  const text = document.createElement('span');
  text.className   = 'debrief-question-btn__text';
  text.textContent = label;

  // Status pill
  const badge = document.createElement('span');
  badge.className   = `debrief-badge debrief-badge--${state}`;
  badge.textContent = isCorrect ? 'Correct' : 'Incorrect';
  badge.setAttribute('aria-hidden', 'true');

  // Chevron
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
