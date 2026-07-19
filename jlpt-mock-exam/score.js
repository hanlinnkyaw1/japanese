/**
 * JLPT hardcoded (non-IRT) scoring — supports N1, N2, N3, N4, N5 in one file.
 * The active level is read dynamically from <i id="LevelConFig" data-user-level="N3">.
 *
 * N1/N2/N3 use three official-style sections, each independently scaled to
 * max 60 (total 180): 文字・語彙・文法, 読解, 聴解.
 *
 * N4/N5 use only TWO official sections: 言語知識（文字・語彙・文法）・読解
 * combined, scaled to max 120, and 聴解 scaled to max 60 (total 180 still).
 * Internally we still track vocab/grammar and reading as separate buckets
 * (for detailed breakdowns), but they are scaled together as one group so
 * their combined pass/fail and max-120 behavior matches the real test.
 *
 * Points are assigned per question type, then aggregated via
 * Proportional Normalization: (rawScore / rawMax) * groupScale.
 */

// ---- Per-level point tables ----

const N3_POINT_CONFIG = {
  vocab: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
  grammar: { 1: 1, 2: 1, 3: 1.5 },
  reading: { 4: 3, 5: 4, 6: 4, 7: 5 },
  listening: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 1 }
};

const N2_POINT_CONFIG = {
  vocab: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2 },
  grammar: { 7: 1, 8: 1, 9: 2 },
  reading: { 10: 3, 11: 2.5, 12: 3, 13: 3.5, 14: 4 },
  listening: { 1: 2, 2: 2, 3: 2.5, 4: 1.5, 5: 3 }
};

const N1_POINT_CONFIG = {
  vocab: { 1: 1, 2: 1, 3: 1.5, 4: 2 },
  grammar: { 5: 1, 6: 1.5, 7: 2 },
  reading: { 8: 2, 9: 2, 10: 3, 11: 3, 12: 3.5, 13: 4 },
  listening: { 1: 2, 2: 2, 3: 2.5, 4: 1.5, 5: 3 }
};

// N4: 文字・語彙 問題1-5, 文法 問題1-3, 読解 問題4-6 (continues numbering after grammar),
// 聴解 問題1-4. Grammar and reading are separate 'kind' tables so the shared
// mondai numbers 1-3 (grammar) vs 4-6 (reading) never collide.
const N4_POINT_CONFIG = {
  vocab: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2 },
  grammar: { 1: 1, 2: 1, 3: 1.5 },
  reading: { 4: 7, 5: 7, 6: 9 },
  listening: { 1: 2, 2: 2, 3: 4, 4: 1.5 }
};

// N5: 文字・語彙 問題1-4, 文法 問題1-3, 読解 問題1-3 (restarts its own numbering,
// but since 'reading' and 'grammar' are separate kind tables this is safe),
// 聴解 問題1-4.
const N5_POINT_CONFIG = {
  vocab: { 1: 2, 2: 2, 3: 2, 4: 2 },
  grammar: { 1: 1, 2: 1, 3: 1 },
  reading: { 4: 10, 5: 10, 6: 20 },
  listening: { 1: 2, 2: 2.5, 3: 3, 4: 2.5 }
};

// ---- Per-level pass rules (totals only; section minimums live in SECTION_GROUPS) ----

const N3_PASS_RULES = { totalMin: 95, totalMax: 180 };
const N2_PASS_RULES = { totalMin: 90, totalMax: 180 };
const N1_PASS_RULES = { totalMin: 100, totalMax: 180 };
const N4_PASS_RULES = { totalMin: 90, totalMax: 180 };
const N5_PASS_RULES = { totalMin: 80, totalMax: 180 };

/**
 * Section groups define how internal scoring buckets (vocabGrammar, reading,
 * listening) are combined and scaled into the OFFICIAL test sections used
 * for pass/fail thresholds.
 *
 * N1-N3: three independent sections, each its own group, scale 60 / min 19.
 * N4-N5: vocabGrammar + reading combine into one 120-point section (min 38),
 *         listening stays its own 60-point section (min 19).
 */
const THREE_WAY_SECTION_GROUPS = [
  { name: 'vocabGrammar', label: 'Vocab/Grammar', buckets: ['vocabGrammar'], scale: 60, min: 19 },
  { name: 'reading', label: 'Reading', buckets: ['reading'], scale: 60, min: 19 },
  { name: 'listening', label: 'Listening', buckets: ['listening'], scale: 60, min: 19 }
];

const COMBINED_LANGUAGE_SECTION_GROUPS = [
  {
    name: 'languageReading',
    label: 'Language Knowledge (Vocab/Grammar) & Reading',
    buckets: ['vocabGrammar', 'reading'],
    scale: 120,
    min: 38
  },
  { name: 'listening', label: 'Listening', buckets: ['listening'], scale: 60, min: 19 }
];

/**
 * Some N3 reading JSONs title sections 問題10–13 instead of 問題4–7.
 */
function n3NormalizeReadingMondai(mondai) {
  if (mondai == null) return null;
  if (mondai >= 4 && mondai <= 7) return mondai;
  if (mondai >= 10 && mondai <= 13) return mondai - 6; // 10→4 … 13→7
  return mondai;
}

function identityReadingMondai(mondai) {
  return mondai;
}

const LEVELS = {
  N1: {
    POINT_CONFIG: N1_POINT_CONFIG,
    PASS_RULES: N1_PASS_RULES,
    SECTION_GROUPS: THREE_WAY_SECTION_GROUPS,
    normalizeReadingMondai: identityReadingMondai
  },
  N2: {
    POINT_CONFIG: N2_POINT_CONFIG,
    PASS_RULES: N2_PASS_RULES,
    SECTION_GROUPS: THREE_WAY_SECTION_GROUPS,
    normalizeReadingMondai: identityReadingMondai
  },
  N3: {
    POINT_CONFIG: N3_POINT_CONFIG,
    PASS_RULES: N3_PASS_RULES,
    SECTION_GROUPS: THREE_WAY_SECTION_GROUPS,
    normalizeReadingMondai: n3NormalizeReadingMondai
  },
  N4: {
    POINT_CONFIG: N4_POINT_CONFIG,
    PASS_RULES: N4_PASS_RULES,
    SECTION_GROUPS: COMBINED_LANGUAGE_SECTION_GROUPS,
    normalizeReadingMondai: identityReadingMondai
  },
  N5: {
    POINT_CONFIG: N5_POINT_CONFIG,
    PASS_RULES: N5_PASS_RULES,
    SECTION_GROUPS: COMBINED_LANGUAGE_SECTION_GROUPS,
    normalizeReadingMondai: identityReadingMondai
  }
};

/**
 * Detect the active level from the page's <i id="LevelConFig" data-user-level="N3">.
 * Falls back to 'N3' if the element is missing or the level is unrecognized.
 */
function detectLevel() {
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('LevelConFig') : null;
    const raw = (el?.dataset?.userLevel || '').toUpperCase();
    if (LEVELS[raw]) return raw;
  } catch (e) {
    console.error('detected level fail:', e);
  }

  // Guarantee a valid fallback so the script never crashes
  return 'N3';
}

/**
 * Dynamically fetches the configuration so it adapts to DOM changes at runtime.
 */
function getActiveConfig() {
  const level = detectLevel();
  return {
    level: level,
    active: LEVELS[level],
    points: LEVELS[level].POINT_CONFIG,
    passRules: LEVELS[level].PASS_RULES,
    sectionGroups: LEVELS[level].SECTION_GROUPS
  };
}

/** Extract 問題 number from titles like "問題1", "問題４", "問題 12 …". */
function parseMondaiFromTitle(title) {
  if (!title) return null;
  const m = String(title).match(/問題\s*([0-9０-９]+)/);
  if (!m) return null;
  const raw = m[1].replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 0xFEE0));
  return parseInt(raw, 10);
}

function getPointsPerQuestion(scoreMeta) {
  if (!scoreMeta) return 0;
  const { points } = getActiveConfig(); // Read live config
  const { kind, mondai } = scoreMeta;
  const table = points[kind];
  if (!table || mondai == null) return 0;
  return table[mondai] ?? 0;
}

/**
 * Build scoreMeta for a Moji/Grammar item from section type + title.
 */
function buildMojiScoreMeta(sectionType, title) {
  const type = (sectionType || '').toLowerCase();
  let kind = 'vocab';
  if (type === 'grammar' || type === 'clozetest') kind = 'grammar';

  let mondai = parseMondaiFromTitle(title);
  if (type === 'clozetest' && !mondai) {
    const { points } = getActiveConfig(); // Read live config
    const grammarKeys = Object.keys(points.grammar || {}).map(Number);
    mondai = grammarKeys.length ? Math.min(...grammarKeys) : null;
  }

  return { kind, mondai, bucket: 'vocabGrammar' };
}

/**
 * Build scoreMeta for a Reading item.
 */
function buildReadingScoreMeta(title) {
  const { active } = getActiveConfig(); // Read live config
  const mondai = active.normalizeReadingMondai(parseMondaiFromTitle(title));
  return { kind: 'reading', mondai, bucket: 'reading' };
}

/**
 * Build scoreMeta for a Listening item.
 */
function buildListeningScoreMeta(mondai) {
  return { kind: 'listening', mondai: Number(mondai), bucket: 'listening' };
}

/**
 * calculateScores(items)
 */
function calculateScores(items) {
  // Grab the level, rules, and section-group layout dynamically at the exact moment this runs
  const { level, passRules, sectionGroups } = getActiveConfig();

  const buckets = {
    vocabGrammar: { score: 0, max: 0, correct: 0, total: 0 },
    reading: { score: 0, max: 0, correct: 0, total: 0 },
    listening: { score: 0, max: 0, correct: 0, total: 0 }
  };

  items.forEach(item => {
    const meta = item.scoreMeta;
    if (!meta || !buckets[meta.bucket]) return;

    const pts = getPointsPerQuestion(meta);
    const bucket = buckets[meta.bucket];
    bucket.total += 1;
    bucket.max += pts;

    const selected = item.selected == null ? null : Number(item.selected);
    const correct = Number(item.correct);
    if (selected !== null && selected === correct) {
      bucket.score += pts;
      bucket.correct += 1;
    }
  });

  // Freeze raw (unscaled) totals before section-group scaling
  Object.values(buckets).forEach(b => {
    b.rawScore = Math.round(b.score * 10) / 10;
    b.rawMax = Math.round(b.max * 10) / 10;
  });

  // Proportional Normalization, applied per official SECTION GROUP.
  // For N1-N3 each group wraps exactly one bucket (identical behavior to
  // before). For N4-N5, vocabGrammar + reading are combined into one
  // 120-point group before scaling, matching the real test's section layout.
  const failReasons = [];

  sectionGroups.forEach(group => {
    const groupRawScore = group.buckets.reduce((sum, key) => sum + buckets[key].rawScore, 0);
    const groupRawMax = group.buckets.reduce((sum, key) => sum + buckets[key].rawMax, 0);

    const incomplete = groupRawMax <= 0;
    const scaledTotal = incomplete ? 0 : Math.round(((groupRawScore / groupRawMax) * group.scale) * 10) / 10;
    const passed = !incomplete && scaledTotal >= group.min;
    const factor = incomplete ? 0 : group.scale / groupRawMax;

    group.buckets.forEach(key => {
      const b = buckets[key];
      b.score = incomplete ? 0 : Math.round(b.rawScore * factor * 10) / 10;
      b.max = incomplete
        ? Math.round((group.scale / group.buckets.length) * 10) / 10
        : Math.round(b.rawMax * factor * 10) / 10;
      b.passed = passed;
      b.incomplete = incomplete;
      b.groupName = group.name;
      b.groupLabel = group.label;
      b.groupScaledScore = scaledTotal;
      b.groupMin = group.min;
    });

    if (!passed) {
      failReasons.push(
        incomplete
          ? `${group.label}: section not attempted (no scorable questions)`
          : `${group.label} ${scaledTotal} < ${group.min}`
      );
    }
  });

  const totalScore = Math.round((buckets.vocabGrammar.score + buckets.reading.score + buckets.listening.score) * 10) / 10;
  const totalMax = 180;

  const totalCorrect = buckets.vocabGrammar.correct + buckets.reading.correct + buckets.listening.correct;
  const totalQuestions = buckets.vocabGrammar.total + buckets.reading.total + buckets.listening.total;

  if (totalScore < passRules.totalMin) {
    failReasons.unshift(`Total ${totalScore} < ${passRules.totalMin}`);
  }

  const allGroupsPassed = sectionGroups.every(group => {
    // Any bucket in the group carries the shared passed flag
    return buckets[group.buckets[0]].passed;
  });

  const passed = totalScore >= passRules.totalMin && allGroupsPassed;

  return {
    level: level,
    vocabGrammar: buckets.vocabGrammar,
    reading: buckets.reading,
    listening: buckets.listening,
    total: {
      score: totalScore,
      max: totalMax,
      correct: totalCorrect,
      total: totalQuestions
    },
    passed,
    failReasons
  };
}

// Expose for browser <script> usage
window.LEVELS = LEVELS;
window.getActiveConfig = getActiveConfig;
window.parseMondaiFromTitle = parseMondaiFromTitle;
window.buildMojiScoreMeta = buildMojiScoreMeta;
window.buildReadingScoreMeta = buildReadingScoreMeta;
window.buildListeningScoreMeta = buildListeningScoreMeta;
window.getPointsPerQuestion = getPointsPerQuestion;
window.calculateScores = calculateScores;
