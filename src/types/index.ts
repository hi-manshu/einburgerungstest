
export interface Question {
  id: number;
  question: string;
  answers: string[];
  correct: number;
  state?: string;
  explanation?: string;
}

export interface State {
  code: string;
  name: string;
}

export interface TestResult {
  score: number;
  total: number;
  passed: boolean;
  timeSpent: number;
}

