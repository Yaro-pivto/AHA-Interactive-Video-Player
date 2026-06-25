/**
 * Regular Video generator.
 * Reads ../video-manifest.json and creates one folder per non-interactive video
 * (types: background, intro, score, special). Each folder gets a single index.html
 * with the EAD switch. Run: node generate.cjs
 */
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const MANIFEST = path.join(ROOT, 'video-manifest.json');
const TYPES    = ['background', 'intro', 'score', 'special'];

function safeName(label) {
  // keep letters, numbers, spaces, parentheses, dashes; collapse spaces
  return label.replace(/[^A-Za-z0-9 ()\-]/g, '').replace(/\s+/g, ' ').trim();
}

function page(v) {
  var params = 'badge=0&autopause=0&quality_selector=1&progress_bar=1&fullscreen=0';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${v.label}</title>
  <style>
    html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
    iframe { width:100%; height:100%; border:0; }
  </style>
</head>
<body>
  <iframe
    id="vimeo"
    title="${v.label}"
    data-standard-id="${v.standardId}"
    data-ead-id="${v.eadId}"
    data-params="${params}"
    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
  <script>
    (function () {
      var f = document.getElementById('vimeo');
      if (!f) return;
      var standard = f.getAttribute('data-standard-id');
      var ead      = f.getAttribute('data-ead-id') || standard;
      var params   = f.getAttribute('data-params');
      var extended = false;
      try {
        var sl = (window.parent && window.parent.GetPlayer && window.parent.GetPlayer()) ||
                 (window.top && window.top.GetPlayer && window.top.GetPlayer());
        if (sl) {
          var val = sl.GetVar('Extended_Audio_Description_Track');
          extended = (val === true || val === 'true' || val === 'True');
        }
      } catch (e) { extended = false; }
      var id = extended ? ead : standard;
      f.src = 'https://player.vimeo.com/video/' + id + '?' + params;
    })();
  </script>
</body>
</html>
`;
}

const data = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
let count = 0;
data.videos.filter(v => TYPES.includes(v.type)).forEach(v => {
  const folder = path.join(__dirname, safeName(v.label));
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'index.html'), page(v), 'utf8');
  count++;
});
console.log('Generated ' + count + ' Regular Video folders.');
