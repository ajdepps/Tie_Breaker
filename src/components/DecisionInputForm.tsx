import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, HelpCircle, Shield, Target, Clock, ArrowRight, Zap, CheckCircle2, RotateCcw } from 'lucide-react';
import { DecisionInput, DecisionOption, RiskTolerance } from '../types';
import { PRESET_DECISIONS } from '../data/presets';

const DRAFT_STORAGE_KEY = 'the_tiebreaker_form_draft_v1';

interface DecisionInputFormProps {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
  initialValues?: DecisionInput | null;
}

const COMMON_PRIORITY_TAGS = [
  'Financial Upside',
  'Work-Life Balance',
  'Long-Term Growth',
  'Low Risk & Security',
  'Autonomy & Control',
  'Mental Peace',
  'Time Flexibility',
  'Family & Relationships',
  'Speed of Execution',
  'Ease of Reversal'
];

export const DecisionInputForm: React.FC<DecisionInputFormProps> = ({ onSubmit, isLoading, initialValues }) => {
  // Load initial state from initialValues or localStorage draft
  const getInitialState = () => {
    if (initialValues) {
      return {
        title: initialValues.title || '',
        context: initialValues.context || '',
        primaryGoal: initialValues.primaryGoal || '',
        timeline: initialValues.timeline || '',
        riskTolerance: initialValues.riskTolerance || 'balanced',
        priorities: initialValues.priorities || ['Financial Upside', 'Work-Life Balance'],
        options: initialValues.options && initialValues.options.length >= 2
          ? initialValues.options
          : [
              { id: 'opt-1', name: '', description: '' },
              { id: 'opt-2', name: '', description: '' }
            ]
      };
    }

    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return {
          title: parsed.title || '',
          context: parsed.context || '',
          primaryGoal: parsed.primaryGoal || '',
          timeline: parsed.timeline || '',
          riskTolerance: parsed.riskTolerance || 'balanced',
          priorities: parsed.priorities || ['Financial Upside', 'Work-Life Balance'],
          options: parsed.options && parsed.options.length >= 2
            ? parsed.options
            : [
                { id: 'opt-1', name: '', description: '' },
                { id: 'opt-2', name: '', description: '' }
              ]
        };
      }
    } catch (e) {
      console.warn('Could not parse form draft:', e);
    }

    return {
      title: '',
      context: '',
      primaryGoal: '',
      timeline: '',
      riskTolerance: 'balanced' as RiskTolerance,
      priorities: ['Financial Upside', 'Work-Life Balance'],
      options: [
        { id: 'opt-1', name: '', description: '' },
        { id: 'opt-2', name: '', description: '' }
      ]
    };
  };

  const initial = getInitialState();
  const [title, setTitle] = useState(initial.title);
  const [context, setContext] = useState(initial.context);
  const [primaryGoal, setPrimaryGoal] = useState(initial.primaryGoal);
  const [timeline, setTimeline] = useState(initial.timeline);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(initial.riskTolerance);
  const [priorities, setPriorities] = useState<string[]>(initial.priorities);
  const [newPriorityInput, setNewPriorityInput] = useState('');
  const [options, setOptions] = useState<DecisionOption[]>(initial.options);

  // Sync to localStorage whenever inputs change
  useEffect(() => {
    try {
      const draft: DecisionInput = {
        title,
        context,
        primaryGoal,
        timeline,
        riskTolerance,
        priorities,
        options
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save form draft:', err);
    }
  }, [title, context, primaryGoal, timeline, riskTolerance, priorities, options]);

  // Update form if initialValues prop changes
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setContext(initialValues.context || '');
      setPrimaryGoal(initialValues.primaryGoal || '');
      setTimeline(initialValues.timeline || '');
      setRiskTolerance(initialValues.riskTolerance || 'balanced');
      setPriorities(initialValues.priorities || ['Financial Upside', 'Work-Life Balance']);
      setOptions(
        initialValues.options && initialValues.options.length >= 2
          ? initialValues.options
          : [
              { id: 'opt-1', name: '', description: '' },
              { id: 'opt-2', name: '', description: '' }
            ]
      );
    }
  }, [initialValues]);

  const handleClearDraft = () => {
    if (window.confirm('Clear current inputs and start fresh?')) {
      setTitle('');
      setContext('');
      setPrimaryGoal('');
      setTimeline('');
      setRiskTolerance('balanced');
      setPriorities(['Financial Upside', 'Work-Life Balance']);
      setOptions([
        { id: 'opt-1', name: '', description: '' },
        { id: 'opt-2', name: '', description: '' }
      ]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_DECISIONS[0]) => {
    setTitle(preset.data.title);
    setContext(preset.data.context || '');
    setPrimaryGoal(preset.data.primaryGoal || '');
    setTimeline(preset.data.timeline || '');
    setRiskTolerance(preset.data.riskTolerance);
    setPriorities(preset.data.priorities || []);
    setOptions(preset.data.options.map(o => ({ ...o })));
  };

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions(prev => [
      ...prev,
      { id: `opt-${Date.now()}`, name: '', description: '' }
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleOptionChange = (id: string, field: 'name' | 'description', value: string) => {
    setOptions(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleTogglePriority = (tag: string) => {
    setPriorities(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriorityInput.trim() && !priorities.includes(newPriorityInput.trim())) {
      setPriorities(prev => [...prev, newPriorityInput.trim()]);
      setNewPriorityInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Filter valid options with names
    const validOptions = options.filter(o => o.name.trim().length > 0);
    if (validOptions.length < 2) {
      alert('Please provide at least 2 named options to compare.');
      return;
    }

    onSubmit({
      title: title.trim(),
      context: context.trim(),
      primaryGoal: primaryGoal.trim(),
      timeline: timeline.trim(),
      riskTolerance,
      priorities,
      options: validOptions
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero Welcome Box */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Strategic Decision Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Resolve Tough Dilemmas with Decisive Clarity
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Feed in your options, constraints, and priorities. Get an instant, mathematically weighted
          pros & cons breakdown, comparison matrix, SWOT analysis, and an unambiguous tiebreaker verdict.
        </p>
      </div>

      {/* Preset Inspiration Pills */}
      <div className="mb-8 bg-[#161618] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Or Try a Real-World Decision Template:</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_DECISIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              id={`preset-btn-${preset.id}`}
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3 rounded-xl bg-[#1C1C1F] hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all duration-150 group"
            >
              <div className="text-[11px] font-mono font-medium text-slate-400 group-hover:text-indigo-300 transition-colors">
                {preset.category}
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1 mt-0.5">
                {preset.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-[#161618] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">Inputs auto-saved locally</span>
          </div>
          {(title || options[0]?.name || options[1]?.name) && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded-md hover:bg-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Form</span>
            </button>
          )}
        </div>

        {/* Decision Title */}
        <div>
          <label htmlFor="decision-title-input" className="block text-sm font-semibold text-white mb-1.5">
            What decision are you facing? <span className="text-indigo-400">*</span>
          </label>
          <input
            id="decision-title-input"
            type="text"
            required
            placeholder="e.g. Should I accept the senior role at Startup X or stay at my current corporate job?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#1C1C1F] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-500 text-sm outline-none transition-all"
          />
        </div>

        {/* Options to Compare */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white">
              Options to Evaluate (2 to 5 options) <span className="text-indigo-400">*</span>
            </label>
            {options.length < 5 && (
              <button
                type="button"
                id="add-option-btn"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1 text-xs font-mono font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Option
              </button>
            )}
          </div>

          <div className="space-y-3">
            {options.map((opt, index) => (
              <div
                key={opt.id}
                className="p-4 rounded-xl bg-[#1C1C1F] border border-slate-800 space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                    Option {index + 1}
                  </span>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove Option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      required
                      placeholder={`Option Name (e.g. ${index === 0 ? 'Accept Startup Offer' : 'Stay at Current Role'})`}
                      value={opt.name}
                      onChange={(e) => handleOptionChange(opt.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#161618] border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      placeholder="Brief details/numbers (e.g. $165k base + equity, fast pace, high ownership)"
                      value={opt.description || ''}
                      onChange={(e) => handleOptionChange(opt.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#161618] border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-slate-300 placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Context & Primary Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="decision-goal-input" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Primary Goal / Desired Outcome</span>
            </label>
            <input
              id="decision-goal-input"
              type="text"
              placeholder="e.g. Maximize 5-year wealth & career velocity"
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1F] border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="decision-timeline-input" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Timeline / Urgency</span>
            </label>
            <input
              id="decision-timeline-input"
              type="text"
              placeholder="e.g. Must decide by this Friday"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1F] border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Detailed Context / Background */}
        <div>
          <label htmlFor="decision-context-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Key Background & Constraints (Optional)
          </label>
          <textarea
            id="decision-context-input"
            rows={2}
            placeholder="Share any special nuances, dependencies, partner/family inputs, or financial context..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1F] border border-slate-800 focus:border-indigo-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none"
          />
        </div>

        {/* Risk Tolerance Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Your Risk Appetite</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: 'conservative',
                label: 'Conservative',
                desc: 'Prioritize downside protection, peace of mind & stability'
              },
              {
                id: 'balanced',
                label: 'Balanced',
                desc: 'Optimize for upside while keeping risks measured & manageable'
              },
              {
                id: 'aggressive',
                label: 'Bold / Aggressive',
                desc: 'Maximize asymmetric upside, willing to take calculated risks'
              }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                id={`risk-btn-${r.id}`}
                onClick={() => setRiskTolerance(r.id as RiskTolerance)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  riskTolerance === r.id
                    ? 'bg-indigo-950/30 border-indigo-500/60 text-white shadow-md shadow-indigo-950/20'
                    : 'bg-[#1C1C1F] border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{r.label}</span>
                  {riskTolerance === r.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Priorities Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            What factors matter most to you? (Select or add custom)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {COMMON_PRIORITY_TAGS.map((tag) => {
              const isSelected = priorities.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTogglePriority(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-[#1C1C1F] text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>

          {/* Add custom priority input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add custom priority (e.g. 10-minute commute)..."
              value={newPriorityInput}
              onChange={(e) => setNewPriorityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomPriority(e);
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#1C1C1F] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddCustomPriority}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading || !title.trim() || options.filter(o => o.name.trim()).length < 2}
            id="run-tiebreaker-btn"
            className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Frameworks & Calculating Tiebreaker...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Run The Tiebreaker Analysis</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
