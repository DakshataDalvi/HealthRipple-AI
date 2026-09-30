import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Building2, Send, RefreshCw, Globe
} from 'lucide-react';
import { generateActionPlan, askFollowUp, isGeminiConfigured, GeminiError, translatePlan } from '../services/geminiService';

// ─── Suggested follow-up questions ───────────────────────────────────────────
function buildSuggestedQuestions(simulationResult) {
  const { summary, secondaryRisks, capacityImpacts } = simulationResult;
  const topRisk = secondaryRisks?.[0];
  const topPHC = capacityImpacts?.find(p => !p.isDisrupted);

  return [
    topRisk
      ? `Why is ${topRisk.name} at risk and what should be done?`
      : `What caused the secondary network impact?`,
    `What should the district administrator prioritize first?`,
    topPHC
      ? `How long can ${topPHC.name} sustain the increased patient load?`
      : `What is the estimated recovery timeline for the network?`,
  ];
}

// ─── Priority color map ───────────────────────────────────────────────────────
const priorityColors = {
  1: 'border-red-200 bg-red-50',
  2: 'border-amber-200 bg-amber-50',
  3: 'border-blue-200 bg-blue-50',
  4: 'border-gray-200 bg-gray-50',
};
const priorityBadge = {
  1: 'bg-red-600 text-white',
  2: 'bg-amber-500 text-white',
  3: 'bg-blue-600 text-white',
  4: 'bg-gray-500 text-white',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, iconColor = 'text-blue-600' }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
        <Icon size={12} className={iconColor} />
        {title}
      </h4>
      {children}
    </div>
  );
}

function ActionCard({ item }) {
  const cardStyle = priorityColors[item.priority] ?? priorityColors[4];
  const badgeStyle = priorityBadge[item.priority] ?? priorityBadge[4];
  return (
    <div className={`flex gap-3 p-3 rounded-md border ${cardStyle}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${badgeStyle}`}>
        {item.priority}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-snug">{item.action}</p>
        {item.rationale && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.rationale}</p>
        )}
      </div>
    </div>
  );
}

function FollowUpChat({ simulationResult }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const suggested = buildSuggestedQuestions(simulationResult);

  const ask = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer('');
    setQuestion(q);
    try {
      const result = await askFollowUp(simulationResult, q);
      setAnswer(result);
    } catch (err) {
      setError(err.message ?? 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  }, [simulationResult]);

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Ask a Follow-up Question
      </p>

      {/* Suggested questions */}
      <div className="flex flex-col gap-1.5 mb-3">
        {suggested.map((q, i) => (
          <button
            key={i}
            onClick={() => ask(q)}
            disabled={loading}
            className="text-left text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Custom question input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(question)}
          placeholder="Type a question about this simulation…"
          className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          disabled={loading}
        />
        <button
          onClick={() => ask(question)}
          disabled={!question.trim() || loading}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </div>

      {/* Answer */}
      {answer && (
        <div className="mt-3 bg-white border border-gray-200 rounded-md px-3 py-3">
          <p className="text-xs text-gray-400 mb-1 font-medium">Gemini response:</p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SECTION_TITLES = {
  en: {
    situation: "Situation Summary",
    primary: "Primary Impact",
    secondary: "Secondary Impact",
    actions: "Recommended Actions",
    facilities: "Priority Facilities",
    why: "Why This Matters",
    context: "Relevant Context (from Web)"
  },
  hi: {
    situation: "स्थिति सारांश",
    primary: "प्राथमिक प्रभाव",
    secondary: "द्वितीयक प्रभाव",
    actions: "अनुशंसित कार्रवाइयां",
    facilities: "प्राथमिकता सुविधाएं",
    why: "यह क्यों महत्वपूर्ण है",
    context: "प्रासंगिक संदर्भ (वेब से)"
  },
  mr: {
    situation: "परिस्थितीचा सारांश",
    primary: "प्राथमिक परिणाम",
    secondary: "दुय्यम परिणाम",
    actions: "शिफारस केलेल्या कृती",
    facilities: "प्राधान्य सुविधा",
    why: "हे का महत्त्वाचे आहे",
    context: "संबंधित संदर्भ (वेबवरून)"
  },
  ta: {
    situation: "நிலைமை சுருக்கம்",
    primary: "முதன்மை தாக்கம்",
    secondary: "இரண்டாம் நிலை தாக்கம்",
    actions: "பரிந்துரைக்கப்படும் செயல்கள்",
    facilities: "முன்னுரிமை வசதிகள்",
    why: "இது ஏன் முக்கியம்",
    context: "தொடர்புடைய சூழல் (இணையத்திலிருந்து)"
  }
};

export default function AIActionPlan({ simulationResult }) {
  const { language, setLanguage } = useOutletContext();
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [basePlan, setBasePlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState({});
  const [useSearch, setUseSearch] = useState(false);

  const configured = isGeminiConfigured();

  const generate = useCallback(async () => {
    setState('loading');
    setErrorMsg('');
    setBasePlan(null);
    setTranslations({});
    try {
      const result = await generateActionPlan(simulationResult, useSearch);
      setBasePlan(result);
      setTranslations({ en: result });
      setState('success');
    } catch (err) {
      console.error('Gemini error:', err);
      if (err instanceof GeminiError) {
        if (err.code === 'NO_API_KEY' || err.code === 'INVALID_API_KEY') {
          setErrorMsg(`API key issue: ${err.message}`);
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('AI analysis temporarily unavailable. The simulation results above are unaffected.');
      }
      setState('error');
    }
  }, [simulationResult, useSearch]);

  useEffect(() => {
    if (language === 'en' || !basePlan || translations[language]) return;
    
    let isMounted = true;
    const translate = async () => {
      setIsTranslating(true);
      try {
        const translated = await translatePlan(basePlan, language);
        if (isMounted) {
          setTranslations(prev => ({ ...prev, [language]: translated }));
        }
      } catch (err) {
        console.error("Translation failed:", err);
        // Fallback gracefully without overriding global language
      } finally {
        if (isMounted) setIsTranslating(false);
      }
    };
    translate();
    return () => { isMounted = false; };
  }, [language, basePlan, translations]);

  const plan = translations[language] || basePlan;

  // ─── Idle state — just show the button ───────────────────────────────────────
  if (state === 'idle') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles size={15} className="text-blue-500" />
              AI Action Plan
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Gemini AI will interpret the simulation results and recommend actions.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={generate}
              disabled={!configured}
              title={!configured ? 'Add VITE_GEMINI_API_KEY to .env to enable' : ''}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={13} />
              Generate AI Action Plan
            </button>
            <label className="flex items-center gap-1.5 text-[10px] text-gray-500 cursor-pointer hover:text-gray-700">
              <input 
                type="checkbox" 
                checked={useSearch} 
                onChange={(e) => setUseSearch(e.target.checked)} 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Globe size={11} className="text-gray-400" />
              Enable Google Search Grounding for real-world context
            </label>
          </div>
        </div>
        {!configured && (
          <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
            <AlertTriangle size={11} />
            VITE_GEMINI_API_KEY not set. Add it to .env to enable AI analysis.
          </p>
        )}
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-6 flex items-center gap-3">
        <Loader2 size={18} className="animate-spin text-blue-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-700">Generating AI Action Plan…</p>
          <p className="text-xs text-gray-400 mt-0.5">Gemini is analyzing the simulation data. This may take a few seconds.</p>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="bg-white border border-red-200 rounded-lg px-5 py-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">AI analysis temporarily unavailable</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{errorMsg}</p>
            <p className="text-xs text-gray-400 mt-1">The numerical simulation results above are unaffected.</p>
          </div>
          <button
            onClick={generate}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Success — show full action plan ─────────────────────────────────────────
  if (!plan) return null;

  // Handle case where Gemini returned free-form text instead of JSON
  if (!plan.structured) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <PlanHeader onRegenerate={generate} />
        <div className="px-5 py-4">
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{plan.freeFormText}</p>
          <Disclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-900">AI Action Plan</h3>
          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold tracking-wide">
            Generated with Gemini
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {isTranslating && <Loader2 size={12} className="animate-spin text-blue-500" />}
            </div>
            <button
              onClick={generate}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              <RefreshCw size={11} />
              Regenerate
            </button>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] text-gray-500 cursor-pointer hover:text-gray-700">
            <input 
              type="checkbox" 
              checked={useSearch} 
              onChange={(e) => setUseSearch(e.target.checked)} 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Globe size={11} className="text-gray-400" />
            Enable Google Search Grounding for real-world context
          </label>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* 1. Situation Summary */}
        {plan.situationSummary && (
          <Section title={SECTION_TITLES[language].situation} icon={AlertCircle} iconColor="text-red-500">
            <p className="text-sm text-gray-700 leading-relaxed">{plan.situationSummary}</p>
          </Section>
        )}

        {/* 2 + 3. Impact in two columns */}
        <div className="grid grid-cols-2 gap-4">
          {plan.primaryImpact && (
            <Section title={SECTION_TITLES[language].primary} icon={Building2} iconColor="text-purple-600">
              <p className="text-xs text-gray-600 leading-relaxed">{plan.primaryImpact}</p>
            </Section>
          )}
          {plan.secondaryImpact && (
            <Section title={SECTION_TITLES[language].secondary} icon={AlertTriangle} iconColor="text-amber-500">
              <p className="text-xs text-gray-600 leading-relaxed">{plan.secondaryImpact}</p>
            </Section>
          )}
        </div>

        {/* 4. Recommended Actions */}
        {plan.recommendedActions?.length > 0 && (
          <Section title={SECTION_TITLES[language].actions} icon={CheckCircle2} iconColor="text-green-600">
            <div className="space-y-2">
              {plan.recommendedActions.map((item, i) => (
                <ActionCard key={i} item={item} />
              ))}
            </div>
          </Section>
        )}

        {/* 5. Priority Facilities */}
        {plan.priorityFacilities?.length > 0 && (
          <Section title={SECTION_TITLES[language].facilities} icon={Building2} iconColor="text-red-500">
            <div className="space-y-1.5">
              {plan.priorityFacilities.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-800">{f.name}</span>
                    {f.reason && <span className="text-gray-500"> — {f.reason}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 6. Why It Matters */}
        {plan.whyItMatters && (
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
            <p className="text-xs font-semibold text-amber-700 mb-0.5">{SECTION_TITLES[language].why}</p>
            <p className="text-xs text-amber-800 leading-relaxed">{plan.whyItMatters}</p>
          </div>
        )}

        {/* 7. Relevant Context (Optional) */}
        {plan.relevantContext && plan.relevantContext !== "No relevant external context was found." && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2.5 mt-4">
            <p className="text-xs font-semibold text-indigo-700 mb-0.5 flex items-center gap-1.5">
              <Globe size={12} />
              {SECTION_TITLES[language].context}
            </p>
            <p className="text-xs text-indigo-900 leading-relaxed">{plan.relevantContext}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            <span className="font-semibold">Disclaimer:</span>{' '}
            {plan.disclaimer ?? 'This analysis is generated by Gemini AI based on simulated data. It does not constitute medical advice or official government guidance.'}
          </p>
        </div>

        {/* Follow-up questions toggle */}
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowFollowUp(o => !o)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showFollowUp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showFollowUp ? 'Hide follow-up questions' : 'Ask Gemini a follow-up question'}
          </button>
          {showFollowUp && <FollowUpChat simulationResult={simulationResult} />}
        </div>

      </div>
    </div>
  );
}

function PlanHeader({ onRegenerate }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-blue-50 border-b border-blue-100">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">AI Action Plan</h3>
        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">
          Generated with Gemini
        </span>
      </div>
      <button onClick={onRegenerate} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
        <RefreshCw size={11} /> Regenerate
      </button>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="mt-3 text-[10px] text-gray-400">
      This analysis is generated by Gemini AI based on simulated data. It does not constitute medical advice or official guidance.
    </p>
  );
}
