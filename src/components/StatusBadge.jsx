export function StatusBadge({ status, t = (k) => k }) {
  const config = {
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
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {labels[status] || status}
    </span>
  );
}
