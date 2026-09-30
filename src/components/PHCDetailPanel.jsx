import { X, MapPin, Users, Bed, Stethoscope, Pill } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getMedicineStockDays, getCapacityPercent } from '../data/phcData';

function DataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  );
}

function MedicineRow({ name, data }) {
  const days = data.avgDemandPerDay > 0
    ? Math.floor(data.stock / data.avgDemandPerDay)
    : 999;
  const stockColor =
    days <= 3 ? 'text-red-600' :
    days <= 7 ? 'text-amber-600' :
    'text-green-700';

  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-600">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{data.stock} {data.unit}</span>
        <span className={`text-xs font-semibold ${stockColor}`}>{days}d</span>
      </div>
    </div>
  );
}

export default function PHCDetailPanel({ phc, onClose, t = (k) => k }) {
  if (!phc) return null;

  const capacityPct = getCapacityPercent(phc);
  const capacityColor =
    capacityPct >= 90 ? 'bg-red-500' :
    capacityPct >= 70 ? 'bg-amber-400' :
    'bg-green-500';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{phc.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500">{phc.city || phc.district}, {phc.state}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={phc.status} t={t} />
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Capacity bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{t('common.capacity')}</span>
            <span className="text-xs font-semibold text-gray-800">{phc.bedsOccupied}/{phc.bedCapacity} ({capacityPct}%)</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${capacityColor}`}
              style={{ width: `${Math.min(capacityPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('common.staff')}</p>
          <DataRow label={t('common.patientsDay')} value={phc.patientsPerDay} />
          <DataRow label="Doctors" value={phc.doctors} />
          <DataRow label="Nurses" value={phc.nurses} />
          <DataRow label="Pharmacists" value={phc.pharmacists} />
        </div>

        {/* Medicine inventory */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            {t('common.medicines')} <span className="normal-case font-normal">(days remaining)</span>
          </p>
          {Object.entries(phc.medicines).map(([name, data]) => (
            <MedicineRow key={name} name={name} data={data} />
          ))}
        </div>

        {/* Nearby PHCs */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nearby PHCs</p>
          <div className="flex flex-wrap gap-1">
            {phc.nearbyPHCIds.map(id => (
              <span
                key={id}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium"
              >
                {id.replace('phc-', 'PHC ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
