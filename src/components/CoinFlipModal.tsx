import React, { useState } from 'react';
import { Coins, Sparkles, RotateCcw, CheckCircle2, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecisionOption } from '../types';

interface CoinFlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: DecisionOption[];
}

export const CoinFlipModal: React.FC<CoinFlipModalProps> = ({
  isOpen,
  onClose,
  options
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [revealedResult, setRevealedResult] = useState<string | null>(null);
  const [customOptA, setCustomOptA] = useState(options[0]?.name || 'Option A');
  const [customOptB, setCustomOptB] = useState(options[1]?.name || 'Option B');
  const [gutCheckNotes, setGutCheckNotes] = useState('');

  if (!isOpen) return null;

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setRevealedResult(null);

    // Random choice
    const isHeads = Math.random() > 0.5;
    const winner = isHeads ? customOptA : customOptB;

    setTimeout(() => {
      setSelectedSide(isHeads ? 'heads' : 'tails');
      setRevealedResult(winner);
      setIsFlipping(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#818cf8', '#a5b4fc']
      });
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161618] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-sm"
        >
          ✕
        </button>

        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Psychological Gut-Check</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            The Tiebreaker Coin Flip
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            The secret is not the coin's result — it's noticing which outcome you <em>secretly hope</em> lands while the coin is in the air.
          </p>
        </div>

        {/* Options Input */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-[#1C1C1F] border border-slate-800">
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">Heads</span>
            <input
              type="text"
              value={customOptA}
              onChange={(e) => setCustomOptA(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-100 font-semibold outline-none mt-1"
            />
          </div>
          <div className="p-2.5 rounded-xl bg-[#1C1C1F] border border-slate-800">
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">Tails</span>
            <input
              type="text"
              value={customOptB}
              onChange={(e) => setCustomOptB(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-100 font-semibold outline-none mt-1"
            />
          </div>
        </div>

        {/* Animated Coin */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div
            onClick={handleFlip}
            className={`w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-500 to-sky-300 p-1 shadow-2xl shadow-indigo-500/30 cursor-pointer select-none transition-transform duration-300 ${
              isFlipping ? 'animate-spin' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="w-full h-full rounded-full bg-[#161618] border-2 border-indigo-400/80 flex flex-col items-center justify-center p-2">
              <Coins className="w-8 h-8 text-indigo-400 mb-1" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-indigo-300">
                {isFlipping ? 'FLIPPING...' : revealedResult ? (selectedSide === 'heads' ? 'HEADS' : 'TAILS') : 'TAP TO FLIP'}
              </span>
            </div>
          </div>
        </div>

        {/* Result & Gut Reflection */}
        {revealedResult && !isFlipping && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coin Landed On: {revealedResult}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              <strong>Gut-Check Question:</strong> When you saw "{revealedResult}", did you feel a subtle sense of relief or a twinge of disappointment?
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleFlip}
            disabled={isFlipping}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs transition-all shadow-md shadow-indigo-950/40"
          >
            {isFlipping ? 'Flipping...' : 'Flip Again'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 text-slate-300 text-xs font-mono font-medium border border-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
