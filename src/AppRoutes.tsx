import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PracticeMode from "./practice/PracticeMode";
import ExamMode from "./exam/ExamMode";
import ExamResultsPage from "./exam/ExamResultsPage";
import FlashcardMode from "./flashcard/FlashcardMode";
import HomePage from "./component/HomePage";
import SettingsPage from "./component/SettingsPage";
import BummerPage from "./component/BummerPage";
import { Question, StatesData, ExamResultsData, Language } from "./types";

interface AppRoutesProps {
  onStartPractice: (stateCode: string) => void;
  onStartExam: (stateCode: string) => void;
  onStartFlashcards: (stateCode: string) => void;

  statesData: StatesData;
  selectedState: string;
  onStateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onResetState: () => void;
  selectedLanguage: string;
  onLanguageChange: (newLanguage: string) => void;
  availableLanguages: Language[];

  practiceSessionQuestions: Question[];

  examQuestionsForMode: Question[];
  onShowResultsPage: (results: ExamResultsData) => void;

  examResultsData: ExamResultsData | null;
  onRetryTest: () => void;
  onStartNewTest: () => void;

  flashcardSessionQuestions: Question[];

  onNavigateHome: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  onStartPractice,
  onStartExam,
  onStartFlashcards,
  statesData,
  selectedState,
  onStateChange,
  onResetState,
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  practiceSessionQuestions,
  examQuestionsForMode,
  onShowResultsPage,
  examResultsData,
  onRetryTest,
  onStartNewTest,
  flashcardSessionQuestions,
  onNavigateHome,
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
            selectedState={selectedState}
          />
        }
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/practice"
        element={
          <PracticeMode
            questions={practiceSessionQuestions}
            onNavigateHome={onNavigateHome}
            selectedLanguageCode={selectedLanguage}
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
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
