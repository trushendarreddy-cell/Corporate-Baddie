import React from 'react';
import { BrainCircuit, Sparkles, Download, HelpCircle, Settings2 } from 'lucide-react';

export type ModuleTab = 'overview' | 'investigate' | 'decisions' | 'evidence' | 'signals' | 'history';

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

const NAV: Array<{ id: ModuleTab; label: string; meaning: string }> = [
  { id: 'investigate', label: 'Investigate', meaning: 'Ask a question' },
  { id: 'overview', label: 'Overview', meaning: 'Understand the answer' },
  { id: 'decisions', label: 'Decisions', meaning: 'Compare actions' },
  { id: 'evidence', label: 'Evidence', meaning: 'Prove the answer' },
  { id: 'signals', label: 'Signals', meaning: "What's changing?" },
  { id: 'history', label: 'History', meaning: 'Previous investigations' },
];

/**
 * COMMAND HEADER — quiet, compact global navigation.
 * Left: brand. Center: module tabs (text + hairline indicator).
 * Right: data status, run id, Ask, Export. No boxes around nav items.
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
    <header className="sticky top-0 z-40 w-full border-b cb-hairline bg-[#191b1a]/95 backdrop-blur-xl">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[52px] py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onNavigate('investigate')}
            className="flex items-center gap-2.5 group shrink-0 cb-btn"
            title="Start an investigation"
          >
            <BrainCircuit className="w-[18px] h-[18px] text-[#8eb397]" />
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="font-bold tracking-tight text-[14px] text-slate-100 truncate">
                CorporateBaddie
              </span>
              <span className="cb-meta hidden xl:inline">Decision Intelligence</span>
            </span>
          </button>

          {/* Center nav — plain text, no absolute positioning so it can wrap and stay readable */}
          <nav className="hidden md:flex flex-1 justify-center min-w-0" aria-label="Modules">
            <div className="flex items-center gap-2 xl:gap-4 min-w-0 overflow-visible">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`cb-nav-underline whitespace-nowrap pb-0.5 text-[11.5px] xl:text-[12.5px] font-medium transition-colors ${
                    activeTab === item.id ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  data-active={activeTab === item.id}
                  title={item.meaning}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => onNavigate('investigate')}
              className="hidden lg:flex items-center gap-1.5 text-[11.5px] text-slate-500 hover:text-slate-300 transition-colors cb-btn"
              title={`Data quality ${dataQuality}% · ${activeSources}/${totalSources} sources live`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8eb397]" />
              <span className="cb-metric text-[11.5px] text-slate-400">{dataQuality}%</span>
              <span className="text-slate-600">·</span>
              <span className="cb-metric text-[11.5px] text-slate-400">{activeSources}/{totalSources}</span>
            </button>

            <span className="hidden xl:inline font-mono text-[11.5px] text-slate-500" title="Active run">
              {runId}
            </span>

            <button
              type="button"
              onClick={onAsk}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] cb-btn"
              title="Ask CorporateBaddie"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8eb397]" />
              <span className="hidden xl:inline">Ask</span>
            </button>

            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] cb-btn"
              title="Export executive brief (PDF)"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">Export</span>
            </button>

            <span className="w-px h-4 bg-slate-800 hidden sm:block" />

            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="p-1.5 text-slate-600 hover:text-slate-300 rounded-md hover:bg-white/[0.04] cb-btn"
              title="How it works"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:block p-1.5 text-slate-600 hover:text-slate-300 rounded-md hover:bg-white/[0.04] cb-btn"
              title="Workflow settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNewInvestigation}
              className="cb-primary-action px-3 py-1.5 rounded-md text-[12px] font-semibold cb-btn"
              title="New investigation"
            >
              New
            </button>
          </div>
        </div>

        {/* Mobile nav — scrollable row */}
        <nav className="md:hidden flex items-center gap-5 overflow-x-auto pb-2.5 -mb-px" aria-label="Modules">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`cb-nav-underline shrink-0 pb-0.5 text-[13px] font-medium transition-colors ${
                activeTab === item.id ? 'text-slate-100' : 'text-slate-500'
              }`}
              data-active={activeTab === item.id}
              title={item.meaning}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
