import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Database, 
  RefreshCcw, 
  Scale, 
  BarChart2, 
  UserCheck 
} from 'lucide-react';

interface RiskPanelProps {
  risks: string[];
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ risks }) => {
  const riskDetails = [
    {
      title: 'Demo Dataset',
      icon: <Database className="w-4 h-4 text-indigo-400" />,
      desc: 'Analysis executed on synthetic enterprise transaction datasets for prototype validation. Not audited company financials.',
    },
    {
      title: 'External Evidence May Change',
      icon: <RefreshCcw className="w-4 h-4 text-purple-400" />,
      desc: 'Competitor promotional tracking and distributor signals are volatile market snapshots that require continuous polling.',
    },
    {
      title: 'Correlation Does Not Prove Causation',
      icon: <Scale className="w-4 h-4 text-amber-400" />,
      desc: 'Statistical co-occurrence between regional decline and competitor discounts should be verified via randomized territorial testing.',
    },
    {
      title: 'Forecast Confidence Depends on Historical Data',
      icon: <BarChart2 className="w-4 h-4 text-cyan-400" />,
      desc: 'Projected $1.3M - $1.8M recovery assumes linear distributor elasticity and stable macro demand curves.',
    },
    {
      title: 'Human Review Required for High-Impact Decisions',
      icon: <UserCheck className="w-4 h-4 text-emerald-400" />,
      desc: 'CorporateBaddie provides structured decision intelligence; management retains sole legal and fiduciary authority.',
    },
  ];

  return (
    <section 
      id="risks-limitations-section"
      aria-label="Risks and Limitations"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Section 9 · Governance & Risk Safeguards
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            RISKS & LIMITATIONS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit criteria, statistical constraints, and enterprise governance compliance
          </p>
        </div>

        <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          Governance Protocol v2.4
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {riskDetails.map((risk, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  {risk.icon}
                </div>
                <h3 className="text-xs font-bold text-slate-200">
                  {risk.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {risk.desc}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Risk Severity: Medium</span>
              <span className="text-amber-400">Audit Check #0{idx + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
