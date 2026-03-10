/**
 * questionRenderer.js
 * Pure DOM-building functions for the question overlay.
 * No state imports — receives question object and callbacks only.
 *
 * Supported modes:
 *   'normal'  — first-time answering; options interactive
 *   'review'  — readonly review from Debrief; shows feedback panel, no answer cards
 */

const RATIONALE_DEFAULT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod ' +
  'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
  'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

// ─── renderQuestion ───────────────────────────────────────────────────────────

export function renderQuestion(question, dom, previousAnswer, onSelect, {
  mode = 'normal',
  onReturnToDebrief = null,
} = {}) {
  dom.questionText.textContent = question.question;
  dom.answersContainer.innerHTML = '';
  // Clean up review-mode overrides from a previous render
  dom.answersContainer.classList.remove('answers--review');
  // Reset ARIA role — normal mode sets radiogroup, review mode leaves it absent
  dom.answersContainer.removeAttribute('role');
  dom.answersContainer.removeAttribute('aria-labelledby');
  dom.feedbackMessage.classList.add('hidden');
  // Remove any Return-to-Debrief button injected in a previous review render
  dom.submitBtn.closest('.question-submit-area')
    ?.querySelector('.return-to-debrief-btn')?.remove();

  if (mode === 'review') {
    _renderReviewMode(question, dom, previousAnswer, onReturnToDebrief);
  } else {
    _renderNormalMode(question, dom, previousAnswer, onSelect);
  }
}

// ─── _renderNormalMode ────────────────────────────────────────────────────────

function _renderNormalMode(question, dom, previousAnswer, onSelect) {
  dom.continueBtn.classList.add('hidden');
  dom.submitBtn.classList.remove('hidden');
  dom.submitBtn.disabled = !previousAnswer;
  if (dom.watchAgainBtn) dom.watchAgainBtn.classList.remove('hidden');

  const instrEl = document.getElementById('instructionText');
  if (instrEl) instrEl.textContent = 'Select an answer and press Submit to continue.';

  // Associate the radio group directly with the question text — WCAG 1.3.1.
  // role="radiogroup" (not generic "group") is the correct landmark for radio inputs.
  // Set here, on the element that directly wraps the inputs, not on a parent wrapper.
  dom.answersContainer.setAttribute('role', 'radiogroup');
  dom.answersContainer.setAttribute('aria-labelledby', 'questionText');

  renderOptions(question.options, dom.answersContainer, previousAnswer, onSelect, 'normal');

  // Focus the first answer radio so SR reads it in context of the radiogroup,
  // but suppress the visible focus ring until the user navigates with keyboard/mouse.
  requestAnimationFrame(() => {
    const firstRadio = dom.answersContainer.querySelector('input[type="radio"]');
    if (!firstRadio) { dom.questionOverlay.focus(); return; }

    // .focus-init silences :focus-visible via CSS (see styles.css).
    // Removed on the first interaction so the ring reappears normally.
    firstRadio.classList.add('focus-init');
    firstRadio.focus();

    const removeInit = () => firstRadio.classList.remove('focus-init');
    dom.answersContainer.addEventListener('keydown',   removeInit, { once: true });
    dom.answersContainer.addEventListener('mousedown', removeInit, { once: true });
  });
}

// ─── _renderReviewMode ────────────────────────────────────────────────────────

function _renderReviewMode(question, dom, userAnswer, onReturnToDebrief) {
  // Hide normal-mode controls; replay button stays visible (works same as initial screen)
  dom.submitBtn.classList.add('hidden');
  dom.continueBtn.classList.add('hidden');

  // Update helper subtitle
  const instrEl = document.getElementById('instructionText');
  if (instrEl) instrEl.textContent = 'Review your answer below. Press Escape to return to Debrief.';

  // ── Derive answer state ──────────────────────────────────────────────────
  const correctOption     = question.options.find(o => o.correct);
  const isCorrect         = Boolean(
    correctOption && userAnswer && userAnswer.text === correctOption.text
  );
  const userAnswerText    = userAnswer
    ? `${userAnswer.text} - ${userAnswer.description}`
    : 'No answer recorded';
  const correctAnswerText = correctOption
    ? `${correctOption.text} - ${correctOption.description}`
    : '';

  // Rationale: question-level field first, then default Lorem ipsum
  const rawRationale  = question.rationale?.trim() ?? '';
  const rationaleText = (rawRationale && rawRationale !== '<PASTE RATIONALE HERE>')
    ? rawRationale
    : RATIONALE_DEFAULT;

  // ── Replace answer grid with full-width feedback panel ──────────────────
  dom.answersContainer.classList.add('answers--review');
  dom.answersContainer.appendChild(
    buildReviewFeedbackPanel({ isCorrect, userAnswerText, correctAnswerText, rationaleText })
  );

  // ── Inject "Return to Debrief" button into the submit area ──────────────
  const submitArea = dom.submitBtn.closest('.question-submit-area');
  if (submitArea) {
    submitArea.appendChild(buildReturnToDebriefBtn(onReturnToDebrief));
  }

  // Focus the dialog itself so SR announces: "dialog → Question X → [question text]"
  // before the user navigates to the feedback panel content.
  requestAnimationFrame(() => dom.questionOverlay.focus());
}

// ─── renderOptions ────────────────────────────────────────────────────────────
// Still used in normal mode.

export function renderOptions(options, container, selectedAnswer, onSelect, mode = 'normal') {
  const isReview = mode === 'review';

  options.forEach((option, i) => {
    const isSelected = selectedAnswer && option.text === selectedAnswer.text;
    const isCorrect  = option.correct === true;

    const item = document.createElement('div');
    item.className = 'answer-item';

    if (isReview) {
      if (isSelected && isCorrect)  item.classList.add('option--selected', 'option--correct');
      else if (isSelected)          item.classList.add('option--selected', 'option--incorrect');
      else if (isCorrect)           item.classList.add('option--correctAnswer');
    }

    const radio = document.createElement('input');
    radio.type      = 'radio';
    radio.name      = 'answer';
    radio.id        = 'answer-' + i;
    radio.value     = option.text;
    radio.className = 'answer-radio';
    radio.checked   = Boolean(isSelected);
    if (isReview) radio.disabled = true;

    const label = document.createElement('label');
    label.htmlFor   = 'answer-' + i;
    label.className = 'answer-label';

    const circle = document.createElement('span');
    circle.className = 'answer-number';

    if (isReview) {
      if (isSelected && isCorrect) {
        circle.textContent = '✓';
        circle.classList.add('answer-number--correct');
      } else if (isSelected && !isCorrect) {
        circle.textContent = '✗';
        circle.classList.add('answer-number--incorrect');
      } else if (isCorrect) {
        circle.textContent = '✓';
        circle.classList.add('answer-number--correctAnswer');
      } else {
        circle.textContent = option.text;
      }
    } else {
      circle.textContent = option.text;
    }

    const desc = document.createElement('span');
    desc.className   = 'answer-description';
    desc.textContent = option.description;

    label.appendChild(circle);
    label.appendChild(desc);
    item.appendChild(radio);
    item.appendChild(label);

    if (!isReview && onSelect) {
      radio.addEventListener('change', () => {
        if (radio.checked) onSelect(option, radio);
      });
    }

    container.appendChild(item);
  });
}

// ─── showFeedback ─────────────────────────────────────────────────────────────

export function showFeedback(feedbackEl, text = 'Answer recorded') {
  feedbackEl.textContent = text;
  feedbackEl.className   = 'feedback-message';
  feedbackEl.classList.remove('hidden');
}

// ─── buildReviewFeedbackPanel ─────────────────────────────────────────────────

function buildReviewFeedbackPanel({ isCorrect, userAnswerText, correctAnswerText, rationaleText }) {
  const state = isCorrect ? 'correct' : 'incorrect';

  const panel = document.createElement('div');
  panel.className = `review-feedback-panel review-feedback-panel--${state}`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label',
    isCorrect ? 'Correct answer explanation' : 'Incorrect answer explanation'
  );
  panel.setAttribute('tabindex', '-1');

  // ── Top section: result message (centered) ────────────────────────────────
  const top = document.createElement('div');
  top.className = 'review-feedback-panel__top';

  if (isCorrect) {
    const headline = document.createElement('p');
    headline.className   = 'review-feedback-panel__headline';
    headline.textContent = 'Great Job!';
    top.appendChild(headline);

    const subline = document.createElement('p');
    subline.className   = 'review-feedback-panel__subline';
    subline.textContent = `You selected the correct answer: ${userAnswerText}`;
    top.appendChild(subline);
  } else {
    const subline1 = document.createElement('p');
    subline1.className   = 'review-feedback-panel__subline';
    subline1.textContent = `Your answer: ${userAnswerText}`;
    top.appendChild(subline1);

    const subline2 = document.createElement('p');
    subline2.className   = 'review-feedback-panel__subline';
    subline2.textContent = `The correct answer is ${correctAnswerText}.`;
    top.appendChild(subline2);
  }

  panel.appendChild(top);

  // ── Rationale section (left-aligned) ─────────────────────────────────────
  const rationaleWrap = document.createElement('div');
  rationaleWrap.className = 'review-feedback-panel__rationale';

  const rationaleHeading = document.createElement('p');
  rationaleHeading.className   = 'review-feedback-panel__rationale-heading';
  rationaleHeading.textContent = 'Rationale:';

  const rationaleBody = document.createElement('p');
  rationaleBody.className   = 'review-feedback-panel__rationale-body';
  rationaleBody.textContent = rationaleText;

  rationaleWrap.appendChild(rationaleHeading);
  rationaleWrap.appendChild(rationaleBody);
  panel.appendChild(rationaleWrap);

  return panel;
}

// ─── buildReturnToDebriefBtn ──────────────────────────────────────────────────

function buildReturnToDebriefBtn(onClick) {
  const btn = document.createElement('button');
  btn.type        = 'button';
  btn.className   = 'return-to-debrief-btn';
  btn.textContent = 'Return to Debrief';
  btn.setAttribute('aria-label', 'Return to the debrief summary screen');
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}
