export interface RubricCriterionDefinition {
  name: string;
  description: string;
  weight: number;
}

export interface ProblemRubric {
  criteria: RubricCriterionDefinition[];
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  requirements: string[];
  constraints?: string[];
  rubric: ProblemRubric;
  createdAt?: Date;
  updatedAt?: Date;
}
