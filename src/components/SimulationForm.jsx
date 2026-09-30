import { useState, useRef } from 'react';
import { Play, ChevronDown, Mic, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { phcs, DISRUPTION_TYPES, DURATION_OPTIONS, MEDICINE_LIST } from '../data/phcData';
import { parseVoiceCommand, isGeminiConfigured } from '../services/geminiService';

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function SimulationForm({ onRun, compact = false, initialParams = null }) {
  const [selectedPHCId, setSelectedPHCId] = useState(initialParams?.phcId ?? '');
  const [disruptionType, setDisruptionType] = useState(initialParams?.disruptionType ?? '');
  const [selectedMedicine, setSelectedMedicine] = useState(initialParams?.medicine ?? '');
  const [duration, setDuration] = useState(initialParams?.duration ?? 7);
  const [severity, setSeverity] = useState(initialParams?.severity ?? 'medium');

  // Voice Input State
  const [voiceState, setVoiceState] = useState('idle'); // idle | listening | processing | confirm | error
  const [voiceError, setVoiceError] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Your browser doesn't support speech recognition.");
      setVoiceState('error');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setVoiceState('listening');
      setVoiceError('');
      setTranscript('');
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      setVoiceState('processing');

      try {
        const parsed = await parseVoiceCommand(speechResult);
        if (parsed) {
          if (parsed.phcId) setSelectedPHCId(parsed.phcId);
          if (parsed.disruptionType) setDisruptionType(parsed.disruptionType);
          // Snap duration to closest valid option if we want, or just accept the number.
          // Since the dropdown maps to exactly 3, 7, 14, 30, it's safer to just set it and let the UI button not highlight if it's custom.
          if (parsed.duration) setDuration(parsed.duration);
          if (parsed.severity) setSeverity(parsed.severity);
          if (parsed.medicine) setSelectedMedicine(parsed.medicine);
          setVoiceState('confirm');
          // Clear confirm state after 5 seconds
          setTimeout(() => setVoiceState('idle'), 5000);
        } else {
          setVoiceError("Couldn't understand the simulation request. Please use manual controls.");
          setVoiceState('error');
        }
      } catch (err) {
        setVoiceError("AI processing failed. Please use manual controls.");
        setVoiceState('error');
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setVoiceError(`Microphone error: ${event.error}`);
        setVoiceState('error');
      }
    };

    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPHCId || !disruptionType) return;
    onRun?.({
      phcId: selectedPHCId,
      disruptionType,
      medicine: disruptionType === 'medicine_shortage' ? selectedMedicine : null,
      duration,
      severity,
    });
  };

  const showMedicineSelect = disruptionType === 'medicine_shortage';
  const isReady =
    selectedPHCId &&
    disruptionType &&
    (disruptionType !== 'medicine_shortage' || selectedMedicine);

  const gridClass = compact
    ? 'grid grid-cols-2 gap-3'
    : 'grid grid-cols-2 gap-4';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={gridClass}>
        {/* PHC Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Select PHC</label>
          <div className="relative">
            <select
              value={selectedPHCId}
              onChange={e => setSelectedPHCId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              required
            >
              <option value="">— Choose a PHC —</option>
              {phcs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.district ?? p.state})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Disruption Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Disruption Type</label>
          <div className="relative">
            <select
              value={disruptionType}
              onChange={e => { setDisruptionType(e.target.value); setSelectedMedicine(''); }}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              required
            >
              <option value="">— Choose disruption —</option>
              {DISRUPTION_TYPES.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Medicine selector — conditional */}
        {showMedicineSelect && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Medicine</label>
            <div className="relative">
              <select
                value={selectedMedicine}
                onChange={e => setSelectedMedicine(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                required={showMedicineSelect}
              >
                <option value="">— Choose medicine —</option>
                {MEDICINE_LIST.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Severity */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
          <div className="flex gap-2">
            {SEVERITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  severity === opt.value
                    ? opt.value === 'low'
                      ? 'bg-green-600 text-white border-green-600'
                      : opt.value === 'medium'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
          <div className="flex gap-2 flex-wrap">
            {DURATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  duration === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Status Banner */}
      {voiceState !== 'idle' && (
        <div className={`px-3 py-2.5 rounded-md text-xs border flex items-center gap-2 ${
          voiceState === 'listening' ? 'bg-blue-50 border-blue-200 text-blue-700' :
          voiceState === 'processing' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
          voiceState === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-green-50 border-green-200 text-green-800'
        }`}>
          {voiceState === 'listening' && <Mic size={14} className="animate-pulse" />}
          {voiceState === 'processing' && <Loader2 size={14} className="animate-spin" />}
          {voiceState === 'error' && <AlertCircle size={14} />}
          {voiceState === 'confirm' && <CheckCircle2 size={14} />}
          
          <div className="flex-1">
            {voiceState === 'listening' && "Listening... Speak your scenario (e.g., 'PHC-07 closes for 5 days')."}
            {voiceState === 'processing' && <span>Interpreting: <em className="opacity-80">"{transcript}"</em></span>}
            {voiceState === 'error' && voiceError}
            {voiceState === 'confirm' && (
              <span>
                <strong>Understood!</strong> Parameters above have been updated. Review and click Run Simulation.
              </span>
            )}
          </div>
          {(voiceState === 'listening' || voiceState === 'error') && (
            <button
              type="button"
              onClick={() => {
                if (recognitionRef.current) recognitionRef.current.abort();
                setVoiceState('idle');
              }}
              className="text-xs underline hover:opacity-100 opacity-70 ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!isReady || voiceState === 'listening' || voiceState === 'processing'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Play size={14} />
          Run Simulation
        </button>

        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={voiceState === 'listening' || voiceState === 'processing' || !isGeminiConfigured()}
          title={!isGeminiConfigured() ? "Requires Gemini API Key" : "Ask by Voice"}
          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Mic size={14} className={voiceState === 'listening' ? 'text-red-500 animate-pulse' : 'text-blue-500'} />
          Ask by Voice
        </button>
      </div>
    </form>
  );
}
