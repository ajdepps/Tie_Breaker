export type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';

export interface DecisionOption {
  id: string;
  name: string;
  description?: string;
}

export interface DecisionInput {
  title: string;
  context?: string;
  primaryGoal?: string;
  timeline?: string;
  riskTolerance: RiskTolerance;
  priorities: string[];
  options: DecisionOption[];
}

export interface ProConItem {
  id: string;
  text: string;
  detail: string;
  category: string; // e.g. 'Financial', 'Lifestyle', 'Career', 'Risk', 'Time'
  weight: number; // 1 to 5
  mitigation?: string;
}

export interface OptionProConAnalysis {
  optionId: string;
  optionName: string;
  pros: ProConItem[];
  cons: ProConItem[];
  summary: string;
  weightedScore?: number; // Calculated dynamically
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  description: string;
  userWeight: number; // 1 to 3 multiplier
  optionScores: Record<string, {
    score: number; // 1 to 10
    justification: string;
  }>;
}

export interface SwotQuadrant {
  strengths: { point: string; impact: string }[];
  weaknesses: { point: string; impact: string }[];
  opportunities: { point: string; impact: string }[];
  threats: { point: string; impact: string }[];
}

export interface OptionSwot {
  optionId: string;
  optionName: string;
  swot: SwotQuadrant;
  keyTakeaway: string;
}

export interface TiebreakerVerdict {
  winnerOptionId: string;
  winnerOptionName: string;
  confidenceScore: number; // 0 - 100%
  executiveSummary: string;
  keyDecidingFactors: string[];
  whatWouldFlipIt: string[];
  rule101010: {
    tenMinutes: string;
    tenMonths: string;
    tenYears: string;
  };
  regretMinimizationTake: string;
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
  };
}

export interface FullDecisionAnalysis {
  id: string;
  createdAt: string;
  input: DecisionInput;
  prosCons: OptionProConAnalysis[];
  comparisonMatrix: {
    criteria: ComparisonCriterion[];
    overallSummary: string;
  };
  swotAnalysis: OptionSwot[];
  verdict: TiebreakerVerdict;
  devilsAdvocateNotes: string[];
  isOfflineSynthesis?: boolean;
  modelUsed?: string;
}

export interface ChatFollowUpMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
