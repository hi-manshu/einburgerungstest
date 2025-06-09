import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PracticeMode from "../src/feature/practice/PracticeMode";
import ExamMode from "../src/feature/exam/ExamMode";
import ExamResultsPage from "../src/feature/exam/ExamResultsPage";
import FlashcardMode from "./feature/flashcard/FlashcardMode";
import HomePage from "./component/HomePage";
import SettingsPage from "./component/SettingsPage";
import BummerPage from "./component/BummerPage";
import StatePracticeMode from "./feature/state-practice/StatePracticeMode";
import PracticeByCategoryMode from "./feature/practice/PracticeByCategoryMode"; // Added this
import { Question, StatesData, ExamResultsData, Language } from "./types";

interface AppRoutesProps {
  onStartPractice: (stateCode: string) => void;
  onStartExam: (stateCode: string) => void;
  onStartFlashcards: (stateCode: string) => void;
  onStartStatePractice: (stateCode: string) => void;
  onStartPracticeByCategory: () => void; // Changed: no stateCode needed

  statesData: StatesData;
  selectedState: string;
  onStateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onResetState: () => void;
  selectedLanguage: string;
  onLanguageChange: (newLanguage: string) => void;
  availableLanguages: Language[];

  practiceSessionQuestions: Question[];
  statePracticeSessionQuestions: Question[]; // New prop

  examQuestionsForMode: Question[];
  onShowResultsPage: (results: ExamResultsData) => void;

  examResultsData: ExamResultsData | null;
  onRetryTest: () => void;
  onStartNewTest: () => void;

  flashcardSessionQuestions: Question[];

  onNavigateHome: () => void;
  enablePracticeTranslation: boolean;
  onTogglePracticeTranslation: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  onStartPractice,
  onStartExam,
  onStartFlashcards,
  onStartStatePractice,
  onStartPracticeByCategory, // Added for the new card
  statesData,
  selectedState,
  onStateChange,
  onResetState,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  practiceSessionQuestions,
  statePracticeSessionQuestions, // New prop
  examQuestionsForMode,
  onShowResultsPage,
  examResultsData,
  onRetryTest,
  onStartNewTest,
  flashcardSessionQuestions,
  onNavigateHome,
  enablePracticeTranslation,
  onTogglePracticeTranslation,
}) => {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <HomePage
            onStartPractice={onStartPractice}
            onStartExam={onStartExam}
            onStartFlashcards={onStartFlashcards}
            onStartStatePractice={onStartStatePractice}
            onStartPracticeByCategory={onStartPracticeByCategory} // Pass it here
            selectedState={selectedState}
            statesData={statesData}
          />
        }
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/state-practice"
        element={
          <StatePracticeMode
            questions={statePracticeSessionQuestions}
            onNavigateHome={onNavigateHome}
            selectedLanguageCode={selectedLanguage}
            enableTranslation={enablePracticeTranslation}
          />
        }
      />
      <Route
        path="/practice"
        element={
          <PracticeMode
            questions={practiceSessionQuestions}
            onNavigateHome={onNavigateHome}
            selectedLanguageCode={selectedLanguage}
            enablePracticeTranslation={enablePracticeTranslation}
          />
        }
      />
      <Route
        path="/exam"
        element={
          <ExamMode
            questions={examQuestionsForMode}
            onNavigateHome={onNavigateHome}
            onShowResultsPage={onShowResultsPage}
            examDuration={3600}
            selectedLanguageCode={selectedLanguage}
          />
        }
      />
      <Route
        path="/results"
        element={
          examResultsData ? (
            <ExamResultsPage
              questions={examResultsData.questions}
              userAnswers={examResultsData.userAnswers}
              timeTaken={examResultsData.timeTaken}
              score={examResultsData.score}
              isPassed={examResultsData.isPassed}
              passMark={examResultsData.passMark}
              correctAnswersCount={examResultsData.correctAnswersCount}
              selectedLanguageCode={examResultsData.selectedLanguageCode}
              onNavigateHome={onNavigateHome}
              onRetryTest={onRetryTest}
              onStartNewTest={onStartNewTest}
            />
          ) : (
            <BummerPage />
          )
        }
      />
      <Route
        path="/flashcards"
        element={
          <FlashcardMode
            initialQuestions={flashcardSessionQuestions}
            onNavigateHome={onNavigateHome}
            cardDuration={15}
            selectedLanguageCode={selectedLanguage}
          />
        }
      />
      {/* Placeholder for Practice by Category */}
      <Route
        path="/practice-by-category"
        element={
          <PracticeByCategoryMode
            onNavigateHome={onNavigateHome}
            selectedLanguageCode={selectedLanguage}
            enablePracticeTranslation={enablePracticeTranslation}
          />
        }
      />
      <Route
        path="/settings"
        element={
          <SettingsPage
            statesData={statesData}
            selectedState={selectedState}
            onStateChange={onStateChange}
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
            availableLanguages={availableLanguages}
            enablePracticeTranslation={enablePracticeTranslation}
            onTogglePracticeTranslation={onTogglePracticeTranslation}
          />
        }
      />
    </Routes>
  );
};

// Simple placeholder component has been removed as it's no longer used.

export default AppRoutes;
