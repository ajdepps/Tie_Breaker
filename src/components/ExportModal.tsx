import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Share2 } from 'lucide-react';
import { FullDecisionAnalysis } from '../types';
import { exportDecisionAsMarkdown } from '../utils/decisionCalculations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FullDecisionAnalysis;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analysis
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContent = exportDecisionAsMarkdown(analysis);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiebreaker-decision-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161618] border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">
              Export Decision Brief
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Share this comprehensive decision brief with your team, manager, partner, or advisors.
        </p>

        {/* Markdown Preview Box */}
        <div className="flex-1 bg-[#1C1C1F] border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed max-h-72 select-all">
          <pre className="whitespace-pre-wrap">{markdownContent}</pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs transition-colors shadow-md shadow-indigo-950/40"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download .md File</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 text-slate-400 text-xs font-mono font-medium border border-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
