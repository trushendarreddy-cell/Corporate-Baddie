import React from 'react';
import {
  BrainCircuit,
  Database,
  FileSearch,
  Scale,
  GitBranch,
  History,
  Sparkles,
  Download,
  HelpCircle,
  Settings2,
} from 'lucide-react';

export type ModuleTab =
  | 'overview'
  | 'investigate'
  | 'decisions'
  | 'evidence'
  | 'signals'
  | 'history';

interface CommandHeaderProps {
  activeTab: ModuleTab;
  onNavigate: (tab: ModuleTab) => void;
  runId: string;
  dataQuality: number;
  activeSources: number;
  totalSources: number;
  onAsk: () => void;
  onExport: () => void;
  onOpenHowItWorks: () => void;
  onOpenSettings: () => void;
  onNewInvestigation: () => void;
}

const NAV_ITEMS: Array<{ id: ModuleTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'investigate', label: 'Investigate' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'signals', label: 'Signals' },
  { id: 'history', label: 'History' },
];

/**
 * COMMAND HEADER — global navigation for the decision intelligence
 * command center. Left: brand. Center: module tabs. Right: data status,
 * run id, Ask, Export. Mobile: collapsing single row with scrollable tabs.
 */
export const CommandHeader: React.FC<CommandHeaderProps> = ({
  activeTab,
  onNavigate,
  runId,
  dataQuality,
  activeSources,
  totalSources,
  onAsk,
  onExport,
  onOpenHowItWorks,
  onOpenSettings,
  onNewInvestigation,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/70 bg-[#07080c]/85 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Row 1: brand + status cluster */}
        <div className="h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 group shrink-0 cb-btn"
            title="Back to executive overview"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-rose-500/15 border border-amber-500/30 flex items-center justify-center shadow-[0_0_18px_-6px_rgba(245,158,11,0.5)]">
              <BrainCircuit className="w-4.5 h-4.5 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-[15px] text-slate-100">
                  CORPORATE<span className="text-amber-400">BADDIE</span>
                </span>
              </div>
              <span className="cb-meta text-slate-500">Decision Intelligence</span>
            </div>
          </button>

          {/* Status cluster */}
          <div className="flex items-center gap-2">
            {/* Data status */}
            <button
              type="button"
              onClick={() => onNavigate('investigate')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 cb-btn text-left"
              title="Data ingestion status"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="cb-meta text-slate-400">
                Data <span className="text-emerald-300 font-mono">{dataQuality}%</span>
              </span>
              <span className="cb-meta text-slate-500 hidden lg:inline">
                · <span className="text-indigo-300 font-mono">{activeSources}/{totalSources}</span> live
              </span>
            </button>

            {/* Run ID */}
            <span
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/[0.07] border border-amber-500/20"
              title="Active investigation run"
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px] font-bold text-amber-300">{runId}</span>
            </span>

            {/* Ask CorporateBaddie */}
            <button
              type="button"
              onClick={onAsk}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 cb-btn text-xs font-bold"
              title="Ask CorporateBaddie about this investigation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask CorporateBaddie</span>
              <span className="sm:hidden">Ask</span>
            </button>

            {/* Export */}
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-700/80 cb-btn text-xs font-bold"
              title="Export executive brief (PDF)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Export Brief</span>
            </button>

            {/* Utility */}
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/80 cb-btn"
              title="How it works"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:block p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/80 cb-btn"
              title="LangGraph pipeline settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: module tabs */}
        <nav
          className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px"
          aria-label="Modules"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            const isHome = item.id === 'overview';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`cb-nav-underline shrink-0 px-3.5 pb-2.5 pt-1 text-[13px] font-semibold transition-colors ${
                  active ? 'text-amber-300' : 'text-slate-500 hover:text-slate-200'
                }`}
                data-active={active}
                aria-current={active ? 'page' : undefined}
              >
                <span className="flex items-center gap-1.5">
                  {isHome && <Database className="w-3.5 h-3.5 opacity-70" />}
                  {!isHome && item.id === 'evidence' && <FileSearch className="w-3.5 h-3.5 opacity-70" />}
                  {!isHome && item.id === 'decisions' && <Scale className="w-3.5 h-3.5 opacity-70" />}
                  {!isHome && item.id === 'history' && <History className="w-3.5 h-3.5 opacity-70" />}
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onNewInvestigation}
            className="shrink-0 ml-auto pl-3 pb-2.5 pt-1 text-[13px] font-semibold text-slate-600 hover:text-amber-300 transition-colors"
            title="Start a new investigation"
          >
            + New Investigation
          </button>
        </nav>
      </div>
    </header>
  );
};
