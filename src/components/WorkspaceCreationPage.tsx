// ============================================================================
// WORKSPACE CREATION PAGE
// First-time user onboarding flow
// ============================================================================

import React, { useState } from 'react';
import { Building2, ChevronRight, CheckCircle, Globe, TrendingUp } from 'lucide-react';
import type { Workspace } from '../models/workspace';

interface WorkspaceCreationProps {
  onComplete: (workspace: Workspace) => void;
  onCancel?: () => void;
}

export const WorkspaceCreationPage: React.FC<WorkspaceCreationProps> = ({
  onComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    country: '',
    region: '',
    currency: 'USD',
    description: '',
    businessObjective: '',
    importantKpis: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const kpis = formData.importantKpis
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const now = new Date().toISOString();
    let workspaceId = `ws-${Date.now().toString().slice(-8)}`;

    try {
      const { api } = await import('../services/api');
      const response = await api.createWorkspace({
        name: formData.companyName.trim(),
        industry: formData.industry.trim() || 'General',
        country: formData.country.trim() || 'Global',
        region: formData.region.trim() || 'Global',
        currency: formData.currency.trim(),
        description: formData.description.trim() || undefined,
        objective: formData.businessObjective.trim() || undefined,
        kpis: kpis.length > 0 ? kpis : undefined,
      });
      if (response.workspace?.id) {
        workspaceId = response.workspace.id;
      }
    } catch (apiErr) {
      console.warn('API workspace creation failed, falling back to local workspace:', apiErr);
    }

    // Create workspace object
    const workspace: Workspace = {
      id: workspaceId,
      name: formData.companyName.trim(),
      slug: formData.companyName.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim(),
      industry: formData.industry.trim() || 'General',
      country: formData.country.trim() || 'Global',
      region: formData.region.trim() || 'Global',
      currency: formData.currency.trim(),
      businessObjective: formData.businessObjective.trim() || 'Grow the business',
      currentStrategy: '',
      knownConstraints: '',
      importantKpis: kpis,
      managementPriorities: '',
      createdAt: now,
      updatedAt: now,
      isDemo: false,
    };

    const { workspaceRepo } = await import('../state/workspaceRepository');
    workspaceRepo.save(workspace);

    onComplete(workspace);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="cb-display text-[28px] sm:text-[36px] text-white">
            Create your workspace
          </h1>
          <p className="text-[15px] text-slate-400 mt-3 max-w-lg mx-auto">
            Set up your company profile. We'll use this context to understand your business questions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Company / Organization
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              placeholder="e.g., Acme Retail Pvt. Ltd."
              className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={e => handleChange('industry', e.target.value)}
              placeholder="e.g., Retail, E-commerce, Finance, Healthcare..."
              className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Country/Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
                placeholder="e.g., India"
                className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={e => handleChange('region', e.target.value)}
                placeholder="e.g., South Asia"
                className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={e => handleChange('currency', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
              disabled={isSubmitting}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>

          {/* Business Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Business description
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Briefly describe your business..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Business Objective */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Primary business objective
            </label>
            <input
              type="text"
              value={formData.businessObjective}
              onChange={e => handleChange('businessObjective', e.target.value)}
              placeholder="e.g., Increase profitable revenue while protecting margins"
              className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Important KPIs */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Important KPIs
            </label>
            <input
              type="text"
              value={formData.importantKpis}
              onChange={e => handleChange('importantKpis', e.target.value)}
              placeholder="e.g., Revenue, Gross Margin, Customer Retention, AOV"
              className="w-full px-4 py-3 rounded-lg bg-[#0b0e15] border border-slate-700/80 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/80 transition-all"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 mt-2">
              Separate multiple KPIs with commas
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.companyName.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating workspace...</span>
              </>
            ) : (
              <>
                <span>Create workspace</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Optional Cancel */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </form>

        {/* What happens next */}
        <div className="mt-12 pt-8 border-t cb-hairline">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            What happens next?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Workspace created</p>
                <p className="text-xs text-slate-500 mt-1">Your company profile is saved</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Upload data</p>
                <p className="text-xs text-slate-500 mt-1">Add CSV or Excel files</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ask questions</p>
                <p className="text-xs text-slate-500 mt-1">Investigate your actual data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
