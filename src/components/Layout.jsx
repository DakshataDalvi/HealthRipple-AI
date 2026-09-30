import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Zap, Network, BarChart2, Info, User, Activity, Globe
} from 'lucide-react';
import { getTranslation, LANGUAGES } from '../i18n';

const NAV_ITEMS = [
  { to: '/overview',  icon: LayoutDashboard, key: 'nav.overview' },
  { to: '/simulate',  icon: Zap,             key: 'nav.simulate' },
  { to: '/network',   icon: Network,         key: 'nav.network' },
  { to: '/results',   icon: BarChart2,       key: 'nav.results' },
  { to: '/about',     icon: Info,            key: 'nav.about' },
];

const REGIONS = ['All India', 'Maharashtra', 'Uttar Pradesh', 'Kerala', 'Assam', 'Gujarat', 'Karnataka'];

export default function Layout({ selectedRegion, setSelectedRegion, language, setLanguage }) {
  const location = useLocation();
  const t = (key, params) => getTranslation(language, key, params);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Activity size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{t('layout.title')}</p>
              <p className="text-[10px] text-gray-400 leading-tight font-medium tracking-wide">
                Simulate · Understand · Prepare
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={15} aria-hidden="true" />
              {t(key)}
            </NavLink>
          ))}
        </nav>

        {/* Prototype badge */}
        <div className="px-4 py-3 border-t border-gray-100">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            Prototype
          </span>
          <p className="mt-1.5 text-[10px] text-gray-500 leading-relaxed font-medium">
            PROTOTYPE — SIMULATED DATA
            <br/><span className="text-gray-400 font-normal mt-0.5 block">This demonstration uses synthetic PHC network data and is not connected to live healthcare systems.</span>
          </p>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-13 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-0" style={{ minHeight: 52 }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">{t('layout.title')}</span>
            <span className="text-gray-200 select-none">|</span>
            <span className="text-xs text-gray-400">{t('layout.subtitle')}</span>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Language selector */}
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-gray-500" />
              <label htmlFor="lang-select" className="text-xs text-gray-500 font-medium">{t('layout.language')}</label>
              <select
                id="lang-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Region selector */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <label htmlFor="region-select" className="text-xs text-gray-500 font-medium">{t('layout.region')}</label>
              <select
                id="region-select"
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r === 'All India' ? t('common.allIndia') : r}</option>
                ))}
              </select>
            </div>
            
            {/* User avatar */}
            <div
              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center ml-2"
              aria-label="User profile"
              role="img"
            >
              <User size={13} className="text-gray-600" aria-hidden="true" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" id="main-content">
          <Outlet context={{ selectedRegion, language, setLanguage, t }} />
        </main>
      </div>
    </div>
  );
}
