import { z } from 'zod';
import { Evaluator, EvaluationContext, EvaluationResult } from './Evaluator';
import { RuleBasedEvaluator } from './RuleBasedEvaluator';

const EvaluationResponseSchema = z.object({
  overallScore: z.number().min(0).max(10),
  criterionScores: z.array(
    z.object({
      criterion: z.string(),
      score: z.number().min(0).max(10),
      evidence: z.string(),
      concern: z.string().optional(),
      suggestion: z.string().optional(),
    })
  ),
  feedbackItems: z.array(
    z.object({
      category: z.string(),
      severity: z.enum(['good', 'suggestion', 'concern']),
      evidence: z.string(),
      concern: z.string(),
      suggestion: z.string(),
      confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    })
  ),
  followUpQuestions: z.array(z.string()).min(1).max(3),
});

export class LlmEvaluator implements Evaluator {
  readonly name = 'LlmEvaluator';
  private fallbackEvaluator = new RuleBasedEvaluator();

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      console.log('[LlmEvaluator] No LLM API key detected in environment. Using fallback RuleBasedEvaluator.');
      return this.fallbackEvaluator.evaluate(context);
    }

    try {
      const prompt = this.buildPrompt(context);

      if (geminiKey) {
        return await this.evaluateWithGemini(geminiKey, prompt);
      } else if (openaiKey) {
        return await this.evaluateWithOpenAI(openaiKey, prompt);
      }
    } catch (err) {
      console.error('[LlmEvaluator] LLM API call or validation failed. Falling back to RuleBasedEvaluator:', err);
    }

    return this.fallbackEvaluator.evaluate(context);
  }

  private buildPrompt(context: EvaluationContext): string {
    const { problem, submission } = context;

    return `
You are an expert Low-Level System Design (LLD) evaluator. Your task is to evaluate a learner's LLD submission objectively based on evidence, reasoning, and trade-offs rather than comparing against a rigid reference class diagram.

### Problem Context:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

### Requirements:
${problem.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

${problem.constraints ? `### Constraints:\n${problem.constraints.join('\n')}` : ''}

### Learner Submission:
${submission.getSummaryText()}

### Evaluation Instructions & Fixed Rubric:
Evaluate the submission on these 6 criteria (score each 0.0 to 10.0):
1. Requirement Understanding: Does the design address the stated problem requirements?
2. Responsibility Allocation: Are duties appropriately distributed? (Single Responsibility, avoiding god classes)
3. Abstraction and Interfaces: Are interfaces/abstractions meaningful and justified?
4. Coupling and Cohesion: Are dependencies loose and cohesion high?
5. Extensibility: Can the design accommodate future requirement changes with minimal edits?
6. Explanation and Trade-offs: Did the learner explain and justify their design decisions?

### JSON Output Format:
Return ONLY a valid JSON object matching this EXACT schema:
{
  "overallScore": 8.2,
  "criterionScores": [
    {
      "criterion": "Requirement Understanding",
      "score": 9.0,
      "evidence": "Observed evidence in submission text",
      "concern": "Optional concern if any",
      "suggestion": "Optional suggestion if any"
    }
    // Repeat for all 6 criteria
  ],
  "feedbackItems": [
    {
      "category": "Responsibility",
      "severity": "good" | "suggestion" | "concern",
      "evidence": "Exact quote or observation",
      "concern": "Why this matters or potential drawback",
      "suggestion": "Concrete actionable suggestion",
      "confidence": "HIGH"
    }
  ],
  "followUpQuestions": [
    "1 or 2 thought-provoking design questions to deepen learning"
  ]
}
`;
  }

  private async evaluateWithGemini(apiKey: string, prompt: string): Promise<EvaluationResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response content from Gemini API');
    }

    const parsed = JSON.parse(rawText);
    const validated = EvaluationResponseSchema.parse(parsed);

    return {
      ...validated,
      evaluatorType: 'LLM',
    };
  }

  private async evaluateWithOpenAI(apiKey: string, prompt: string): Promise<EvaluationResult> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error('Empty response content from OpenAI API');
    }

    const parsed = JSON.parse(rawText);
    const validated = EvaluationResponseSchema.parse(parsed);

    return {
      ...validated,
      evaluatorType: 'LLM',
    };
  }
}
