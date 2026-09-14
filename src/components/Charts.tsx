import React, { useState } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingDown, 
  Layers, 
  Maximize2, 
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { MOCK_CHART_SERIES, MOCK_PRODUCTS, MOCK_REGIONS } from '../mockData';

export const Charts: React.FC<{ hasEvidence?: boolean }> = ({ hasEvidence = true }) => {
  const [activeTab, setActiveTab] = useState<'trend' | 'product' | 'region' | 'retention'>('trend');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  if (!hasEvidence) {
    return (
      <section id="visual-evidence-section" aria-label="Visual Evidence" className="w-full bg-[#0e121b] border border-rose-900/60 rounded-2xl p-6 shadow-xl shadow-black/40">
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">DATA INSUFFICIENT</span>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1">VISUAL EVIDENCE UNAVAILABLE</h2>
        <p className="text-xs text-slate-400 mt-2">No validated ledger output is available. Existing demo charts are withheld to prevent mock-data leakage.</p>
      </section>
    );
  }

  return (
    <section 
      id="visual-evidence-section"
      aria-label="Visual Evidence"
      className="w-full bg-[#0e121b] border border-slate-800/90 rounded-2xl p-6 shadow-xl shadow-black/40"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            What the data shows
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            The numbers behind the change
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Revenue trends and how the change splits across products and regions
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-[#7ea889]/15 text-[#b8d4bd] border border-[#7ea889]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Revenue Trend</span>
          </button>

          <button
            onClick={() => setActiveTab('product')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'product'
                ? 'bg-[#7ea889]/15 text-[#b8d4bd] border border-[#7ea889]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Product Mix</span>
          </button>

          <button
            onClick={() => setActiveTab('region')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'region'
                ? 'bg-[#7ea889]/15 text-[#b8d4bd] border border-[#7ea889]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Regional Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('retention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'retention'
                ? 'bg-[#7ea889]/15 text-[#b8d4bd] border border-[#7ea889]/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Retention Dynamics</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="min-h-[320px]">
        {/* TAB 1: REVENUE TREND OVER TIME */}
        {activeTab === 'trend' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#b47d78] rounded-full"></span>
                  <span className="text-slate-300 font-medium">Actual Monthly Revenue ($M)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-slate-500 border-dashed rounded-full"></span>
                  <span className="text-slate-500 font-medium">Budget Target Baseline</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#c59691] font-mono font-semibold bg-[#3a2928] px-2 py-0.5 rounded border border-[#754b48]/50">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Total contraction: -$3.05M (-14.2%)</span>
              </div>
            </div>

            {/* Custom SVG Line Chart with Grid and Tooltips */}
            <div className="relative w-full h-64 bg-slate-950/70 rounded-xl border border-slate-800/80 p-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                {/* Horizontal gridlines */}
                {[0, 50, 100, 150].map((y, i) => (
                  <g key={i}>
                    <line x1="40" y1={y + 10} x2="580" y2={y + 10} stroke="#1f293d" strokeDasharray="3 3" />
                    <text x="32" y={y + 14} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                      ${(4.0 - i * 0.4).toFixed(1)}M
                    </text>
                  </g>
                ))}

                {/* Target Baseline Line */}
                <polyline
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points={MOCK_CHART_SERIES.map((pt, i) => {
                    const x = 60 + i * 100;
                    const y = 200 - ((pt.baseline - 2.4) / 1.6) * 180;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Actual Revenue Line (contracting downwards) */}
                <polyline
                  fill="none"
                  stroke="#b47d78"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={MOCK_CHART_SERIES.map((pt, i) => {
                    const x = 60 + i * 100;
                    const y = 200 - ((pt.revenue - 2.4) / 1.6) * 180;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Data Points */}
                {MOCK_CHART_SERIES.map((pt, i) => {
                  const x = 60 + i * 100;
                  const y = 200 - ((pt.revenue - 2.4) / 1.6) * 180;
                  const isHovered = hoveredPoint === i;

                  return (
                    <g 
                      key={i} 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 4.5}
                        fill="#090b10"
                        stroke="#b47d78"
                        strokeWidth="3"
                        className="transition-all"
                      />
                      {/* Label below axis */}
                      <text
                        x={x}
                        y="195"
                        fill={isHovered ? '#fb7185' : '#94a3b8'}
                        fontSize="11"
                        textAnchor="middle"
                        fontWeight={isHovered ? '700' : '500'}
                      >
                        {pt.period}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic hover callout */}
              {hoveredPoint !== null && (
                <div 
                  className="absolute z-10 bg-slate-900 border border-rose-500/40 p-2.5 rounded-lg shadow-xl text-xs pointer-events-none"
                  style={{
                    left: `${(hoveredPoint / 5) * 75 + 10}%`,
                    top: '20px',
                  }}
                >
                  <p className="font-bold text-white mb-1">
                    {MOCK_CHART_SERIES[hoveredPoint].period} Performance
                  </p>
                  <div className="space-y-0.5 font-mono text-[11px]">
                    <p className="text-[#c59691]">
                      Actual: ${MOCK_CHART_SERIES[hoveredPoint].revenue.toFixed(2)}M
                    </p>
                    <p className="text-slate-400">
                      Baseline: ${MOCK_CHART_SERIES[hoveredPoint].baseline.toFixed(2)}M
                    </p>
                    <p className="text-[#b8b39a]">
                      Product A: ${MOCK_CHART_SERIES[hoveredPoint].productA.toFixed(2)}M
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Key observation: Contraction accelerates sharply from Month 3 onwards, coinciding with competitor regional discounting.
              </span>
            </p>
          </div>
        )}

        {/* TAB 2: REVENUE BY PRODUCT */}
        {activeTab === 'product' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="text-slate-300 font-medium">Product Portfolio Contribution Breakdown</span>
              <span className="text-[#b8d4bd] font-medium">Highlight: Product A accounts for 68.2% of decline</span>
            </div>

            <div className="space-y-3">
              {MOCK_PRODUCTS.map((prod) => {
                const isDrag = prod.growth < -10;
                return (
                  <div
                    key={prod.name}
                    onMouseEnter={() => setHoveredProduct(prod.name)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDrag
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{prod.name}</span>
                        {prod.flag && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            isDrag 
                              ? 'bg-rose-900/40 text-rose-300 border border-rose-700/50'
                              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                          }`}>
                            {prod.flag}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-400">${prod.revenue}M ({prod.share}%)</span>
                        <span className={`font-bold ${prod.growth < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {prod.growth > 0 ? `+${prod.growth}%` : `${prod.growth}%`}
                        </span>
                      </div>
                    </div>

                    {/* Comparative visual bar */}
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full ${
                          isDrag
                            ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${prod.share * 1.8}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE BY REGION */}
        {activeTab === 'region' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="text-slate-300 font-medium">Territory Sales Variance Decomposition</span>
              <span className="text-amber-400 font-medium">Region South exhibits -18.4% drop</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_REGIONS.map((reg) => {
                const isSevereVulnerable = reg.growth < -15;
                return (
                  <div
                    key={reg.name}
                    className={`p-4 rounded-xl border transition-all ${
                      isSevereVulnerable
                        ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-slate-100">{reg.name}</h4>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        reg.growth < 0 
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                      }`}>
                        {reg.growth > 0 ? `+${reg.growth}%` : `${reg.growth}%`}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>Volume: ${reg.revenue}M</span>
                      <span>Share: {reg.share}%</span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isSevereVulnerable ? 'bg-amber-400' : 'bg-slate-600'
                        }`}
                        style={{ width: `${reg.share * 2.2}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                      {isSevereVulnerable 
                        ? 'Product A customer churn accounts for $0.62M of the $0.93M regional contraction.'
                        : 'Portfolio metrics tracking within expected quarterly operational variance.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: RETENTION DYNAMICS */}
        {activeTab === 'retention' && (
          <div>
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="text-slate-300 font-medium">90-Day Cohort Repurchase Rate Trend</span>
              <span className="text-rose-400 font-medium">Repeat Rate: 49.0% → 42.8% (-12.7%)</span>
            </div>

            <div className="relative w-full h-56 bg-slate-950/70 rounded-xl border border-slate-800 p-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
                {/* Horizontal gridlines */}
                {[0, 40, 80, 120].map((y, i) => (
                  <g key={i}>
                    <line x1="40" y1={y + 10} x2="580" y2={y + 10} stroke="#1f293d" strokeDasharray="3 3" />
                    <text x="32" y={y + 14} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                      {(55 - i * 5)}%
                    </text>
                  </g>
                ))}

                {/* Cohort Curve */}
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  points={MOCK_CHART_SERIES.map((pt, i) => {
                    const x = 60 + i * 100;
                    const y = 160 - ((pt.repeatCustomers - 40) / 15) * 140;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {MOCK_CHART_SERIES.map((pt, i) => {
                  const x = 60 + i * 100;
                  const y = 160 - ((pt.repeatCustomers - 40) / 15) * 140;

                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#090b10" stroke="#fbbf24" strokeWidth="2.5" />
                      <text x={x} y="155" fill="#94a3b8" fontSize="11" textAnchor="middle">
                        {pt.period}
                      </text>
                      <text x={x} y={y - 10} fill="#fef08a" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="600">
                        {pt.repeatCustomers}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Diagnostic finding: Top-of-funnel inbound volume remained stable, confirming that the decline is driven by account switching after trial.
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
