import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Network } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { phcs, getCapacityPercent } from '../data/phcData';

function CapacityBar({ pct }) {
  const color =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-amber-400' :
    'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

function MedicineCoverage({ medicines }) {
  const entries = Object.entries(medicines);
  const critical = entries.filter(([, d]) => d.avgDemandPerDay > 0 && Math.floor(d.stock / d.avgDemandPerDay) <= 3).length;
  const low = entries.filter(([, d]) => d.avgDemandPerDay > 0 && Math.floor(d.stock / d.avgDemandPerDay) <= 7 && Math.floor(d.stock / d.avgDemandPerDay) > 3).length;
  if (critical > 0) return <span className="text-xs text-red-600 font-medium">{critical} critical</span>;
  if (low > 0) return <span className="text-xs text-amber-600 font-medium">{low} low</span>;
  return <span className="text-xs text-green-700 font-medium">Adequate</span>;
}

const STATUS_FILTER_OPTIONS = ['all', 'stable', 'at-risk', 'critical'];

export default function PHCNetwork() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { selectedRegion, t } = useOutletContext();

  const filteredPhcs = useMemo(() => {
    if (!selectedRegion || selectedRegion === 'All India') return phcs;
    return phcs.filter(p => p.state === selectedRegion);
  }, [selectedRegion]);

  const filtered = useMemo(() => {
    return filteredPhcs.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.district.toLowerCase().includes(search.toLowerCase()) ||
        (p.city || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, filteredPhcs]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Network size={18} className="text-blue-600" />
          {t('network.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {filteredPhcs.length} {selectedRegion !== 'All India' ? selectedRegion : 'National'} Primary Health Centres.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('network.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-md">
          {STATUS_FILTER_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'all' ? t('network.filterAll') : t(`common.${s === 'at-risk' ? 'atRisk' : s}`)}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{filtered.length} PHCs</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">PHC</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Location</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">{t('common.patientsDay')}</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 w-40">{t('common.capacity')}</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{t('common.medicines')}</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{t('common.staff')}</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPhcs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p className="text-sm font-semibold mb-1">No prototype PHC dataset is currently configured for this region.</p>
                    <p className="text-xs text-gray-400 max-w-sm">This prototype uses selected simulated regional datasets (e.g., Maharashtra, Uttar Pradesh, Kerala) for demonstration purposes.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              filtered.map((phc, idx) => {
                const capPct = getCapacityPercent(phc);
                return (
                  <tr
                    key={phc.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{phc.name}</p>
                      <p className="text-xs text-gray-400">{phc.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{phc.city || phc.district}</p>
                      <p className="text-xs text-gray-400">{phc.state}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{phc.patientsPerDay}</td>
                    <td className="px-4 py-3">
                      <CapacityBar pct={capPct} />
                      <p className="text-[10px] text-gray-400 mt-0.5">{phc.bedsOccupied}/{phc.bedCapacity} beds</p>
                    </td>
                    <td className="px-4 py-3">
                      <MedicineCoverage medicines={phc.medicines} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{phc.doctors}D / {phc.nurses}N</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={phc.status} t={t} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
