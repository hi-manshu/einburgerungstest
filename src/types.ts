// src/types.ts

export interface Option {
    id: string;
    text: string;
    text_translation?: string; // Made optional to be consistent
}

export interface Question {
    id: string;
    question_text: string;
    question_text_de?: string; // German text specifically for results page if needed
    question_text_translation?: string; // Optional
    options: Option[];
    correct_answer: string;
    explanation?: string; // Optional
    state_code: string | null;
    // Raw data properties that might be accessed during transformation or display
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
    [key: string]: any; // For other potential properties from raw JSON
}

export interface ExamUserAnswers {
    [questionId: string]: string; // questionId: selectedOptionId
}

// Data structure for exam results
export interface ExamResultsData {
    questions: Question[];
    userAnswers: ExamUserAnswers;
    timeTaken: number;
    score: number; // Percentage
    isPassed: boolean;
    passMark: number; // Percentage, e.g., 51.51 for (17/33)*100
    correctAnswersCount: number;
    selectedLanguageCode: string;
}

// Props for the ExamResultsPage component
export interface ExamResultsPageProps extends ExamResultsData {
    onNavigateHome: () => void;
    onRetryTest: () => void;
    onStartNewTest: () => void;
}

// For states data in App.tsx and HomePage.tsx
export interface StatesData {
    [key: string]: string; // e.g., { "BW": "Baden-Württemberg", ... }
}

// RawQuestion structure from initial fetch in App.tsx
export interface RawQuestion {
    id: string;
    num?: string;
    question?: string;
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    solution?: string;
    context?: string;
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
