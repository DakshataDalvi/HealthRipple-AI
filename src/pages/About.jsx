import { Info, Activity, Zap, BarChart2, GitBranch, FlaskConical, Shield } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function About() {
  return (
    <div className="p-6 max-w-3xl mx-auto pb-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Info size={18} className="text-blue-600" />
          About HealthRipple AI
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          A decision-support simulation prototype for healthcare network resilience.
        </p>
      </div>

      <div className="space-y-4">

        {/* What is it */}
        <Section icon={Activity} title="What is HealthRipple AI?">
          <p>
            HealthRipple AI is an AI-powered healthcare network resilience simulator built as a hackathon prototype. It helps public health administrators answer a critical planning question:
          </p>
          <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 bg-blue-50 py-2 pr-3 rounded-r text-sm">
            "If one Primary Health Centre (PHC) is disrupted, how does that impact cascade through the surrounding network?"
          </blockquote>
          <p>
            Disruptions do not stay isolated. Patients redistribute, nearby PHCs face increased load, medicine demand spikes, and secondary facilities reach critical capacity. HealthRipple AI makes this invisible cascade visible — before it becomes a crisis.
          </p>
        </Section>

        {/* How it works */}
        <Section icon={Zap} title="How the Simulation Works">
          <p>The system operates in three stages:</p>
          <ol className="list-decimal list-inside space-y-2 mt-1">
            <li>
              <span className="font-semibold text-gray-800">Disruption Modelling —</span> The user selects a PHC and defines a disruption scenario: medicine shortage, PHC closure, patient demand surge, or staff shortage.
            </li>
            <li>
              <span className="font-semibold text-gray-800">Cascading Simulation —</span> A deterministic, rule-based engine propagates the disruption. It calculates patient redistribution using a gravity-weighted model (capacity surplus ÷ distance), updates load at receiving PHCs, scales medicine demand proportionally, and identifies secondary-risk facilities via a two-hop propagation.
            </li>
            <li>
              <span className="font-semibold text-gray-800">AI Interpretation —</span> Gemini AI receives the structured simulation output and generates a plain-language action plan with prioritised recommendations. Gemini does not alter the numerical results.
            </li>
          </ol>
        </Section>

        {/* Scenarios */}
        <Section icon={GitBranch} title="Disruption Scenarios">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Medicine Shortage', 'A specific drug is unavailable. Patients requiring it are partially redirected to nearby PHCs.'],
              ['PHC Closure', 'A facility fully closes. 85% of its patient load is redistributed among nearby operational PHCs.'],
              ['Patient Demand Surge', 'An outbreak or seasonal event increases patient volume by 10–50%. Overflow cascades outward.'],
              ['Staff Shortage', 'Reduced clinical staff lowers practical capacity. Overload triggers patient spillover to neighbours.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-gray-200 rounded-md p-3">
                <p className="font-semibold text-gray-800 text-xs mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Assumptions */}
        <Section icon={FlaskConical} title="Simulation Assumptions">
          <p className="text-xs text-gray-500 mb-3">
            The following assumptions govern the simulation engine. They are intentionally transparent so the methodology can be evaluated and improved.
          </p>
          <div className="space-y-2">
            {[
              ['Practical Capacity', 'Calculated as (Doctors × 40) + (Nurses × 8) patients per day. This is a conservative estimate of daily throughput.'],
              ['Patient Redistribution', 'Uses a gravity model: receivers are weighted by available capacity surplus divided by distance. Not all patients travel — redirect rates vary by scenario (45% for medicine shortage, 85% for closure, 40% for staff shortage).'],
              ['Second-Order Propagation', 'Receiving PHCs that breach 90% utilisation spill 30% of their overflow to their own neighbours (one additional hop only).'],
              ['Risk Thresholds', 'At Risk = utilisation ≥ 75%. Critical = utilisation ≥ 90%. These are illustrative thresholds, not clinically validated standards.'],
              ['Medicine Demand', 'Scales linearly with patient load. Stock-days remaining = current stock ÷ new daily demand.'],
              ['Severity Multipliers', 'Low / Medium / High severity adjusts the number of patients affected or redirected (0.6×, 1.0×, 1.4×).'],
              ['Distances', 'Calculated using the Haversine formula from stored lat/lng coordinates.'],
              ['No Temporal Dynamics', 'The simulation computes a steady-state snapshot. It does not model hour-by-hour or day-by-day changes within the disruption window.'],
            ].map(([label, desc]) => (
              <div key={label} className="text-xs">
                <span className="font-semibold text-gray-700">{label}: </span>
                <span className="text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Data & Disclaimer */}
        <Section icon={Shield} title="Data Transparency & Disclaimer">
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-3 text-xs text-amber-800 font-medium">
            ⚠ All PHC data displayed in this application is entirely simulated and fictional. No real patient records, government health data, or live operational data has been used or accessed.
          </div>
          <p className="mt-2 text-xs">
            The prototype uses synthetic data for 25 Primary Health Centres across multiple states across India. Values for patient volumes, bed capacity, staff counts, and medicine inventory are realistic in magnitude but are generated for demonstration purposes only.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            HealthRipple AI is a <strong>decision-support simulation prototype</strong>. It does not predict real-world healthcare outcomes, does not constitute medical advice, and should not be used to make clinical or administrative decisions without validation against real operational data.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-400">
            <span>Built as a 1-day hackathon prototype</span>
            <span>·</span>
            <span>National Data Model</span>
            <span>·</span>
            <span>Powered by gemini-3.8-flash</span>
          </div>
        </Section>

        {/* Tech stack */}
        <Section icon={BarChart2} title="Technology">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ['Frontend', 'React 19 + Vite 8'],
              ['Styling', 'Tailwind CSS v4'],
              ['Map', 'Google Maps API + Leaflet Fallback'],
              ['Speech', 'Web Speech API (Google)'],
              ['AI', 'gemini-3.8-flash (REST)'],
              ['Routing', 'React Router v7'],
              ['Deployment', 'Vercel'],
              ['Data', 'Synthetic / Simulated'],
            ].map(([label, val]) => (
              <div key={label} className="border border-gray-200 rounded-md p-2.5">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-gray-700 font-medium mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
