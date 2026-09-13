import React, { useState } from 'react';
import { 
  Building2, 
  Target, 
  Compass, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Edit3, 
  RotateCcw, 
  Save, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BusinessContext } from '../types';

interface BusinessContextPanelProps {
  context: BusinessContext;
  onUpdateContext?: (updated: BusinessContext) => void;
  /** Alias for onUpdateContext. */
  onSaveContext?: (updated: BusinessContext) => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  isGroundedMode?: boolean; // When shown on the dashboard as "Context used in this investigation"
}

export const BusinessContextPanel: React.FC<BusinessContextPanelProps> = ({
  context,
  onUpdateContext,
  onSaveContext,
  isCollapsible = false,
  defaultExpanded = true,
  isGroundedMode = false,
}) => {
  const commitContext = onUpdateContext || onSaveContext || (() => {});
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BusinessContext>(context);
  const [newKpi, setNewKpi] = useState('');

  const handleSave = () => {
    commitContext(formData);
    setIsEditing(false);
  };

  const handleReset = () => {
    setFormData(context);
    setIsEditing(false);
  };

  const handleAddKpi = () => {
    if (newKpi.trim() && !formData.importantKpis.includes(newKpi.trim())) {
      setFormData({
        ...formData,
        importantKpis: [...formData.importantKpis, newKpi.trim()],
      });
      setNewKpi('');
    }
  };

  const handleRemoveKpi = (kpiToRemove: string) => {
    setFormData({
      ...formData,
      importantKpis: formData.importantKpis.filter((k) => k !== kpiToRemove),
    });
  };

  return (
    <div className={`rounded-2xl border transition-all ${
      isGroundedMode 
        ? 'bg-[#0d121c] border-amber-500/30 shadow-lg shadow-amber-950/20' 
        : 'bg-[#0b0e15] border-slate-800 shadow-xl'
    } overflow-hidden`}>
      {/* Header bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isGroundedMode 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {isGroundedMode ? 'Context Used in this Investigation' : 'Business Context & Strategy Layer'}
              </h3>
              {isGroundedMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 border border-amber-400/30 text-amber-300">
                  Active in Recommendation
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              CorporateBaddie factors corporate strategy, constraints, and KPI targets alongside internal transaction data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setFormData(context);
                setIsEditing(true);
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Context</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Context</span>
              </button>
            </div>
          )}

          {isCollapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label={isExpanded ? 'Collapse context' : 'Expand context'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {!isEditing ? (
            /* View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Company Profile */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Company Profile</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{context.companyName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium">
                      {context.industry}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                      {context.primaryMarket}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Objective & Strategy */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Objective & Strategy</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Objective</p>
                  <p className="text-xs font-bold text-slate-200">{context.businessObjective}</p>
                  <p className="text-xs text-slate-400 mt-2">Current Strategy</p>
                  <p className="text-xs font-semibold text-emerald-300">{context.currentStrategy}</p>
                </div>
              </div>

              {/* Card 3: Constraints & Priority */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Constraints & Priority</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Known Constraint</p>
                  <p className="text-xs font-semibold text-rose-300">{context.knownConstraints}</p>
                  <p className="text-xs text-slate-400 mt-2">Management Priority</p>
                  <p className="text-xs font-bold text-amber-200">{context.managementPriorities}</p>
                </div>
              </div>

              {/* Card 4: Key Performance Indicators */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Important KPIs</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {context.importantKpis.map((kpi, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-medium"
                    >
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Company / Business Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Primary Market</label>
                  <input
                    type="text"
                    value={formData.primaryMarket}
                    onChange={(e) => setFormData({ ...formData, primaryMarket: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Business Objective</label>
                  <input
                    type="text"
                    value={formData.businessObjective}
                    onChange={(e) => setFormData({ ...formData, businessObjective: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Current Strategy</label>
                  <input
                    type="text"
                    value={formData.currentStrategy}
                    onChange={(e) => setFormData({ ...formData, currentStrategy: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Known Constraints</label>
                  <input
                    type="text"
                    value={formData.knownConstraints}
                    onChange={(e) => setFormData({ ...formData, knownConstraints: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Management Priority</label>
                  <input
                    type="text"
                    value={formData.managementPriorities}
                    onChange={(e) => setFormData({ ...formData, managementPriorities: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* KPIs editor */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Important KPIs</label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {formData.importantKpis.map((kpi, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-cyan-800/40 text-xs"
                    >
                      {kpi}
                      <button
                        type="button"
                        onClick={() => handleRemoveKpi(kpi)}
                        className="text-slate-400 hover:text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="Add KPI (e.g. Net Margin, CLV)..."
                    value={newKpi}
                    onChange={(e) => setNewKpi(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKpi();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddKpi}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Strategic Synthesis Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-300">Strategy & Constraint Alignment:</span>{' '}
              CorporateBaddie will filter candidate recommendations against your constraint (<span className="text-rose-300 font-medium">{context.knownConstraints}</span>) and evaluate success against your objective (<span className="text-emerald-300 font-medium">{context.businessObjective}</span>) while safeguarding premium product positioning in {context.primaryMarket}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
