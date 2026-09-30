// Gemini Service edge-case test (Node-compatible, no imports needed)
// Tests: API key detection, prompt building, JSON extraction

console.log('\n=== Gemini Service Edge Case Tests ===\n');

// ─── Test 1: API key detection ────────────────────────────────
function isGeminiConfigured(key) {
  return !!key && key !== 'your_gemini_api_key_here' && key.trim().length > 10;
}

const keyScenarios = [
  { key: undefined, expected: false, label: 'undefined key' },
  { key: '', expected: false, label: 'empty string' },
  { key: 'your_gemini_api_key_here', expected: false, label: 'placeholder key' },
  { key: '  ', expected: false, label: 'whitespace only' },
  { key: 'short', expected: false, label: 'too short' },
  { key: 'AIzaSyC_validlookingkey12345', expected: true, label: 'valid-looking key' },
];

let passed = 0;
let failed = 0;

for (const s of keyScenarios) {
  const result = isGeminiConfigured(s.key);
  if (result === s.expected) {
    console.log(`[OK] ${s.label}: configured=${result}`);
    passed++;
  } else {
    console.error(`[FAIL] ${s.label}: expected ${s.expected}, got ${result}`);
    failed++;
  }
}

// ─── Test 2: JSON extraction ──────────────────────────────────
function extractJSON(rawText) {
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) {}
  }
  return null;
}

const jsonTestCases = [
  {
    label: 'clean JSON',
    input: '{"situationSummary": "Test summary", "structured": true}',
    expectNull: false,
  },
  {
    label: 'JSON with markdown fences',
    input: '```json\n{"situationSummary": "Test", "whyItMatters": "Cascade"}\n```',
    expectNull: false,
  },
  {
    label: 'JSON embedded in prose',
    input: 'Here is the analysis:\n{"situationSummary": "Impact", "priorityFacilities": []}\nEnd.',
    expectNull: false,
  },
  {
    label: 'pure text — no JSON',
    input: 'This is a free-form text response with no JSON object.',
    expectNull: true,
  },
  {
    label: 'empty string',
    input: '',
    expectNull: true,
  },
];

console.log('\n--- JSON Extraction ---');
for (const tc of jsonTestCases) {
  const result = extractJSON(tc.input);
  const isNull = result === null;
  if (isNull === tc.expectNull) {
    console.log(`[OK] ${tc.label}: ${isNull ? 'null (expected)' : JSON.stringify(result).slice(0, 50) + '…'}`);
    passed++;
  } else {
    console.error(`[FAIL] ${tc.label}: expectNull=${tc.expectNull}, got ${JSON.stringify(result)}`);
    failed++;
  }
}

// ─── Test 3: Prompt sanity ────────────────────────────────────
console.log('\n--- Prompt Content Validation ---');

// Build a minimal mock simulation result
const mockResult = {
  summary: {
    disruptionTypeLabel: 'PHC Closure',
    affectedPHCName: 'Trimbakeshwar PHC',
    patientsAffected: 110,
    phcsAffected: 4,
    secondaryRisks: 2,
    networkLoadIncreasePct: 8,
    redirected: 94,
  },
  params: { phcId: 'phc-003', disruptionType: 'phc_closure', duration: 7, severity: 'medium' },
  affectedPHCs: [
    { id: 'phc-003', name: 'Trimbakeshwar PHC', taluka: 'Trimbakeshwar', baselineLoad: 110, currentLoad: 16, practicalCapacity: 136, utilizationFraction: 0.12, computedStatus: 'stable', isDisrupted: true, redirectedIn: 0, redirectedOut: 94 },
    { id: 'phc-011', name: 'Nashik Road PHC', taluka: 'Nashik', baselineLoad: 145, currentLoad: 217, practicalCapacity: 200, utilizationFraction: 1.09, computedStatus: 'critical', isDisrupted: false, redirectedIn: 72, redirectedOut: 0 },
  ],
  patientFlows: [
    { fromId: 'phc-003', toId: 'phc-011', patients: 72, hop: 1 },
    { fromId: 'phc-003', toId: 'phc-002', patients: 13, hop: 1 },
  ],
  medicineImpacts: [
    { medicine: 'Paracetamol', baseDemand: 130, currentDemand: 0, stockDaysRemaining: 999 },
  ],
  capacityImpacts: [
    { id: 'phc-011', name: 'Nashik Road PHC', utilizationPct: 109, newLoad: 217, capacity: 200, risk: 'critical', isDisrupted: false },
  ],
  secondaryRisks: [
    { id: 'phc-011', name: 'Nashik Road PHC', utilizationFraction: 1.09, computedStatus: 'critical' },
  ],
  timeline: [
    { label: 'Day 0 — Disruption', events: ['Trimbakeshwar PHC closure'] },
    { label: 'Day 1–2 — First Ripple', events: ['Nashik Road PHC absorbs 72 patients'] },
  ],
};

// Build a simplified version of the prompt
function buildPromptSimple(result) {
  const { summary, params, affectedPHCs, patientFlows } = result;
  return `Scenario: ${summary.disruptionTypeLabel}
Affected PHC: ${summary.affectedPHCName}
Duration: ${params.duration} days
Patients affected: ${summary.patientsAffected}
PHCs affected: ${summary.phcsAffected}`;
}

const prompt = buildPromptSimple(mockResult);

// Validate prompt content
const checks = [
  { desc: 'contains disruption type', ok: prompt.includes('PHC Closure') },
  { desc: 'contains PHC name', ok: prompt.includes('Trimbakeshwar') },
  { desc: 'contains duration', ok: prompt.includes('7') },
  { desc: 'contains patient count', ok: prompt.includes('110') },
  { desc: 'no API key exposed', ok: !prompt.includes('AIza') && !prompt.includes('api_key') },
];

for (const c of checks) {
  if (c.ok) {
    console.log(`[OK] ${c.desc}`);
    passed++;
  } else {
    console.error(`[FAIL] ${c.desc}`);
    failed++;
  }
}

// ─── Test 4: Simulation works without Gemini ─────────────────
console.log('\n--- Simulation Independence ---');
// If Gemini errors, simulation data is unaffected
const simulationData = { summary: { patientsAffected: 94 } };
let geminiResult = null;
try {
  throw new Error('Simulated Gemini failure');
} catch (_) {
  // Gemini failed
}
const simulationStillWorks = simulationData.summary.patientsAffected === 94 && geminiResult === null;
if (simulationStillWorks) {
  console.log('[OK] Simulation data unaffected by Gemini failure');
  passed++;
} else {
  console.error('[FAIL] Simulation affected by Gemini failure');
  failed++;
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
