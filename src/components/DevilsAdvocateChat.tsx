import React, { useState } from 'react';
import { Flame, Send, Sparkles, MessageSquare, Bot, User, HelpCircle } from 'lucide-react';
import { FullDecisionAnalysis, ChatFollowUpMessage } from '../types';

interface DevilsAdvocateChatProps {
  analysis: FullDecisionAnalysis;
  messages: ChatFollowUpMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

export const DevilsAdvocateChat: React.FC<DevilsAdvocateChatProps> = ({
  analysis,
  messages,
  onSendMessage,
  isSending
}) => {
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    'What if I can negotiate 15% higher compensation?',
    'What is the worst-case scenario if the winner fails?',
    'How do I overcome the fear of making the wrong choice?',
    'What should I say to my partner/stakeholder to align them?'
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Devil's Advocate Bias Checks Card */}
      <div className="bg-[#161618] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-3">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Devil's Advocate & Cognitive Bias Check</span>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Before locking in your decision, stress-test these blind spots against confirmation bias and status-quo inertia:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analysis.devilsAdvocateNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#1C1C1F] border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-1.5 hover:border-amber-500/30 transition-colors"
            >
              <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Stress Test #{idx + 1}
              </div>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Chat Box */}
      <div className="bg-[#161618] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col h-[500px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                Ask The Tiebreaker Advisor
              </h4>
              <p className="text-[11px] text-slate-400">
                Test new what-ifs, challenge assumptions, or request negotiation tactics
              </p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <div className="text-xs max-w-sm text-slate-300">
                Have an unexpected variable or what-if scenario? Ask below to see if it flips the recommendation.
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-w-md">
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(q)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#1C1C1F] hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-[#1C1C1F] border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#1C1C1F] border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
              </div>
              <div className="bg-[#1C1C1F] border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2 font-mono">
                <span>The Tiebreaker is evaluating your scenario...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask a question or introduce a new condition..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1C1C1F] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
