/**
 * questionsToPlayer.js
 * "Questions to Player" — Node.js build script
 *
 * Reads /excel/Questions.xlsx and generates /Questions.js
 * Run: node scripts/questionsToPlayer.js
 */

import XLSX from 'xlsx';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

const EXCEL_PATH     = path.join(ROOT, 'excel', 'Questions.xlsx');
const OUTPUT_PATH    = path.join(ROOT, 'Questions.js');
const SKIP_SHEETS    = ['start', 'readme'];

// ─── Column name normaliser ───────────────────────────────────────────────────
// Maps raw Excel header text → canonical key used in the output object.
const COLUMN_MAP = {
  'option':                'text',
  'option description':    'description',
  'feedback rationale':    'feedback',
  'correct':               'correct',
  'debrief rationale':     'rationale',
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Entry point — reads Excel, writes Questions.js */
export async function run() {
  try {
    const wb        = readExcel(EXCEL_PATH);
    const questions = parseAllSheets(wb);
    writeQuestionsFile(questions, OUTPUT_PATH);

    console.log('✓ Excel loaded');
    console.log(`✓ ${questions.length} questions parsed`);
    console.log('✓ Questions.js updated');
  } catch (err) {
    console.error('✗ questionsToPlayer error:', err.message);
    throw err;
  }
}

// ─── Step 1: read workbook ────────────────────────────────────────────────────

function readExcel(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }
  return XLSX.readFile(filePath);
}

// ─── Step 2: iterate sheets ──────────────────────────────────────────────────

function parseAllSheets(wb) {
  return wb.SheetNames
    .filter(name => !SKIP_SHEETS.includes(name.trim().toLowerCase()))
    .map((name, idx) => parseSheet(wb.Sheets[name], name, idx + 1))
    .filter(Boolean);
}

// ─── Step 3: parse one sheet → question object ───────────────────────────────

function parseSheet(ws, sheetName, index) {
  try {
    const question  = readQuestionText(ws);
    const time      = readTimecode(ws);
    const options   = readOptionsTable(ws);

    return buildQuestionObject({ index, sheetName, question, time, options });
  } catch (err) {
    console.warn(`  ⚠ Sheet "${sheetName}" skipped: ${err.message}`);
    return null;
  }
}

// ─── Helpers: read cells from sheet ──────────────────────────────────────────

/**
 * Question text lives in the merged cell A1 (first row, spans all columns).
 * xlsx stores the value in the top-left cell of any merged range.
 */
function readQuestionText(ws) {
  const cell = ws['A1'];
  const text = cell ? String(cell.v ?? '').trim() : '';
  if (!text) throw new Error('Question text (A1) is empty');
  return text;
}

/**
 * Timecode is stored in B2 (the value next to the gray label in A2).
 * Excel stores time-of-day as a decimal fraction of 24 hours (0..1).
 * The spreadsheet uses HH:MM:SS display format where "HH" means minutes
 * (e.g. "01:08:06" = 1 min 8 sec), so: fraction × 1440 = seconds.
 */
function readTimecode(ws) {
  const cell = ws['B2'];
  if (!cell) return 0;

  // Excel time fraction — multiply by 1440 (min/day) to get seconds
  if (typeof cell.v === 'number' && cell.v > 0 && cell.v < 1) {
    return Math.round(cell.v * 1440 * 10) / 10;
  }

  // Fallback: use formatted string (cell.w) or raw value
  const raw = cell.w ? String(cell.w).trim() : String(cell.v ?? '').trim();
  return parseTimecode(raw);
}

/**
 * Options table starts at row 5 (header) and data from row 6 downward.
 * Reads until an empty "Option" cell is encountered.
 */
function readOptionsTable(ws) {
  // Decode the range of the sheet
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');

  // Row 5 (index 4) is the header row
  const HEADER_ROW = 4; // 0-indexed
  const DATA_START = 5; // 0-indexed

  // Build column index → canonical key map from the header row
  const colKeyMap = {};
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: HEADER_ROW, c });
    const cell = ws[addr];
    if (!cell) continue;
    const raw = String(cell.v ?? '').trim().toLowerCase();
    const key = COLUMN_MAP[raw];
    if (key) colKeyMap[c] = key;
  }

  if (!Object.values(colKeyMap).includes('text')) {
    throw new Error('Could not find "Option" column in header row (row 5)');
  }

  // Read data rows
  const options = [];
  for (let r = DATA_START; r <= range.e.r; r++) {
    const row = {};
    for (const [c, key] of Object.entries(colKeyMap)) {
      const addr = XLSX.utils.encode_cell({ r, c: Number(c) });
      const cell = ws[addr];
      row[key]   = cell ? cell.v : undefined;
    }

    // Stop if Option cell is blank (end of table)
    const optText = String(row.text ?? '').trim();
    if (!optText) break;

    options.push(row);
  }

  return options;
}

// ─── Step 4: assemble final object ───────────────────────────────────────────

function buildQuestionObject({ index, sheetName, question, time, options }) {
  return {
    id:       `Q${index}`,
    sheet:    sheetName,
    question,
    time,
    options:  options.map(opt => ({
      text:        String(opt.text        ?? '').trim(),
      description: String(opt.description ?? '').trim(),
      feedback:    String(opt.feedback    ?? '').trim(),
      rationale:   String(opt.rationale   ?? '').trim(),
      correct:     parseBoolean(opt.correct),
    })),
  };
}

// ─── Step 5: write output file ───────────────────────────────────────────────

function writeQuestionsFile(questions, outPath) {
  const json    = JSON.stringify(questions, null, 2);
  const content = `// AUTO-GENERATED — do not edit manually.
// Source: excel/Questions.xlsx
// Run "npm run import" to regenerate.

export const QUESTIONS_DATA = ${json};
`;
  fs.writeFileSync(outPath, content, 'utf8');
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

/** Convert various "correct" representations → boolean */
function parseBoolean(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number')  return val === 1;
  const s = String(val ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

/** Parse timecode from string like "5 sec", "5", "01:08", "01:08:06", or number 5 */
function parseTimecode(raw) {
  if (typeof raw === 'number') return raw;

  // "HH:MM:SS" — treat HH as minutes (spreadsheet convention)
  const tripleMatch = raw.match(/^(\d+):(\d+):(\d+)/);
  if (tripleMatch) return parseInt(tripleMatch[1]) * 60 + parseInt(tripleMatch[2]);

  // "MM:SS"
  const timeMatch = raw.match(/^(\d+):(\d+)/);
  if (timeMatch) return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);

  // "5 sec" or "5"
  const numMatch = raw.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1]);

  return 0;
}

// ─── Run if executed directly ─────────────────────────────────────────────────
// node scripts/questionsToPlayer.js
run().catch(() => process.exit(1));
