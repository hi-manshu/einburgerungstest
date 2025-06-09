export interface Option {
  id: string;
  text: string;
  text_translation?: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_text_de?: string;
  question_text_translation?: string;
  options: Option[];
  correct_answer: string;
  explanation?: string;
  state_code: string | null;
  category:string;
  image?: string; // Add this line

  num?: string;
  translation?: {
    [languageCode: string]: {
      question?: string;
      a?: string;
      b?: string;
      c?: string;
      d?: string;
      context?: string;
      [key: string]: string | undefined;
    };
  };
  [key: string]: any;
}

export interface ExamUserAnswers {
  [questionId: string]: string;
}

export interface ExamResultsData {
  questions: Question[];
  userAnswers: ExamUserAnswers;
  timeTaken: number;
  score: number;
  isPassed: boolean;
  passMark: number;
  correctAnswersCount: number;
  selectedLanguageCode: string;
}

export interface ExamResultsPageProps extends ExamResultsData {
  onNavigateHome: () => void;
  onRetryTest: () => void;
  onStartNewTest: () => void;
}

export interface StatesData {
  [key: string]: string;
}

export interface RawQuestion {
  id: string;
  num?: string;
  question?: string;
  image?: string; // Add this line
  a?: string;
  b?: string;
  c?: string;
  d?: string;
  solution?: string;
  context?: string;
  category:string;
  translation?: {
    [languageCode: string]: {
      question?: string;
      a?: string;
      b?: string;
      c?: string;
      d?: string;
      context?: string;
      [key: string]: string | undefined;
    };
  };
  [key: string]: any;
}

export interface Language {
  code: string;
  name: string;
}

// Add new interface for practice mode translation settings
export interface PracticeTranslationSettings {
  enablePracticeTranslation: boolean;
  practiceTranslationLanguage: string;
}
