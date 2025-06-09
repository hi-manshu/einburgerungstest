import React, { useState, useEffect, useRef } from "react";
import { logAnalyticsEvent } from "../../analytics/analytics";
import { Question, Option } from "../../types";

interface UserAnswer {
  answer: string | null;
  correct: boolean | null;
  marked: boolean;
}

interface UserAnswers {
  [questionId: string]: UserAnswer;
}

interface PracticeModeProps {
  questions: Question[];
  onNavigateHome: () => void;
  selectedLanguageCode: string;
  enablePracticeTranslation: boolean;
}

const languageMap: { [key: string]: string } = {
  en: "English",
  tr: "Türkçe",
  ru: "Русский",
  fr: "Français",
  ar: "العربية",
  uk: "Українська",
  hi: "हिन्दी",
};

const getLanguageName = (code: string): string => {
  return languageMap[code] || code;
};

// Message arrays adapted from ExamResultsPage.tsx
const perfectScoreMessages: string[] = [
  "Perfect Score! You Crushed It!",
  "Flawless Victory!",
  "Nailed It! You’re the Gold Standard!",
  "This Practice Didn’t Stand a Chance!",
  "Zero Mistakes. All Brilliance.",
];
const passedMessages: string[] = [
  "Well Done! You Passed With Style!",
  "On Point! Keep the Momentum Going!",
  "Solid Work! You’ve Got This!",
  "Good Job! Just a Few More to Perfection.",
  "You Did It—And You’re Just Getting Started!",
];
const failedMessages: string[] = [
  "Keep Practicing, You Can Do It!",
  "Not This Time—But You’re Closer Than You Think!",
  "Failure’s Just a Stepping Stone—Let’s Try Again!",
  "Missed the Mark? Reset and Fire Again!",
  "Oops! Time to Learn and Level Up!",
  "Practice Mode: Activated. Powering Up…",
];

const PracticeMode: React.FC<PracticeModeProps> = ({
  questions: initialQuestions, // These are ALL questions for the current mode (e.g. selected state + general)
  onNavigateHome,
  selectedLanguageCode,
  enablePracticeTranslation,
}) => {
  const [allQuestionsForMode, setAllQuestionsForMode] =
    useState<Question[]>(initialQuestions);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // 'questions' now stores the currently *filtered* list of questions for display/interaction
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const entryTimeRef = useRef<number | null>(null);

  useEffect(() => {
    entryTimeRef.current = Date.now();
    return () => {
      if (entryTimeRef.current) {
        const duration = Date.now() - entryTimeRef.current;
        logAnalyticsEvent("timing_complete", {
          name: "practice_mode",
          value: duration,
          event_category: "engagement",
          event_label: "time_spent_on_practice",
        });
        entryTimeRef.current = null;
      }
    };
  }, []);

  // Effect to update allQuestionsForMode and derive categories when initialQuestions prop changes
  useEffect(() => {
    setAllQuestionsForMode(initialQuestions);
    const uniqueCategories = new Set<string>();
    initialQuestions.forEach((q) => {
      // Only use 'category' field and ensure it's a non-empty string
      if (q.category && (q.category as string).trim() !== "") {
        uniqueCategories.add(q.category as string);
      }
    });
    setCategories(["All", ...Array.from(uniqueCategories)]);
    // When initialQuestions change, reset to 'All' category and let the filtering effect handle questions
    setSelectedCategory("All");
  }, [initialQuestions]);

  // Effect to filter questions when selectedCategory or allQuestionsForMode changes
  useEffect(() => {
    let filteredQuestions: Question[];
    if (selectedCategory === "All") {
      filteredQuestions = allQuestionsForMode;
    } else {
      // Filter strictly by category field
      filteredQuestions = allQuestionsForMode.filter(
        (q) => q.category === selectedCategory
      );
    }
    setQuestions(filteredQuestions);
    // Reset progress when questions/category changes
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
  }, [selectedCategory, allQuestionsForMode]);

  const currentQuestion: Question | null =
    questions && questions.length > 0 ? questions[currentQuestionIndex] : null;

  const handleAnswerSelection = (
    questionId: string,
    selectedOptionId: string
  ) => {
    if (userAnswers[questionId]?.answer) return;
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const isCorrect = selectedOptionId === question.correct_answer;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer: selectedOptionId,
        correct: isCorrect,
        marked: prev[questionId]?.marked || false,
      },
    }));
  };

  const toggleMarkForLater = (questionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { answer: null, correct: null }),
        marked: !prev[questionId]?.marked,
      },
    }));
  };

  const handleNavigate = (direction: number) => {
    const newIndex = currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
    } else if (newIndex >= questions.length) {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    // This will restart the quiz with the current set of filtered questions
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    // To reset category as well, uncomment next line:
    // setSelectedCategory('All');
  };

  // Check against allQuestionsForMode for the initial "No practice questions" message
  if (!allQuestionsForMode || allQuestionsForMode.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-xl text-gray-700 mb-4">
          No practice questions available.
        </p>
        <button
          onClick={onNavigateHome}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
        >
          Home
        </button>
      </div>
    );
  }

  if (showResults) {
    const answeredCount = Object.keys(userAnswers).filter(
      (qid) => userAnswers[qid]?.answer !== null
    ).length;
    const correctCount = Object.values(userAnswers).filter(
      (ans) => ans?.correct
    ).length;
    const markedCount = Object.values(userAnswers).filter(
      (ans) => ans?.marked
    ).length;

    const totalQuestions = questions.length;
    const scorePercentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    let messageArray: string[];
    let messageColor: string;

    if (scorePercentage === 100 && totalQuestions > 0) {
      messageArray = perfectScoreMessages;
      messageColor = "text-green-600";
    } else if (scorePercentage >= 60) {
      messageArray = passedMessages;
      messageColor = "text-green-600";
    } else {
      messageArray = failedMessages;
      messageColor = "text-red-600";
    }
    const encouragingMessage =
      messageArray[Math.floor(Math.random() * messageArray.length)];

    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Practice Results</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-lg">
          <div>Total Questions:</div>
          <div>{totalQuestions}</div>
          <div>Answered:</div>
          <div>{answeredCount}</div>
          <div>Correct:</div>
          <div className="font-semibold text-green-600">{correctCount}</div>
          <div>Marked for Review:</div>
          <div>{markedCount}</div>
          <div>Your Score:</div>
          <div className={`font-semibold ${messageColor}`}>
            {scorePercentage.toFixed(0)}%
          </div>
        </div>
        <p className={`text-xl font-semibold my-5 ${messageColor}`}>
          {encouragingMessage}
        </p>
        <div className="mt-6">
          <button
            onClick={handleRestart}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-3"
          >
            Restart
          </button>
          <button
            onClick={onNavigateHome}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center p-4">
        <p className="text-xl text-gray-700 mb-4">Loading...</p>
        <button
          onClick={onNavigateHome}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
        >
          Home
        </button>
      </div>
    );
  }

  const userAnswerInfo: UserAnswer | undefined = currentQuestion
    ? userAnswers[currentQuestion.id]
    : undefined;
  const isAnswered =
    userAnswerInfo?.answer !== null && userAnswerInfo?.answer !== undefined;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <div className="mb-4">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filter by Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Display message if no questions for selected category, but questions for the mode exist */}
      {allQuestionsForMode &&
        allQuestionsForMode.length > 0 &&
        questions.length === 0 && (
          <div className="text-center p-4">
            <p className="text-xl text-gray-700 mb-4">
              No questions available for the selected category "
              {selectedCategory}".
            </p>
          </div>
        )}

      {/* Only render question UI if there are questions to display after filtering */}
      {questions && questions.length > 0 && currentQuestion && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}{" "}
              {/* This now correctly reflects filtered count */}
            </p>
            {/* <button
              onClick={() => toggleMarkForLater(currentQuestion.id)}
              className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${
                userAnswerInfo?.marked
                  ? "bg-yellow-400 text-white border-yellow-500 hover:bg-yellow-500"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {userAnswerInfo?.marked ? "✓ Marked" : "Mark"}
            </button> */}
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-1">
            {currentQuestion.question_text}
          </h3>
          {enablePracticeTranslation &&
            currentQuestion.question_text_translation && (
              <p className="text-sm text-gray-500 mt-1 mb-4 italic">
                {`${currentQuestion.question_text_translation}`}
              </p>
            )}
          {/* START: Added image display */}
          {currentQuestion.image && (
            <div className="my-4 text-center">
              {" "}
              {/* Added text-center to center the image if it's smaller than container */}
              <img
                src={currentQuestion.image}
                alt={`Illustration for question ${currentQuestion.id}`}
                className="max-w-full h-auto rounded-md shadow-sm inline-block" // inline-block for text-center to take effect
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
                  btnClass =
                    "bg-green-100 border-green-300 text-green-700 pointer-events-none opacity-90";
                } else {
                  btnClass =
                    "border-gray-200 text-gray-500 pointer-events-none opacity-70";
                }
              }
              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    handleAnswerSelection(currentQuestion.id, opt.id)
                  }
                  disabled={isAnswered}
                  className={`option-btn block w-full text-left p-3 border rounded-md transition-all ${btnClass}`}
                >
                  <div>
                    <span className="font-bold mr-2">
                      {opt.id.toUpperCase()}.
                    </span>{" "}
                    {opt.text}
                  </div>
                  {enablePracticeTranslation && opt.text_translation && (
                    <div className="italic text-xs text-gray-500 ml-6 mt-1">
                      {`${opt.text_translation}`}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {isAnswered && userAnswerInfo && (
            <div
              className={`mt-4 p-3 rounded-md ${
                userAnswerInfo.correct
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {userAnswerInfo.correct ? "Correct!" : "Incorrect."}
              {!userAnswerInfo.correct && (
                <span>
                  {" "}
                  Correct:{" "}
                  <span className="font-bold">
                    {currentQuestion.correct_answer.toUpperCase()}
                  </span>
                  .
                </span>
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
              Prev
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => handleNavigate(1)}
                disabled={!isAnswered}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                disabled={!isAnswered}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Results
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PracticeMode;
