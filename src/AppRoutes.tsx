import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PracticeMode from './practice/PracticeMode';
import ExamMode from './exam/ExamMode';
import ExamResultsPage from './exam/ExamResultsPage';
import FlashcardMode from './flashcard/FlashcardMode';
import HomePage from './component/homePage';
import { Question, StatesData, ExamResultsData } from './types'; // Assuming these are the primary data types needed

interface AppRoutesProps {
    // Props for HomePage
    statesData: StatesData;
    onStartPractice: (stateCode: string) => void;
    onStartExam: (stateCode: string) => void;
    onStartFlashcards: (stateCode: string) => void;
    selectedState: string;
    onStateChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onResetState: () => void;
    selectedLanguage: string;
    onLanguageChange: (newLanguage: string) => void;

    // Props for PracticeMode
    practiceSessionQuestions: Question[];

    // Props for ExamMode
    examQuestionsForMode: Question[];
    onShowResultsPage: (results: ExamResultsData) => void;

    // Props for ExamResultsPage
    examResultsData: ExamResultsData | null;
    onRetryTest: () => void;
    onStartNewTest: () => void;

    // Props for FlashcardMode
    flashcardSessionQuestions: Question[];

    // Common props
    onNavigateHome: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
    statesData, onStartPractice, onStartExam, onStartFlashcards, selectedState, onStateChange, onResetState, selectedLanguage, onLanguageChange,
    practiceSessionQuestions,
    examQuestionsForMode, onShowResultsPage,
    examResultsData, onRetryTest, onStartNewTest,
    flashcardSessionQuestions,
    onNavigateHome
}) => {
    return (
        <Routes>
            <Route path="/" element={<HomePage
                statesData={statesData}
                onStartPractice={onStartPractice}
                onStartExam={onStartExam}
                onStartFlashcards={onStartFlashcards}
                selectedState={selectedState}
                onStateChange={onStateChange}
                onResetState={onResetState}
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
            />} />
            <Route path="/practice" element={<PracticeMode
                questions={practiceSessionQuestions}
                onNavigateHome={onNavigateHome}
                selectedLanguageCode={selectedLanguage} // Pass selectedLanguage as selectedLanguageCode
            />} />
            <Route path="/exam" element={<ExamMode
                questions={examQuestionsForMode}
                onNavigateHome={onNavigateHome}
                onShowResultsPage={onShowResultsPage}
                examDuration={3600} // This could also be a prop if it needs to be dynamic
                selectedLanguageCode={selectedLanguage} // Pass selectedLanguage
            />} />
            <Route path="/results" element={examResultsData ? <ExamResultsPage
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
            /> : <Navigate to="/" replace />} />
            <Route path="/flashcards" element={<FlashcardMode
                initialQuestions={flashcardSessionQuestions}
                onNavigateHome={onNavigateHome}
                cardDuration={15} // This could also be a prop
                selectedLanguageCode={selectedLanguage} // Pass selectedLanguage
            />} />
        </Routes>
    );
};

export default AppRoutes;
