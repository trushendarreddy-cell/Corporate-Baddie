import React, { useState } from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Layers, 
  Network, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  History, 
  Upload, 
  Link2,
  ChevronDown,
  ChevronUp,
  X,
  FileCode
} from 'lucide-react';
import { DataSource, DataRelationship } from '../types';

interface DataSourcesPanelProps {
  sources: DataSource[];
  relationships: DataRelationship[];
  onToggleSource: (id: string) => void;
  onAddSimulatedFile?: (name: string, type: 'CSV' | 'Excel') => void;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export const DataSourcesPanel: React.FC<DataSourcesPanelProps> = ({
  sources,
  relationships,
  onToggleSource,
  onAddSimulatedFile,
  isCollapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'sources' | 'relationships'>('sources');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'CSV' | 'Excel'>('CSV');

  // Compute selected stats
  const selectedSources = sources.filter((s) => s.selected);
  const totalSelectedSources = selectedSources.length;
  const totalSelectedRecords = selectedSources.reduce((acc, s) => acc + s.recordsCount, 0);
  const totalSelectedFields = selectedSources.reduce((acc, s) => acc + s.fieldsCount, 0);

  const getTypeBadge = (type: DataSource['type']) => {
    switch (type) {
      case 'CSV':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">CSV</span>;
      case 'Excel':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-950/60 border border-green-800/40 text-green-300">Excel</span>;
      case 'Database':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">Database</span>;
      case 'API':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">API</span>;
      case 'Previous Analysis':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 border border-purple-800/40 text-purple-300">Analysis</span>;
    }
  };

  const getStatusBadge = (status: DataSource['status']) => {
    switch (status) {
      case 'Connected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Connected
          </span>
        );
      case 'Ready':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Ready to link
          </span>
        );
      case 'Disconnected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Disconnected
          </span>
        );
    }
  };

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim() && onAddSimulatedFile) {
      onAddSimulatedFile(newFileName.trim(), newFileType);
      setNewFileName('');
      setUploadModalOpen(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b0e15] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 to-[#0e131f] border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Multi-Dataset Ingestion & Schema Graphs
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                Multi-Source
              </span>
            </div>
            <p className="text-xs text-slate-400">
              CorporateBaddie correlates transactional ledgers, customer cohorts, and marketing spend across normalized foreign keys
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Stats Capsule */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono flex items-center gap-3 text-slate-300">
            <span className="font-bold text-amber-400">{totalSelectedSources} data sources</span>
            <span className="text-slate-600">·</span>
            <span className="font-bold text-emerald-400">{totalSelectedRecords.toLocaleString()} records</span>
            <span className="text-slate-600">·</span>
            <span className="font-bold text-cyan-400">{totalSelectedFields} fields</span>
          </div>

          {isCollapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label={isExpanded ? 'Collapse data sources' : 'Expand data sources'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sources'
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Connected Datasets ({sources.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('relationships')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'relationships'
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Data Relationships ({relationships.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate New Input (CSV / Excel)</span>
            </button>
          </div>

          {activeTab === 'sources' ? (
            /* Data Sources Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  onClick={() => onToggleSource(source.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none relative overflow-hidden ${
                    source.selected
                      ? 'bg-[#101524] border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        source.selected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-600 bg-slate-800'
                      }`}>
                        {source.selected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        SOURCE
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeBadge(source.type)}
                      {getStatusBadge(source.status)}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{source.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {source.description}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <span>{source.recordsCount.toLocaleString()} records</span>
                    <span>{source.fieldsCount} schema fields</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Data Relationships Preview */
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" />
                <span>
                  CorporateBaddie automatically maps join keys across disparate datasets to construct holistic cross-departmental evidence.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relationships.map((rel, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                          {rel.key}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">Primary Join Key</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">Auto-Resolved</span>
                    </div>

                    <p className="text-xs text-slate-300">{rel.description}</p>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-400">Connected in:</span>
                      {rel.sources.map((srcName, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {srcName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulated Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0e121b] border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                Simulate Data Ingestion
              </h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulatedUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Dataset Name / File Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q2 Inventory & SKU Fulfillment.csv"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Data Source Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFileType('CSV')}
                    className={`p-2.5 rounded-lg border text-center font-bold ${
                      newFileType === 'CSV' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    CSV File
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFileType('Excel')}
                    className={`p-2.5 rounded-lg border text-center font-bold ${
                      newFileType === 'Excel' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                In this prototype, CorporateBaddie will generate synthetic row profiles, schema field counts, and foreign key relations to simulate multi-dataset cross-querying.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Connect Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
