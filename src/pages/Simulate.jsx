import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Zap, Pill, Building2, TrendingUp, UserMinus,
  CheckCircle2, Play, ChevronDown, Sparkles,
} from 'lucide-react';
import { phcs, DISRUPTION_TYPES, DURATION_OPTIONS, MEDICINE_LIST } from '../data/phcData';
import { runSimulation } from '../engine/simulationEngine';
import SimulationForm from '../components/SimulationForm'; // Note: Simulate previously had its own form, but let's use the local one

// ─── Demo scenario ────────────────────────────────────────────────────────────
const DEMO = {
  phcId: 'phc-001',
  disruptionType: 'medicine_shortage',
  medicine: 'Antibiotics',
  duration: 5,
  severity: 'medium',
};

const SCENARIOS = [
  { id: 'medicine_shortage', icon: Pill, color: 'amber' },
  { id: 'phc_closure', icon: Building2, color: 'red' },
  { id: 'patient_surge', icon: TrendingUp, color: 'blue' },
  { id: 'staff_shortage', icon: UserMinus, color: 'purple' },
];

const colorMap = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconText: 'text-amber-600', ring: 'ring-2 ring-amber-400' },
  red:   { bg: 'bg-red-50',   border: 'border-red-200',   iconBg: 'bg-red-100',   iconText: 'text-red-600',   ring: 'ring-2 ring-red-400' },
  blue:  { bg: 'bg-blue-50',  border: 'border-blue-200',  iconBg: 'bg-blue-100',  iconText: 'text-blue-600',  ring: 'ring-2 ring-blue-400' },
  purple:{ bg: 'bg-purple-50',border: 'border-purple-200',iconBg: 'bg-purple-100',iconText: 'text-purple-600',ring: 'ring-2 ring-purple-400' },
};

const SEVERITY_OPTIONS = [
  { value: 'low', key: 'simulate.low', activeClass: 'bg-green-600 text-white border-green-600' },
  { value: 'medium', key: 'simulate.medium', activeClass: 'bg-amber-500 text-white border-amber-500' },
  { value: 'high', key: 'simulate.high', activeClass: 'bg-red-600 text-white border-red-600' },
];

function StepBadge({ n, label, complete }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
        complete ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {complete ? <CheckCircle2 size={11} /> : n}
      </span>
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
    </div>
  );
}

function SelectBox({ value, onChange, children, required }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function Simulate({ setSimulationResult }) {
  const navigate = useNavigate();
  const { selectedRegion, t } = useOutletContext();

  const filteredPhcs = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'All India') return phcs;
    return phcs.filter(p => p.state === selectedRegion);
  }, [selectedRegion]);

  // Pre-fill the demo scenario so judges see a working config immediately
  const [selectedPHCId, setSelectedPHCId] = useState('');
  const [disruptionType, setDisruptionType] = useState(DEMO.disruptionType);
  const [selectedMedicine, setSelectedMedicine] = useState(DEMO.medicine);
  const [duration, setDuration] = useState(DEMO.duration);
  const [severity, setSeverity] = useState(DEMO.severity);
  const [simError, setSimError] = useState('');

  useEffect(() => {
    if (filteredPhcs.length > 0 && !filteredPhcs.find(p => p.id === selectedPHCId)) {
      setSelectedPHCId(filteredPhcs[0].id);
    } else if (filteredPhcs.length === 0) {
      setSelectedPHCId('');
    }
  }, [filteredPhcs, selectedPHCId]);

  const showMedicineSelect = disruptionType === 'medicine_shortage';
  const isReady = selectedPHCId && disruptionType &&
    (disruptionType !== 'medicine_shortage' || selectedMedicine);

  const handleRun = (e) => {
    e.preventDefault();
    if (!isReady) return;
    setSimError('');
    try {
      const result = runSimulation({ phcId: selectedPHCId, disruptionType, medicine: selectedMedicine || null, duration, severity });
      setSimulationResult(result);
      navigate('/results');
    } catch (err) {
      console.error('Simulation error:', err);
      setSimError(err.message ?? 'Simulation failed. Please try different parameters.');
    }
  };

  const loadDemo = () => {
    if (filteredPhcs.find(p => p.id === DEMO.phcId)) {
      setSelectedPHCId(DEMO.phcId);
    }
    setDisruptionType(DEMO.disruptionType);
    setSelectedMedicine(DEMO.medicine);
    setDuration(DEMO.duration);
    setSeverity(DEMO.severity);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap size={18} className="text-blue-600" />
            {t('simulate.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('simulate.desc')}
          </p>
        </div>
        <button
          type="button"
          onClick={loadDemo}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-md px-3 py-1.5 transition-colors shrink-0"
        >
          <Sparkles size={12} />
          {t('simulate.loadDemo')}
        </button>
      </div>

      <form onSubmit={handleRun} className="space-y-4">
        {/* Step 1 — Scenario type */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <StepBadge n={1} label={t('simulate.step1')} complete={!!disruptionType} />
          <div className="grid grid-cols-2 gap-2.5">
            {SCENARIOS.map(s => {
              const c = colorMap[s.color];
              const active = disruptionType === s.id;
              const Icon = s.icon;
              let baseKey = '';
              if (s.id === 'medicine_shortage') baseKey = 'medicine';
              if (s.id === 'phc_closure') baseKey = 'closure';
              if (s.id === 'patient_surge') baseKey = 'surge';
              if (s.id === 'staff_shortage') baseKey = 'staff';
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setDisruptionType(s.id); if (s.id !== 'medicine_shortage') setSelectedMedicine(''); }}
                  className={`text-left p-3.5 rounded-lg border transition-all ${c.bg} ${c.border} ${active ? c.ring : 'hover:shadow-sm'}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${c.iconBg}`}>
                      <Icon size={15} className={c.iconText} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900">{t(`simulate.disruption.${baseKey}`)}</p>
                        {active && <CheckCircle2 size={13} className="text-blue-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t(`simulate.disruption.${baseKey}Desc`)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Select PHC */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <StepBadge n={2} label={t('simulate.step2')} complete={!!selectedPHCId} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('simulate.phcLabel')}</label>
              <SelectBox value={selectedPHCId} onChange={e => setSelectedPHCId(e.target.value)} required>
                <option value="">{t('simulate.choosePHC')}</option>
                {filteredPhcs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.city || p.district}
                  </option>
                ))}
              </SelectBox>
            </div>

            {showMedicineSelect && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('simulate.medLabel')}</label>
                <SelectBox value={selectedMedicine} onChange={e => setSelectedMedicine(e.target.value)} required={showMedicineSelect}>
                  <option value="">{t('simulate.chooseMed')}</option>
                  {MEDICINE_LIST.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </SelectBox>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Configure */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <StepBadge n={3} label={t('simulate.step3')} complete={true} />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('simulate.sevLabel')}</label>
              <div className="flex gap-2">
                {SEVERITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSeverity(opt.value)}
                    className={`flex-1 py-2 rounded-md text-xs font-semibold border transition-colors ${
                      severity === opt.value ? opt.activeClass : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t(opt.key)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('simulate.durLabel')}</label>
              <div className="flex gap-1.5 flex-wrap">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      duration === opt.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 — Run */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <StepBadge n={4} label={t('simulate.step4')} complete={false} />
            {simError && (
              <p className="text-xs text-red-600 mt-1">{simError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isReady}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Play size={14} />
            {t('simulate.runBtn')}
          </button>
        </div>

      </form>
    </div>
  );
}
