/**
 * cases.js — Final Test group manifest.
 *
 * This player represents ONE test group and holds all of that group's cases.
 * At runtime script.js randomly picks one unused case (letter) and loads its
 * video + questions in place; "Next Case" swaps to another unused case without
 * a page reload or a Storyline slide jump.
 *
 * standardId / eadId are placeholders today (all five point at the same video);
 * swap in the real per-case Vimeo ids — and, when delivered, per-case question
 * arrays — as content arrives. The rest of the code keys off `letter`.
 */

import { QUESTIONS_DATA } from './Questions.js';

// The test group this player represents ('1'..'4').
export const GROUP = '3';

// The group's 5 cases (letter-variants a..e).
export const CASES = [
  { letter: 'a', standardId: '1209573495', eadId: '1209573495', questions: QUESTIONS_DATA },
  { letter: 'b', standardId: '1209573495', eadId: '1209573495', questions: QUESTIONS_DATA },
  { letter: 'c', standardId: '1209573495', eadId: '1209573495', questions: QUESTIONS_DATA },
  { letter: 'd', standardId: '1209573495', eadId: '1209573495', questions: QUESTIONS_DATA },
  { letter: 'e', standardId: '1209573495', eadId: '1209573495', questions: QUESTIONS_DATA },
];
