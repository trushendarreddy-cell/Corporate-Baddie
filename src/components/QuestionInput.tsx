import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Database,
  Building2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
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
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const [activeExampleIndex, setActiveExampleIndex] = useState<number>(0);
  const [showInlineContext, setShowInlineContext] = useState<boolean>(false);
  const [showInlineDataSources, setShowInlineDataSources] = useState<boolean>(false);
  const [previewStage, setPreviewStage] = useState(-1);
  const [activeCapability, setActiveCapability] = useState<string | null>(null);

  const previewStages = [
    'Checking your data',
    'Finding important changes',
    'Investigating why',
    'Checking market signals',
    'Verifying evidence',
    'Building a recommendation',
  ];

  const capabilities = [
    ['UNDERSTAND', 'What changed in your business?', 'Why did revenue, margin, or demand move?'],
    ['DIAGNOSE', 'Why is it happening?', 'Why did our gross margin fall in Q3?'],
    ['INVESTIGATE', 'Which parts are driving it?', 'Which products, regions, customers, or channels matter most?'],
    ['MARKET', 'What is happening outside?', 'Are competitors changing prices in our category?'],
    ['FORECAST', 'What could happen next?', 'What happens if the current trend continues?'],
    ['DECIDE', 'Which action has the strongest evidence?', 'Should we increase pricing or protect volume?'],
    ['VERIFY', 'Can we support the recommendation?', 'Which source and calculation support this conclusion?'],
  ];

  useEffect(() => {
    if (previewStage < 0 || previewStage >= previewStages.length - 1) return;
    const timer = window.setTimeout(() => setPreviewStage((current) => current + 1), 520);
    return () => window.clearTimeout(timer);
  }, [previewStage, previewStages.length]);

  const handleSelectExample = (prompt: string, idx: number) => {
    setQuestion(prompt);
    setActiveExampleIndex(idx);
    setPreviewStage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Product entry */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="cb-kicker text-amber-400/90">CorporateBaddie</p>
        <h1 className="cb-display text-[28px] sm:text-[38px] text-white mt-3 leading-tight">
          Ask a business question.<br />
          <span className="text-[#a9c9ae]">Get a decision you can defend.</span>
        </h1>
        <p className="text-[13px] sm:text-[15px] text-slate-400 max-w-2xl mx-auto leading-relaxed mt-4">
          CorporateBaddie investigates your data, checks the evidence, studies relevant market signals, and turns the findings into a clear next move.
        </p>
      </div>

      {/* Main Investigation Input */}
      <div className="cb-glass rounded-xl p-4 sm:p-5 relative max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="business-question-input"
            className="cb-kicker !text-slate-400"
          >
            Start with a business question
          </label>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono text-[10px]">Cmd + Enter</kbd> to analyze
          </span>
        </div>

        {/* Large Input Textarea */}
        <div className="relative mb-4">
          <textarea
            id="business-question-input"
            ref={questionInputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
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
              className={`cb-btn inline-flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] font-medium border ${
                showInlineDataSources
                  ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data Sources · {dataSources.length}</span>
              {showInlineDataSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
            </button>

            {/* Toggle Business Context Panel */}
            <button
              type="button"
              onClick={() => {
                setShowInlineContext(!showInlineContext);
                if (showInlineDataSources) setShowInlineDataSources(false);
              }}
              className={`cb-btn inline-flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] font-medium border ${
                showInlineContext
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Context · {businessContext.companyName}</span>
              {showInlineContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
            </button>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !question.trim()}
              className="cb-primary-action cb-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-[13.5px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                <span>Investigating…</span>
              </>
            ) : (
              <>
                <span>Start an investigation</span>
                <ArrowRight className="w-4 h-4" />
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400">
          <span className="cb-kicker">Try a real business question</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((example, idx) => (
            <button
              key={example.id}
              type="button"
              onClick={() => handleSelectExample(example.prompt, idx)}
              className={`text-left px-3.5 py-2.5 rounded-md border text-xs transition-all group ${
                activeExampleIndex === idx && question === example.prompt
                  ? 'cb-selected text-emerald-100'
                  : 'bg-[#0e121b]/70 hover:bg-[#0e121b] border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <span className="font-medium group-hover:text-amber-200 transition-colors">{example.prompt}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 italic">
          These are examples only. CorporateBaddie investigates your actual data to generate findings.
        </p>
      </div>

      {previewStage >= 0 && (
        <div className="cb-glass-hero cb-edge rounded-xl p-5 sm:p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="cb-kicker text-amber-400/90">Illustrative investigation</p>
              <p className="text-base sm:text-lg font-semibold text-white mt-2">“{question}”</p>
            </div>
            <span className="cb-meta text-emerald-300">{previewStage === previewStages.length - 1 ? 'Example complete' : 'Example flow'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {previewStages.map((stage, index) => {
              const complete = index < previewStage;
              const current = index === previewStage;
              return (
                <div key={stage} className={`flex items-center gap-2 text-xs ${complete ? 'text-emerald-300' : current ? 'text-amber-200' : 'text-slate-600'}`}>
                  {complete ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : current ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <span className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>

          {previewStage === previewStages.length - 1 && (
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <p className="cb-kicker text-amber-400/90">What we recommend</p>
                <p className="text-sm font-semibold text-white mt-1">Reduce discounting on high-demand products.</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">Revenue stayed stable, but aggressive discounting reduced gross margin.</p>
              </div>
              <div className="flex sm:flex-col gap-4 sm:gap-2 sm:text-right">
                <div><span className="cb-metric text-emerald-300 text-lg">7</span><span className="cb-meta ml-1">verified claims</span></div>
                <div><span className="cb-metric text-emerald-300 text-lg">82%</span><span className="cb-meta ml-1">confidence</span></div>
              </div>
              <button type="button" onClick={onAnalyze} className="cb-primary-action sm:col-span-3 justify-self-start inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-md cb-btn">
                Open this investigation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <section className="pt-3 border-t cb-hairline" aria-label="What CorporateBaddie investigates">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <p className="cb-kicker">What CorporateBaddie investigates</p>
            <p className="text-xs text-slate-500 mt-1">One investigation, from business question to defensible decision.</p>
          </div>
          <span className="cb-meta">Select a capability to see an example</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border-y cb-hairline">
          {capabilities.map(([label, description, example]) => {
            const active = activeCapability === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveCapability(active ? null : label)}
                className={`text-left px-3 py-3.5 border-b sm:border-b-0 sm:border-r border-slate-800/80 last:border-r-0 transition-colors ${active ? 'cb-selected' : 'hover:bg-white/[0.025]'}`}
              >
                <span className={`cb-meta block ${active ? 'text-[#b8d4bd]' : ''}`}>{label}</span>
                <span className="text-[11px] text-slate-300 leading-snug block mt-2">{description}</span>
                {active && <span className="text-[11px] text-[#b8d4bd] leading-snug block mt-2">“{example}”</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="pt-3" aria-label="Investigation workflow">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="cb-kicker">How an investigation moves</p>
          <span className="text-[11px] text-slate-500">The system checks each step before it recommends an action.</span>
        </div>
        <div className="flex flex-wrap items-center gap-y-2 text-[11px] text-slate-400">
          {['Question', 'Your data', 'Analysis', 'Why', 'Market signals', 'Evidence check', 'Recommendation'].map((step, index, steps) => (
            <React.Fragment key={step}>
              <span className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-[#a9c9ae]">{index + 1}</span>
                {step}
              </span>
              {index < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 mx-2 text-slate-700" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="cb-glass rounded-xl p-4 sm:p-5" aria-label="Example investigation">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b cb-hairline pb-3">
          <div>
            <p className="cb-kicker">Example investigation</p>
            <p className="text-sm font-semibold text-white mt-1">What is driving our sales decline?</p>
          </div>
          <span className="cb-meta">Illustrative example</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div><p className="cb-kicker">What we found</p><p className="text-xs text-slate-300 mt-2 leading-relaxed">Revenue ↓14.2% · Product A ↓21.0% · South retention ↓18.4%</p></div>
          <div><p className="cb-kicker">Why</p><p className="text-xs text-slate-300 mt-2 leading-relaxed">The decline is concentrated in Product A and the South region.</p></div>
          <div><p className="cb-kicker">Market signal</p><p className="text-xs text-slate-300 mt-2 leading-relaxed">Competitor promotional activity has increased in the region.</p></div>
          <div><p className="cb-kicker">Recommendation</p><p className="text-xs text-[#b8d4bd] mt-2 leading-relaxed">Run a targeted pricing intervention, not a broad discount.</p><p className="cb-meta mt-2">82% confidence · 7 verified claims</p></div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t cb-hairline pt-5" aria-label="Start an investigation">
        <div>
          <p className="text-sm font-semibold text-white">Have a business question?</p>
          <p className="text-xs text-slate-500 mt-1">Bring the decision you are working through. CorporateBaddie will investigate it step by step.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            questionInputRef.current?.focus();
            questionInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="cb-primary-action cb-btn px-4 py-2 rounded-md text-xs font-semibold"
        >
          Start with your question
        </button>
      </section>
    </div>
  );
};

