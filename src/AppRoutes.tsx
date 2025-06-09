import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PracticeMode from "../src/feature/practice/PracticeMode";
import ExamMode from "../src/feature/exam/ExamMode";
import ExamResultsPage from "../src/feature/exam/ExamResultsPage";
import FlashcardMode from "./feature/flashcard/FlashcardMode";
import HomePage from "./component/HomePage";
import SettingsPage from "./component/SettingsPage";
import BummerPage from "./component/BummerPage";
import StatePracticeMode from "./feature/state-practice/StatePracticeMode"; // Add this
import { Question, StatesData, ExamResultsData, Language } from "./types";

interface AppRoutesProps {
  onStartPractice: (stateCode: string) => void;
  onStartExam: (stateCode: string) => void;
  onStartFlashcards: (stateCode: string) => void;
  onStartStatePractice: (stateCode: string) => void; // New prop

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
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  onStartPractice,
  onStartExam,
  onStartFlashcards,
  onStartStatePractice, // New prop
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
            onStartStatePractice={onStartStatePractice} // Pass it here
            selectedState={selectedState}
            statesData={statesData} // Pass statesData
          />
        }
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route
        path="/state-practice"
        element={
          // Replace with actual StatePracticeMode component once created
          // For now, to make this file syntactically valid if StatePracticeMode is not yet defined,
          // we might put a placeholder or ensure the component is created in the next step.
          // Assuming StatePracticeMode will be similar to PracticeMode:
          /*
          <StatePracticeMode
            questions={statePracticeSessionQuestions}
            onNavigateHome={onNavigateHome}
            selectedLanguageCode={selectedLanguage}
          />
          */
          // To prevent errors in this subtask as StatePracticeMode.tsx doesn't exist yet,
          // I will use PracticeMode as a placeholder, but this will be changed in the next step.
          // This is a temporary measure to ensure the subtask can complete.
          <StatePracticeMode // Update this
            questions={statePracticeSessionQuestions}
            onNavigateHome={onNavigateHome}
            selectedLanguageCode={selectedLanguage}
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
