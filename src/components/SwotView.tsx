import React, { useState } from 'react';
import { ShieldAlert, Zap, AlertTriangle, TrendingUp, Compass, Sparkles } from 'lucide-react';
import { OptionSwot } from '../types';

interface SwotViewProps {
  swotAnalysis: OptionSwot[];
}

export const SwotView: React.FC<SwotViewProps> = ({ swotAnalysis }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(swotAnalysis[0]?.optionId || '');

  const activeOption = swotAnalysis.find(s => s.optionId === selectedOptionId) || swotAnalysis[0];

  if (!activeOption) return null;

  const { swot, keyTakeaway, optionName } = activeOption;

  return (
    <div className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {swotAnalysis.map(opt => (
          <button
            key={opt.optionId}
            onClick={() => setSelectedOptionId(opt.optionId)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              opt.optionId === activeOption.optionId
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-[#161618] text-slate-400 hover:text-white border border-slate-800 hover:bg-[#1C1C1F]'
            }`}
          >
            {opt.optionName} SWOT
          </button>
        ))}
      </div>

      {/* Strategic Takeaway Banner */}
      <div className="bg-[#161618] border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <Compass className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
            Strategic Synthesis for "{optionName}"
          </div>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 leading-relaxed">
            {keyTakeaway}
          </p>
        </div>
      </div>

      {/* 4 Quadrants Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* STRENGTHS */}
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 mb-3.5 border-b border-slate-800 pb-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-emerald-400">
                Strengths
              </h4>
              <span className="text-[11px] text-slate-400">Internal Positive Capabilities</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {swot.strengths.map((st, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800 space-y-1 hover:border-emerald-500/30 transition-colors">
                <div className="font-bold text-xs text-white">
                  {st.point}
                </div>
                <div className="text-[11px] text-emerald-400/90 font-mono">
                  Impact: {st.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WEAKNESSES */}
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 mb-3.5 border-b border-slate-800 pb-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-rose-400">
                Weaknesses
              </h4>
              <span className="text-[11px] text-slate-400">Internal Limitations & Bottlenecks</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {swot.weaknesses.map((w, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800 space-y-1 hover:border-rose-500/30 transition-colors">
                <div className="font-bold text-xs text-white">
                  {w.point}
                </div>
                <div className="text-[11px] text-rose-400/90 font-mono">
                  Impact: {w.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPPORTUNITIES */}
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 mb-3.5 border-b border-slate-800 pb-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-indigo-400">
                Opportunities
              </h4>
              <span className="text-[11px] text-slate-400">External Upsides & Tailwinds</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {swot.opportunities.map((o, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800 space-y-1 hover:border-indigo-500/30 transition-colors">
                <div className="font-bold text-xs text-white">
                  {o.point}
                </div>
                <div className="text-[11px] text-indigo-300 font-mono">
                  Impact: {o.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THREATS */}
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 mb-3.5 border-b border-slate-800 pb-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-amber-400">
                Threats
              </h4>
              <span className="text-[11px] text-slate-400">External Headwinds & Tail Risks</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {swot.threats.map((t, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800 space-y-1 hover:border-amber-500/30 transition-colors">
                <div className="font-bold text-xs text-white">
                  {t.point}
                </div>
                <div className="text-[11px] text-amber-300 font-mono">
                  Impact: {t.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
