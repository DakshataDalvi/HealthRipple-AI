// ============================================================
// HealthRipple AI — Simulation Engine
// Pure JavaScript, deterministic, no ML.
// All formulas are transparent and explainable.
// ============================================================

import { phcs, getPHCById } from '../data/phcData';

// ─── Constants ───────────────────────────────────────────────

// Each doctor can handle this many patients per day at "practical" capacity
const PATIENTS_PER_DOCTOR = 40;
// Each nurse contributes fractionally
const PATIENTS_PER_NURSE = 8;

// Patients who cannot be served at disrupted PHC that seek care elsewhere
// (not everyone travels; some stay home, some delay care)
const REDIRECT_RATE = {
  medicine_shortage: 0.45,  // 45% of affected patients seek alternative
  phc_closure: 0.85,        // 85% (most have no choice)
  patient_surge: 0.0,       // not applicable — surge stays at the PHC
  staff_shortage: 0.40,     // 40% overflow
};

// Severity multipliers per disruption type
const SEVERITY_FACTORS = {
  medicine_shortage: { low: 0.6, medium: 1.0, high: 1.4 },
  phc_closure: { low: 0.8, medium: 1.0, high: 1.0 },
  patient_surge: { low: 1.1, medium: 1.25, high: 1.5 },
  staff_shortage: { low: 0.5, medium: 0.65, high: 0.80 },
};

// Risk thresholds (capacity utilisation)
const RISK_THRESHOLD = { atRisk: 0.75, critical: 0.90 };

// How many propagation hops to simulate (keeps it bounded)
const MAX_HOPS = 2;

// ─── Helpers ─────────────────────────────────────────────────

function practicalCapacity(phc, staffReductionFactor = 1.0) {
  const raw = phc.doctors * PATIENTS_PER_DOCTOR + phc.nurses * PATIENTS_PER_NURSE;
  return Math.max(1, Math.round(raw * staffReductionFactor));
}

function haversineDist(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifyRisk(utilizationFraction) {
  if (utilizationFraction >= RISK_THRESHOLD.critical) return 'critical';
  if (utilizationFraction >= RISK_THRESHOLD.atRisk) return 'at-risk';
  return 'stable';
}

function safeDivide(a, b) {
  if (!b || b === 0) return 0;
  return a / b;
}

// Estimate the fraction of patients at the disrupted PHC that need medicine M
function medicineAffectedFraction(affectedPHC, medicine) {
  const med = affectedPHC.medicines[medicine];
  if (!med) return 0;
  // Fraction = medicine demand relative to total patient demand proxy
  const totalDemand = Object.values(affectedPHC.medicines).reduce(
    (s, m) => s + (m.avgDemandPerDay || 0),
    0,
  );
  return totalDemand > 0 ? safeDivide(med.avgDemandPerDay, totalDemand) : 0;
}

// Distribute redirected patients among nearby PHCs using a weighted gravity model.
// Weight = capacitySurplus × (1 / distance) — unchanged formula.
// Each returned flow now carries:
//   distanceKm     — Haversine straight-line km (geographic proximity factor)
//   capacitySurplus — remaining headroom at the receiver (capacity factor)
//   utilizationPct  — current utilization at the receiver (risk factor)
//   weightScore     — the combined gravity weight that determined the share
//   sharePct        — percentage of total redirected patients sent here
//
// Also returns `candidateEvaluations` showing ALL nearby PHCs evaluated,
// so the UI can distinguish "considered but not selected" candidates.
function distributePatients(redirectedCount, affectedPHC, receiverStates, allPHCStates) {
  const nearbyIds = affectedPHC.nearbyPHCIds || [];
  const receivers = nearbyIds
    .map(id => allPHCStates[id])
    .filter(Boolean);

  if (receivers.length === 0) return { flows: [], candidateEvaluations: [] };

  const evalData = receivers.map(r => {
    const distanceKm = Math.round(haversineDist(affectedPHC.lat, affectedPHC.lng, r.lat, r.lng) * 10) / 10;
    const surplus = Math.max(0, r.practicalCapacity - r.currentLoad);
    const utilizationPct = Math.round(safeDivide(r.currentLoad, r.practicalCapacity) * 100);
    // gravity: inversely proportional to distance, proportional to capacity surplus — unchanged
    const weight = surplus / Math.max(1, distanceKm);
    return { receiver: r, distanceKm, surplus, utilizationPct, weight };
  });

  const totalWeight = evalData.reduce((s, e) => s + e.weight, 0);

  const flows = evalData.map(e => {
    const share = totalWeight > 0 ? e.weight / totalWeight : 1 / evalData.length;
    const patients = Math.round(redirectedCount * share);
    return {
      toId: e.receiver.id,
      patients,
      // geographic & capacity metadata (read-only in UI; does not alter the model)
      distanceKm: e.distanceKm,
      capacitySurplus: e.surplus,
      utilizationPct: e.utilizationPct,
      weightScore: Math.round(e.weight * 100) / 100,
      sharePct: Math.round(share * 100),
    };
  });

  // All candidates with their evaluation scores (including those receiving 0 patients)
  const candidateEvaluations = evalData.map(e => ({
    phcId: e.receiver.id,
    phcName: e.receiver.name,
    distanceKm: e.distanceKm,
    capacitySurplus: e.surplus,
    utilizationPct: e.utilizationPct,
    weightScore: Math.round(e.weight * 100) / 100,
  }));

  return { flows, candidateEvaluations };
}

// ─── State Builder ────────────────────────────────────────────

function buildInitialStates() {
  const states = {};
  for (const phc of phcs) {
    states[phc.id] = {
      ...phc,
      currentLoad: phc.patientsPerDay,
      practicalCapacity: practicalCapacity(phc),
      medicineStates: Object.fromEntries(
        Object.entries(phc.medicines).map(([name, data]) => [
          name,
          { ...data, currentDemandPerDay: data.avgDemandPerDay },
        ]),
      ),
      utilizationFraction: safeDivide(phc.patientsPerDay, practicalCapacity(phc)),
      computedStatus: phc.status,
      redirectedInPatients: 0,
      redirectedOutPatients: 0,
      isDisrupted: false,
      disruptionType: null,
    };
  }
  return states;
}

// ─── Scenario Engines ─────────────────────────────────────────

function runMedicineShortage(params, states) {
  const { phcId, medicine, duration, severity } = params;
  const affected = states[phcId];
  if (!affected) throw new Error(`PHC ${phcId} not found`);

  const med = affected.medicines[medicine];
  // Days of stock remaining before shortage bites
  const stockDays = med
    ? Math.floor(safeDivide(med.stock, med.avgDemandPerDay))
    : 0;

  // Fraction of patients that actually need this medicine
  const affectedFraction = medicineAffectedFraction(affected, medicine);
  const severityFactor = SEVERITY_FACTORS.medicine_shortage[severity] ?? 1.0;

  // Patients who can't get medicine and may seek it elsewhere
  const patientsAffected = Math.round(
    affected.patientsPerDay * affectedFraction * severityFactor,
  );
  const redirected = Math.round(patientsAffected * REDIRECT_RATE.medicine_shortage);

  // Mark the affected PHC
  affected.isDisrupted = true;
  affected.disruptionType = 'medicine_shortage';
  affected.redirectedOutPatients = redirected;
  affected.currentLoad = Math.max(0, affected.currentLoad - redirected);
  affected.computedStatus = 'critical';
  if (med) {
    affected.medicineStates[medicine].currentDemandPerDay = 0; // effectively out of stock
  }
  affected.utilizationFraction = safeDivide(affected.currentLoad, affected.practicalCapacity);

  // Distribute to neighbours
  const { flows, candidateEvaluations } = distributePatients(redirected, affected, states, states);
  for (const flow of flows) {
    const receiver = states[flow.toId];
    if (!receiver) continue;
    receiver.redirectedInPatients += flow.patients;
    receiver.currentLoad += flow.patients;
    // Proportionally increase all medicine demands
    const loadIncreaseFactor = safeDivide(receiver.currentLoad, receiver.patientsPerDay);
    for (const mName of Object.keys(receiver.medicineStates)) {
      receiver.medicineStates[mName].currentDemandPerDay = Math.round(
        receiver.medicines[mName].avgDemandPerDay * loadIncreaseFactor,
      );
    }
    receiver.utilizationFraction = safeDivide(receiver.currentLoad, receiver.practicalCapacity);
    receiver.computedStatus = classifyRisk(receiver.utilizationFraction);
  }

  return { primaryFlows: flows, candidateEvaluations, patientsAffected, redirected };
}

function runPHCClosure(params, states) {
  const { phcId, duration, severity } = params;
  const affected = states[phcId];
  if (!affected) throw new Error(`PHC ${phcId} not found`);

  const redirected = Math.round(affected.patientsPerDay * REDIRECT_RATE.phc_closure);

  affected.isDisrupted = true;
  affected.disruptionType = 'phc_closure';
  affected.redirectedOutPatients = redirected;
  affected.currentLoad = 0;
  affected.computedStatus = 'critical';
  affected.utilizationFraction = 0;
  affected.practicalCapacity = 0;

  const { flows, candidateEvaluations } = distributePatients(redirected, affected, states, states);
  for (const flow of flows) {
    const receiver = states[flow.toId];
    if (!receiver) continue;
    receiver.redirectedInPatients += flow.patients;
    receiver.currentLoad += flow.patients;
    const factor = safeDivide(receiver.currentLoad, receiver.patientsPerDay);
    for (const mName of Object.keys(receiver.medicineStates)) {
      receiver.medicineStates[mName].currentDemandPerDay = Math.round(
        receiver.medicines[mName].avgDemandPerDay * factor,
      );
    }
    receiver.utilizationFraction = safeDivide(receiver.currentLoad, receiver.practicalCapacity);
    receiver.computedStatus = classifyRisk(receiver.utilizationFraction);
  }

  return { primaryFlows: flows, candidateEvaluations, patientsAffected: affected.patientsPerDay, redirected };
}

function runPatientSurge(params, states) {
  const { phcId, severity, duration } = params;
  const affected = states[phcId];
  if (!affected) throw new Error(`PHC ${phcId} not found`);

  const surgeFactor = SEVERITY_FACTORS.patient_surge[severity] ?? 1.25;
  const newLoad = Math.round(affected.patientsPerDay * surgeFactor);
  const surgeExtra = newLoad - affected.patientsPerDay;

  affected.isDisrupted = true;
  affected.disruptionType = 'patient_surge';
  affected.currentLoad = newLoad;
  affected.utilizationFraction = safeDivide(newLoad, affected.practicalCapacity);
  affected.computedStatus = classifyRisk(affected.utilizationFraction);

  // Scale medicine demand proportionally
  for (const mName of Object.keys(affected.medicineStates)) {
    affected.medicineStates[mName].currentDemandPerDay = Math.round(
      affected.medicines[mName].avgDemandPerDay * surgeFactor,
    );
  }

  // If capacity is breached, overflow to nearby PHCs
  const overflowAmount = Math.max(0, newLoad - affected.practicalCapacity);
  let flows = [];
  let candidateEvaluations = [];
  if (overflowAmount > 0) {
    affected.redirectedOutPatients = overflowAmount;
    affected.currentLoad = Math.max(0, affected.currentLoad - overflowAmount);
    affected.utilizationFraction = safeDivide(affected.currentLoad, affected.practicalCapacity);
    affected.computedStatus = classifyRisk(affected.utilizationFraction);
    ({ flows, candidateEvaluations } = distributePatients(overflowAmount, affected, states, states));
    for (const flow of flows) {
      const receiver = states[flow.toId];
      if (!receiver) continue;
      receiver.redirectedInPatients += flow.patients;
      receiver.currentLoad += flow.patients;
      const factor = safeDivide(receiver.currentLoad, receiver.patientsPerDay);
      for (const mName of Object.keys(receiver.medicineStates)) {
        receiver.medicineStates[mName].currentDemandPerDay = Math.round(
          receiver.medicines[mName].avgDemandPerDay * factor,
        );
      }
      receiver.utilizationFraction = safeDivide(receiver.currentLoad, receiver.practicalCapacity);
      receiver.computedStatus = classifyRisk(receiver.utilizationFraction);
    }
  }

  return { primaryFlows: flows, candidateEvaluations, patientsAffected: newLoad, redirected: overflowAmount };
}

function runStaffShortage(params, states) {
  const { phcId, severity, duration } = params;
  const affected = states[phcId];
  if (!affected) throw new Error(`PHC ${phcId} not found`);

  // Staff reduction factor: how much of normal capacity remains
  const remainingCapacityFactor = SEVERITY_FACTORS.staff_shortage[severity] ?? 0.65;
  const reducedCapacity = Math.round(affected.practicalCapacity * remainingCapacityFactor);

  affected.isDisrupted = true;
  affected.disruptionType = 'staff_shortage';
  affected.practicalCapacity = reducedCapacity;
  affected.utilizationFraction = safeDivide(affected.currentLoad, reducedCapacity);
  affected.computedStatus = classifyRisk(affected.utilizationFraction);

  // Overflow: patients that can't be served
  const overflow = Math.max(0, affected.currentLoad - reducedCapacity);
  let flows = [];
  let candidateEvaluations = [];
  if (overflow > 0) {
    const redirected = Math.round(overflow * REDIRECT_RATE.staff_shortage);
    affected.redirectedOutPatients = redirected;
    affected.currentLoad = Math.max(0, affected.currentLoad - redirected);
    affected.utilizationFraction = safeDivide(affected.currentLoad, reducedCapacity);
    affected.computedStatus = classifyRisk(affected.utilizationFraction);
    ({ flows, candidateEvaluations } = distributePatients(redirected, affected, states, states));
    for (const flow of flows) {
      const receiver = states[flow.toId];
      if (!receiver) continue;
      receiver.redirectedInPatients += flow.patients;
      receiver.currentLoad += flow.patients;
      const factor = safeDivide(receiver.currentLoad, receiver.patientsPerDay);
      for (const mName of Object.keys(receiver.medicineStates)) {
        receiver.medicineStates[mName].currentDemandPerDay = Math.round(
          receiver.medicines[mName].avgDemandPerDay * factor,
        );
      }
      receiver.utilizationFraction = safeDivide(receiver.currentLoad, receiver.practicalCapacity);
      receiver.computedStatus = classifyRisk(receiver.utilizationFraction);
    }
    return { primaryFlows: flows, candidateEvaluations, patientsAffected: affected.patientsPerDay, redirected };
  }

  return { primaryFlows: flows, candidateEvaluations, patientsAffected: affected.patientsPerDay, redirected: 0 };
}

// ─── Second-order propagation ─────────────────────────────────
// After first hop, receivers that are now overloaded may push to their neighbours
function propagateSecondOrder(primaryReceiverIds, states, allFlows) {
  for (const receiverId of primaryReceiverIds) {
    const phc = states[receiverId];
    if (!phc || phc.utilizationFraction < RISK_THRESHOLD.atRisk) continue;

    const secondaryOverflow = Math.max(0, phc.currentLoad - phc.practicalCapacity);
    if (secondaryOverflow <= 0) continue;

    const spillover = Math.round(secondaryOverflow * 0.30); // conservative secondary spill
    const { flows: secondFlows } = distributePatients(spillover, phc, states, states);

    for (const flow of secondFlows) {
      if (flow.toId === receiverId) continue; // avoid self-loops
      const r2 = states[flow.toId];
      if (!r2 || r2.isDisrupted) continue;
      r2.redirectedInPatients += flow.patients;
      r2.currentLoad += flow.patients;
      const factor = safeDivide(r2.currentLoad, r2.patientsPerDay);
      for (const mName of Object.keys(r2.medicineStates)) {
        r2.medicineStates[mName].currentDemandPerDay = Math.round(
          r2.medicines[mName].avgDemandPerDay * factor,
        );
      }
      r2.utilizationFraction = safeDivide(r2.currentLoad, r2.practicalCapacity);
      r2.computedStatus = classifyRisk(r2.utilizationFraction);
      // Carry distanceKm and weightScore from the flow metadata into hop-2 record
      allFlows.push({
        fromId: receiverId,
        toId: r2.id,
        patients: flow.patients,
        hop: 2,
        distanceKm: flow.distanceKm,
        weightScore: flow.weightScore,
      });
    }
  }
}

// ─── Result Builder ───────────────────────────────────────────

function buildResult(params, states, primaryFlows, patientsAffected, redirected, candidateEvaluations = []) {
  const { phcId, disruptionType, duration } = params;
  const affected = states[phcId];

  // All flows (tagged with hop)
  const allFlows = primaryFlows.map(f => ({ ...f, fromId: phcId, hop: 1 }));

  // Second-order propagation
  const primaryReceiverIds = primaryFlows.map(f => f.toId);
  propagateSecondOrder(primaryReceiverIds, states, allFlows);

  // Collect impacted PHCs (all that changed)
  const impactedIds = new Set([
    phcId,
    ...allFlows.map(f => f.fromId),
    ...allFlows.map(f => f.toId),
  ]);

  const affectedPHCs = [...impactedIds]
    .map(id => {
      const s = states[id];
      if (!s) return null;
      return {
        id: s.id,
        name: s.name,
        district: s.district ?? s.state ?? "",
        lat: s.lat,
        lng: s.lng,
        isDisrupted: s.isDisrupted,
        disruptionType: s.disruptionType,
        baselineLoad: s.patientsPerDay,
        currentLoad: Math.round(s.currentLoad),
        practicalCapacity: s.practicalCapacity,
        utilizationFraction: Math.min(s.utilizationFraction, 3.0), // cap at 300% for display
        computedStatus: s.computedStatus,
        redirectedIn: s.redirectedInPatients,
        redirectedOut: s.redirectedOutPatients,
        loadChangePct: s.patientsPerDay > 0
          ? Math.round(((s.currentLoad - s.patientsPerDay) / s.patientsPerDay) * 100)
          : 0,
        medicineStates: s.medicineStates,
      };
    })
    .filter(Boolean);

  // Secondary risks: at-risk or critical non-disrupted PHCs
  const secondaryRisks = affectedPHCs.filter(
    p => !p.isDisrupted && (p.computedStatus === 'at-risk' || p.computedStatus === 'critical'),
  );

  // Network-wide load increase
  const totalBaselineLoad = phcs.reduce((s, p) => s + p.patientsPerDay, 0);
  const totalCurrentLoad = Object.values(states).reduce((s, p) => s + p.currentLoad, 0);
  const networkLoadIncreasePct = Math.round(
    safeDivide(totalCurrentLoad - totalBaselineLoad, totalBaselineLoad) * 100,
  );

  // Medicine impact: gather all medicines at affected PHC showing increased demand
  const medicineImpacts = [];
  for (const [name, mState] of Object.entries(affected.medicineStates)) {
    const base = affected.medicines[name].avgDemandPerDay;
    const current = mState.currentDemandPerDay;
    medicineImpacts.push({
      medicine: name,
      affectedPHCName: affected.name,
      baseDemand: base,
      currentDemand: current,
      changePct: base > 0 ? Math.round(((current - base) / base) * 100) : 0,
      stockDaysRemaining:
        base > 0 ? Math.floor(safeDivide(affected.medicines[name].stock, current || 1)) : 999,
    });
  }

  // Capacity impacts per PHC
  const capacityImpacts = affectedPHCs
    .filter(p => p.redirectedIn > 0 || p.isDisrupted)
    .map(p => ({
      id: p.id,
      name: p.name,
      baselineLoad: p.baselineLoad,
      newLoad: p.currentLoad,
      capacity: p.practicalCapacity,
      utilizationPct: Math.round(p.utilizationFraction * 100),
      risk: p.computedStatus,
      isDisrupted: p.isDisrupted,
    }))
    .sort((a, b) => b.utilizationPct - a.utilizationPct);

  // Propagation timeline (simplified: hop 1 = day 1–2, hop 2 = day 3–5)
  const timeline = [
    {
      label: 'Day 0 — Disruption',
      events: [`${affected.name} experiences ${DISRUPTION_TYPES_LABEL[disruptionType]}`],
    },
    {
      label: 'Day 1–2 — First Ripple',
      events: primaryFlows
        .filter(f => f.patients > 0)
        .map(f => {
          const r = states[f.toId];
          return `${r?.name ?? f.toId} absorbs ${f.patients} redirected patients`;
        }),
    },
  ];

  const hop2Flows = allFlows.filter(f => f.hop === 2 && f.patients > 0);
  if (hop2Flows.length > 0) {
    timeline.push({
      label: 'Day 3–5 — Second Ripple',
      events: hop2Flows.map(f => {
        const from = states[f.fromId];
        const to = states[f.toId];
        return `${from?.name ?? f.fromId} overflows ${f.patients} patients to ${to?.name ?? f.toId}`;
      }),
    });
  } else if (primaryFlows.length > 0) {
    timeline.push({
      label: 'Day 3–5 — Second Ripple',
      events: ['No secondary propagation detected.'],
    });
  }

  if (duration > 7) {
    timeline.push({
      label: `Day 7–${duration} — Sustained Pressure`,
      events: secondaryRisks.map(r => `${r.name} remains ${r.computedStatus}`),
    });
  }

  // Recommendations input (text hints for Gemini in Prompt 3)
  const recommendationsInput = {
    disruptionType,
    affectedPHC: affected.name,
    duration,
    patientsAffected,
    redirected,
    secondaryRiskCount: secondaryRisks.length,
    topBottleneck: capacityImpacts[0] ?? null,
    criticalMedicines: medicineImpacts.filter(m => m.stockDaysRemaining < 7),
  };

  return {
    params,
    summary: {
      patientsAffected,
      phcsAffected: impactedIds.size,
      secondaryRisks: secondaryRisks.length,
      networkLoadIncreasePct,
      redirected,
      disruptionTypeLabel: DISRUPTION_TYPES_LABEL[disruptionType] ?? disruptionType,
      affectedPHCName: affected.name,
    },
    patientFlows: allFlows,
    affectedPHCs,
    medicineImpacts,
    capacityImpacts,
    secondaryRisks,
    timeline,
    recommendationsInput,
    // Geographic candidate evaluation data (for map display & transparency)
    // Shows all nearby PHCs considered for receiving patients, with the
    // distance / capacity / utilization scores that drove the gravity model.
    candidateEvaluations,
    allStates: states,
  };
}

const DISRUPTION_TYPES_LABEL = {
  medicine_shortage: 'Medicine Shortage',
  phc_closure: 'PHC Closure',
  patient_surge: 'Patient Demand Surge',
  staff_shortage: 'Staff Shortage',
};

// ─── Public API ───────────────────────────────────────────────

/**
 * Run the simulation.
 * @param {object} params
 * @param {string} params.phcId
 * @param {string} params.disruptionType  medicine_shortage | phc_closure | patient_surge | staff_shortage
 * @param {string} [params.medicine]      required for medicine_shortage
 * @param {number} params.duration        days
 * @param {string} [params.severity]      low | medium | high (default: medium)
 * @param {number} [params.surgePercent]  used for patient_surge display
 * @returns {object} simulation result
 */
export function runSimulation(params) {
  const severity = params.severity ?? 'medium';
  const enrichedParams = { ...params, severity };

  const states = buildInitialStates();

  let primaryResult;
  switch (params.disruptionType) {
    case 'medicine_shortage':
      primaryResult = runMedicineShortage(enrichedParams, states);
      break;
    case 'phc_closure':
      primaryResult = runPHCClosure(enrichedParams, states);
      break;
    case 'patient_surge':
      primaryResult = runPatientSurge(enrichedParams, states);
      break;
    case 'staff_shortage':
      primaryResult = runStaffShortage(enrichedParams, states);
      break;
    default:
      throw new Error(`Unknown disruption type: ${params.disruptionType}`);
  }

  return buildResult(
    enrichedParams,
    states,
    primaryResult.primaryFlows,
    primaryResult.patientsAffected,
    primaryResult.redirected,
    primaryResult.candidateEvaluations ?? [],
  );
}
