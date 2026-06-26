'use strict';
const fs   = require('fs');
const path = require('path');

const BASE = __dirname;
const css  = fs.readFileSync(path.join(BASE, 'Item_5_Motor_Arm_Player', 'styles.css'), 'utf8');

const ITEMS = [
  {
    dir: 'Item_1a_LOC_Player',
    title: 'Item 1a: Level of Consciousness',
    ariaLabel: 'Item 1a LOC videos',
    videos: [
      { label: 'Introduction', sid: '1175970592' },
      { label: 'Score 0', score: '0', sid: '1175970608' },
      { label: 'Score 1', score: '1', sid: '1175970625' },
      { label: 'Score 2', score: '2', sid: '1175970641' },
      { label: 'Score 3', score: '3', sid: '1175970657' },
    ],
  },
  {
    dir: 'Item_1b_LOC_Questions_Player',
    title: 'Item 1b: LOC Questions',
    ariaLabel: 'Item 1b LOC Questions videos',
    videos: [
      { label: 'Introduction', sid: '1175970685' },
      { label: 'Score 0', score: '0', sid: '1175970696' },
      { label: 'Score 1', score: '1', sid: '1175970712' },
      { label: 'Score 2', score: '2', sid: '1175970720' },
    ],
  },
  {
    dir: 'Item_1c_LOC_Commands_Player',
    title: 'Item 1c: LOC Commands',
    ariaLabel: 'Item 1c LOC Commands videos',
    videos: [
      { label: 'Introduction', sid: '1175970739' },
      { label: 'Score 0', score: '0', sid: '1175970748' },
      { label: 'Score 1', score: '1', sid: '1175971120' },
      { label: 'Score 2', score: '2', sid: '1175971130' },
    ],
  },
  {
    dir: 'Item_2_Best_Gaze_Player',
    title: 'Item 2: Best Gaze',
    ariaLabel: 'Item 2 Best Gaze videos',
    videos: [
      { label: 'Introduction', sid: '1175971174' },
      { label: 'Score 0', score: '0', sid: '1175971197' },
      { label: 'Score 1', score: '1', sid: '1175971214' },
      { label: 'Score 2', score: '2', sid: '1175971242' },
    ],
  },
  {
    dir: 'Item_3_Visual_Player',
    title: 'Item 3: Visual',
    ariaLabel: 'Item 3 Visual videos',
    videos: [
      { label: 'Introduction', sid: '1175971284' },
      { label: 'Score 0', score: '0', sid: '1175971292' },
      { label: 'Score 1', score: '1', sid: '1175971321' },
      { label: 'Score 2', score: '2', sid: '1175971331' },
      { label: 'Score 3', score: '3', sid: '1175971346' },
    ],
  },
  {
    dir: 'Item_4_Facial_Palsy_Player',
    title: 'Item 4: Facial Palsy',
    ariaLabel: 'Item 4 Facial Palsy videos',
    videos: [
      { label: 'Introduction', sid: '1175971377' },
      { label: 'Score 0', score: '0', sid: '1175971415' },
      { label: 'Score 1', score: '1', sid: '1175971996' },
      { label: 'Score 2', score: '2', sid: '1175972027' },
      { label: 'Score 3', score: '3', sid: '1175972049' },
    ],
  },
  {
    dir: 'Item_6_Motor_Leg_Player',
    title: 'Item 6: Motor Leg',
    ariaLabel: 'Item 6 Motor Leg videos',
    videos: [
      { label: 'Introduction', sid: null },
      { label: 'Score 0', score: '0', sid: null },
      { label: 'Score 1', score: '1', sid: null },
      { label: 'Score 2', score: '2', sid: null },
      { label: 'Score 3', score: '3', sid: null },
      { label: 'Score 4', score: '4', sid: null },
      { label: 'Untestable', score: 'UN', un: true, sid: null },
    ],
  },
  {
    dir: 'Item_7_Limb_Ataxia_Player',
    title: 'Item 7: Limb Ataxia',
    ariaLabel: 'Item 7 Limb Ataxia videos',
    videos: [
      { label: 'Introduction', sid: '1175972466' },
      { label: 'Score 0', score: '0', sid: '1175972490' },
      { label: 'Score 1', score: '1', sid: '1175972508' },
      { label: 'Score 2', score: '2', sid: '1175972529' },
      { label: 'Untestable', score: 'UN', un: true, sid: null },
    ],
  },
  {
    dir: 'Item_8_Sensory_Player',
    title: 'Item 8: Sensory',
    ariaLabel: 'Item 8 Sensory videos',
    videos: [
      { label: 'Introduction', sid: '1175972560' },
      { label: 'Score 0', score: '0', sid: '1175972582' },
      { label: 'Score 1', score: '1', sid: '1175972606' },
      { label: 'Score 2', score: '2', sid: '1175972616' },
    ],
  },
  {
    dir: 'Item_9_Best_Language_Player',
    title: 'Item 9: Best Language',
    ariaLabel: 'Item 9 Best Language videos',
    videos: [
      { label: 'Introduction', sid: '1175972646' },
      { label: 'Score 0', score: '0', sid: '1175972665' },
      { label: 'Score 1', score: '1', sid: '1175972678' },
      { label: 'Score 2', score: '2', sid: '1175972690' },
      { label: 'Score 3', score: '3', sid: '1175972875' },
    ],
  },
  {
    dir: 'Item_10_Dysarthria_Player',
    title: 'Item 10: Dysarthria',
    ariaLabel: 'Item 10 Dysarthria videos',
    videos: [
      { label: 'Introduction', sid: '1175972907' },
      { label: 'Score 0', score: '0', sid: '1175972930' },
      { label: 'Score 1', score: '1', sid: '1175972945' },
      { label: 'Score 2', score: '2', sid: '1175972960' },
      { label: 'Untestable', score: 'UN', un: true, sid: '1175972971' },
    ],
  },
  {
    dir: 'Item_11_Extinction_and_Inattention_Player',
    title: 'Item 11: Extinction and Inattention',
    ariaLabel: 'Item 11 Extinction and Inattention videos',
    videos: [
      { label: 'Introduction', sid: '1175973008' },
      { label: 'Score 0', score: '0', sid: '1175973022' },
      { label: 'Score 1', score: '1', sid: '1175973041' },
      { label: 'Score 2', score: '2', sid: '1175973058' },
    ],
  },
];

// ---- HTML ----
function scoreBtn(v, dataIdx) {
  var isUn    = v.un === true;
  var id      = isUn ? 'tab-un' : ('tab-' + v.score);
  var cls     = 'po-tab po-tab--score' + (isUn ? ' po-tab--un' : '');
  var ariaLbl = isUn ? 'Untestable video' : ('Score ' + v.score + ' video');
  return [
    '          <button id="' + id + '" class="' + cls + '" role="tab"',
    '                  aria-selected="false" aria-controls="poStage" tabindex="0"',
    '                  data-index="' + dataIdx + '" aria-label="' + ariaLbl + '">' + v.score + '</button>',
  ].join('\n');
}

function buildHTML(item) {
  var scoreRows = item.videos.slice(1).map(function (v, i) {
    return scoreBtn(v, i + 1);
  }).join('\n');

  return '<!doctype html>\n'
    + '<html lang="en">\n'
    + '<head>\n'
    + '  <meta charset="utf-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + item.title + '</title>\n'
    + '  <link rel="stylesheet" href="https://use.typekit.net/nid8klk.css">\n'
    + '  <script src="https://player.vimeo.com/api/player.js"></script>\n'
    + '  <link rel="stylesheet" href="styles.css">\n'
    + '</head>\n'
    + '\n'
    + '<body>\n'
    + '  <main id="poCard" class="po-card">\n'
    + '\n'
    + '    <h1 class="sr-only">' + item.title + '. Choose a video to watch.</h1>\n'
    + '\n'
    + '    <div id="poStatus" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>\n'
    + '\n'
    + '    <div class="po-tabs">\n'
    + '      <div\n'
    + '        id="poTablist"\n'
    + '        class="po-tablist"\n'
    + '        role="tablist"\n'
    + '        aria-label="' + item.ariaLabel + '"\n'
    + '        aria-orientation="horizontal">\n'
    + '\n'
    + '        <button id="tab-intro" class="po-tab po-tab--intro" role="tab"\n'
    + '                aria-selected="true" aria-controls="poStage" tabindex="0"\n'
    + '                data-index="0">Introduction</button>\n'
    + '\n'
    + '        <div class="po-scores">\n'
    + scoreRows + '\n'
    + '        </div>\n'
    + '      </div>\n'
    + '    </div>\n'
    + '\n'
    + '    <div id="poStage" class="po-stage" role="tabpanel" aria-labelledby="tab-intro"\n'
    + '         tabindex="0" aria-label="Video">\n'
    + '\n'
    + '      <iframe\n'
    + '        id="vimeo"\n'
    + '        tabindex="-1"\n'
    + '        data-params="badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=1"\n'
    + '        allow="autoplay; fullscreen; picture-in-picture"\n'
    + '        allowfullscreen\n'
    + '        title="' + item.title + ' video"\n'
    + '        aria-label="Video player">\n'
    + '      </iframe>\n'
    + '\n'
    + '      <div id="poPlaceholder" class="po-placeholder hidden" aria-hidden="true">\n'
    + '        <p class="po-placeholder__text">Video coming soon.</p>\n'
    + '      </div>\n'
    + '\n'
    + '    </div>\n'
    + '\n'
    + '  </main>\n'
    + '\n'
    + '  <script src="script.js"></script>\n'
    + '</body>\n'
    + '</html>\n';
}

// ---- JS ----
function buildScript(item) {
  var rows = item.videos.map(function (v) {
    var sid = v.sid ? ("'" + v.sid + "'") : 'null';
    return "  { label: '" + v.label + "', standardId: " + sid + ', eadId: ' + sid + ' }';
  });

  return '// ' + item.title + ' - grouped video player\n'
    + '// Auto-generated - run generate-players.cjs to regenerate.\n'
    + '\n'
    + 'var VIDEOS = [\n'
    + rows.join(',\n') + '\n'
    + '];\n'
    + '\n'
    + "var PARAMS  = 'badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=1';\n"
    + 'var FADE_MS = 160;\n'
    + '\n'
    + 'var CARD_W  = 1680;\n'
    + 'var CARD_H  = 1436;\n'
    + 'var STAGE_W = CARD_W - 80;\n'
    + 'var STAGE_H = Math.round(STAGE_W * 9 / 16);\n'
    + '\n'
    + 'var player     = null;\n'
    + 'var useEad     = false;\n'
    + 'var initDone   = false;\n'
    + 'var fadeTimer  = null;\n'
    + 'var calibTimer = null;\n'
    + '\n'
    + 'var card, tablist, tabs, stage, iframe, placeholder, statusEl;\n'
    + '\n'
    + "document.addEventListener('DOMContentLoaded', function () {\n"
    + "  card        = document.getElementById('poCard');\n"
    + "  tablist     = document.getElementById('poTablist');\n"
    + "  tabs        = Array.prototype.slice.call(tablist.querySelectorAll('[role=\"tab\"]'));\n"
    + "  stage       = document.getElementById('poStage');\n"
    + "  iframe      = document.getElementById('vimeo');\n"
    + "  placeholder = document.getElementById('poPlaceholder');\n"
    + "  statusEl    = document.getElementById('poStatus');\n"
    + '\n'
    + '  useEad = resolveEad();\n'
    + '\n'
    + '  var firstId = pickId(VIDEOS[0]);\n'
    + '  if (firstId) {\n'
    + "    iframe.src = 'https://player.vimeo.com/video/' + firstId + '?' + PARAMS;\n"
    + '    player = new Vimeo.Player(iframe);\n'
    + '  } else {\n'
    + '    showPlaceholder(true);\n'
    + '  }\n'
    + '  initDone = true;\n'
    + '\n'
    + '  calibrateIframe();\n'
    + "  window.addEventListener('resize', calibrateDebounced);\n"
    + '  bindEvents();\n'
    + '});\n'
    + '\n'
    + 'function calibrateIframe() {\n'
    + '  var z = Math.min(window.innerWidth / CARD_W, window.innerHeight / CARD_H);\n'
    + '  if (z >= 1) {\n'
    + "    iframe.style.width     = '';\n"
    + "    iframe.style.height    = '';\n"
    + "    iframe.style.transform = '';\n"
    + '    return;\n'
    + '  }\n'
    + '  var renderW = Math.round(STAGE_W * z);\n'
    + '  var renderH = Math.round(STAGE_H * z);\n'
    + "  iframe.style.width           = renderW + 'px';\n"
    + "  iframe.style.height          = renderH + 'px';\n"
    + "  iframe.style.transform       = 'scale(' + (1 / z).toFixed(6) + ')';\n"
    + "  iframe.style.transformOrigin = 'top left';\n"
    + '}\n'
    + '\n'
    + 'function calibrateDebounced() {\n'
    + '  clearTimeout(calibTimer);\n'
    + '  calibTimer = setTimeout(calibrateIframe, 120);\n'
    + '}\n'
    + '\n'
    + 'function resolveEad() {\n'
    + '  try {\n'
    + '    var sl = (window.parent && window.parent.GetPlayer && window.parent.GetPlayer()) ||\n'
    + '             (window.top && window.top.GetPlayer && window.top.GetPlayer());\n'
    + '    if (sl) {\n'
    + "      var v = sl.GetVar('Extended_Audio_Description_Track');\n"
    + "      return (v === true || v === 'true' || v === 'True');\n"
    + '    }\n'
    + '  } catch (e) {}\n'
    + '  return false;\n'
    + '}\n'
    + '\n'
    + 'function pickId(video) {\n'
    + '  return (useEad && video.eadId) ? video.eadId : video.standardId;\n'
    + '}\n'
    + '\n'
    + 'function selectedIndex() {\n'
    + '  for (var i = 0; i < tabs.length; i++) {\n'
    + "    if (tabs[i].getAttribute('aria-selected') === 'true') return i;\n"
    + '  }\n'
    + '  return 0;\n'
    + '}\n'
    + '\n'
    + 'function bindEvents() {\n'
    + '  tabs.forEach(function (tab, i) {\n'
    + "    tab.addEventListener('click', function () { selectTab(i, true); });\n"
    + "    tab.addEventListener('focus', function () { selectTab(i, false); });\n"
    + '  });\n'
    + '\n'
    + "  stage.addEventListener('focus', function () {\n"
    + '    if (VIDEOS[selectedIndex()].standardId && player) {\n'
    + '      player.play().catch(function () {});\n'
    + '    }\n'
    + '  });\n'
    + '\n'
    + "  card.addEventListener('keydown', handleKeydown);\n"
    + '}\n'
    + '\n'
    + 'function handleKeydown(e) {\n'
    + '  var active  = document.activeElement;\n'
    + '  var tabIdx  = tabs.indexOf(active);\n'
    + '  var onStage = (active === stage);\n'
    + '\n'
    + '  if (tabIdx !== -1) {\n'
    + '    var next = null;\n'
    + '    switch (e.key) {\n'
    + "      case 'ArrowRight':\n"
    + "      case 'ArrowDown': next = (tabIdx + 1) % tabs.length; break;\n"
    + "      case 'ArrowLeft':\n"
    + "      case 'ArrowUp':   next = (tabIdx - 1 + tabs.length) % tabs.length; break;\n"
    + "      case 'Home':      next = 0; break;\n"
    + "      case 'End':       next = tabs.length - 1; break;\n"
    + "      case 'Enter':\n"
    + "      case ' ':\n"
    + "      case 'Spacebar':\n"
    + '        e.preventDefault();\n'
    + '        selectTab(tabIdx, true);\n'
    + '        return;\n'
    + '    }\n'
    + '    if (next !== null) {\n'
    + '      e.preventDefault();\n'
    + '      selectTab(next, false);\n'
    + '      tabs[next].focus();\n'
    + '      return;\n'
    + '    }\n'
    + '  }\n'
    + '\n'
    + "  if (e.key !== 'Tab') return;\n"
    + '\n'
    + '  if (!e.shiftKey) {\n'
    + '    if (tabIdx !== -1) {\n'
    + '      e.preventDefault();\n'
    + '      stage.focus();\n'
    + '    } else if (onStage) {\n'
    + '      var sel = selectedIndex();\n'
    + '      if (sel < tabs.length - 1) {\n'
    + '        e.preventDefault();\n'
    + '        selectTab(sel + 1, false);\n'
    + '        tabs[sel + 1].focus();\n'
    + '      }\n'
    + '    }\n'
    + '  } else {\n'
    + '    if (onStage) {\n'
    + '      e.preventDefault();\n'
    + '      tabs[selectedIndex()].focus();\n'
    + '    } else if (tabIdx > 0) {\n'
    + '      e.preventDefault();\n'
    + '      selectTab(tabIdx - 1, false);\n'
    + '      stage.focus();\n'
    + '    }\n'
    + '  }\n'
    + '}\n'
    + '\n'
    + 'function selectTab(index, force) {\n'
    + '  if (!force && index === selectedIndex() && initDone) return;\n'
    + '\n'
    + '  var video = VIDEOS[index];\n'
    + '\n'
    + '  tabs.forEach(function (t, i) {\n'
    + "    t.setAttribute('aria-selected', i === index ? 'true' : 'false');\n"
    + '  });\n'
    + "  stage.setAttribute('aria-labelledby', tabs[index].id);\n"
    + '\n'
    + "  stage.classList.add('po-fading');\n"
    + '  if (fadeTimer) clearTimeout(fadeTimer);\n'
    + '  fadeTimer = setTimeout(function () {\n'
    + '    if (video.standardId) {\n'
    + '      showPlaceholder(false);\n'
    + '      if (player) {\n'
    + '        player.loadVideo(pickId(video))\n'
    + '              .then(function () { player.play().catch(function () {}); })\n'
    + '              .catch(function () {});\n'
    + '      } else {\n'
    + "        iframe.src = 'https://player.vimeo.com/video/' + pickId(video) + '?' + PARAMS;\n"
    + '        player = new Vimeo.Player(iframe);\n'
    + '        player.ready().then(function () { player.play().catch(function () {}); });\n'
    + '      }\n'
    + '    } else {\n'
    + '      if (player) player.pause().catch(function () {});\n'
    + '      showPlaceholder(true);\n'
    + '    }\n'
    + "    requestAnimationFrame(function () { stage.classList.remove('po-fading'); });\n"
    + '    fadeTimer = null;\n'
    + '  }, FADE_MS);\n'
    + '\n'
    + "  announce(video.standardId ? ('Now playing: ' + video.label + ' video.')\n"
    + "                            : (video.label + ': video coming soon.'));\n"
    + '}\n'
    + '\n'
    + 'function showPlaceholder(show) {\n'
    + '  if (show) {\n'
    + "    placeholder.classList.remove('hidden');\n"
    + "    placeholder.setAttribute('aria-hidden', 'false');\n"
    + "    iframe.style.visibility = 'hidden';\n"
    + '  } else {\n'
    + "    placeholder.classList.add('hidden');\n"
    + "    placeholder.setAttribute('aria-hidden', 'true');\n"
    + "    iframe.style.visibility = '';\n"
    + '  }\n'
    + '}\n'
    + '\n'
    + 'function announce(msg) {\n'
    + "  statusEl.textContent = '';\n"
    + '  requestAnimationFrame(function () { statusEl.textContent = msg; });\n'
    + '}\n';
}

// ---- CSS (replace item name in comment) ----
function buildCSS(item) {
  return css.replace(
    'Item 5: Motor Arm - grouped video player',
    item.title + ' - grouped video player'
  );
}

// ---- Write files ----
ITEMS.forEach(function (item) {
  var dir = path.join(BASE, item.dir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), buildHTML(item),   'utf8');
  fs.writeFileSync(path.join(dir, 'script.js'),  buildScript(item), 'utf8');
  fs.writeFileSync(path.join(dir, 'styles.css'), buildCSS(item),    'utf8');
  console.log('Created: ' + item.dir);
});

console.log('\nDone. ' + ITEMS.length + ' players created.');
