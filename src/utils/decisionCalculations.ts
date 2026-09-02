import { FullDecisionAnalysis, OptionProConAnalysis, ComparisonCriterion } from '../types';

export function calculateOptionProsConsScore(optionAnalysis: OptionProConAnalysis): {
  prosTotal: number;
  consTotal: number;
  netScore: number;
} {
  const prosTotal = (optionAnalysis.pros || []).reduce((acc, p) => acc + (Number(p.weight) || 1), 0);
  const consTotal = (optionAnalysis.cons || []).reduce((acc, c) => acc + (Number(c.weight) || 1), 0);
  return {
    prosTotal,
    consTotal,
    netScore: prosTotal - consTotal
  };
}

export function calculateComparisonMatrixScores(
  criteria: ComparisonCriterion[],
  optionIds: string[]
): Record<string, { totalWeightedScore: number; maxPossibleScore: number; normalizedPercent: number }> {
  const result: Record<string, { totalWeightedScore: number; maxPossibleScore: number; normalizedPercent: number }> = {};

  optionIds.forEach(optId => {
    result[optId] = { totalWeightedScore: 0, maxPossibleScore: 0, normalizedPercent: 0 };
  });

  criteria.forEach(crit => {
    const weight = Number(crit.userWeight) || 1;
    optionIds.forEach(optId => {
      const scoreObj = crit.optionScores[optId];
      const rawScore = scoreObj ? scoreObj.score : 5;
      result[optId].totalWeightedScore += rawScore * weight;
      result[optId].maxPossibleScore += 10 * weight;
    });
  });

  optionIds.forEach(optId => {
    const item = result[optId];
    item.normalizedPercent = item.maxPossibleScore > 0
      ? Math.round((item.totalWeightedScore / item.maxPossibleScore) * 100)
      : 50;
  });

  return result;
}

export function exportDecisionAsMarkdown(analysis: FullDecisionAnalysis): string {
  const { input, prosCons, comparisonMatrix, swotAnalysis, verdict, devilsAdvocateNotes } = analysis;

  let md = `# The Tiebreaker: Decision Analysis\n\n`;
  md += `## 📌 Decision: ${input.title}\n\n`;
  if (input.context) md += `**Context:** ${input.context}\n\n`;
  if (input.primaryGoal) md += `**Primary Goal:** ${input.primaryGoal}\n\n`;
  md += `**Risk Profile:** ${input.riskTolerance.toUpperCase()} | **Date:** ${new Date(analysis.createdAt).toLocaleDateString()}\n\n`;

  md += `---\n\n`;
  md += `## 🏆 The Tiebreaker Verdict\n\n`;
  md += `### Winner: **${verdict.winnerOptionName}** (${verdict.confidenceScore}% Confidence)\n\n`;
  md += `> ${verdict.executiveSummary}\n\n`;

  md += `### Deciding Factors:\n`;
  verdict.keyDecidingFactors.forEach(f => {
    md += `- ${f}\n`;
  });
  md += `\n`;

  md += `### 🔄 What Would Flip This Decision?\n`;
  verdict.whatWouldFlipIt.forEach(flip => {
    md += `- ${flip}\n`;
  });
  md += `\n`;

  md += `### ⏱️ 10/10/10 Rule Perspective\n`;
  md += `- **10 Minutes:** ${verdict.rule101010.tenMinutes}\n`;
  md += `- **10 Months:** ${verdict.rule101010.tenMonths}\n`;
  md += `- **10 Years:** ${verdict.rule101010.tenYears}\n\n`;

  md += `---\n\n`;
  md += `## ⚖️ Weighted Pros & Cons\n\n`;
  prosCons.forEach(opt => {
    const scores = calculateOptionProsConsScore(opt);
    md += `### ${opt.optionName} (Net Impact: ${scores.netScore > 0 ? '+' : ''}${scores.netScore})\n`;
    md += `*${opt.summary}*\n\n`;
    md += `**PROS:**\n`;
    opt.pros.forEach(p => {
      md += `- **[+${p.weight}] ${p.text}** (${p.category}): ${p.detail}${p.mitigation ? ` *(Maximizer: ${p.mitigation})*` : ''}\n`;
    });
    md += `\n**CONS:**\n`;
    opt.cons.forEach(c => {
      md += `- **[-${c.weight}] ${c.text}** (${c.category}): ${c.detail}${c.mitigation ? ` *(Mitigation: ${c.mitigation})*` : ''}\n`;
    });
    md += `\n`;
  });

  md += `---\n\n`;
  md += `## 📊 Comparison Matrix\n\n`;
  md += `| Criteria | Weight | ` + input.options.map(o => o.name).join(' | ') + ` |\n`;
  md += `| --- | --- | ` + input.options.map(() => '---').join(' | ') + ` |\n`;
  comparisonMatrix.criteria.forEach(crit => {
    const row = [
      `**${crit.name}**`,
      `${crit.userWeight}x`,
      ...input.options.map(o => `${crit.optionScores[o.id]?.score || '-'}/10`)
    ];
    md += `| ` + row.join(' | ') + ` |\n`;
  });
  md += `\n`;

  md += `---\n\n`;
  md += `## 🧭 SWOT Analysis Summary\n\n`;
  swotAnalysis.forEach(s => {
    md += `### Option: ${s.optionName}\n`;
    md += `*Takeaway: ${s.keyTakeaway}*\n\n`;
    md += `**Strengths:**\n` + s.swot.strengths.map(st => `- ${st.point} (${st.impact})`).join('\n') + `\n\n`;
    md += `**Weaknesses:**\n` + s.swot.weaknesses.map(w => `- ${w.point} (${w.impact})`).join('\n') + `\n\n`;
    md += `**Opportunities:**\n` + s.swot.opportunities.map(o => `- ${o.point} (${o.impact})`).join('\n') + `\n\n`;
    md += `**Threats:**\n` + s.swot.threats.map(t => `- ${t.point} (${t.impact})`).join('\n') + `\n\n`;
  });

  md += `---\n\n`;
  md += `## 😈 Devil's Advocate & Bias Checks\n\n`;
  devilsAdvocateNotes.forEach(note => {
    md += `- ${note}\n`;
  });

  return md;
}
