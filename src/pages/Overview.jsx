import { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Activity, AlertTriangle, AlertCircle, CheckCircle2,
  Play, Sparkles, MapPin,
} from 'lucide-react';
import PHCMap from '../components/PHCMap';
import GooglePHCMap from '../components/GooglePHCMap';
import PHCDetailPanel from '../components/PHCDetailPanel';
import { phcs, getNetworkSummary, DISRUPTION_TYPES, MEDICINE_LIST } from '../data/phcData';
import { runSimulation } from '../engine/simulationEngine';

function SummaryCard({ icon: Icon, label, value, iconClass, borderClass }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border bg-white ${borderClass}`}>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Legend({ t }) {
  return (
    <div className="flex items-center gap-4">
      {[
        { color: 'bg-green-500', label: t('common.stable') },
        { color: 'bg-amber-500', label: t('common.atRisk') },
        { color: 'bg-red-500', label: t('common.critical') },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
          <span className="text-xs text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Compact quick-run simulation form embedded in Overview
function QuickRunForm({ onRun, availablePHCs, t }) {
  const [phcId, setPhcId] = useState(availablePHCs[0]?.id || '');
  const [disruptionType, setDisruptionType] = useState('medicine_shortage');
  const [medicine, setMedicine] = useState('Antibiotics');
  const [duration, setDuration] = useState(5);

  const isReady = phcId && disruptionType && (disruptionType !== 'medicine_shortage' || medicine);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isReady) return;
    onRun({ phcId, disruptionType, medicine: disruptionType === 'medicine_shortage' ? medicine : null, duration, severity: 'medium' });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {/* PHC */}
      <div className="flex-1 min-w-36">
        <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('simulate.phcLabel')}</label>
        <div className="relative">
          <select
            value={phcId}
            onChange={e => setPhcId(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-6"
          >
            {availablePHCs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Disruption */}
      <div className="flex-1 min-w-36">
        <label className="block text-[11px] font-medium text-gray-500 mb-1">Disruption</label>
        <div className="relative">
          <select
            value={disruptionType}
            onChange={e => { setDisruptionType(e.target.value); setMedicine(''); }}
            className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-6"
          >
            {DISRUPTION_TYPES.map(d => (
              <option key={d.id} value={d.id}>{t(`simulate.disruption.${d.id.split('_')[0]}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicine — conditional */}
      {disruptionType === 'medicine_shortage' && (
        <div className="flex-1 min-w-32">
          <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('simulate.medLabel')}</label>
          <select
            value={medicine}
            onChange={e => setMedicine(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('simulate.chooseMed')}</option>
            {MEDICINE_LIST.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {/* Duration */}
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('simulate.durLabel')}</label>
        <div className="flex gap-1.5">
          {[3, 5, 7, 14].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                duration === d
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isReady}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Play size={12} />
        {t('simulate.runBtn')}
      </button>
    </form>
  );
}

export default function Overview({ setSimulationResult }) {
  const navigate = useNavigate();
  const { selectedRegion, t } = useOutletContext();
  const [selectedPHC, setSelectedPHC] = useState(null);
  const [simError, setSimError] = useState('');

  const filteredPhcs = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'All India') return phcs;
    return phcs.filter(p => p.state === selectedRegion);
  }, [selectedRegion]);

  const summary = useMemo(() => getNetworkSummary(filteredPhcs), [filteredPhcs]);

  const handleRunSim = (params) => {
    setSimError('');
    try {
      const result = runSimulation(params);
      setSimulationResult(result);
      navigate('/results');
    } catch (err) {
      console.error('Simulation error:', err);
      setSimError(err.message ?? 'Simulation failed.');
    }
  };

  const mapTitle = t('overview.networkTitle', { region: selectedRegion === 'All India' ? 'National' : selectedRegion });

  return (
    <div className="flex flex-col h-full p-5 gap-4 min-h-0">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        <SummaryCard
          icon={Activity}
          label={t('common.totalPHCs')}
          value={summary.total}
          iconClass="bg-blue-100 text-blue-600"
          borderClass="border-gray-200"
        />
        <SummaryCard
          icon={AlertCircle}
          label={t('common.critical')}
          value={summary.critical}
          iconClass="bg-red-100 text-red-600"
          borderClass="border-red-100"
        />
        <SummaryCard
          icon={AlertTriangle}
          label={t('common.atRisk')}
          value={summary.atRisk}
          iconClass="bg-amber-100 text-amber-600"
          borderClass="border-amber-100"
        />
        <SummaryCard
          icon={CheckCircle2}
          label={t('common.stable')}
          value={summary.stable}
          iconClass="bg-green-100 text-green-600"
          borderClass="border-green-100"
        />
      </div>

      {/* Map + Detail panel */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">{mapTitle}</h2>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={10} />
                Click any marker to view PHC details
              </p>
            </div>
            <Legend t={t} />
          </div>
          <div className="flex-1 min-h-0 relative">
            {filteredPhcs.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 font-medium">{t('common.noData')}</p>
              </div>
            ) : import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' ? (
              <GooglePHCMap
                phcs={filteredPhcs}
                selectedPHC={selectedPHC}
                onSelectPHC={setSelectedPHC}
              />
            ) : (
              <PHCMap
                phcs={filteredPhcs}
                selectedPHC={selectedPHC}
                onSelectPHC={setSelectedPHC}
              />
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-64 shrink-0">
          {selectedPHC ? (
            <PHCDetailPanel
              phc={selectedPHC}
              onClose={() => setSelectedPHC(null)}
              t={t}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <MapPin size={17} className="text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">{t('simulate.choosePHC').replace(/—/g, '').trim()}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Click any marker on the map to view facility details and resource status.
              </p>
              <button
                onClick={() => navigate('/simulate')}
                className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-800"
              >
                <Sparkles size={12} />
                Or run a simulation →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick run panel */}
      <div className="shrink-0 bg-white border border-gray-200 rounded-lg px-5 py-3.5">
        <div className="flex items-center gap-2 mb-3">
          <Play size={13} className="text-blue-600" />
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quick What-If Simulation</h3>
          <span className="text-[10px] text-gray-400 ml-1">— pre-filled with demo scenario</span>
        </div>
        {simError && (
          <p className="text-xs text-red-600 mb-2">{simError}</p>
        )}
        <QuickRunForm onRun={handleRunSim} availablePHCs={filteredPhcs} t={t} />
      </div>
    </div>
  );
}
