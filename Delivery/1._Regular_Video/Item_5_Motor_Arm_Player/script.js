// Item 5: Motor Arm - grouped video player
//
// A tabbed video selector. Each tab loads one Vimeo video into the shared
// 16:9 stage. Tabs whose video has not been delivered yet (standardId === null)
// show a "Video coming soon" placeholder instead of loading the player.
//
// Keyboard model:
//   - Arrow / Home / End move between tabs and activate them immediately.
//   - Tab walks an interleaved order: tab, video, next tab, video, ... and
//     finally leaves the web object. Shift+Tab reverses it.
//   - Enter / Space replays the focused tab's video.

// ─── Video data ────────────────────────────────────────────────────────────
// One entry per tab, in DOM order. standardId / eadId === null marks a
// placeholder. eadId equals standardId until Extended Audio Description
// masters are delivered.
var VIDEOS = [
  { label: 'Introduction', standardId: '1175972102', eadId: '1175972102' },
  { label: 'Score 0',      standardId: '1175972115', eadId: '1175972115' },
  { label: 'Score 1',      standardId: '1175972125', eadId: '1175972125' },
  { label: 'Score 2',      standardId: '1175972137', eadId: '1175972137' },
  { label: 'Score 3',      standardId: '1175972145', eadId: '1175972145' },
  { label: 'Score 4',      standardId: '1175972153', eadId: '1175972153' },
  { label: 'Untestable',   standardId: null,         eadId: null         }
];

var PARAMS = 'badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=1';
var FADE_MS = 160;

// Design dimensions — must match CSS --card-w / --card-h and the card padding.
var CARD_W  = 1680;
var CARD_H  = 1436;
var STAGE_W = CARD_W - 80;           // 40px padding each side = 1600
var STAGE_H = Math.round(STAGE_W * 9 / 16); // 900

// ─── State ───────────────────────────────────────────────────────────────
var player        = null;
var useEad        = false;
var initDone      = false;
var fadeTimer     = null;
var calibTimer    = null;

var card, tablist, tabs, stage, iframe, placeholder, statusEl;

document.addEventListener('DOMContentLoaded', function () {
  card        = document.getElementById('poCard');
  tablist     = document.getElementById('poTablist');
  tabs        = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  stage       = document.getElementById('poStage');
  iframe      = document.getElementById('vimeo');
  placeholder = document.getElementById('poPlaceholder');
  statusEl    = document.getElementById('poStatus');

  useEad = resolveEad();

  // Initial load: Introduction, paused (no autoplay on page open).
  iframe.src = 'https://player.vimeo.com/video/' + pickId(VIDEOS[0]) + '?' + PARAMS;
  player = new Vimeo.Player(iframe);
  initDone = true;

  calibrateIframe();
  window.addEventListener('resize', calibrateDebounced);

  bindEvents();
});

// ─── Iframe calibration ─────────────────────────────────────────────────────
// When the card is scaled down via CSS zoom (e.g. inside a Storyline web
// object), the iframe's CSS dimensions stay at the full design size (1600x900)
// but are rendered smaller. Vimeo picks control sizes for the CSS dimensions,
// which can look oversized for the actual visible area. This function resizes
// the iframe to match the true visible pixel dimensions and applies an inverse
// scale() so it still fills the stage, ensuring Vimeo shows controls that are
// proportional to the visible player size.
function calibrateIframe() {
  var z = Math.min(window.innerWidth / CARD_W, window.innerHeight / CARD_H);
  if (z >= 1) {
    // Card shown at natural size or larger: let CSS handle it normally.
    iframe.style.width     = '';
    iframe.style.height    = '';
    iframe.style.transform = '';
    return;
  }
  var renderW = Math.round(STAGE_W * z);
  var renderH = Math.round(STAGE_H * z);
  iframe.style.width           = renderW + 'px';
  iframe.style.height          = renderH + 'px';
  iframe.style.transform       = 'scale(' + (1 / z).toFixed(6) + ')';
  iframe.style.transformOrigin = 'top left';
}

function calibrateDebounced() {
  clearTimeout(calibTimer);
  calibTimer = setTimeout(calibrateIframe, 120);
}

// ─── Extended Audio Description switch ──────────────────────────────────────
// Reads the Storyline Boolean Extended_Audio_Description_Track. Falls back to
// the standard video when the variable is missing or Storyline is not present.
function resolveEad() {
  try {
    var sl = (window.parent && window.parent.GetPlayer && window.parent.GetPlayer()) ||
             (window.top && window.top.GetPlayer && window.top.GetPlayer());
    if (sl) {
      var v = sl.GetVar('Extended_Audio_Description_Track');
      return (v === true || v === 'true' || v === 'True');
    }
  } catch (e) { /* Storyline absent */ }
  return false;
}

function pickId(video) {
  return (useEad && video.eadId) ? video.eadId : video.standardId;
}

function selectedIndex() {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].getAttribute('aria-selected') === 'true') return i;
  }
  return 0;
}

// ─── Events ──────────────────────────────────────────────────────────────
function bindEvents() {
  tabs.forEach(function (tab, i) {
    // Click and focus both select the tab. Focus drives the keyboard model
    // (arrow / Tab navigation moves focus; selection follows).
    tab.addEventListener('click', function () { selectTab(i, true); });
    tab.addEventListener('focus', function () { selectTab(i, false); });
  });

  // Reaching the video stop plays the current video.
  stage.addEventListener('focus', function () {
    if (VIDEOS[selectedIndex()].standardId) player.play().catch(function () {});
  });

  card.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
  var active  = document.activeElement;
  var tabIdx  = tabs.indexOf(active);
  var onStage = (active === stage);

  // Arrow / Home / End / Enter / Space: only while a tab is focused.
  if (tabIdx !== -1) {
    var next = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': next = (tabIdx + 1) % tabs.length; break;
      case 'ArrowLeft':
      case 'ArrowUp':   next = (tabIdx - 1 + tabs.length) % tabs.length; break;
      case 'Home':      next = 0; break;
      case 'End':       next = tabs.length - 1; break;
      case 'Enter':
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        selectTab(tabIdx, true);   // replay current video
        return;
    }
    if (next !== null) {
      e.preventDefault();
      selectTab(next, false);      // arrows activate immediately
      tabs[next].focus();
      return;
    }
  }

  // Tab / Shift+Tab: interleaved order tab -> video -> next tab -> video ...
  if (e.key !== 'Tab') return;

  if (!e.shiftKey) {
    if (tabIdx !== -1) {
      e.preventDefault();
      stage.focus();               // from a tab, go to its video
    } else if (onStage) {
      var sel = selectedIndex();
      if (sel < tabs.length - 1) {
        e.preventDefault();
        selectTab(sel + 1, false); // from video, go to (and activate) the next tab
        tabs[sel + 1].focus();
      }
      // last video: let Tab fall through and leave the web object
    }
  } else {
    if (onStage) {
      e.preventDefault();
      tabs[selectedIndex()].focus();   // from video, back to its tab
    } else if (tabIdx > 0) {
      e.preventDefault();
      selectTab(tabIdx - 1, false);    // select the previous tab...
      stage.focus();                   // ...and land on its video
    }
    // first tab: let Shift+Tab fall through and leave the web object
  }
}

// ─── Select a tab: load its video (with a cross-fade) or show placeholder ────
function selectTab(index, force) {
  if (!force && index === selectedIndex() && initDone) return;

  var video = VIDEOS[index];

  tabs.forEach(function (t, i) {
    t.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });
  stage.setAttribute('aria-labelledby', tabs[index].id);

  // Fade the stage out, swap the content while hidden, then fade back in.
  stage.classList.add('po-fading');
  if (fadeTimer) clearTimeout(fadeTimer);
  fadeTimer = setTimeout(function () {
    if (video.standardId) {
      showPlaceholder(false);
      player.loadVideo(pickId(video))
            .then(function () { player.play().catch(function () {}); })
            .catch(function () {});
    } else {
      player.pause().catch(function () {});
      showPlaceholder(true);
    }
    requestAnimationFrame(function () { stage.classList.remove('po-fading'); });
    fadeTimer = null;
  }, FADE_MS);

  announce(video.standardId ? ('Now playing: ' + video.label + ' video.')
                            : (video.label + ': video coming soon.'));
}

function showPlaceholder(show) {
  if (show) {
    placeholder.classList.remove('hidden');
    placeholder.setAttribute('aria-hidden', 'false');
    iframe.style.visibility = 'hidden';
  } else {
    placeholder.classList.add('hidden');
    placeholder.setAttribute('aria-hidden', 'true');
    iframe.style.visibility = '';
  }
}

function announce(msg) {
  statusEl.textContent = '';
  // Toggle text so repeated identical messages are still announced.
  requestAnimationFrame(function () { statusEl.textContent = msg; });
}
