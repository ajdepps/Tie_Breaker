import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, ThumbsUp, ThumbsDown, Sliders, Sparkles, Filter } from 'lucide-react';
import { OptionProConAnalysis, ProConItem } from '../types';
import { calculateOptionProsConsScore } from '../utils/decisionCalculations';

interface ProsConsViewProps {
  analyses: OptionProConAnalysis[];
  onUpdateAnalyses: (updated: OptionProConAnalysis[]) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({ analyses, onUpdateAnalyses }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(analyses[0]?.optionId || '');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Custom pro/con input state
  const [isAddingItem, setIsAddingItem] = useState<{ optionId: string; type: 'pro' | 'con' } | null>(null);
  const [newText, setNewText] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newWeight, setNewWeight] = useState(3);
  const [newMitigation, setNewMitigation] = useState('');

  const currentOption = analyses.find(a => a.optionId === selectedOptionId) || analyses[0];

  // Collect all unique categories
  const allCategories = Array.from(
    new Set(
      analyses.flatMap(a => [
        ...a.pros.map(p => p.category),
        ...a.cons.map(c => c.category)
      ])
    )
  ).filter(Boolean);

  const handleUpdateWeight = (optionId: string, itemId: string, isPro: boolean, newWeight: number) => {
    const updated = analyses.map(opt => {
      if (opt.optionId !== optionId) return opt;
      if (isPro) {
        return {
          ...opt,
          pros: opt.pros.map(p => (p.id === itemId ? { ...p, weight: newWeight } : p))
        };
      } else {
        return {
          ...opt,
          cons: opt.cons.map(c => (c.id === itemId ? { ...c, weight: newWeight } : c))
        };
      }
    });
    onUpdateAnalyses(updated);
  };

  const handleDeleteItem = (optionId: string, itemId: string, isPro: boolean) => {
    const updated = analyses.map(opt => {
      if (opt.optionId !== optionId) return opt;
      if (isPro) {
        return { ...opt, pros: opt.pros.filter(p => p.id !== itemId) };
      } else {
        return { ...opt, cons: opt.cons.filter(c => c.id !== itemId) };
      }
    });
    onUpdateAnalyses(updated);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingItem || !newText.trim()) return;

    const newItem: ProConItem = {
      id: `custom-${Date.now()}`,
      text: newText.trim(),
      detail: newDetail.trim() || 'Custom factor added by you.',
      category: newCategory.trim() || 'Custom',
      weight: newWeight,
      mitigation: newMitigation.trim()
    };

    const updated = analyses.map(opt => {
      if (opt.optionId !== isAddingItem.optionId) return opt;
      if (isAddingItem.type === 'pro') {
        return { ...opt, pros: [...opt.pros, newItem] };
      } else {
        return { ...opt, cons: [...opt.cons, newItem] };
      }
    });

    onUpdateAnalyses(updated);
    setIsAddingItem(null);
    setNewText('');
    setNewDetail('');
    setNewMitigation('');
    setNewWeight(3);
  };

  if (!currentOption) return null;

  const currentScores = calculateOptionProsConsScore(currentOption);

  const filteredPros = filterCategory === 'all'
    ? currentOption.pros
    : currentOption.pros.filter(p => p.category === filterCategory);

  const filteredCons = filterCategory === 'all'
    ? currentOption.cons
    : currentOption.cons.filter(c => c.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Option Navigation & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {analyses.map(opt => {
          const score = calculateOptionProsConsScore(opt);
          const isSelected = opt.optionId === currentOption.optionId;
          return (
            <button
              key={opt.optionId}
              onClick={() => setSelectedOptionId(opt.optionId)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-[#1C1C1F] border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                  : 'bg-[#161618] border-slate-800 hover:border-slate-700 hover:bg-[#1C1C1F]/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white line-clamp-1">
                  {opt.optionName}
                </h3>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    score.netScore > 0
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                      : score.netScore < 0
                      ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Net: {score.netScore > 0 ? `+${score.netScore}` : score.netScore}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {opt.summary}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold">{opt.pros.length} Pros (+{score.prosTotal})</span>
                <span>•</span>
                <span className="text-rose-400 font-semibold">{opt.cons.length} Cons (-{score.consTotal})</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161618] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Category Filter:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#1C1C1F] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories ({analyses.flatMap(a => [...a.pros, ...a.cons]).length})</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Weight Simulation</span>
        </div>
      </div>

      {/* Pros & Cons Columns for Active Option */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROS COLUMN */}
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Pros & Upsides
                </h3>
                <div className="text-xs font-mono text-emerald-400">
                  {filteredPros.length} items • Total: +{currentScores.prosTotal}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddingItem({ optionId: currentOption.optionId, type: 'pro' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pro</span>
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {filteredPros.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No pros matching this filter.
              </div>
            ) : (
              filteredPros.map(pro => (
                <div
                  key={pro.id}
                  className="p-4 rounded-xl bg-[#1C1C1F] border border-slate-800 hover:border-emerald-500/30 transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold text-sm">+</span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 uppercase">
                          {pro.category}
                        </span>
                        <h5 className="font-bold text-sm text-white">
                          {pro.text}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal pl-4">
                        {pro.detail}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(currentOption.optionId, pro.id, true)}
                      className="text-slate-600 hover:text-rose-400 transition-colors opacity-60 group-hover:opacity-100 p-1 shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Leverage / Maximizer note */}
                  {pro.mitigation && (
                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-[11px] text-emerald-300 ml-4">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>How to leverage:</strong> {pro.mitigation}</span>
                    </div>
                  )}

                  {/* Weight Slider */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs pl-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Impact Weight:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleUpdateWeight(currentOption.optionId, pro.id, true, val)}
                          className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all ${
                            pro.weight === val
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CONS COLUMN */}
        <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Cons & Risks
                </h3>
                <div className="text-xs font-mono text-rose-400">
                  {filteredCons.length} items • Total: -{currentScores.consTotal}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddingItem({ optionId: currentOption.optionId, type: 'con' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Con</span>
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {filteredCons.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No cons matching this filter.
              </div>
            ) : (
              filteredCons.map(con => (
                <div
                  key={con.id}
                  className="p-4 rounded-xl bg-[#1C1C1F] border border-slate-800 hover:border-rose-500/30 transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500 font-bold text-sm">-</span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 uppercase">
                          {con.category}
                        </span>
                        <h5 className="font-bold text-sm text-white">
                          {con.text}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal pl-4">
                        {con.detail}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(currentOption.optionId, con.id, false)}
                      className="text-slate-600 hover:text-rose-400 transition-colors opacity-60 group-hover:opacity-100 p-1 shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mitigation Note */}
                  {con.mitigation && (
                    <div className="flex items-start gap-1.5 p-2 rounded-lg bg-rose-950/20 border border-rose-900/50 text-[11px] text-rose-300 ml-4">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>Mitigation:</strong> {con.mitigation}</span>
                    </div>
                  )}

                  {/* Weight Slider */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs pl-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Severity Weight:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleUpdateWeight(currentOption.optionId, con.id, false, val)}
                          className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all ${
                            con.weight === val
                              ? 'bg-rose-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          -{val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Item Modal / Sheet */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveNewItem}
            className="bg-[#161618] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-base text-white">
                Add Custom {isAddingItem.type === 'pro' ? 'Pro (Upside)' : 'Con (Risk)'}
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingItem(null)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Headline <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Higher equity upside"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Description & Impact
              </label>
              <textarea
                rows={2}
                placeholder="Why does this matter to you specifically?"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Financial, Career"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Weight (1 to 5)
                </label>
                <select
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={1}>1 - Minor</option>
                  <option value={2}>2 - Moderate</option>
                  <option value={3}>3 - Important</option>
                  <option value={4}>4 - High Impact</option>
                  <option value={5}>5 - Decisive Game Changer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                {isAddingItem.type === 'pro' ? 'How to maximize/leverage (Optional)' : 'Mitigation strategy (Optional)'}
              </label>
              <input
                type="text"
                placeholder={isAddingItem.type === 'pro' ? 'e.g. Negotiate 4-year vesting with 1-year cliff' : 'e.g. Set strict 6pm work cutoff'}
                value={newMitigation}
                onChange={(e) => setNewMitigation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsAddingItem(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#1C1C1F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 font-mono"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
