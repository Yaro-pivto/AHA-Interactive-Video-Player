/**
 * Final Test subfolder generator.
 * Copies the Final Test base player into 20 Test folders, one per Test Case Study,
 * setting each folder's video id. Questions are copied unchanged.
 * Run: node generate-tests.cjs
 */
const fs   = require('fs');
const path = require('path');

const BASE = __dirname;
const TESTS = {
  'Test 1a':'1175973409','Test 1b':'1175973423','Test 1c':'1175973442','Test 1d':'1175973454','Test 1e':'1175973464',
  'Test 2a':'1175973485','Test 2b':'1175973505','Test 2c':'1175973530','Test 2d':'1175973546','Test 2e':'1175973570',
  'Test 3a':'1175973586','Test 3b':'1175973614','Test 3c':'1175973630','Test 3d':'1175973840','Test 3e':'1175973860',
  'Test 4a':'1175973872','Test 4b':'1175973880','Test 4c':'1175973894','Test 4d':'1175973909','Test 4e':'1175973918'
};

// files/folders to copy from the base into each Test folder
const ITEMS = ['index.html', 'Questions.js', 'scripts', 'styles', 'img'];

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(name => copyRecursive(path.join(src, name), path.join(dst, name)));
  } else {
    fs.copyFileSync(src, dst);
  }
}

Object.keys(TESTS).forEach(folderName => {
  const id  = TESTS[folderName];
  const dst = path.join(BASE, folderName);
  fs.mkdirSync(dst, { recursive: true });

  ITEMS.forEach(item => {
    const s = path.join(BASE, item);
    if (fs.existsSync(s)) copyRecursive(s, path.join(dst, item));
  });

  // set the video id in the copied index.html
  const idx = path.join(dst, 'index.html');
  let html = fs.readFileSync(idx, 'utf8');
  html = html.replace(/data-standard-id="\d+"/, 'data-standard-id="' + id + '"');
  html = html.replace(/data-ead-id="\d+"/,      'data-ead-id="' + id + '"');
  fs.writeFileSync(idx, html, 'utf8');
});

console.log('Generated ' + Object.keys(TESTS).length + ' Final Test subfolders.');
