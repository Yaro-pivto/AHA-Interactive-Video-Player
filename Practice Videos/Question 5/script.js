// Question 5 data
var QUESTION = {
  text: "Based on what you see in the video, please score the patient accordingly.",
  options:   [
    {
      "text": "0",
      "description": "No visual loss",
      "correct": false,
      "rationale": "<PASTE RATIONALE HERE>"
    },
    {
      "text": "1",
      "description": "Partial hemianopia.",
      "correct": true,
      "rationale": ""
    },
    {
      "text": "2",
      "description": "Complete hemianopia.",
      "correct": false,
      "rationale": ""
    },
    {
      "text": "3",
      "description": "Bilaterial hemianopia (blind including cortical blindness)",
      "correct": false,
      "rationale": ""
    }
  ]
};

// ─── State ────────────────────────────────────────────────

var selectedAnswer = null;
var mode = 'start';
var player;

var iframe, videoWrapper, startOverlay, startBtn, questionOverlay,
    questionText, answersContainer, instructionText, submitBtn,
    watchAgainBtn, frameSentinel, fullscreenBtn;

document.addEventListener('DOMContentLoaded', function () {
  iframe           = document.getElementById('vimeo');
  videoWrapper     = document.getElementById('videoWrapper');
  startOverlay     = document.getElementById('startOverlay');
  startBtn         = document.getElementById('startBtn');
  questionOverlay  = document.getElementById('questionOverlay');
  questionText     = document.getElementById('questionText');
  answersContainer = document.getElementById('answersContainer');
  instructionText  = document.getElementById('instructionText');
  submitBtn        = document.getElementById('submitBtn');
  watchAgainBtn    = document.getElementById('watchAgainBtn');
  frameSentinel    = document.getElementById('frameSentinel');
  fullscreenBtn    = document.getElementById('fullscreenBtn');

  player = new Vimeo.Player(iframe);

  startBtn.addEventListener('click', startActivity);

  player.on('ended', function () {
    if (mode !== 'playing') return;
    showQuestion();
  });

  submitBtn.addEventListener('click', function () {
    if (!selectedAnswer || mode !== 'question') return;
    mode = 'feedback';
    showFeedback();
  });

  watchAgainBtn.addEventListener('click', watchAgain);

  fullscreenBtn.addEventListener('click', function () {
    var isFs = document.fullscreenElement === videoWrapper ||
               document.webkitFullscreenElement === videoWrapper;
    if (!isFs) {
      var req = videoWrapper.requestFullscreen || videoWrapper.webkitRequestFullscreen;
      if (req) req.call(videoWrapper).catch(function () {});
    } else {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document).catch(function () {});
    }
  });

  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      var isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      fullscreenBtn.setAttribute('aria-label',   isFs ? 'Exit fullscreen' : 'Enter fullscreen');
      fullscreenBtn.setAttribute('aria-pressed', String(isFs));
      requestAnimationFrame(function () { fullscreenBtn.focus(); });
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.activeElement === submitBtn && !submitBtn.disabled) {
      submitBtn.click();
    }
  });
});

function startActivity() {
  startOverlay.classList.add('hidden');
  startOverlay.setAttribute('aria-hidden', 'true');
  iframe.removeAttribute('tabindex');
  iframe.removeAttribute('aria-hidden');
  frameSentinel.setAttribute('tabindex', '0');
  mode = 'playing';
  player.play();
  requestAnimationFrame(function () { frameSentinel.focus(); });
}

function watchAgain() {
  questionOverlay.classList.add('hidden');
  questionOverlay.setAttribute('aria-hidden', 'true');
  iframe.removeAttribute('tabindex');
  iframe.removeAttribute('aria-hidden');
  frameSentinel.setAttribute('tabindex', '0');
  selectedAnswer = null;
  mode = 'playing';
  player.setCurrentTime(0).then(function () {
    return player.play();
  }).catch(function () { player.play().catch(function () {}); });
  requestAnimationFrame(function () { frameSentinel.focus(); });
}

function showQuestion() {
  mode = 'question';
  selectedAnswer = null;

  questionText.textContent = QUESTION.text;
  instructionText.textContent = 'Select an answer and press Submit to continue.';

  answersContainer.innerHTML = '';
  answersContainer.setAttribute('role', 'radiogroup');
  answersContainer.setAttribute('aria-labelledby', 'questionText');
  answersContainer.classList.remove('answers--review');

  QUESTION.options.forEach(function (option, i) {
    var item = document.createElement('div');
    item.className = 'answer-item';

    var radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'answer';
    radio.id = 'answer-' + i; radio.value = option.text;
    radio.className = 'answer-radio';
    radio.addEventListener('change', function () {
      if (radio.checked) { selectedAnswer = option; submitBtn.disabled = false; }
    });

    var label = document.createElement('label');
    label.htmlFor = 'answer-' + i; label.className = 'answer-label';

    var circle = document.createElement('span');
    circle.className = 'answer-number'; circle.textContent = option.text;

    var desc = document.createElement('span');
    desc.className = 'answer-description'; desc.textContent = option.description;

    label.appendChild(circle); label.appendChild(desc);
    item.appendChild(radio); item.appendChild(label);
    answersContainer.appendChild(item);
  });

  submitBtn.classList.remove('hidden');
  submitBtn.disabled = true;
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('aria-hidden', 'true');
  frameSentinel.setAttribute('tabindex', '-1');
  questionOverlay.classList.remove('hidden');
  questionOverlay.removeAttribute('aria-hidden');

  requestAnimationFrame(function () {
    var firstRadio = answersContainer.querySelector('input[type="radio"]');
    if (firstRadio) {
      firstRadio.classList.add('focus-init');
      firstRadio.focus();
      var removeInit = function () { firstRadio.classList.remove('focus-init'); };
      answersContainer.addEventListener('keydown',   removeInit, { once: true });
      answersContainer.addEventListener('mousedown', removeInit, { once: true });
    } else {
      questionOverlay.focus();
    }
  });
}

function showFeedback() {
  var correctOption = QUESTION.options.find(function (o) { return o.correct; });
  var isCorrect = selectedAnswer && correctOption && selectedAnswer.text === correctOption.text;

  var userAnswerText    = selectedAnswer
    ? (selectedAnswer.text + ' \u2013 ' + selectedAnswer.description) : 'No answer recorded';
  var correctAnswerText = correctOption
    ? (correctOption.text + ' \u2013 ' + correctOption.description) : '';

  var rawRationale = correctOption ? (correctOption.rationale || '').trim() : '';
  var rationaleText = (rawRationale && rawRationale !== '<PASTE RATIONALE HERE>') ? rawRationale : '';

  answersContainer.innerHTML = '';
  answersContainer.classList.add('answers--review');
  answersContainer.removeAttribute('role');
  answersContainer.removeAttribute('aria-labelledby');

  var state = isCorrect ? 'correct' : 'incorrect';
  var panel = document.createElement('div');
  panel.className = 'review-feedback-panel review-feedback-panel--' + state;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', isCorrect ? 'Correct answer explanation' : 'Incorrect answer explanation');
  panel.setAttribute('tabindex', '-1');

  var top = document.createElement('div');
  top.className = 'review-feedback-panel__top';

  if (isCorrect) {
    var h = document.createElement('p');
    h.className = 'review-feedback-panel__headline'; h.textContent = 'Great Job!';
    top.appendChild(h);
    var s = document.createElement('p');
    s.className = 'review-feedback-panel__subline';
    s.textContent = 'You selected the correct answer: ' + userAnswerText;
    top.appendChild(s);
  } else {
    var s1 = document.createElement('p');
    s1.className = 'review-feedback-panel__subline';
    s1.textContent = 'Your answer: ' + userAnswerText;
    top.appendChild(s1);
    var s2 = document.createElement('p');
    s2.className = 'review-feedback-panel__subline';
    s2.textContent = 'The correct answer is ' + correctAnswerText;
    top.appendChild(s2);
  }

  panel.appendChild(top);

  if (rationaleText) {
    var rWrap = document.createElement('div');
    rWrap.className = 'review-feedback-panel__rationale';
    var rH = document.createElement('p');
    rH.className = 'review-feedback-panel__rationale-heading'; rH.textContent = 'Rationale:';
    var rB = document.createElement('p');
    rB.className = 'review-feedback-panel__rationale-body'; rB.textContent = rationaleText;
    rWrap.appendChild(rH); rWrap.appendChild(rB);
    panel.appendChild(rWrap);
  }

  answersContainer.appendChild(panel);
  instructionText.textContent = isCorrect ? 'Correct!' : 'Review the correct answer below.';
  submitBtn.classList.add('hidden');
  requestAnimationFrame(function () { panel.focus(); });
}
