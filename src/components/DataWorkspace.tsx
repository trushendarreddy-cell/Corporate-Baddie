// ============================================================================
// DATA WORKSPACE
// User's central place to manage business data
// ============================================================================

import React, { useState } from 'react';
import { Database, FileText, Plus, CheckCircle, AlertCircle, Upload, FileJson } from 'lucide-react';
import type { DataSource } from '../types';
import { Dataset, WSDataSource } from '../models/workspace';
import { api } from '../services/api';
import { workspaceRepo, datasetRepo, dataSourceRepo } from '../state/workspaceRepository';
import { mapDataSourceToLegacy } from '../models/workspace';

interface DataWorkspaceProps {
  dataSources: DataSource[];
  datasets: Dataset[];
  activeTab: string;
  onAddDataSource: () => void;
  onUploadFile: (file: File) => Promise<void>;
  onToggleDataSource: (sourceId: string) => void;
}

export const DataWorkspace: React.FC<DataWorkspaceProps> = ({
  dataSources,
  datasets,
  activeTab: _activeTab,
  onAddDataSource,
  onUploadFile: _onUploadFile,
  onToggleDataSource,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const hasData = dataSources.length > 0 || datasets.length > 0;
  const activeSourcesCount = dataSources.filter(s => s.selected).length;
  const totalRecords = dataSources.reduce((sum, s) => sum + s.recordsCount, 0);

  const uploadToBackend = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      let workspace = workspaceRepo.get();
      if (!workspace) throw new Error('Create a workspace before uploading data.');

      let serverWorkspace;
      try {
        serverWorkspace = (await api.workspace(workspace.id)).workspace;
      } catch {
        serverWorkspace = (await api.createWorkspace({
          name: workspace.name,
          industry: workspace.industry,
          country: workspace.country,
          region: workspace.region,
          currency: workspace.currency,
          description: workspace.description,
          objective: workspace.businessObjective,
          kpis: workspace.importantKpis,
        })).workspace;
        workspaceRepo.save({ ...workspace, id: serverWorkspace.id });
        workspace = { ...workspace, id: serverWorkspace.id };
      }

      const response = await api.uploadDataset(workspace.id, file);
      const serverDataset = response.dataset as any;
      const sourceType = serverDataset.source?.type === 'XLSX' ? 'Excel' : 'CSV';
      const now = new Date().toISOString();
      const source: WSDataSource = {
        id: serverDataset.sourceId || `src-${serverDataset.id}`,
        workspaceId: workspace.id,
        type: sourceType,
        name: String(serverDataset.name).replace(/\.[^/.]+$/, ''),
        description: `Backend-ingested ${sourceType} file`,
        status: 'connected',
        fileName: serverDataset.name,
        fileHash: serverDataset.contentHash || serverDataset.source?.hash,
        rows: serverDataset.rowCount || 0,
        columns: serverDataset.schema?.columns?.length || 0,
        selected: true,
        createdAt: serverDataset.createdAt || now,
        updatedAt: serverDataset.updatedAt || now,
        config: { hasHeader: true },
      };
      const dataset: Dataset = {
        id: serverDataset.id,
        workspaceId: workspace.id,
        sourceId: source.id,
        name: serverDataset.name,
        description: serverDataset.description || 'Backend-ingested dataset',
        status: 'ready',
        schema: {
          columns: (serverDataset.schema?.columns || []).map((column: any) => ({
            name: column.name,
            type: column.type === 'number' || column.type === 'date' ? column.type : 'string',
            isNullable: Boolean(column.nullable),
            nullCount: Number(column.nullCount || 0),
            sampleValues: column.sampleValues || [],
          })),
        },
        rowCount: Number(serverDataset.rowCount || 0),
        lastUpdated: serverDataset.updatedAt || now,
        dataQualityScore: Number(serverDataset.dataQualityScore || 0),
        contentHash: serverDataset.contentHash || serverDataset.source?.hash || '',
        createdAt: serverDataset.createdAt || now,
        updatedAt: serverDataset.updatedAt || now,
      };

      dataSourceRepo.save(source);
      datasetRepo.save(dataset);
      localStorage.setItem('cb_backend_connected', 'true');
      localStorage.setItem('cb_backend_last_dataset', JSON.stringify(dataset));
      window.location.reload();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Data</h1>
        <p className="text-slate-400 mt-2 text-sm">Your business data</p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button onClick={onAddDataSource} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
          <Plus className="w-4 h-4" /><span>Add data source</span>
        </button>
        <input type="file" accept=".csv,.xlsx,.xls" className="hidden" id="file-upload" disabled={uploading}
          onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadToBackend(file); e.target.value = ''; }} />
        <label htmlFor="file-upload" className={`inline-flex items-center gap-2 px-4 py-2.5 bg-[#0e131f] hover:bg-[#121826] border border-slate-700 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" /><span>{uploading ? 'Uploading…' : 'Upload file'}</span>
        </label>
      </div>

      {uploadError && <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">{uploadError}</div>}

      {hasData && (
        <div className="mb-8 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5"><Database className="w-4 h-4 text-emerald-500" /><span className="text-slate-400">Sources</span><span className="text-white font-semibold">{dataSources.length}</span></div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-slate-400">Active</span><span className="text-white font-semibold">{activeSourcesCount}</span></div>
            <div className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-500" /><span className="text-slate-400">Records</span><span className="text-white font-semibold">{totalRecords.toLocaleString()}</span></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {dataSources.length > 0 && <>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Connected Sources ({dataSources.length})</h2>
          <div className="grid gap-3">{dataSources.map(source => (
            <div key={source.id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700/30 text-slate-300">
                  {source.type === 'CSV' || source.type === 'Excel' ? <FileText className="w-5 h-5" /> : source.type === 'Database' ? <Database className="w-5 h-5" /> : <FileJson className="w-5 h-5" />}
                </div>
                <div><div className="flex items-center gap-2"><h3 className="text-white font-semibold">{source.name}</h3><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">{source.status}</span></div><div className="flex items-center gap-3 mt-1 text-xs text-slate-400"><span>{source.type}</span>{source.recordsCount > 0 && <span>{source.recordsCount.toLocaleString()} rows</span>}{source.fieldsCount > 0 && <span>{source.fieldsCount} columns</span>}</div></div>
              </div>
              <button onClick={() => onToggleDataSource(source.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${source.selected ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{source.selected ? 'Active' : 'Inactive'}</button>
            </div>
          ))}</div>
        </>}

        {datasets.length > 0 && <>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Datasets ({datasets.length})</h2>
          <div className="grid gap-3">{datasets.map(dataset => (
            <div key={dataset.id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><FileText className="w-5 h-5" /></div><div><h3 className="text-white font-semibold">{dataset.name}</h3><div className="flex items-center gap-3 mt-1 text-xs text-slate-400"><span className="capitalize">{dataset.status}</span><span>{dataset.rowCount.toLocaleString()} rows</span><span>{dataset.schema.columns.length} columns</span></div></div></div><div className="px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 text-xs font-semibold">Ready</div>
            </div>
          ))}</div>
        </>}
      </div>

      {!hasData && <div className="mt-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center"><Database className="w-10 h-10 text-slate-600" /></div>
        <h3 className="text-lg font-semibold text-white mb-2">No business data connected yet</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">Connect your first source to start investigating your business. Upload CSV or Excel files, or connect to databases and APIs.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center"><FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" /><h4 className="text-sm font-semibold text-white mb-1">CSV</h4><p className="text-xs text-slate-500">Upload sales, customer, or transaction data</p></div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center"><FileText className="w-8 h-8 text-green-400 mx-auto mb-2" /><h4 className="text-sm font-semibold text-white mb-1">Excel</h4><p className="text-xs text-slate-500">Upload reports, dashboards, or analysis files</p></div>
          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center"><Database className="w-8 h-8 text-purple-400 mx-auto mb-2" /><h4 className="text-sm font-semibold text-white mb-1">Database</h4><p className="text-xs text-slate-500">Connect PostgreSQL, MySQL, or SQLite</p></div>
        </div>
      </div>}

      <div className="mt-12 p-6 rounded-xl bg-slate-900/30 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">What you can do with your data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-emerald-400" /></div><div><h4 className="text-sm font-semibold text-white mb-1">Analyze your data</h4><p className="text-xs text-slate-400">Upload CSV and Excel files to gain insights from your business records</p></div></div>
          <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><AlertCircle className="w-4 h-4 text-emerald-400" /></div><div><h4 className="text-sm font-semibold text-white mb-1">Investigate drivers</h4><p className="text-xs text-slate-400">Identify root causes behind revenue changes and performance issues</p></div></div>
          <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-emerald-400" /></div><div><h4 className="text-sm font-semibold text-white mb-1">Make decisions</h4><p className="text-xs text-slate-400">Get recommendations backed by evidence from your actual data</p></div></div>
        </div>
      </div>
    </div>
  );
};
