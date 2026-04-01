/**
 * generate.js
 * Run once: node generate.js
 * Creates Question 1 – Question 13 folders inside the same directory.
 */

const fs   = require('fs');
const path = require('path');

// ─── All 13 questions ─────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    n: 1,
    title: 'Item 1a \u2014 Level of Consciousness',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'Alert; keenly responsive.',                                                                                                                                                                                                                                                                                correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Not Alert; but arousable by minor stimulation to obey, answer, or respond.',                                                                                                                                                                                                                               correct: false, rationale: '' },
      { text: '2', description: 'Not Alert; requires repeated stimulation to attend, or is obtunded and requires strong or painful.',                                                                                                                                                                                                        correct: false, rationale: '' },
      { text: '3', description: 'Responds only with reflex motor or autonomic effects, or totally unresponsive, flaccid, and areflexic.',                                                                                                                                                                                                   correct: false, rationale: '' }
    ]
  },
  {
    n: 2,
    title: 'Item 1b \u2014 LOC Questions',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'Answers both questions correctly',  correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Answers one question correctly',    correct: false, rationale: '' },
      { text: '2', description: 'Answers neither question correctly',correct: false, rationale: '' }
    ]
  },
  {
    n: 3,
    title: 'Item 1c \u2014 LOC Commands',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'Performs both tasks correctly',   correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Performs one task correctly',     correct: false, rationale: '' },
      { text: '2', description: 'Performs neither task correctly', correct: false, rationale: '' }
    ]
  },
  {
    n: 4,
    title: 'Item 2 \u2014 Best Gaze',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'Normal',                                                                                                    correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Partial gaze palsy; gaze is abnormal in one or both eyes, but forced deviation or total gaze paresis is not present.', correct: false, rationale: '' },
      { text: '2', description: 'Forced deviation, or total gaze paresis is not overcome by the oculocephalic maneuver.',                    correct: false, rationale: '' }
    ]
  },
  {
    n: 5,
    title: 'Item 3 \u2014 Visual',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'No visual loss',                                           correct: false, rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Partial hemianopia.',                                       correct: true,  rationale: '' },
      { text: '2', description: 'Complete hemianopia.',                                      correct: false, rationale: '' },
      { text: '3', description: 'Bilaterial hemianopia (blind including cortical blindness)', correct: false, rationale: '' }
    ]
  },
  {
    n: 6,
    title: 'Item 4 \u2014 Facial Palsy',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'Normal symmetrical movements.',                                                                  correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Minor paralysis (flattened nasolabial fold, asymmetry on smiling).',                             correct: false, rationale: '' },
      { text: '2', description: 'Partial paralysis (total or near-total paralysis of lower face).',                               correct: false, rationale: '' },
      { text: '3', description: 'Complete paralysis of one or both sides (absences of facial movement in the upper and lower face).', correct: false, rationale: '' }
    ]
  },
  {
    n: 7,
    title: 'Item 5 \u2014 Motor Arm',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0',  description: 'No drift; limb holds 90 (or 45) degrees for full 10 seconds.',                                                                                       correct: false, rationale: '<PASTE RATIONALE HERE>' },
      { text: '1',  description: 'Drift; limb holds 90 (or 45) degrees, but drifts down before full 10 seconds; does not hit bed or other support.',                                   correct: true,  rationale: 'There was a slight drift in the right arm.' },
      { text: '2',  description: 'Some effort against gravity; limb cannot get to or maintain (if cued) 90 (or 45) degrees, drifts down to bed, but has some effort against gravity.', correct: false, rationale: '' },
      { text: '3',  description: 'No effort against gravity; limb falls',                                                                                                               correct: false, rationale: '' },
      { text: '4',  description: 'No movement.',                                                                                                                                        correct: false, rationale: '' },
      { text: 'UN', description: 'Amputation or joint fusion',                                                                                                                          correct: false, rationale: '' }
    ]
  },
  {
    n: 8,
    title: 'Item 6 \u2014 Motor Leg',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0',  description: 'No drift; leg holds 30-degree position for full 5 seconds.',                                     correct: false, rationale: '<PASTE RATIONALE HERE>' },
      { text: '1',  description: 'Drift; leg falls by the end of the 5-second period but does not hit the bed.',                   correct: true,  rationale: 'There was a slight drift in the right leg.' },
      { text: '2',  description: 'Some effort against gravity; leg falls to bed by 5 seconds but has some effort against gravity.', correct: false, rationale: '' },
      { text: '3',  description: 'No effort against gravity; leg falls to bed immediately.',                                        correct: false, rationale: '' },
      { text: '4',  description: 'No movement.',                                                                                    correct: false, rationale: '' },
      { text: 'UN', description: 'Amputation or joint fusion',                                                                      correct: false, rationale: '' }
    ]
  },
  {
    n: 9,
    title: 'Item 7 \u2014 Limb Ataxia',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0',  description: 'Absent',                        correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1',  description: 'Present in one limb',           correct: false, rationale: '' },
      { text: '2',  description: 'Present in two limbs',          correct: false, rationale: '' },
      { text: 'UN', description: 'Amputation or joint fusion',    correct: false, rationale: '' }
    ]
  },
  {
    n: 10,
    title: 'Item 8 \u2014 Sensory',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'Normal; no sensory loss',                                                                                                                                                               correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Mild-to-moderate sensory loss; patient feels pinprick is less sharp or is dull on the affected side; or there is a loss of superficial pain with pinprick, but the patient is aware of being touched.', correct: false, rationale: '' },
      { text: '2', description: 'Severe or total sensory loss; patient is not aware of being touched in the face, arm, and leg.',                                                                                         correct: false, rationale: '' }
    ]
  },
  {
    n: 11,
    title: 'Item 9 \u2014 Best Language',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'No aphasia; normal',                                                                                                                                                                                                                                                                                                                                         correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Mild-to-moderate aphasia; some obviousl loss of fluency or facility to comprehension, without signifant limitation on ideas expressed or form of expression. Reduction of speech and/or comprehension, however, makes conversation about provided materials difficult or impossible. For example, in conversation about provided materials, examiner can identify picture or naming card content from patient\'s response.', correct: false, rationale: '' },
      { text: '2', description: 'Severe aphasia; all communication is through fragmentary expression; great need for inference, questioning, and guessing by the listener. Range of information that can be exchanged is limited; listener carries burden of communication. Examiner cannot identify materials provided from patient response.',                                                      correct: false, rationale: '' },
      { text: '3', description: 'Mute, global aphasia; no usable speech or auditory comprehension.',                                                                                                                                                                                                                                                                                           correct: false, rationale: '' }
    ]
  },
  {
    n: 12,
    title: 'Item 10 \u2014 Dysarthria',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0',  description: 'Normal.',                                                                                                                          correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1',  description: 'Mild-to-moderate dysarthria; patietn slurs at least some words and, at worst, can be understood with some difficulty.',            correct: false, rationale: '' },
      { text: '2',  description: 'Severe dysarthria; patient\'s speech is so slurred as to be unintelligible in the absence of or out of proportion to any dysphagia, or is mute/anarthric.', correct: false, rationale: '' },
      { text: 'UN', description: 'Intubated or other physical barrier',                                                                                              correct: false, rationale: '' }
    ]
  },
  {
    n: 13,
    title: 'Item 11 \u2014 Extinction and Inattention',
    question: 'Based on what you see in the video, please score the patient accordingly.',
    options: [
      { text: '0', description: 'No abnormality.',                                                                                                                                                                                    correct: true,  rationale: '<PASTE RATIONALE HERE>' },
      { text: '1', description: 'Visual, tactile, auditory, spatial, or personal inattention, or extinction to bilateral simultaneous stimulation in one of the sensory modalities.',                                                  correct: false, rationale: '' },
      { text: '2', description: 'Profound hemi-inattention or extinction to more than one modality; does not recovntize own hand or orients to only one side of space.',                                                               correct: false, rationale: '' }
    ]
  }
];

// ─── Templates ────────────────────────────────────────────────────────────────

function makeHTML(q) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Question ${q.n} \u2014 Practice</title>
  <link rel="stylesheet" href="https://use.typekit.net/nid8klk.css">
  <script src="https://player.vimeo.com/api/player.js"></script>
  <link rel="stylesheet" href="styles.css">
</head>

<body>
  <div id="videoWrapper" class="video-wrapper" tabindex="-1">

    <div id="screenReaderStatus" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

    <!-- \u2500\u2500\u2500 Start overlay \u2500\u2500\u2500 -->
    <div id="startOverlay" class="start-overlay">
      <div class="start-container">
        <div class="start-logo-wrap">
          <img src="img/Aha logo black.svg" alt="American Heart Association logo" class="start-logo">
        </div>
        <h2 class="start-heading">${q.title}</h2>
        <p class="start-instructions">
          Watch the video. A question will appear at the end.
          Select your answer and press Submit to see your feedback.
          Press the Start button below to begin.
        </p>
        <button id="startBtn" type="button" class="start-btn">Start</button>
      </div>
    </div>

    <div id="frameSentinel" tabindex="-1" aria-label="frame" class="frame-sentinel"></div>

    <iframe
      id="vimeo"
      tabindex="-1"
      src="https://player.vimeo.com/video/1179338166?badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=0"
      allow="autoplay; picture-in-picture"
      title="Practice Video \u2014 Question ${q.n}"
      aria-label="Interactive video player">
    </iframe>

    <!-- \u2500\u2500\u2500 Question overlay \u2500\u2500\u2500 -->
    <div
      id="questionOverlay"
      class="question-overlay hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="questionNumber"
      aria-describedby="instructionText questionKeyboardHint"
      tabindex="-1">

      <div class="question-container">
        <div class="question-inner">

          <h1 id="questionNumber" class="question-number">Question</h1>
          <h2 id="questionText" class="question-title" role="heading" aria-level="2"></h2>

          <p id="instructionText" class="instruction-text">
            Select an answer and press Submit to continue.
          </p>

          <p id="questionKeyboardHint" class="sr-only">
            Use the arrow keys to move between answer options.
            Press Tab to reach the Submit button, then press Space or Enter to submit.
          </p>

          <div class="answers-container">
            <div id="answersContainer"></div>
          </div>

          <div class="question-bottom-row">
            <div class="question-submit-area">
              <button
                id="submitBtn"
                class="submit-btn"
                aria-label="Submit the answer and see feedback"
                disabled>
                Submit
              </button>
            </div>
          </div>

          <button
            id="watchAgainBtn"
            class="watch-again-btn"
            aria-label="Watch the video again from the beginning"
            data-tooltip="Watch the video again">
            <img src="img/replay.svg" alt="" class="watch-again-icon" aria-hidden="true">
          </button>

        </div>
      </div>
    </div>

    <button
      id="fullscreenBtn"
      type="button"
      class="fullscreen-btn"
      aria-label="Enter fullscreen"
      aria-pressed="false"
      data-tooltip="Fullscreen mode">
      \u26F6
    </button>

  </div>

  <script src="script.js"></script>
</body>
</html>
`;
}

function makeJS(q) {
  const optionsJSON = JSON.stringify(q.options, null, 2)
    .replace(/^/gm, '  ');

  return `// Question ${q.n} data
var QUESTION = {
  text: ${JSON.stringify(q.question)},
  options: ${optionsJSON}
};

// \u2500\u2500\u2500 State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

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
    ? (selectedAnswer.text + ' \\u2013 ' + selectedAnswer.description) : 'No answer recorded';
  var correctAnswerText = correctOption
    ? (correctOption.text + ' \\u2013 ' + correctOption.description) : '';

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
`;
}

// ─── Generate files ───────────────────────────────────────────────────────────

const BASE = __dirname;
const SRC  = path.join(BASE, '..'); // Player Restored folder

QUESTIONS.forEach(function (q) {
  const dir    = path.join(BASE, 'Question ' + q.n);
  const imgSrc = path.join(SRC, 'img');
  const imgDst = path.join(dir, 'img');
  const cssSrc = path.join(SRC, 'styles', 'styles.css');

  // Create folder
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(imgDst, { recursive: true });

  // Copy img files
  fs.readdirSync(imgSrc).forEach(function (f) {
    fs.copyFileSync(path.join(imgSrc, f), path.join(imgDst, f));
  });

  // Copy styles.css
  fs.copyFileSync(cssSrc, path.join(dir, 'styles.css'));

  // Write index.html
  fs.writeFileSync(path.join(dir, 'index.html'), makeHTML(q), 'utf8');

  // Write script.js
  fs.writeFileSync(path.join(dir, 'script.js'), makeJS(q), 'utf8');

  console.log('Created Question ' + q.n + ' — ' + q.title);
});

console.log('\nDone! All 13 questions generated.');
