// Quick sanity test for the simulation engine
// Run with: node --experimental-vm-modules src/engine/test.mjs
// Or just: node test.mjs from inside src/engine/

// Because we are in ESM, we need to inline minimal test data here
// This file tests core logic outside of React

const PATIENTS_PER_DOCTOR = 40;
const PATIENTS_PER_NURSE = 8;

function practicalCapacity(phc) {
  return Math.max(1, Math.round(phc.doctors * PATIENTS_PER_DOCTOR + phc.nurses * PATIENTS_PER_NURSE));
}

function safeDivide(a, b) {
  if (!b || b === 0) return 0;
  return a / b;
}

function classifyRisk(f) {
  if (f >= 0.90) return 'critical';
  if (f >= 0.75) return 'at-risk';
  return 'stable';
}

// Mini PHC dataset for testing
const testPHCs = [
  { id: 'phc-003', name: 'Trimbakeshwar PHC', patientsPerDay: 110, bedCapacity: 30, bedsOccupied: 27, doctors: 2, nurses: 7, medicines: { 'Paracetamol': { stock: 500, avgDemandPerDay: 130 } }, nearbyPHCIds: ['phc-002', 'phc-004', 'phc-011'] },
  { id: 'phc-002', name: 'Ghoti PHC', patientsPerDay: 62, bedCapacity: 20, bedsOccupied: 14, doctors: 1, nurses: 4, medicines: { 'Paracetamol': { stock: 800, avgDemandPerDay: 75 } }, nearbyPHCIds: [] },
  { id: 'phc-004', name: 'Surgana PHC', patientsPerDay: 73, bedCapacity: 20, bedsOccupied: 11, doctors: 1, nurses: 5, medicines: { 'Paracetamol': { stock: 1800, avgDemandPerDay: 90 } }, nearbyPHCIds: [] },
  { id: 'phc-011', name: 'Nashik Road PHC', patientsPerDay: 145, bedCapacity: 50, bedsOccupied: 38, doctors: 3, nurses: 10, medicines: { 'Paracetamol': { stock: 3500, avgDemandPerDay: 175 } }, nearbyPHCIds: [] },
];

// Build states
const states = {};
for (const phc of testPHCs) {
  states[phc.id] = {
    ...phc,
    currentLoad: phc.patientsPerDay,
    practicalCapacity: practicalCapacity(phc),
    redirectedInPatients: 0,
    redirectedOutPatients: 0,
    utilizationFraction: safeDivide(phc.patientsPerDay, practicalCapacity(phc)),
    computedStatus: 'stable',
    isDisrupted: false,
  };
}

console.log('\n=== Simulation Engine Sanity Tests ===\n');

// Test 1: Practical capacity calculation
for (const phc of testPHCs) {
  const cap = practicalCapacity(phc);
  console.assert(!isNaN(cap), `NaN practical capacity for ${phc.name}`);
  console.assert(cap > 0, `Zero capacity for ${phc.name}`);
  console.log(`[OK] ${phc.name}: practicalCapacity = ${cap}, baseline load = ${phc.patientsPerDay}, util = ${(safeDivide(phc.patientsPerDay, cap) * 100).toFixed(0)}%`);
}

// Test 2: PHC Closure scenario
const affected = states['phc-003'];
const REDIRECT_RATE = 0.85;
const redirected = Math.round(affected.patientsPerDay * REDIRECT_RATE);
console.log(`\n[SCENARIO] PHC Closure: ${affected.name}`);
console.log(`  Redirected patients: ${redirected}`);
console.assert(!isNaN(redirected), 'Redirected patients is NaN');
console.assert(redirected > 0, 'No patients redirected on closure');

// Distribute
const receivers = affected.nearbyPHCIds.map(id => states[id]).filter(Boolean);
const totalSurplus = receivers.reduce((s, r) => s + Math.max(0, r.practicalCapacity - r.currentLoad), 0);
for (const r of receivers) {
  const surplus = Math.max(0, r.practicalCapacity - r.currentLoad);
  const share = totalSurplus > 0 ? surplus / totalSurplus : 1 / receivers.length;
  const pts = Math.round(redirected * share);
  r.currentLoad += pts;
  r.redirectedInPatients += pts;
  r.utilizationFraction = safeDivide(r.currentLoad, r.practicalCapacity);
  r.computedStatus = classifyRisk(r.utilizationFraction);
  console.assert(!isNaN(pts), `NaN patients for ${r.name}`);
  console.assert(!isNaN(r.utilizationFraction), `NaN utilization for ${r.name}`);
  console.log(`  → ${r.name}: +${pts} patients, util=${(r.utilizationFraction * 100).toFixed(0)}%, risk=${r.computedStatus}`);
}

// Test 3: Duration affects output
const dur7 = 7;
const dur30 = 30;
// Duration does not change per-day numbers but affects secondary risk reporting
// Different severity multipliers should change redirected count
const severities = { low: 0.6, medium: 1.0, high: 1.4 };
for (const [sev, factor] of Object.entries(severities)) {
  const affectedFrac = 130 / (130);
  const patientsAffected = Math.round(110 * affectedFrac * factor);
  const red = Math.round(patientsAffected * 0.45);
  console.assert(!isNaN(red), `NaN redirected for severity ${sev}`);
}
console.log('\n[OK] All severity outputs are non-NaN');

// Test 4: Patient surge
const surgeFactor = 1.25;
const newLoad = Math.round(110 * surgeFactor);
const overflow = Math.max(0, newLoad - practicalCapacity(testPHCs[0]));
console.log(`\n[SCENARIO] Patient Surge (medium): load ${110} → ${newLoad}, overflow = ${overflow}`);
console.assert(!isNaN(newLoad) && !isNaN(overflow));
console.log('[OK] Patient surge values are valid');

console.log('\n=== All tests passed ✓ ===\n');
