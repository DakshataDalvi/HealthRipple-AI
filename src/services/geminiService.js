// ============================================================
// HealthRipple AI — Gemini Service
// Pure client-side (Vite VITE_ prefix) for hackathon use.
// The key is gated to VITE_GEMINI_API_KEY and never hardcoded.
// For production: move to a server-side proxy route.
// ============================================================

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// ─── Prompt builder ───────────────────────────────────────────

/**
 * Builds a structured prompt from simulation results.
 * Explicitly instructs Gemini NOT to invent data.
 * @param {object} simulationResult
 * @param {string|null} followUpQuestion - optional user follow-up
 */
export function buildPrompt(simulationResult, followUpQuestion = null) {
  const { summary, params, affectedPHCs, patientFlows, medicineImpacts, capacityImpacts, secondaryRisks, timeline } = simulationResult;

  // Format key data compactly for the context window
  const affectedList = affectedPHCs
    .slice(0, 10)
    .map(p =>
      `  - ${p.name} (${p.district ?? p.state}): baseline=${p.baselineLoad} pts/day, new load=${p.currentLoad} pts/day, ` +
      `capacity=${p.practicalCapacity}, utilization=${Math.round(p.utilizationFraction * 100)}%, ` +
      `status=${p.computedStatus}${p.isDisrupted ? ', DIRECTLY DISRUPTED' : ''}`,
    )
    .join('\n');

  const flowList = patientFlows
    .filter(f => f.patients > 0)
    .slice(0, 8)
    .map(f => {
      const fromPHC = affectedPHCs.find(p => p.id === f.fromId);
      const toPHC = affectedPHCs.find(p => p.id === f.toId);
      return `  - ${fromPHC?.name ?? f.fromId} → ${toPHC?.name ?? f.toId}: ${f.patients} patients (hop ${f.hop ?? 1})`;
    })
    .join('\n');

  const medList = medicineImpacts
    .slice(0, 6)
    .map(m =>
      `  - ${m.medicine}: stock=${m.stockDaysRemaining === 999 ? 'adequate' : m.stockDaysRemaining + ' days'}, ` +
      `demand changed from ${m.baseDemand} to ${m.currentDemand}/day`,
    )
    .join('\n');

  const secRiskList = secondaryRisks
    .map(r => `  - ${r.name}: ${Math.round(r.utilizationFraction * 100)}% capacity, status=${r.computedStatus}`)
    .join('\n');

  const topCapacity = capacityImpacts
    .slice(0, 5)
    .map(c => `  - ${c.name}: ${c.utilizationPct}% utilized (${c.newLoad}/${c.capacity} patients), risk=${c.risk}`)
    .join('\n');

  const timelineText = timeline
    .map(t => `  ${t.label}: ${t.events.join('; ')}`)
    .join('\n');

  const systemContext = `You are a Senior Public Health Strategist and Network Analyst assisting the Ministry of Health.
You are analyzing a SIMULATED healthcare network disruption in ${params.phcId?.replace('phc-', 'PHC ')}.
Your goal is to provide a deep, highly analytical, and actionable disaster-recovery plan. Do not just repeat the numbers; interpret the SEVERITY of the cascade, the operational risks to staff/patients, and strategic resource allocation.
This is prototype/simulated data for demonstration purposes only.
Do NOT make medical diagnoses. Do NOT invent numerical data not provided. If information is unavailable, say so.
Base all analysis STRICTLY on the simulation data below.`;

  const dataContext = `
SIMULATION DATA (use only this, do not invent):
=================================================
Scenario: ${summary.disruptionTypeLabel}
Affected PHC: ${summary.affectedPHCName}
Duration: ${params.duration} days
Severity: ${params.severity}
${params.medicine ? `Medicine affected: ${params.medicine}` : ''}

Summary metrics:
- Patients directly affected: ${summary.patientsAffected}
- Total PHCs affected in network: ${summary.phcsAffected}
- Secondary risk PHCs: ${summary.secondaryRisks}
- Network-wide load increase: +${summary.networkLoadIncreasePct}%
- Patients redirected: ${summary.redirected}

PHC Status After Simulation:
${affectedList || '  (none recorded)'}

Patient Redistribution Flows:
${flowList || '  (no significant flows)'}

Medicine Inventory Impact:
${medList || '  (no medicine data)'}

Secondary Risk PHCs:
${secRiskList || '  (none identified)'}

Capacity Pressure (top affected):
${topCapacity || '  (no data)'}

Propagation Timeline:
${timelineText || '  (no timeline data)'}
=================================================`;

  if (followUpQuestion) {
    return `${systemContext}

${dataContext}

FOLLOW-UP QUESTION FROM ADMINISTRATOR:
"${followUpQuestion}"

Answer thoughtfully and analytically, based strictly on the simulation data above. Do not invent data.`;
  }

  return `${systemContext}

${dataContext}

Based strictly on the simulation data above, provide a structured AI Action Plan in the following JSON format. Do not include any text outside the JSON. Return ONLY valid JSON. Provide detailed, expert-level analysis rather than basic summaries.

For the "relevantContext" field ONLY, use Google Search to find real-world external contextual information about ${summary.affectedPHCName}, the surrounding district, or relevant public health context (e.g., seasonal diseases, infrastructure). DO NOT alter the deterministic simulation numbers based on search. Do not invent statistics. Clearly cite your source in the text. If no useful external information is found, exactly output "No relevant external context was found."

{
  "situationSummary": "3-4 detailed sentences explaining the network-wide cascade effect, beyond just the initial disruption.",
  "primaryImpact": "2-3 sentences analyzing the operational bottleneck at the directly disrupted facility.",
  "secondaryImpact": "2-3 sentences detailing the strain on receiving facilities, specifically mentioning capacity thresholds.",
  "recommendedActions": [
    { "priority": 1, "action": "Highly specific strategic action (e.g. dynamic rerouting, mobile units)", "rationale": "Deep rationale tied to specific simulation metrics" },
    { "priority": 2, "action": "...", "rationale": "..." },
    { "priority": 3, "action": "...", "rationale": "..." },
    { "priority": 4, "action": "...", "rationale": "..." }
  ],
  "priorityFacilities": [
    { "name": "PHC name", "reason": "Specific risk factor from the data" }
  ],
  "whyItMatters": "One strong sentence on the systemic risk if left unaddressed.",
  "relevantContext": "Brief external context with sources based on Google Search. Say 'No relevant external context was found.' if unavailable.",
  "disclaimer": "This analysis is based on simulated data and should not be used for real-world clinical decisions."
}`;
}

// ─── API caller ───────────────────────────────────────────────

async function callGeminiAPI(prompt, retryCount = 0, expectJson = false, enableSearch = false) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    throw new GeminiError('NO_API_KEY', 'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.');
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  let response;
  try {
    const generationConfig = {
      temperature: 0.3,       // Low temperature = more deterministic, less hallucination
      maxOutputTokens: 1024,
      topP: 0.8,
    };
    
    if (expectJson) {
      generationConfig.responseMimeType = "application/json";
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    // Enable Google Search Grounding if requested
    if (enableSearch) {
      payload.tools = [{ googleSearch: {} }];
    }

    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (retryCount + 1));
      return callGeminiAPI(prompt, retryCount + 1, expectJson, enableSearch);
    }
    throw new GeminiError('NETWORK_ERROR', 'Network error connecting to Gemini API.');
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const errMsg = errBody?.error?.message ?? `HTTP ${response.status}`;

    if ((response.status === 429 || response.status === 503 || response.status === 500) && retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (retryCount + 2));
      return callGeminiAPI(prompt, retryCount + 1, expectJson, enableSearch);
    }
    if (response.status === 401 || response.status === 403) {
      throw new GeminiError('INVALID_API_KEY', `Invalid or unauthorized API key: ${errMsg}`);
    }
    throw new GeminiError('API_ERROR', `Gemini API error: ${errMsg}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!rawText) {
    throw new GeminiError('EMPTY_RESPONSE', 'Gemini returned an empty response.');
  }

  return rawText;
}

// ─── Response parsers ─────────────────────────────────────────

function extractJSON(rawText) {
  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Try parsing directly
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Try extracting a JSON object from surrounding text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }

  return null;
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Generate an AI action plan for the given simulation result.
 * Returns a structured object.
 */
export async function generateActionPlan(simulationResult, useSearch = false) {
  const prompt = buildPrompt(simulationResult);
  let rawText;
  
  try {
    rawText = await callGeminiAPI(prompt, 0, true, useSearch);
  } catch (err) {
    if (useSearch) {
      console.warn("Search-grounded generation failed. Falling back to base generation without search.", err);
      // Fallback: Try again without search
      rawText = await callGeminiAPI(prompt, 0, true, false);
    } else {
      throw err;
    }
  }

  const parsed = extractJSON(rawText);

  if (!parsed) {
    // Gemini returned text but not valid JSON — return as free-form text
    return { freeFormText: rawText, structured: false };
  }

  return { ...parsed, structured: true };
}

/**
 * Send a follow-up question grounded in the simulation context.
 * Returns raw text (not JSON).
 */
export async function askFollowUp(simulationResult, question) {
  const prompt = buildPrompt(simulationResult, question);
  const rawText = await callGeminiAPI(prompt);
  return rawText.trim();
}

// ─── Error class ──────────────────────────────────────────────

export class GeminiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'GeminiError';
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Translate an AI action plan object into Hindi or Marathi using Gemini.
 *
 * Architecture note: we reuse the existing Gemini REST API (same VITE_GEMINI_API_KEY)
 * rather than a separate Cloud Translation API key — no new credentials needed,
 * and the translation quality is excellent for structured health text.
 *
 * Preservation rules (strictly enforced in prompt):
 *   - All numbers, percentages, and statistics → keep in original digits
 *   - PHC IDs (e.g. PHC-001, phc-007) → keep exactly as-is
 *   - Medicine names (Amoxicillin, Paracetamol, ORS Packets, Metformin) → keep in English
 *   - Facility names → keep in English (they are proper nouns)
 *   - Dates/durations → keep as-is
 *
 * @param {object} plan      - The structured plan from generateActionPlan()
 * @param {string} targetLang - 'hi' (Hindi) | 'mr' (Marathi)
 * @returns {Promise<object>} - Same shape as plan, with translated text fields
 */
export async function translatePlan(plan, targetLang) {
  const langName = targetLang === 'hi' ? 'Hindi' : 'Marathi';

  // Serialize only the translatable text fields.
  // We exclude structured keys like `structured`, `disclaimer` (keep English).
  const toTranslate = {
    situationSummary: plan.situationSummary ?? '',
    primaryImpact:    plan.primaryImpact ?? '',
    secondaryImpact:  plan.secondaryImpact ?? '',
    recommendedActions: (plan.recommendedActions ?? []).map(a => ({
      priority: a.priority,       // number — preserved automatically
      action:   a.action ?? '',
      rationale: a.rationale ?? '',
    })),
    priorityFacilities: (plan.priorityFacilities ?? []).map(f => ({
      name:   f.name ?? '',       // facility name — preserved per rule below
      reason: f.reason ?? '',
    })),
    whyItMatters: plan.whyItMatters ?? '',
    relevantContext: plan.relevantContext ?? '',
  };

  const prompt = `You are a medical translation assistant. Translate the following JSON from English into ${langName}.

STRICT RULES — violating these invalidates the translation:
1. Return ONLY valid JSON with the same structure and keys. No extra text outside JSON.
2. Numbers, percentages, and statistics MUST remain as-is (e.g. "120 patients" → "120 रोगी", keep "120").
3. PHC IDs (e.g. "PHC-001", "phc-007", "PHC 7") MUST remain exactly in English/numerals — do NOT transliterate.
4. Medicine names (Amoxicillin, Paracetamol, ORS Packets, Metformin, etc.) MUST remain in English.
5. Facility names and PHC names MUST remain in English as they are proper nouns.
6. Dates and durations (e.g. "5 days", "Day 1–2") MUST remain as-is.
7. The "priority" field is a number — leave it unchanged.
8. Translate all other descriptive and explanatory text into ${langName}.

INPUT JSON:
${JSON.stringify(toTranslate, null, 2)}

OUTPUT: Valid JSON only, translated to ${langName} following all rules above.`;

  const rawText = await callGeminiAPI(prompt, 0, true);
  const parsed = extractJSON(rawText);

  if (!parsed) {
    throw new GeminiError('TRANSLATION_PARSE_ERROR', `Could not parse ${langName} translation response.`);
  }

  // Merge: take translated text fields, keep English for disclaimer/structured flag
  return {
    ...plan,
    situationSummary:   parsed.situationSummary   ?? plan.situationSummary,
    primaryImpact:      parsed.primaryImpact      ?? plan.primaryImpact,
    secondaryImpact:    parsed.secondaryImpact    ?? plan.secondaryImpact,
    recommendedActions: parsed.recommendedActions ?? plan.recommendedActions,
    priorityFacilities: parsed.priorityFacilities ?? plan.priorityFacilities,
    whyItMatters:       parsed.whyItMatters       ?? plan.whyItMatters,
    relevantContext:    parsed.relevantContext    ?? plan.relevantContext,
    // disclaimer always stays in English — legal/medical text must be clear
    disclaimer: plan.disclaimer,
    structured: true,
  };
}

/**
 * Check if Gemini is configured (key present and non-placeholder).
 */
export function isGeminiConfigured() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !!key && key !== 'your_gemini_api_key_here' && key.trim().length > 10;
}

/**
 * Parses natural language voice input into simulation parameters.
 * Returns null if the request is ambiguous or completely unrelated.
 * @param {string} transcript - The recognized voice text
 * @returns {Promise<object|null>} - { phcId, disruptionType, duration, severity, medicine }
 */
export async function parseVoiceCommand(transcript) {
  const prompt = `You are a natural language parser for a healthcare simulation system.
Extract simulation parameters from the following user voice command.

Valid Disruption Types: "medicine_shortage", "phc_closure", "patient_surge", "staff_shortage"
Valid Severities: "low", "medium", "high"
Valid Durations: usually 3, 7, 14, or 30 (return the integer number of days if specified).

USER COMMAND: "${transcript}"

STRICT RULES:
1. Return ONLY valid JSON. No other text.
2. If the user command is too ambiguous or unrelated, return exactly: { "error": "ambiguous" }
3. "phcId" must be in the format "phc-XXX" (e.g., PHC 7 or PHC-07 becomes "phc-007", PHC 12 becomes "phc-012").
4. "disruptionType" must be one of the valid types above. (e.g., "closes" -> phc_closure, "runs out of meds" -> medicine_shortage, "huge crowd" -> patient_surge, "doctors missing" -> staff_shortage).
5. "duration" is a number of days (default to 7 if not mentioned).
6. "severity" is "low", "medium", or "high" (default to "medium" if not mentioned).
7. "medicine" is required ONLY if disruptionType is "medicine_shortage" (e.g., "Amoxicillin", "Paracetamol", "ORS Packets", "Metformin"). Leave null otherwise.

OUTPUT JSON FORMAT:
{
  "phcId": "phc-007",
  "disruptionType": "phc_closure",
  "duration": 5,
  "severity": "medium",
  "medicine": null
}`;

  const rawText = await callGeminiAPI(prompt, 0, true);
  const parsed = extractJSON(rawText);

  if (!parsed || parsed.error) {
    return null; // Ambiguous or parsing failed
  }

  return parsed;
}
