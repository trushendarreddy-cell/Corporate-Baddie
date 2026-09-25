import React from 'react';
import { BrainCircuit, Sparkles, Download, HelpCircle, Settings2, Wifi, WifiOff } from 'lucide-react';

export type ModuleTab = 'overview' | 'investigate' | 'decisions' | 'evidence' | 'signals' | 'data' | 'history';

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
  onReplayIntro?: () => void;
  backendStatus?: 'checking' | 'online' | 'offline';
  onRetryBackend?: () => void;
}

const NAV: Array<{ id: ModuleTab; label: string; meaning: string }> = [
  { id: 'overview', label: 'Dashboard', meaning: 'Executive Overview' },
  { id: 'investigate', label: 'Investigate', meaning: 'Ask a question' },
  { id: 'decisions', label: 'Decisions', meaning: 'Compare actions' },
  { id: 'evidence', label: 'Evidence', meaning: 'Prove the answer' },
  { id: 'signals', label: 'Signals', meaning: "What's changing?" },
  { id: 'data', label: 'Data', meaning: 'Datasets & uploads' },
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
  onReplayIntro,
  backendStatus = 'checking',
  onRetryBackend,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onAsk();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAsk]);

  return (
    <header className="sticky top-0 z-40 w-full border-b cb-hairline bg-[#191b1a]/95 backdrop-blur-xl" role="banner">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[52px] py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 group shrink-0 cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191b1a] rounded-lg"
            title="Executive Dashboard"
            aria-label="CorporateBaddie Decision Intelligence - navigate to executive dashboard"
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
                  className={`cb-nav-underline whitespace-nowrap pb-0.5 text-[11.5px] xl:text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80 rounded ${
                    activeTab === item.id ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  data-active={activeTab === item.id}
                  title={item.meaning}
                  aria-label={`${item.label} module - ${item.meaning}`}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap justify-end">
            {/* Backend connection status */}
            <button
              type="button"
              onClick={onRetryBackend}
              disabled={backendStatus === 'checking' || !onRetryBackend}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80 ${
                backendStatus === 'online'
                  ? 'text-[#8eb397]'
                  : backendStatus === 'offline'
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-slate-500'
              }`}
              title={
                backendStatus === 'online'
                  ? 'Backend API connected — investigations run server-side'
                  : backendStatus === 'offline'
                  ? 'Backend unreachable — running in deterministic local mode. Click to retry.'
                  : 'Checking backend connection…'
              }
              aria-label={`Backend status: ${backendStatus}. ${backendStatus === 'offline' ? 'Click to retry connection.' : ''}`}
            >
              {backendStatus === 'offline' ? (
                <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Wifi className={`w-3.5 h-3.5 ${backendStatus === 'checking' ? 'animate-pulse' : ''}`} aria-hidden="true" />
              )}
              <span className="hidden xl:inline cb-mono">{backendStatus === 'online' ? 'API LIVE' : backendStatus === 'offline' ? 'LOCAL MODE' : '…'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('investigate')}
              className="hidden lg:flex items-center gap-1.5 text-[11.5px] text-slate-500 hover:text-slate-300 transition-colors cb-btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8eb397] rounded"
              title={`Data quality ${dataQuality}% · ${activeSources}/${totalSources} sources live`}
              aria-label={`System status: data quality ${dataQuality}%, ${activeSources} of ${totalSources} data sources live`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8eb397]" aria-hidden="true" />
              <span className="cb-metric text-[11.5px] text-slate-400">{dataQuality}%</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="cb-metric text-[11.5px] text-slate-400">{activeSources}/{totalSources}</span>
            </button>

            <span className="hidden xl:inline font-mono text-[11.5px] text-slate-500" title="Active run" aria-label={`Active run ID: ${runId}`}>
              {runId}
            </span>

            <button
              type="button"
              onClick={onAsk}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80"
              title="Ask CorporateBaddie (Ctrl+K)"
              aria-label="Ask CorporateBaddie AI assistant (Shortcut: Ctrl+K)"
              aria-keyshortcuts="Control+k Meta+k"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8eb397]" aria-hidden="true" />
              <span className="hidden xl:inline">Ask</span>
              <kbd className="hidden xl:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80"
              title="Export executive brief (PDF)"
              aria-label="Export executive brief as PDF document"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="hidden xl:inline">Export</span>
            </button>

            <span className="w-px h-4 bg-slate-800 hidden sm:block" aria-hidden="true" />

            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="p-1.5 text-slate-600 hover:text-slate-300 rounded-md hover:bg-white/[0.04] cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80"
              title="How it works"
              aria-label="View how CorporateBaddie works documentation"
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:block p-1.5 text-slate-600 hover:text-slate-300 rounded-md hover:bg-white/[0.04] cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80"
              title="Workflow settings"
              aria-label="Open pipeline and architecture workflow settings"
            >
              <Settings2 className="w-4 h-4" aria-hidden="true" />
            </button>

            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-emerald-300 rounded-md hover:bg-white/[0.04] border border-white/10 text-xs transition cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80"
                title="View 3D Intro Experience"
                aria-label="View 3D intro presentation experience"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="hidden sm:inline">Intro</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNewInvestigation}
              className="cb-primary-action px-3 py-1.5 rounded-md text-[12px] font-semibold cb-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb397]/80"
              title="New investigation"
              aria-label="Start a new investigation"
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
