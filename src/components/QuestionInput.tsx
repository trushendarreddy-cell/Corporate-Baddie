import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  Layers, 
  Sparkles, 
  FileSpreadsheet, 
  ArrowRight,
  Database,
  Building2,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EXAMPLE_QUESTIONS, DEFAULT_BUSINESS_CONTEXT, DEFAULT_DATA_SOURCES, DATA_RELATIONSHIPS } from '../mockData';
import { BusinessContext, DataSource } from '../types';
import { BusinessContextPanel } from './BusinessContextPanel';
import { DataSourcesPanel } from './DataSourcesPanel';

interface QuestionInputProps {
  question: string;
  setQuestion: (q: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onOpenUploadModal: () => void;
  onOpenContextModal: () => void;
  attachedDataLabel: string;
  hasCustomContext: boolean;
  businessContext?: BusinessContext;
  onUpdateBusinessContext?: (ctx: BusinessContext) => void;
  dataSources?: DataSource[];
  onToggleDataSource?: (id: string) => void;
  onAddSimulatedFile?: (name: string, type: 'CSV' | 'Excel') => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  setQuestion,
  onAnalyze,
  isAnalyzing,
  onOpenUploadModal,
  onOpenContextModal,
  attachedDataLabel,
  hasCustomContext,
  businessContext = DEFAULT_BUSINESS_CONTEXT,
  onUpdateBusinessContext,
  dataSources = DEFAULT_DATA_SOURCES,
  onToggleDataSource,
  onAddSimulatedFile,
}) => {
  const [activeExampleIndex, setActiveExampleIndex] = useState<number>(0);
  const [showInlineContext, setShowInlineContext] = useState<boolean>(false);
  const [showInlineDataSources, setShowInlineDataSources] = useState<boolean>(false);

  const handleSelectExample = (prompt: string, idx: number) => {
    setQuestion(prompt);
    setActiveExampleIndex(idx);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Agentic Decision Intelligence Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Turn business questions into decisions.
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CorporateBaddie investigates your multi-source data, profiles anomalies, researches external market signals, and provides falsifiable executive recommendations.
        </p>
      </div>

      {/* Main Investigation Input Card */}
      <div className="bg-[#0e121b] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-sm">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <label 
            htmlFor="business-question-input" 
            className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            What's happening?
          </label>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono text-[10px]">Cmd + Enter</kbd> to analyze
          </span>
        </div>

        {/* Large Input Textarea */}
        <div className="relative mb-4">
          <textarea
            id="business-question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isAnalyzing}
            placeholder="Describe your business dilemma, margin contraction, or strategic choice..."
            className="w-full bg-[#090b10] border border-slate-700/80 rounded-xl p-4 text-base sm:text-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Data Sources Panel */}
            <button
              type="button"
              onClick={() => {
                setShowInlineDataSources(!showInlineDataSources);
                if (showInlineContext) setShowInlineContext(false);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                showInlineDataSources
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data Sources ({dataSources.length} Connected)</span>
              {showInlineDataSources ? <ChevronUp className="w-3.5 h-3.5 text-indigo-300" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Toggle Business Context Panel */}
            <button
              type="button"
              onClick={() => {
                setShowInlineContext(!showInlineContext);
                if (showInlineDataSources) setShowInlineDataSources(false);
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                showInlineContext
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Business Context ({businessContext.companyName})</span>
              {showInlineContext ? <ChevronUp className="w-3.5 h-3.5 text-amber-300" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !question.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Analyze Problem</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Data Sources Panel if toggled */}
      {showInlineDataSources && (
        <div className="animate-in fade-in duration-200">
          <DataSourcesPanel
            sources={dataSources}
            relationships={DATA_RELATIONSHIPS}
            onToggleSource={onToggleDataSource || (() => {})}
            onAddSimulatedFile={onAddSimulatedFile}
            isCollapsible={false}
          />
        </div>
      )}

      {/* Inline Business Context Panel if toggled */}
      {showInlineContext && (
        <div className="animate-in fade-in duration-200">
          <BusinessContextPanel
            context={businessContext}
            onSaveContext={onUpdateBusinessContext || (() => {})}
          />
        </div>
      )}

      {/* Clickable Example Questions */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400">
          <span>Or explore benchmark investigations:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_QUESTIONS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectExample(ex.prompt, idx)}
              className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 group ${
                activeExampleIndex === idx && question === ex.prompt
                  ? 'bg-slate-800/90 border-amber-500/40 text-slate-100 shadow-md shadow-black/20'
                  : 'bg-[#0e121b]/70 hover:bg-[#0e121b] border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-400/80 font-bold text-[11px] mt-0.5">
                  0{idx + 1}
                </span>
                <span className="font-medium group-hover:text-amber-200 transition-colors">
                  {ex.title}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

