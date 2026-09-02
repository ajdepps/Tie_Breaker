import React, { useState } from 'react';
import { Trophy, Plus, Sliders, Info, Check, Sparkles } from 'lucide-react';
import { ComparisonCriterion, DecisionOption } from '../types';
import { calculateComparisonMatrixScores } from '../utils/decisionCalculations';

interface ComparisonTableViewProps {
  options: DecisionOption[];
  criteria: ComparisonCriterion[];
  overallSummary: string;
  onUpdateCriteria: (updated: ComparisonCriterion[]) => void;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  options,
  criteria,
  overallSummary,
  onUpdateCriteria
}) => {
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const optionIds = options.map(o => o.id);
  const calculatedScores = calculateComparisonMatrixScores(criteria, optionIds);

  // Find leader
  let leaderOptId = options[0]?.id;
  let highestScore = -1;
  options.forEach(opt => {
    const score = calculatedScores[opt.id]?.totalWeightedScore || 0;
    if (score > highestScore) {
      highestScore = score;
      leaderOptId = opt.id;
    }
  });

  const handleUpdateWeight = (critId: string, weight: number) => {
    const updated = criteria.map(c => (c.id === critId ? { ...c, userWeight: weight } : c));
    onUpdateCriteria(updated);
  };

  const handleUpdateScore = (critId: string, optionId: string, newScore: number) => {
    const updated = criteria.map(c => {
      if (c.id !== critId) return c;
      const currentOptScore = c.optionScores[optionId] || { score: 5, justification: '' };
      return {
        ...c,
        optionScores: {
          ...c.optionScores,
          [optionId]: {
            ...currentOptScore,
            score: Math.min(10, Math.max(1, newScore))
          }
        }
      };
    });
    onUpdateCriteria(updated);
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const scoresMap: Record<string, { score: number; justification: string }> = {};
    options.forEach(opt => {
      scoresMap[opt.id] = { score: 7, justification: 'Custom evaluation benchmark' };
    });

    const newCrit: ComparisonCriterion = {
      id: `crit-custom-${Date.now()}`,
      name: newCritName.trim(),
      description: newCritDesc.trim() || 'User-defined evaluation factor',
      userWeight: 2,
      optionScores: scoresMap
    };

    onUpdateCriteria([...criteria, newCrit]);
    setIsAddingCriterion(false);
    setNewCritName('');
    setNewCritDesc('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-950/30 border-emerald-500/40';
    if (score >= 5) return 'text-indigo-300 bg-indigo-950/30 border-indigo-500/40';
    return 'text-rose-400 bg-rose-950/30 border-rose-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Summary Banner */}
      <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              <span>Multi-Criteria Leaderboard</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Weights reflect your priorities. Adjust any slider below to stress-test rankings.
            </p>
          </div>

          <button
            onClick={() => setIsAddingCriterion(true)}
            id="add-criteria-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold transition-colors self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Criteria</span>
          </button>
        </div>

        {/* Dynamic Progress Bars for Each Option */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {options.map(opt => {
            const stats = calculatedScores[opt.id] || { totalWeightedScore: 0, normalizedPercent: 0 };
            const isLeader = opt.id === leaderOptId;
            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isLeader
                    ? 'bg-indigo-950/20 border-indigo-500/50 ring-1 ring-indigo-500/40'
                    : 'bg-[#1C1C1F] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isLeader && <Trophy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="font-bold text-sm text-white line-clamp-1">
                      {opt.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {stats.normalizedPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#161618] rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLeader ? 'bg-gradient-to-r from-indigo-500 to-indigo-300' : 'bg-slate-700'
                    }`}
                    style={{ width: `${stats.normalizedPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                  <span>Weighted Total: {stats.totalWeightedScore} pts</span>
                  {isLeader && <span className="text-indigo-400 font-bold uppercase tracking-wider">Leading</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-[#161618] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#1C1C1F]">
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 min-w-[220px]">
                  Evaluation Dimension
                </th>
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 w-28 text-center">
                  Importance
                </th>
                {options.map(opt => (
                  <th
                    key={opt.id}
                    className="p-4 text-xs font-bold uppercase tracking-wider text-white min-w-[180px]"
                  >
                    <div className="flex items-center gap-1.5">
                      {opt.id === leaderOptId && <Trophy className="w-3.5 h-3.5 text-indigo-400" />}
                      <span className="line-clamp-1">{opt.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {criteria.map(crit => (
                <tr key={crit.id} className="hover:bg-[#1C1C1F]/50 transition-colors">
                  {/* Criterion Title & Desc */}
                  <td className="p-4 align-top">
                    <div className="font-bold text-white text-sm">
                      {crit.name}
                    </div>
                    {crit.description && (
                      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                        {crit.description}
                      </p>
                    )}
                  </td>

                  {/* Weight Toggle Buttons */}
                  <td className="p-4 align-middle text-center">
                    <div className="inline-flex items-center gap-1 p-1 bg-[#1C1C1F] rounded-lg border border-slate-800">
                      {[1, 2, 3].map(w => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleUpdateWeight(crit.id, w)}
                          className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all ${
                            crit.userWeight === w
                              ? 'bg-indigo-600 text-white font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          title={`${w}x Multiplier`}
                        >
                          {w}x
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Option Scores & Justifications */}
                  {options.map(opt => {
                    const scoreObj = crit.optionScores[opt.id] || { score: 5, justification: '' };
                    return (
                      <td key={opt.id} className="p-4 align-top space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${getScoreColor(
                              scoreObj.score
                            )}`}
                          >
                            {scoreObj.score} / 10
                          </div>

                          {/* Quick score bump buttons */}
                          <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleUpdateScore(crit.id, opt.id, scoreObj.score - 1)}
                              className="w-5 h-5 rounded bg-[#1C1C1F] hover:bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] border border-slate-800 font-mono"
                              title="Decrease score"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleUpdateScore(crit.id, opt.id, scoreObj.score + 1)}
                              className="w-5 h-5 rounded bg-[#1C1C1F] hover:bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] border border-slate-800 font-mono"
                              title="Increase score"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Justification note */}
                        {scoreObj.justification && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {scoreObj.justification}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Criterion Modal */}
      {isAddingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddCriterion}
            className="bg-[#161618] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-base text-white">
                Add Custom Evaluation Criteria
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingCriterion(false)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Criteria Name <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Commute Time & Proximity"
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="How should options be judged on this?"
                value={newCritDesc}
                onChange={(e) => setNewCritDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddingCriterion(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#1C1C1F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Add Criteria
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
