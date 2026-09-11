import { Evaluator, EvaluationContext, EvaluationResult, CriterionScoreResult, FeedbackItemResult } from './Evaluator';

export class RuleBasedEvaluator implements Evaluator {
  readonly name = 'RuleBasedEvaluator';

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { problem, submission } = context;
    const summaryText = submission.getSummaryText().toLowerCase();

    // 1. Requirement Understanding
    const reqMatches = problem.requirements.filter(req => {
      const keywords = req.toLowerCase().split(' ').filter(w => w.length > 3);
      return keywords.some(kw => summaryText.includes(kw));
    });
    const reqScore = Math.min(10, Math.max(5, Math.round((reqMatches.length / problem.requirements.length) * 10)));

    // 2. Responsibility Allocation
    const hasGodClass = summaryText.includes('manager') && summaryText.includes('controller') && summaryText.includes('service');
    const respScore = hasGodClass ? 6.5 : 8.0;

    // 3. Abstraction and Interfaces
    const hasInterfaceKeywords = summaryText.includes('interface') || summaryText.includes('abstract') || summaryText.includes('strategy');
    const abstractionScore = hasInterfaceKeywords ? 8.5 : 6.5;

    // 4. Coupling and Cohesion
    const mentionsCoupling = summaryText.includes('decoupl') || summaryText.includes('independ');
    const couplingScore = mentionsCoupling ? 8.5 : 7.0;

    // 5. Extensibility
    const mentionsExtensible = summaryText.includes('extensib') || summaryText.includes('factory') || summaryText.includes('strategy');
    const extensibilityScore = mentionsExtensible ? 8.5 : 7.2;

    // 6. Explanation and Trade-offs
    const explanationLen = summaryText.length;
    const explanationScore = explanationLen > 300 ? 8.5 : explanationLen > 150 ? 7.5 : 6.0;

    const criterionScores: CriterionScoreResult[] = [
      {
        criterion: 'Requirement Understanding',
        score: reqScore,
        evidence: `Addressed ${reqMatches.length} of ${problem.requirements.length} core problem requirements explicitly in the design text.`,
        suggestion: reqMatches.length < problem.requirements.length ? 'Ensure all specific requirements like edge cases or exit flows are documented.' : undefined,
      },
      {
        criterion: 'Responsibility Allocation',
        score: respScore,
        evidence: 'Classes and responsibilities were explicitly mapped out.',
        concern: hasGodClass ? 'Multiple central manager classes were identified which may aggregate too many duties.' : undefined,
        suggestion: 'Consider keeping domain entities focused on single responsibilities.',
      },
      {
        criterion: 'Abstraction and Interfaces',
        score: abstractionScore,
        evidence: hasInterfaceKeywords ? 'Used interface abstractions for flexible behaviors.' : 'Concrete classes were mostly specified without explicit interface contracts.',
        suggestion: hasInterfaceKeywords ? undefined : 'Identify components whose rules change independently and extract interfaces for them.',
      },
      {
        criterion: 'Coupling and Cohesion',
        score: couplingScore,
        evidence: mentionsCoupling ? 'Design explicitly considers loose coupling between components.' : 'Direct relationships between components were outlined.',
        suggestion: 'Keep pricing, payment, and inventory management decoupled from core domain controllers.',
      },
      {
        criterion: 'Extensibility',
        score: extensibilityScore,
        evidence: mentionsExtensible ? 'Design demonstrates flexibility for future extensions.' : 'Extensibility relies on existing class structures.',
        suggestion: 'Think about how new vehicle or spot types can be added without modifying existing logic.',
      },
      {
        criterion: 'Explanation and Trade-offs',
        score: explanationScore,
        evidence: `Provided a ${explanationLen} character explanation of design decisions.`,
        suggestion: explanationLen < 200 ? 'Elaborate more on why specific patterns or structures were chosen.' : undefined,
      },
    ];

    const overallScore = Number(
      (criterionScores.reduce((acc, c) => acc + c.score, 0) / criterionScores.length).toFixed(1)
    );

    const feedbackItems: FeedbackItemResult[] = [
      {
        category: 'Responsibility',
        severity: respScore >= 8 ? 'good' : 'concern',
        evidence: 'Classes defined in submission',
        concern: respScore < 8 ? 'Some classes combine management and business rule processing.' : 'Good separation of concerns observed overall.',
        suggestion: 'Delegate pricing and rule calculations to dedicated strategy/service objects.',
        confidence: 'HIGH',
      },
      {
        category: 'Abstraction',
        severity: hasInterfaceKeywords ? 'good' : 'suggestion',
        evidence: hasInterfaceKeywords ? 'Interface keywords detected in class list' : 'Limited interface abstractions found',
        concern: hasInterfaceKeywords ? 'Interfaces were used effectively.' : 'Hardcoding concrete classes may hinder dynamic swapping.',
        suggestion: 'Consider defining polymorphic interfaces for algorithms or state changes.',
        confidence: 'HIGH',
      },
      {
        category: 'Extensibility',
        severity: extensibilityScore >= 8 ? 'good' : 'suggestion',
        evidence: 'Extensibility rationale provided in explanation',
        concern: extensibilityScore < 8 ? 'Adding new variants may require modifying existing core classes.' : 'Design supports open-closed principle for future requirements.',
        suggestion: 'Use composition over inheritance to support new requirement variants easily.',
        confidence: 'HIGH',
      },
    ];

    const followUpQuestions = [
      `If a new variant or dynamic pricing rule is introduced tomorrow, which classes in your design would require changes?`,
      `How does your design handle concurrent state updates or capacity limits under peak load?`,
    ];

    return {
      overallScore,
      criterionScores,
      feedbackItems,
      followUpQuestions,
      evaluatorType: 'RULE_BASED',
    };
  }
}
