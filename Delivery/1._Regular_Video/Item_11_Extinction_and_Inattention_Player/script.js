// Item 11: Extinction and Inattention - grouped video player
// Auto-generated - run generate-players.cjs to regenerate.

var VIDEOS = [
  { label: 'Introduction', standardId: '1175973008', eadId: '1175973008' },
  { label: 'Score 0', standardId: '1175973022', eadId: '1175973022' },
  { label: 'Score 1', standardId: '1175973041', eadId: '1175973041' },
  { label: 'Score 2', standardId: '1175973058', eadId: '1175973058' }
];

var PARAMS  = 'badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=1';
var FADE_MS = 160;

var CARD_W  = 1680;
var CARD_H  = 1436;
var STAGE_W = CARD_W - 80;
var STAGE_H = Math.round(STAGE_W * 9 / 16);

var player     = null;
var useEad     = false;
var initDone   = false;
var fadeTimer  = null;
var calibTimer = null;

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

  var firstId = pickId(VIDEOS[0]);
  if (firstId) {
    iframe.src = 'https://player.vimeo.com/video/' + firstId + '?' + PARAMS;
    player = new Vimeo.Player(iframe);
  } else {
    showPlaceholder(true);
  }
  initDone = true;

  calibrateIframe();
  window.addEventListener('resize', calibrateDebounced);
  bindEvents();
});

function calibrateIframe() {
  var z = Math.min(window.innerWidth / CARD_W, window.innerHeight / CARD_H);
  if (z >= 1) {
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

function resolveEad() {
  try {
    var sl = (window.parent && window.parent.GetPlayer && window.parent.GetPlayer()) ||
             (window.top && window.top.GetPlayer && window.top.GetPlayer());
    if (sl) {
      var v = sl.GetVar('Extended_Audio_Description_Track');
      return (v === true || v === 'true' || v === 'True');
    }
  } catch (e) {}
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

function bindEvents() {
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(i, true); });
    tab.addEventListener('focus', function () { selectTab(i, false); });
  });

  stage.addEventListener('focus', function () {
    if (VIDEOS[selectedIndex()].standardId && player) {
      player.play().catch(function () {});
    }
  });

  card.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
  var active  = document.activeElement;
  var tabIdx  = tabs.indexOf(active);
  var onStage = (active === stage);

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
        selectTab(tabIdx, true);
        return;
    }
    if (next !== null) {
      e.preventDefault();
      selectTab(next, false);
      tabs[next].focus();
      return;
    }
  }

  if (e.key !== 'Tab') return;

  if (!e.shiftKey) {
    if (tabIdx !== -1) {
      e.preventDefault();
      stage.focus();
    } else if (onStage) {
      var sel = selectedIndex();
      if (sel < tabs.length - 1) {
        e.preventDefault();
        selectTab(sel + 1, false);
        tabs[sel + 1].focus();
      }
    }
  } else {
    if (onStage) {
      e.preventDefault();
      tabs[selectedIndex()].focus();
    } else if (tabIdx > 0) {
      e.preventDefault();
      selectTab(tabIdx - 1, false);
      stage.focus();
    }
  }
}

function selectTab(index, force) {
  if (!force && index === selectedIndex() && initDone) return;

  var video = VIDEOS[index];

  tabs.forEach(function (t, i) {
    t.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });
  stage.setAttribute('aria-labelledby', tabs[index].id);

  stage.classList.add('po-fading');
  if (fadeTimer) clearTimeout(fadeTimer);
  fadeTimer = setTimeout(function () {
    if (video.standardId) {
      showPlaceholder(false);
      if (player) {
        player.loadVideo(pickId(video))
              .then(function () { player.play().catch(function () {}); })
              .catch(function () {});
      } else {
        iframe.src = 'https://player.vimeo.com/video/' + pickId(video) + '?' + PARAMS;
        player = new Vimeo.Player(iframe);
        player.ready().then(function () { player.play().catch(function () {}); });
      }
    } else {
      if (player) player.pause().catch(function () {});
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
  requestAnimationFrame(function () { statusEl.textContent = msg; });
}
