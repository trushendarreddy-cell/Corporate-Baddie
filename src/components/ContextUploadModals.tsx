import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Check, 
  Building2, 
  ShieldCheck, 
  Database,
  Sliders,
  DollarSign
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDataset: string;
  onSelectDataset: (name: string) => void;
}

export const UploadDataModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  selectedDataset,
  onSelectDataset,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [customFile, setCustomFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoDatasets = [
    {
      name: 'Q1-Q2 Consolidated Sales & Territory Ledger.csv',
      rows: '284,520 records',
      size: '14.2 MB',
      quality: '91% completeness',
      isCurrent: selectedDataset.includes('Consolidated Sales'),
    },
    {
      name: 'Enterprise Product SKU Margin & Unit Pricing.xlsx',
      rows: '18,400 records',
      size: '2.8 MB',
      quality: '96% completeness',
      isCurrent: selectedDataset.includes('Product SKU'),
    },
    {
      name: 'Southern Territory Distributor Cohorts 2026.parquet',
      rows: '92,100 records',
      size: '8.4 MB',
      quality: '89% completeness',
      isCurrent: selectedDataset.includes('Southern Territory'),
    },
  ];

  const handleSelect = (name: string) => {
    onSelectDataset(name);
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const name = e.dataTransfer.files[0].name;
      setCustomFile(name);
      onSelectDataset(`Uploaded: ${name}`);
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Upload Business Data"
        className="w-full max-w-xl bg-[#0e121b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Internal Business Data</h3>
              <p className="text-xs text-slate-400">Connect ERP ledgers, CRM cohorts, or product performance files</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Drag and drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-amber-400 bg-amber-950/20'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
            }`}
          >
            <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-200">
              Drag & drop CSV, Excel, or Parquet datasets
            </p>
            <p className="text-slate-500 text-[11px] mt-1">
              Supports .csv, .xlsx, .parquet, .json up to 100MB
            </p>
            {customFile && (
              <p className="text-emerald-400 font-mono text-[11px] mt-2 font-bold">
                ✓ Uploaded: {customFile}
              </p>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Or Select Verified Demo Datasets:
            </span>
            <div className="space-y-2">
              {demoDatasets.map((ds, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(ds.name)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    ds.isCurrent
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className={`w-4 h-4 ${ds.isCurrent ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-slate-200">{ds.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {ds.rows} · {ds.size} · {ds.quality}
                      </p>
                    </div>
                  </div>
                  {ds.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#0e121b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContext: (context: { competitorIntel: string; marginTarget: string; regionPriority: string }) => void;
}

export const ContextModal: React.FC<ContextModalProps> = ({
  isOpen,
  onClose,
  onSaveContext,
}) => {
  const [competitorIntel, setCompetitorIntel] = useState(
    'NexaCorp launched regional 15-20% discounts on rival bundle; active in South and Gulf industrial corridors.'
  );
  const [marginTarget, setMarginTarget] = useState('Maintain minimum 38% gross contribution margin across portfolio.');
  const [regionPriority, setRegionPriority] = useState('Region South is our primary customer retention focus for H2.');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveContext({ competitorIntel, marginTarget, regionPriority });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Business Context & Constraints"
        className="w-full max-w-xl bg-[#0e121b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Business Context & Constraints</h3>
              <p className="text-xs text-slate-400">Guide CorporateBaddie with company-specific boundaries and market intel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Competitor Market Intelligence:
            </label>
            <textarea
              value={competitorIntel}
              onChange={(e) => setCompetitorIntel(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Financial Margin Floor & Hurdle Rates:
            </label>
            <input
              type="text"
              value={marginTarget}
              onChange={(e) => setMarginTarget(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Strategic Priorities & Governance Constraints:
            </label>
            <input
              type="text"
              value={regionPriority}
              onChange={(e) => setRegionPriority(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#0e121b] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
          >
            Apply Context
          </button>
        </div>
      </div>
    </div>
  );
};
