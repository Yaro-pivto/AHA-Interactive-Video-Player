/**
 * summaryRenderer.js
 * Builds the pre-debrief Summary screen.
 * Shows each question with the user's selected point value.
 * No correct/incorrect indication — purely for review before final results.
 */

// ─── renderSummary ────────────────────────────────────────────────────────────

export function renderSummary(summaryOverlay, results, { onQuestionClick, onSeeResults }) {
  const pointsScored = results.reduce((sum, r) => {
    const text = r.userAnswer?.text ?? '0';
    const val  = text === 'UN' ? 0 : (parseInt(text, 10) || 0);
    return sum + val;
  }, 0);

  const pointsEl = summaryOverlay.querySelector('#summaryPoints');
  if (pointsEl) pointsEl.textContent = `Points Scored: ${pointsScored}`;

  const list = summaryOverlay.querySelector('#summaryList');
  if (list) {
    list.innerHTML = '';
    results.forEach((result, index) => {
      list.appendChild(buildSummaryListItem(result, index, () => onQuestionClick(index)));
    });
  }

  const submitBtn = summaryOverlay.querySelector('#summarySubmitBtn');
  if (submitBtn) {
    submitBtn.onclick = onSeeResults;
  }

  summaryOverlay.classList.remove('hidden');
  summaryOverlay.removeAttribute('aria-hidden');
  requestAnimationFrame(() => summaryOverlay.focus());
}

// ─── hideSummary ──────────────────────────────────────────────────────────────

export function hideSummary(summaryOverlay) {
  summaryOverlay.classList.add('hidden');
  summaryOverlay.setAttribute('aria-hidden', 'true');
}

// ─── buildSummaryListItem ─────────────────────────────────────────────────────

function buildSummaryListItem(result, index, onClick) {
  const userText = result.userAnswer?.text ?? '?';

  const li = document.createElement('li');
  li.className = 'summary-list__item';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'summary-question-btn';
  const sheet = result.question?.sheet ?? '';
  const label = sheet ? `Question ${index + 1}: ${sheet}` : `Question ${index + 1}`;
  btn.setAttribute('aria-label', `${label}: ${userText} points. Click to change.`);
  btn.addEventListener('click', onClick);

  const text = document.createElement('span');
  text.className   = 'summary-question-btn__text';
  text.textContent = label;

  const badge = document.createElement('span');
  badge.className   = 'summary-points-pill';
  badge.textContent = userText;
  badge.setAttribute('aria-hidden', 'true');

  const arrow = document.createElement('span');
  arrow.className   = 'summary-arrow';
  arrow.textContent = '›';
  arrow.setAttribute('aria-hidden', 'true');

  btn.appendChild(text);
  btn.appendChild(badge);
  btn.appendChild(arrow);
  li.appendChild(btn);
  return li;
}
