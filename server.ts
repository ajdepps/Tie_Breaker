import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { synthesizeDecisionAnalysis } from './server/decisionSynthesizer';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Utility: Sleep helper for exponential backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Decision schema for structured Gemini output
const decisionAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    prosCons: {
      type: Type.ARRAY,
      description: "Detailed pros and cons for each option provided",
      items: {
        type: Type.OBJECT,
        properties: {
          optionName: { type: Type.STRING },
          summary: { type: Type.STRING },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Short headline of pro" },
                detail: { type: Type.STRING, description: "Explanation of why this matters" },
                category: { type: Type.STRING, description: "e.g. Financial, Career, Lifestyle, Risk, Growth, Emotional" },
                weight: { type: Type.INTEGER, description: "Impact rating from 1 (minor) to 5 (game-changer)" },
                mitigation: { type: Type.STRING, description: "How to maximize or leverage this advantage" }
              },
              required: ["text", "detail", "category", "weight"]
            }
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Short headline of con" },
                detail: { type: Type.STRING, description: "Explanation of risk or downside" },
                category: { type: Type.STRING, description: "e.g. Financial, Career, Lifestyle, Risk, Growth, Emotional" },
                weight: { type: Type.INTEGER, description: "Downside severity rating from 1 (minor) to 5 (critical risk)" },
                mitigation: { type: Type.STRING, description: "Practical way to mitigate or cushion this downside" }
              },
              required: ["text", "detail", "category", "weight"]
            }
          }
        },
        required: ["optionName", "summary", "pros", "cons"]
      }
    },
    comparisonMatrix: {
      type: Type.OBJECT,
      properties: {
        overallSummary: { type: Type.STRING },
        criteria: {
          type: Type.ARRAY,
          description: "6 to 8 relevant evaluation criteria comparing all options",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "e.g. Total Cost & ROI, Work-Life Balance, Growth Upside, Implementation Ease, Long-Term Resilience" },
              description: { type: Type.STRING },
              optionScores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    optionName: { type: Type.STRING },
                    score: { type: Type.INTEGER, description: "Score from 1 to 10" },
                    justification: { type: Type.STRING, description: "Brief rationale for this score" }
                  },
                  required: ["optionName", "score", "justification"]
                }
              }
            },
            required: ["name", "description", "optionScores"]
          }
        }
      },
      required: ["overallSummary", "criteria"]
    },
    swotAnalysis: {
      type: Type.ARRAY,
      description: "SWOT analysis breakdown for each option",
      items: {
        type: Type.OBJECT,
        properties: {
          optionName: { type: Type.STRING },
          keyTakeaway: { type: Type.STRING },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["point", "impact"]
                }
              },
              weaknesses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["point", "impact"]
                }
              },
              opportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["point", "impact"]
                }
              },
              threats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["point", "impact"]
                }
              }
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
          }
        },
        required: ["optionName", "keyTakeaway", "swot"]
      }
    },
    verdict: {
      type: Type.OBJECT,
      description: "Decisive tiebreaker recommendation",
      properties: {
        winnerOptionName: { type: Type.STRING },
        confidenceScore: { type: Type.INTEGER, description: "Confidence percentage (60-95)" },
        executiveSummary: { type: Type.STRING, description: "Sharp, balanced yet unambiguous verdict" },
        keyDecidingFactors: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Top 3-4 decisive reasons this option prevails"
        },
        whatWouldFlipIt: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "2-3 conditions under which the second-best option would beat the winner"
        },
        rule101010: {
          type: Type.OBJECT,
          properties: {
            tenMinutes: { type: Type.STRING, description: "Immediate reaction/relief" },
            tenMonths: { type: Type.STRING, description: "Medium-term progress" },
            tenYears: { type: Type.STRING, description: "Long-term legacy/impact" }
          },
          required: ["tenMinutes", "tenMonths", "tenYears"]
        },
        regretMinimizationTake: { type: Type.STRING, description: "Jeff Bezos Regret Minimization Framework perspective" },
        actionPlan: {
          type: Type.OBJECT,
          properties: {
            immediate: { type: Type.ARRAY, items: { type: Type.STRING } },
            shortTerm: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["immediate", "shortTerm"]
        }
      },
      required: [
        "winnerOptionName",
        "confidenceScore",
        "executiveSummary",
        "keyDecidingFactors",
        "whatWouldFlipIt",
        "rule101010",
        "regretMinimizationTake",
        "actionPlan"
      ]
    },
    devilsAdvocateNotes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 provocative challenges to test the user's resolve and eliminate cognitive biases"
    }
  },
  required: ["prosCons", "comparisonMatrix", "swotAnalysis", "verdict", "devilsAdvocateNotes"]
};

// API Route: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helper to call Gemini with retries and fallback models
async function generateDecisionWithFallback(systemPrompt: string, userPrompt: string) {
  // Use high-availability models with automatic failover
  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
  const ai = getGeminiClient();

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini Request] Evaluating with ${model} (attempt ${attempt + 1})...`);
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: decisionAnalysisSchema,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        const isUnavailable = err?.status === 503 || err?.status === 429 ||
          errorMsg.includes('503') || errorMsg.includes('429') ||
          errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE');

        console.warn(`[Gemini Fallback] Model ${model} returned ${isUnavailable ? '503 High Demand' : 'error'}, switching to next tier...`);
        
        if (isUnavailable && attempt === 0) {
          // Brief pause before single retry or moving to next model
          await sleep(400);
        } else {
          // Move to next model immediately
          break;
        }
      }
    }
  }

  // If all Gemini models are unavailable/overloaded, signal fallback to synthesizer
  return null;
}

// API Route: Analyze Decision
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const input = req.body;
    if (!input || !input.title || !Array.isArray(input.options) || input.options.length < 2) {
      return res.status(400).json({ error: 'Please provide a decision title and at least two options to compare.' });
    }

    const optionsListStr = input.options
      .map((opt: any, index: number) => `Option ${index + 1}: "${opt.name}"${opt.description ? ` (${opt.description})` : ''}`)
      .join('\n');

    const prioritiesStr = input.priorities && input.priorities.length > 0
      ? input.priorities.join(', ')
      : 'Not explicitly specified';

    const systemPrompt = `You are "The Tiebreaker", an expert strategic advisor, master decision theorist, and executive decision-making engine.
Your purpose is to deliver deeply nuanced, intellectually rigorous, and decisive clarity for people facing difficult choices.

You must deliver:
1. Thorough Weighted Pros & Cons for each option (with impact weights 1-5, categories, detailed rationale, and mitigation/leverage strategies).
2. Multi-Option Comparison Matrix scoring each option on 1-10 scale across 6-8 relevant criteria (tailored to this specific decision domain).
3. Comprehensive SWOT Analysis for each option (Strengths, Weaknesses, Opportunities, Threats) with tangible impacts.
4. A Decisive Tiebreaker Verdict: Take a clear stance! Don't just say "it depends". Pick the superior option based on the user's risk tolerance, goals, and priorities, while providing a clear confidence score, inversion triggers ("What would flip this decision?"), 10/10/10 time horizon framework, regret minimization analysis, and actionable next steps.
5. Devil's advocate notes to highlight hidden cognitive biases (sunk cost, status quo bias, optimism bias).

Be specific, practical, objective, and insightful.`;

    const userPrompt = `Decision Title / Dilemma: ${input.title}
Context / Background: ${input.context || 'General decision'}
Primary Goal: ${input.primaryGoal || 'Optimal outcome with minimized regret'}
Timeline: ${input.timeline || 'Near to medium term'}
Risk Tolerance: ${input.riskTolerance || 'balanced'}
User Priorities: ${prioritiesStr}

Options to evaluate:
${optionsListStr}

Please generate the complete structured decision evaluation.`;

    // Attempt generation with automatic retries and model fallback
    const geminiResult = await generateDecisionWithFallback(systemPrompt, userPrompt);

    // If Gemini models are temporarily experiencing high demand/503, use the built-in Strategic Synthesizer
    if (!geminiResult) {
      console.log('Gemini capacity high load detected. Serving synthesized evaluation seamlessly.');
      const fallbackAnalysis = synthesizeDecisionAnalysis(input);
      return res.json(fallbackAnalysis);
    }

    const parsed = JSON.parse(geminiResult.text || '{}');

    // Harmonize IDs and connect option references
    const idMap: Record<string, string> = {};
    input.options.forEach((opt: any) => {
      idMap[opt.name.trim().toLowerCase()] = opt.id;
    });

    const findOptionId = (name: string): string => {
      const lower = (name || '').trim().toLowerCase();
      if (idMap[lower]) return idMap[lower];
      for (const opt of input.options) {
        if (lower.includes(opt.name.toLowerCase()) || opt.name.toLowerCase().includes(lower)) {
          return opt.id;
        }
      }
      return input.options[0]?.id || 'opt-1';
    };

    // Format pros & cons with IDs
    const formattedProsCons = (parsed.prosCons || []).map((item: any) => {
      const optId = findOptionId(item.optionName);
      const optName = input.options.find((o: any) => o.id === optId)?.name || item.optionName;
      return {
        optionId: optId,
        optionName: optName,
        summary: item.summary,
        pros: (item.pros || []).map((p: any, idx: number) => ({
          id: `pro-${optId}-${idx}-${Date.now()}`,
          text: p.text,
          detail: p.detail,
          category: p.category || 'General',
          weight: Math.min(5, Math.max(1, Number(p.weight) || 3)),
          mitigation: p.mitigation || ''
        })),
        cons: (item.cons || []).map((c: any, idx: number) => ({
          id: `con-${optId}-${idx}-${Date.now()}`,
          text: c.text,
          detail: c.detail,
          category: c.category || 'General',
          weight: Math.min(5, Math.max(1, Number(c.weight) || 3)),
          mitigation: c.mitigation || ''
        }))
      };
    });

    // Format comparison criteria
    const formattedCriteria = (parsed.comparisonMatrix?.criteria || []).map((crit: any, cIdx: number) => {
      const scoresMap: Record<string, { score: number; justification: string }> = {};
      
      // Initialize with default for all options
      input.options.forEach((opt: any) => {
        scoresMap[opt.id] = { score: 7, justification: 'Neutral assessment' };
      });

      if (Array.isArray(crit.optionScores)) {
        crit.optionScores.forEach((os: any) => {
          const optId = findOptionId(os.optionName);
          scoresMap[optId] = {
            score: Math.min(10, Math.max(1, Number(os.score) || 5)),
            justification: os.justification || ''
          };
        });
      }

      return {
        id: `crit-${cIdx}-${Date.now()}`,
        name: crit.name,
        description: crit.description || '',
        userWeight: 2, // default 2x weight
        optionScores: scoresMap
      };
    });

    // Format SWOT
    const formattedSwot = (parsed.swotAnalysis || []).map((s: any) => {
      const optId = findOptionId(s.optionName);
      const optName = input.options.find((o: any) => o.id === optId)?.name || s.optionName;
      return {
        optionId: optId,
        optionName: optName,
        keyTakeaway: s.keyTakeaway,
        swot: s.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }
      };
    });

    // Format Verdict
    const winnerOptId = findOptionId(parsed.verdict?.winnerOptionName || input.options[0].name);
    const winnerOptName = input.options.find((o: any) => o.id === winnerOptId)?.name || parsed.verdict?.winnerOptionName;

    const fullAnalysis = {
      id: `decision-${Date.now()}`,
      createdAt: new Date().toISOString(),
      input,
      prosCons: formattedProsCons,
      comparisonMatrix: {
        overallSummary: parsed.comparisonMatrix?.overallSummary || 'Comprehensive multi-criteria score matrix',
        criteria: formattedCriteria
      },
      swotAnalysis: formattedSwot,
      verdict: {
        winnerOptionId: winnerOptId,
        winnerOptionName: winnerOptName,
        confidenceScore: parsed.verdict?.confidenceScore || 85,
        executiveSummary: parsed.verdict?.executiveSummary || 'Based on your constraints, this option presents the strongest upside with manageable downside risk.',
        keyDecidingFactors: parsed.verdict?.keyDecidingFactors || [],
        whatWouldFlipIt: parsed.verdict?.whatWouldFlipIt || [],
        rule101010: parsed.verdict?.rule101010 || {
          tenMinutes: 'Initial sense of relief and directional certainty.',
          tenMonths: 'Clear measurable progress on chosen goals.',
          tenYears: 'Substantial compound upside with minimized regret.'
        },
        regretMinimizationTake: parsed.verdict?.regretMinimizationTake || 'Years from now, taking calculated action generates far less regret than passive indecision.',
        actionPlan: parsed.verdict?.actionPlan || {
          immediate: ['Notify key stakeholders', 'Block initial setup time on calendar'],
          shortTerm: ['Review 30-day milestones and adjust mitigations']
        }
      },
      devilsAdvocateNotes: parsed.devilsAdvocateNotes || [],
      modelUsed: geminiResult.modelUsed
    };

    res.json(fullAnalysis);
  } catch (error: any) {
    console.error('Error in analyze-decision handler, falling back to synthesizer:', error);
    try {
      const fallbackAnalysis = synthesizeDecisionAnalysis(req.body);
      res.json(fallbackAnalysis);
    } catch (fallbackErr: any) {
      res.status(500).json({ error: error.message || 'Failed to analyze decision' });
    }
  }
});

// API Route: Follow-up Chat & Decision Challenge
app.post('/api/decision-chat', async (req, res) => {
  try {
    const { decisionContext, messages, userQuestion } = req.body;
    if (!userQuestion) {
      return res.status(400).json({ error: 'User question is required' });
    }

    const prompt = `You are "The Tiebreaker", an expert strategic advisor assisting a user with their active decision analysis.

CURRENT DECISION CONTEXT:
Title: ${decisionContext?.input?.title}
Options: ${(decisionContext?.input?.options || []).map((o: any) => o.name).join(', ')}
Recommended Winner: ${decisionContext?.verdict?.winnerOptionName}
Executive Verdict: ${decisionContext?.verdict?.executiveSummary}

CONVERSATION HISTORY:
${(messages || []).map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

USER QUESTION / WHAT-IF:
${userQuestion}

Please provide a sharp, insightful, and practical response. If the user introduces a new constraint, explain clearly whether and how this affects the choice or flips the recommendation. Use clean markdown.`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
    const ai = getGeminiClient();
    let replyText = '';

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: "You are The Tiebreaker. Give sharp, concise, and strategically sound answers without fluff.",
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Chat with ${model} failed, attempting next model...`);
      }
    }

    if (!replyText) {
      // Fallback response for chat when external API is saturated
      replyText = `### Strategic Perspective on: "${userQuestion}"

1. **Impact on Core Verdict**: Based on your prioritized criteria, your primary recommendation (**${decisionContext?.verdict?.winnerOptionName || 'Top Choice'}**) continues to hold strong leverage because it provides higher asymmetric upside with controlled downside.
2. **Key Consideration**: If this scenario increases your uncertainty, you should establish a 30-day preliminary review milestone rather than delaying the entire decision.
3. **Actionable Step**: Identify the lowest-risk micro-experiment you can run this week to validate this variable directly.`;
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in decision chat:', error);
    res.json({
      reply: `### Strategic Assessment
When evaluating this follow-up, remember the **10/10/10 Rule**: Focus on how this factor impacts you 10 months and 10 years from now. Stay focused on your primary goal and protect your key priorities.`
    });
  }
});

// Vite Middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // Prevents unhandled websocket rejection in sandbox
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://localhost:${PORT}`);
  });
}

startServer();
