import React from 'react';
import { History, Trash2, ArrowRight, Calendar, Award } from 'lucide-react';
import { FullDecisionAnalysis } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: FullDecisionAnalysis[];
  onSelectDecision: (decision: FullDecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAllHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161618] border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">
              Saved Decision Analyses ({savedDecisions.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No saved decisions yet. Every decision you analyze is automatically archived here.
            </div>
          ) : (
            savedDecisions.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#1C1C1F] border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-4 group"
              >
                <div
                  onClick={() => {
                    onSelectDecision(item);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                      Winner: {item.verdict?.winnerOptionName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.input.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    Options: {item.input.options.map(o => o.name).join(' vs ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectDecision(item);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-colors text-xs font-mono font-semibold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteDecision(item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedDecisions.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <button
              onClick={onClearAllHistory}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors font-mono"
            >
              Clear All Saved Decisions
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
