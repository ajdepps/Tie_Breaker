/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Scale,
  Table,
  Compass,
  Flame,
  Download,
  Coins,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Share2
} from 'lucide-react';

import {
  DecisionInput,
  FullDecisionAnalysis,
  OptionProConAnalysis,
  ComparisonCriterion,
  ChatFollowUpMessage
} from './types';

import { Header } from './components/Header';
import { DecisionInputForm } from './components/DecisionInputForm';
import { VerdictBanner } from './components/VerdictBanner';
import { ProsConsView } from './components/ProsConsView';
import { ComparisonTableView } from './components/ComparisonTableView';
import { SwotView } from './components/SwotView';
import { DevilsAdvocateChat } from './components/DevilsAdvocateChat';
import { CoinFlipModal } from './components/CoinFlipModal';
import { HistoryModal } from './components/HistoryModal';
import { ExportModal } from './components/ExportModal';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions_v1';

export default function App() {
  const [activeAnalysis, setActiveAnalysis] = useState<FullDecisionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'verdict' | 'proscons' | 'comparison' | 'swot' | 'devilsAdvocate'>('verdict');
  const [savedDecisions, setSavedDecisions] = useState<FullDecisionAnalysis[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatFollowUpMessage[]>([]);
  const [editingInput, setEditingInput] = useState<DecisionInput | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isCoinFlipOpen, setIsCoinFlipOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load saved decisions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedDecisions(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved decisions:', err);
    }
  }, []);

  // Save decisions to localStorage
  const saveDecisionToStorage = (decision: FullDecisionAnalysis) => {
    try {
      const updated = [decision, ...savedDecisions.filter(d => d.id !== decision.id)];
      setSavedDecisions(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to persist decision:', err);
    }
  };

  const handleDeleteDecision = (id: string) => {
    const updated = savedDecisions.filter(d => d.id !== id);
    setSavedDecisions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (activeAnalysis?.id === id) {
      setActiveAnalysis(null);
    }
  };

  const handleClearAllHistory = () => {
    setSavedDecisions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Submit decision to AI backend
  const handleAnalyzeDecision = async (input: DecisionInput) => {
    setEditingInput(input);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const analysisResult: FullDecisionAnalysis = await response.json();
      setActiveAnalysis(analysisResult);
      setActiveTab('verdict');
      setChatMessages([]);
      saveDecisionToStorage(analysisResult);

      // Trigger celebratory confetti for clarity!
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#fbbf24']
      });
    } catch (err: any) {
      console.error('Decision analysis error:', err);
      setErrorMessage(err.message || 'Temporary connection issue. Your inputs are safely preserved.');
    } finally {
      setIsLoading(false);
    }
  };

  // Chat follow-up query
  const handleSendChatMessage = async (text: string) => {
    if (!activeAnalysis) return;

    const userMsg: ChatFollowUpMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      const response = await fetch('/api/decision-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionContext: activeAnalysis,
          messages: [...chatMessages, userMsg],
          userQuestion: text
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      const assistantMsg: ChatFollowUpMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis updated.',
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatFollowUpMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I ran into an error evaluating that scenario. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleUpdateProsCons = (updated: OptionProConAnalysis[]) => {
    if (!activeAnalysis) return;
    const newAnalysis = { ...activeAnalysis, prosCons: updated };
    setActiveAnalysis(newAnalysis);
    saveDecisionToStorage(newAnalysis);
  };

  const handleUpdateCriteria = (updated: ComparisonCriterion[]) => {
    if (!activeAnalysis) return;
    const newAnalysis = {
      ...activeAnalysis,
      comparisonMatrix: {
        ...activeAnalysis.comparisonMatrix,
        criteria: updated
      }
    };
    setActiveAnalysis(newAnalysis);
    saveDecisionToStorage(newAnalysis);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        onNewDecision={() => {
          setActiveAnalysis(null);
          setErrorMessage(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCoinFlip={() => setIsCoinFlipOpen(true)}
        hasActiveDecision={!!activeAnalysis}
        historyCount={savedDecisions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 max-w-4xl mx-auto p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice:</span> {errorMessage}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {editingInput && (
                <button
                  type="button"
                  onClick={() => handleAnalyzeDecision(editingInput)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Retrying...' : 'Retry Now'}
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-200 text-xs p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!activeAnalysis ? (
          /* Decision Input View */
          <DecisionInputForm
            onSubmit={handleAnalyzeDecision}
            isLoading={isLoading}
            initialValues={editingInput || null}
          />
        ) : (
          /* Decision Analysis Dashboard */
          <div className="space-y-6">
            {/* Top Back / Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161618] border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingInput(activeAnalysis.input);
                    setActiveAnalysis(null);
                  }}
                  className="p-2 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
                  title="Edit or adjust these inputs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-white line-clamp-1">
                    {activeAnalysis.input.title}
                  </h2>
                  <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 font-mono mt-0.5">
                    <span>{activeAnalysis.input.options.length} Options Evaluated</span>
                    <span>•</span>
                    <span className="capitalize">{activeAnalysis.input.riskTolerance} Risk</span>
                    {activeAnalysis.input.timeline && (
                      <>
                        <span>•</span>
                        <span>{activeAnalysis.input.timeline}</span>
                      </>
                    )}
                    {activeAnalysis.isOfflineSynthesis && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                          ⚡ High-Load Engine
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    setEditingInput(activeAnalysis.input);
                    setActiveAnalysis(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors"
                >
                  <span>Edit Inputs</span>
                </button>

                <button
                  onClick={() => setIsCoinFlipOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C1F] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-400 text-xs font-mono font-semibold transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gut-Check Coin</span>
                </button>

                <button
                  onClick={() => setIsExportOpen(true)}
                  id="export-decision-btn"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export Brief</span>
                </button>
              </div>
            </div>

            {/* Framework Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
              {[
                {
                  id: 'verdict',
                  label: 'Tiebreaker Verdict',
                  icon: Award,
                  badge: `${activeAnalysis.verdict.confidenceScore}% Conf.`
                },
                {
                  id: 'proscons',
                  label: 'Pros & Cons',
                  icon: Scale,
                  badge: `${activeAnalysis.prosCons.reduce((acc, o) => acc + o.pros.length + o.cons.length, 0)} pts`
                },
                {
                  id: 'comparison',
                  label: 'Comparison Matrix',
                  icon: Table,
                  badge: `${activeAnalysis.comparisonMatrix.criteria.length} Criteria`
                },
                {
                  id: 'swot',
                  label: 'SWOT Analysis',
                  icon: Compass,
                  badge: `${activeAnalysis.swotAnalysis.length} Options`
                },
                {
                  id: 'devilsAdvocate',
                  label: "Devil's Advocate & Q&A",
                  icon: Flame,
                  badge: 'AI Stress-Test'
                }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-500/40'
                        : 'bg-[#161618] text-slate-400 hover:text-slate-200 hover:bg-[#1C1C1F] border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-400/30'
                          : 'bg-[#1C1C1F] text-slate-400 border border-slate-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab View Rendering */}
            <div className="pt-2">
              {activeTab === 'verdict' && (
                <div className="space-y-6">
                  <VerdictBanner verdict={activeAnalysis.verdict} />
                  
                  {/* Quick Summary of all Frameworks below verdict */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('proscons')}
                      className="text-left p-4 rounded-2xl bg-[#161618] border border-slate-800 hover:border-indigo-500/40 transition-all group shadow-sm hover:shadow-indigo-950/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400">
                          <Scale className="w-4 h-4" />
                          <span>Weighted Pros & Cons</span>
                        </div>
                        <span className="text-slate-500 group-hover:text-indigo-400 text-xs font-mono">→</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Explore individual weights, impact rankings, and mitigation tactics for all options.
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('comparison')}
                      className="text-left p-4 rounded-2xl bg-[#161618] border border-slate-800 hover:border-indigo-500/40 transition-all group shadow-sm hover:shadow-indigo-950/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400">
                          <Table className="w-4 h-4" />
                          <span>Comparison Matrix</span>
                        </div>
                        <span className="text-slate-500 group-hover:text-indigo-400 text-xs font-mono">→</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Side-by-side scoring across {activeAnalysis.comparisonMatrix.criteria.length} custom weighted evaluation dimensions.
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('swot')}
                      className="text-left p-4 rounded-2xl bg-[#161618] border border-slate-800 hover:border-indigo-500/40 transition-all group shadow-sm hover:shadow-indigo-950/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400">
                          <Compass className="w-4 h-4" />
                          <span>SWOT Quadrants</span>
                        </div>
                        <span className="text-slate-500 group-hover:text-indigo-400 text-xs font-mono">→</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Internal Strengths & Weaknesses mapped against external Opportunities & Threats.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'proscons' && (
                <ProsConsView
                  analyses={activeAnalysis.prosCons}
                  onUpdateAnalyses={handleUpdateProsCons}
                />
              )}

              {activeTab === 'comparison' && (
                <ComparisonTableView
                  options={activeAnalysis.input.options}
                  criteria={activeAnalysis.comparisonMatrix.criteria}
                  overallSummary={activeAnalysis.comparisonMatrix.overallSummary}
                  onUpdateCriteria={handleUpdateCriteria}
                />
              )}

              {activeTab === 'swot' && (
                <SwotView swotAnalysis={activeAnalysis.swotAnalysis} />
              )}

              {activeTab === 'devilsAdvocate' && (
                <DevilsAdvocateChat
                  analysis={activeAnalysis}
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isSending={isChatSending}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CoinFlipModal
        isOpen={isCoinFlipOpen}
        onClose={() => setIsCoinFlipOpen(false)}
        options={activeAnalysis?.input.options || [
          { id: 'opt-a', name: 'Option A' },
          { id: 'opt-b', name: 'Option B' }
        ]}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => {
          setActiveAnalysis(dec);
          setActiveTab('verdict');
        }}
        onDeleteDecision={handleDeleteDecision}
        onClearAllHistory={handleClearAllHistory}
      />

      {activeAnalysis && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={activeAnalysis}
        />
      )}
    </div>
  );
}
