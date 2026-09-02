import React from 'react';
import { Scale, Sparkles, History, RotateCcw, Coins } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenCoinFlip: () => void;
  hasActiveDecision: boolean;
  historyCount: number;
  activeQueryTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenCoinFlip,
  hasActiveDecision,
  historyCount,
  activeQueryTitle,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0A0A0B]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Logo & Brand */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo-btn"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 p-0.5 shadow-lg shadow-indigo-950/40 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#161618] rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[11px] font-mono text-indigo-400 tracking-widest uppercase">Decision Engine v2.4</h1>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>The Tiebreaker</span>
            </h2>
          </div>
        </div>

        {/* Center: Current Query Bento Capsule if Active */}
        {hasActiveDecision && activeQueryTitle && (
          <div className="hidden lg:flex bg-[#161618] border border-slate-800 rounded-xl px-4 py-2 items-center gap-3 max-w-md xl:max-w-xl flex-1 mx-4 shadow-inner">
            <span className="text-slate-500 text-xs font-mono uppercase tracking-wider shrink-0">Current Query:</span>
            <span className="text-indigo-200 text-xs font-medium truncate">{activeQueryTitle}</span>
          </div>
        )}

        {/* Right: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
          {/* Gut check coin flip */}
          <button
            onClick={onOpenCoinFlip}
            id="coin-flip-tool-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-indigo-300 bg-[#161618] hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Interactive Gut-Check Coin Flip"
          >
            <Coins className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Gut-Check Coin</span>
          </button>

          {/* Decision History */}
          <button
            onClick={onOpenHistory}
            id="decision-history-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#161618] hover:bg-slate-800 border border-slate-800 transition-colors relative"
            title="Saved Decisions History"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* New Decision Button */}
          {hasActiveDecision && (
            <button
              onClick={onNewDecision}
              id="new-decision-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-950 transition-all hover:scale-[1.02]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Decision</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
