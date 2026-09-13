import React from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  Settings2, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
  hasAnalyzed: boolean;
  isAnalyzing: boolean;
  onOpenVersionHistory?: () => void;
  versionCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItWorks,
  onOpenSettings,
  onReset,
  hasAnalyzed,
  isAnalyzing,
  onOpenVersionHistory,
  versionCount = 1,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090b10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onReset}
            className="flex items-center gap-2.5 text-left group transition-all"
            title="Reset to home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center group-hover:border-amber-400/60 transition-colors shadow-inner">
              <BrainCircuit className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-slate-100 group-hover:text-white transition-colors">
                  CORPORATE<span className="text-amber-400">BADDIE</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                Making Sense of Corporate Nonsense
              </p>
            </div>
          </button>
        </div>

        {/* Center / Navigation items */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agentic Decision Intelligence</span>
          </div>

          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 hover:text-white transition-colors text-slate-400"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 hover:text-white transition-colors text-slate-400"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>LangGraph Pipeline</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {onOpenVersionHistory && (
            <button
              onClick={onOpenVersionHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              title="View session investigation version history"
            >
              <RotateCcw className="w-3.5 h-3.5 rotate-45 text-amber-400" />
              <span>History ({versionCount})</span>
            </button>
          )}

          {hasAnalyzed && !isAnalyzing && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">New Question</span>
            </button>
          )}

          <button
            onClick={onOpenHowItWorks}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="How it works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Pipeline & Architecture Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
