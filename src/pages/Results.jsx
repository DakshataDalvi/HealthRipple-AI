import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  BarChart2, Play, Users, Building2, AlertTriangle, TrendingUp,
  ArrowRight, RefreshCw, Clock, Pill, Activity, Sparkles,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts';
import SimulationForm from '../components/SimulationForm';
import SimulationMap from '../components/SimulationMap';
import GoogleSimulationMap from '../components/GoogleSimulationMap';
import AIActionPlan from '../components/AIActionPlan';
import { runSimulation } from '../engine/simulationEngine';
import { phcs } from '../data/phcData';

// ─── Summary metric card ──────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, accent }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border bg-white ${colors[accent] || 'border-gray-200'}`}>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
        accent === 'blue' ? 'bg-blue-100 text-blue-600' :
        accent === 'red' ? 'bg-red-100 text-red-600' :
        accent === 'amber' ? 'bg-amber-100 text-amber-600' :
        'bg-purple-100 text-purple-600'
      }`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────
function StatusBadge({ status, t = (k) => k }) {
  const cfg = {
    stable: 'bg-green-100 text-green-700',
    'at-risk': 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };
  const labels = {
    stable: t('common.stable') || 'Stable',
    'at-risk': t('common.atRisk') || 'At Risk',
    critical: t('common.critical') || 'Critical',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Capacity utilization bar ─────────────────────────────────
function UtilBar({ pct }) {
  const color = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-gray-600 font-medium w-9 text-right">{pct}%</span>
    </div>
  );
}

// ─── Map legend ───────────────────────────────────────────────
function MapLegend({ t }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
      {[
        { color: '#7c3aed', label: 'Disrupted PHC' },
        { color: '#dc2626', label: t('common.critical') },
        { color: '#d97706', label: t('common.atRisk') },
        { color: '#16a34a', label: t('common.stable') },
      ].map(i => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="w-6 border-t-2 border-blue-500 inline-block" />
        Primary flow
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-6 border-t-2 border-dashed border-purple-500 inline-block" />
        Secondary ripple
      </span>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────
function Timeline({ timeline }) {
  return (
    <div className="space-y-3">
      {timeline.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
              i === 0 ? 'bg-purple-600' : i === 1 ? 'bg-blue-600' : i === 2 ? 'bg-amber-500' : 'bg-gray-400'
            }`}>
              {i + 1}
            </div>
            {i < timeline.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 my-1" />
            )}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">{step.label}</p>
            <ul className="space-y-0.5">
              {step.events.map((ev, j) => (
                <li key={j} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {ev}
                </li>
              ))}
              {step.events.length === 0 && (
                <li className="text-xs text-gray-400 italic">No events at this stage</li>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Rerun panel ──────────────────────────────────────────────
function RerunPanel({ params, onRerun }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <RefreshCw size={14} className="text-blue-600" />
          Adjust &amp; Re-run What-If
        </span>
        <span className="text-gray-400 text-xs">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <SimulationForm onRun={onRerun} initialParams={params} />
        </div>
      )}
    </div>
  );
}

// ─── Main Results Page ────────────────────────────────────────
export default function Results({ simulationResult, setSimulationResult }) {
  const navigate = useNavigate();
  const { t } = useOutletContext();

  const handleRerun = (params) => {
    try {
      const result = runSimulation(params);
      setSimulationResult(result);
    } catch (err) {
      console.error('Rerun error:', err);
    }
  };

  if (!simulationResult || simulationResult.pending) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <BarChart2 size={28} className="text-gray-300" />
        </div>
        <h2 className="text-base font-semibold text-gray-700 mb-1">No simulation has been run yet</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Configure and run a disruption scenario to see cascading impact analysis.
        </p>
        <button
          onClick={() => navigate('/simulate')}
          className="mt-5 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <Play size={14} />
          Go to Simulate
        </button>
      </div>
    );
  }

  const { summary, patientFlows, affectedPHCs, capacityImpacts, secondaryRisks, timeline, params, medicineImpacts } = simulationResult;

  // Chart data: top 8 impacted PHCs by utilisation
  const chartData = capacityImpacts.slice(0, 8).map(p => ({
    name: p.name.replace(' PHC', ''),
    utilization: p.utilizationPct,
    newLoad: p.newLoad,
    capacity: p.capacity,
    risk: p.risk,
    isDisrupted: p.isDisrupted,
  }));

  const barColor = (risk, isDisrupted) => {
    if (isDisrupted) return '#7c3aed';
    if (risk === 'critical') return '#dc2626';
    if (risk === 'at-risk') return '#d97706';
    return '#16a34a';
  };

  // Patient flow rows (unique from→to)
  const flowRows = patientFlows
    .filter(f => f.patients > 0)
    .sort((a, b) => b.patients - a.patients)
    .slice(0, 8);

  const getPHCName = (id) => phcs.find(p => p.id === id)?.name ?? id;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky header strip */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Activity size={16} className="text-blue-600" />
            Simulation Results
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {summary.disruptionTypeLabel} · <span className="font-medium text-gray-600">{summary.affectedPHCName}</span> · {params.duration} days · severity: {params.severity}
          </p>
        </div>
        <button
          onClick={() => navigate('/simulate')}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <Play size={12} />
          New Simulation
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto p-5 space-y-5">

        {/* Summary metrics */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            icon={Users}
            label="Patients Affected"
            value={summary.patientsAffected.toLocaleString()}
            sub="at disrupted PHC"
            accent="purple"
          />
          <MetricCard
            icon={Building2}
            label="PHCs Affected"
            value={summary.phcsAffected}
            sub="across network"
            accent="blue"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Secondary Risks"
            value={summary.secondaryRisks}
            sub="at-risk or critical"
            accent="amber"
          />
          <MetricCard
            icon={TrendingUp}
            label="Redistributed Load"
            value={`+${summary.redirected}`}
            sub="patients redirected"
            accent="purple"
          />
        </div>

        {/* Map + Network Impact side by side */}
        <div className="flex gap-4" style={{ height: 420 }}>
          {/* Map */}
          <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden min-w-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 shrink-0">
              <h2 className="text-sm font-semibold text-gray-800">Network Impact Map</h2>
              <MapLegend t={t} />
            </div>
            <div className="flex-1 min-h-0 relative">
              {/* Google Maps primary — Leaflet fallback when key is absent */}
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY &&
               import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' ? (
                <GoogleSimulationMap result={simulationResult} />
              ) : (
                <SimulationMap result={simulationResult} />
              )}
            </div>
          </div>

          {/* Network Impact — patient flows */}
          <div className="w-64 shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-gray-200 shrink-0">
              <h2 className="text-sm font-semibold text-gray-800">Patient Flows</h2>
              <p className="text-xs text-gray-400 mt-0.5">Redirected patient volumes</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {flowRows.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No significant patient flows detected.</p>
              ) : (
                flowRows.map((flow, i) => (
                  <div key={i} className={`px-3 py-2 rounded-md border text-xs ${
                    flow.hop === 2 ? 'border-purple-100 bg-purple-50' : 'border-blue-100 bg-blue-50'
                  }`}>
                    <div className="flex items-center gap-1 font-medium text-gray-800 mb-0.5">
                      <span className="truncate max-w-[80px]">{getPHCName(flow.fromId).replace(' PHC', '')}</span>
                      <ArrowRight size={10} className="shrink-0 text-gray-400" />
                      <span className="truncate max-w-[80px]">{getPHCName(flow.toId).replace(' PHC', '')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-700">{flow.patients} patients</span>
                      {flow.hop === 2 && (
                        <span className="text-[10px] text-purple-600 font-medium">2nd ripple</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Affected PHCs + Timeline */}
        <div className="flex gap-4">
          {/* Capacity chart */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 min-w-0">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Top Affected PHCs — Capacity Utilisation</h2>
            <p className="text-xs text-gray-400 mb-3">After redistribution. Dashed line = 90% critical threshold.</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 30, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    angle={-35}
                    textAnchor="end"
                    height={50}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickFormatter={v => `${v}%`}
                    domain={[0, 120]}
                  />
                  <ReTooltip
                    formatter={(value, name) => [`${value}%`, 'Utilisation']}
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  />
                  <Bar dataKey="utilization" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.risk, entry.isDisrupted)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 text-sm py-8">No capacity data</div>
            )}
          </div>

          {/* Propagation timeline */}
          <div className="w-64 shrink-0 bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={14} className="text-blue-600" />
              Propagation Timeline
            </h2>
            <Timeline timeline={timeline} />
          </div>
        </div>

        {/* Detailed PHC table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">Affected PHC Detail</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">PHC</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2.5">Baseline</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2.5">New Load</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2.5">Change</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5 w-36">Utilisation</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {affectedPHCs
                .sort((a, b) => b.utilizationFraction - a.utilizationFraction)
                .map((phc, i) => {
                  const changePct = phc.baselineLoad > 0
                    ? Math.round(((phc.currentLoad - phc.baselineLoad) / phc.baselineLoad) * 100)
                    : 0;
                  const utilPct = Math.round(phc.utilizationFraction * 100);
                  return (
                    <tr key={phc.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900 flex items-center gap-1.5">
                          {phc.name}
                          {phc.isDisrupted && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">DISRUPTED</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{phc.district ?? phc.taluka}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{phc.baselineLoad}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{phc.currentLoad}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${
                        changePct > 0 ? 'text-red-600' : changePct < 0 ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {changePct > 0 ? '+' : ''}{changePct}%
                      </td>
                      <td className="px-4 py-2.5">
                        <UtilBar pct={utilPct} />
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={phc.computedStatus} t={t} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Medicine impact */}
        {medicineImpacts && medicineImpacts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Pill size={14} className="text-blue-600" />
                Medicine Demand Impact — {summary.affectedPHCName}
              </h2>
            </div>
            <div className="px-4 py-3 grid grid-cols-3 gap-2">
              {medicineImpacts.map(med => {
                const isLow = med.stockDaysRemaining < 7;
                const isCritical = med.stockDaysRemaining < 3;
                return (
                  <div key={med.medicine} className={`p-3 rounded-md border text-xs ${
                    isCritical ? 'bg-red-50 border-red-200' :
                    isLow ? 'bg-amber-50 border-amber-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <p className="font-semibold text-gray-800 mb-1">{med.medicine}</p>
                    <div className="space-y-0.5 text-gray-500">
                      <p>Baseline demand: <span className="font-medium text-gray-700">{med.baseDemand}/day</span></p>
                      <p>New demand: <span className="font-medium text-gray-700">{med.currentDemand}/day</span></p>
                      <p>Stock remaining: <span className={`font-semibold ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-green-700'}`}>
                        {med.stockDaysRemaining === 999 ? '—' : `${med.stockDaysRemaining} days`}
                      </span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary risks summary */}
        {secondaryRisks.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Secondary Risk PHCs
            </h3>
            <div className="flex flex-wrap gap-2">
              {secondaryRisks.map(r => (
                <span key={r.id} className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                  r.computedStatus === 'critical'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {r.name} — {Math.round(r.utilizationFraction * 100)}% capacity
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rerun / What-if panel */}
        <RerunPanel params={params} onRerun={handleRerun} />

        {/* ── AI Interpretation section divider ─────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium shrink-0">
            <Sparkles size={11} className="text-blue-400" />
            AI Interpretation
          </span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Note distinguishing simulation from AI */}
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
          <div className="w-1 self-stretch rounded-full bg-blue-400 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Simulation results above</span> are calculated deterministically from PHC network data.{' '}
            <span className="font-semibold text-gray-700">AI analysis below</span> is generated by Gemini and provides contextual interpretation and recommendations — it does not replace the quantitative data.
          </p>
        </div>

        {/* AI Action Plan — only triggered by user action */}
        <AIActionPlan simulationResult={simulationResult} />

      </div>
    </div>
  );
}
