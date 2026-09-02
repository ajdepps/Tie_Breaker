import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldAlert, Sparkles, CheckSquare, Square } from 'lucide-react';
import { TiebreakerVerdict } from '../types';

interface VerdictBannerProps {
  verdict: TiebreakerVerdict;
  onSelectOptionFocus?: (optionId: string) => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ verdict }) => {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<'factors' | 'flip' | 'timeHorizon' | 'actionPlan'>('factors');

  const toggleAction = (key: string) => {
    setCompletedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900/20 via-[#161618] to-[#161618] border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header: Winner Badge & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-400">
                The Tiebreaker AI Verdict
              </h4>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 tracking-tight">
              {verdict.winnerOptionName}
            </h2>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="flex items-center gap-3 bg-[#1C1C1F] border border-slate-800 px-4 py-2.5 rounded-xl self-start sm:self-auto shadow-inner">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Recommendation Score
            </div>
            <div className="text-xl font-mono font-bold text-indigo-300">
              {verdict.confidenceScore}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-slate-800 relative flex items-center justify-center bg-[#161618]">
            <div
              className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin-slow"
              style={{ transform: `rotate(${verdict.confidenceScore * 3.6}deg)` }}
            />
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mt-5 relative z-10">
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-[#1C1C1F]/90 p-4 rounded-xl border border-slate-800/80 font-normal">
          {verdict.executiveSummary}
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 mt-6 pb-2 overflow-x-auto relative z-10">
        {[
          { id: 'factors', label: 'Deciding Factors' },
          { id: 'flip', label: 'What Would Flip This?' },
          { id: 'timeHorizon', label: '10/10/10 & Regret' },
          { id: 'actionPlan', label: 'Action Checklist' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tab Contents */}
      <div className="mt-5 relative z-10">
        {/* Deciding Factors */}
        {activeSubTab === 'factors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {verdict.keyDecidingFactors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-200 leading-snug font-medium">
                  {factor}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* What Would Flip It (Inversion analysis) */}
        {activeSubTab === 'flip' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Sensitivity Triggers (When to reconsider this choice):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {verdict.whatWouldFlipIt.map((flipCondition, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#1C1C1F] border border-amber-900/50 text-xs sm:text-sm text-slate-300 leading-snug"
                >
                  <span className="font-mono font-semibold text-amber-300 mr-1.5">Condition #{idx + 1}:</span>
                  {flipCondition}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10/10/10 Perspective & Regret Minimization */}
        {activeSubTab === 'timeHorizon' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>In 10 Minutes</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {verdict.rule101010.tenMinutes}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>In 10 Months</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {verdict.rule101010.tenMonths}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>In 10 Years</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {verdict.rule101010.tenYears}
                </p>
              </div>
            </div>

            {/* Regret Minimization Card */}
            {verdict.regretMinimizationTake && (
              <div className="p-4 rounded-xl bg-[#1C1C1F] border border-slate-800">
                <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Jeff Bezos Regret Minimization Lens</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{verdict.regretMinimizationTake}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Plan */}
        {activeSubTab === 'actionPlan' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Immediate Steps (Next 24-48 Hours)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {verdict.actionPlan.immediate.map((act, i) => {
                  const key = `imm-${i}`;
                  const isDone = !!completedActions[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleAction(key)}
                      className={`text-left flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-400 line-through'
                          : 'bg-[#1C1C1F] border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs font-medium leading-snug">{act}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Short-Term Follow-Through (Next 30 Days)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {verdict.actionPlan.shortTerm.map((act, i) => {
                  const key = `short-${i}`;
                  const isDone = !!completedActions[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleAction(key)}
                      className={`text-left flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-slate-400 line-through'
                          : 'bg-[#1C1C1F] border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs font-medium leading-snug">{act}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
