// src/feature/state-practice/StatePracticeMode.tsx
import React, { useState, useEffect } from "react";
import { Question, Option } from "../../types"; // Ensure this path is correct
// import { logAnalyticsEvent } from "../../analytics/analytics"; // If adding analytics

interface StatePracticeModeProps {
  questions: Question[];
  onNavigateHome: () => void;
  selectedLanguageCode: string;
}

// Minimal UserAnswer type for this mode
interface UserAnswer {
  answer: string | null;
  correct: boolean | null;
}
interface UserAnswers {
  [questionId: string]: UserAnswer;
}

const StatePracticeMode: React.FC<StatePracticeModeProps> = ({
  questions,
  onNavigateHome,
  selectedLanguageCode,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});

  // Reset state if questions prop changes (e.g., user goes home and starts a new session for a different state)
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  }, [questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-xl text-gray-700 mb-4">
          No specific practice questions available for this state, or an error occurred.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswerInfo = userAnswers[currentQuestion.id];
  const isAnswered = userAnswerInfo?.answer !== null && userAnswerInfo?.answer !== undefined;

  const handleAnswerSelection = (questionId: string, selectedOptionId: string) => {
    if (userAnswers[questionId]?.answer) return; // Already answered
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const isCorrect = selectedOptionId === question.correct_answer;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { answer: selectedOptionId, correct: isCorrect },
    }));
  };

  const handleNavigate = (direction: number) => {
    const newIndex = currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
    }
    // No automatic navigation to results or home. User uses main navigation or provided home button.
  };

  // Basic JSX structure (adapt from PracticeMode.tsx, simplifying as needed)
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <p className="text-sm text-gray-600 mb-3">
        State Practice: Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <h3 className="text-lg md:text-xl font-semibold mb-1">
        {currentQuestion.question_text}
      </h3>
      {currentQuestion.question_text_translation && (
        <p className="text-sm text-gray-500 mt-1 mb-4 italic">
          {currentQuestion.question_text_translation}
        </p>
      )}
      {/* START: Added image display */}
      {currentQuestion.image && (
        <div className="my-4 text-center">
          <img
            src={currentQuestion.image}
            alt={`Illustration for question ${currentQuestion.id}`}
            className="max-w-full h-auto rounded-md shadow-sm inline-block"
          />
        </div>
      )}
      {/* END: Added image display */}
      <div className="space-y-3">
        {currentQuestion.options.map((opt: Option) => {
          let btnClass = "border-gray-300 hover:bg-gray-100 text-gray-800";
          if (isAnswered && userAnswerInfo) {
            if (opt.id === userAnswerInfo.answer) {
              btnClass = userAnswerInfo.correct
                ? "bg-green-200 border-green-400 text-green-800 pointer-events-none"
                : "bg-red-200 border-red-400 text-red-800 pointer-events-none";
            } else if (opt.id === currentQuestion.correct_answer) {
              btnClass = "bg-green-100 border-green-300 text-green-700 pointer-events-none opacity-90";
            } else {
              btnClass = "border-gray-200 text-gray-500 pointer-events-none opacity-70";
            }
          }
          return (
            <button
              key={opt.id}
              onClick={() => handleAnswerSelection(currentQuestion.id, opt.id)}
              disabled={isAnswered}
              className={`option-btn block w-full text-left p-3 border rounded-md transition-all ${btnClass}`}
            >
              <div>
                <span className="font-bold mr-2">{opt.id.toUpperCase()}.</span> {opt.text}
              </div>
              {opt.text_translation && (
                <div className="italic text-xs text-gray-500 ml-6 mt-1">
                  {opt.text_translation}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {isAnswered && userAnswerInfo && (
        <div
          className={`mt-4 p-3 rounded-md ${userAnswerInfo.correct ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {userAnswerInfo.correct ? "Correct!" : "Incorrect."}
          {!userAnswerInfo.correct && (
            <span> Correct answer: <span className="font-bold">{currentQuestion.correct_answer.toUpperCase()}</span>.</span>
          )}
          {currentQuestion.explanation && (
            <p className="text-sm mt-1">{currentQuestion.explanation}</p>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-between items-center mb-2">
        <button
          onClick={() => handleNavigate(-1)}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => handleNavigate(1)}
          disabled={currentQuestionIndex === questions.length - 1 || !isAnswered}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StatePracticeMode;
