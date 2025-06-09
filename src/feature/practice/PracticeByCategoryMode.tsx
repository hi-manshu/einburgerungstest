import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Question } from "../../types"; // Assuming Question type is in src/types.ts
import QuestionDisplay from "../exam/QuestionDisplay"; // Reusing QuestionDisplay

interface PracticeByCategoryModeProps {
  onNavigateHome: () => void;
  selectedLanguageCode: string;
  enablePracticeTranslation: boolean; // Though QuestionDisplay handles its own translation logic based on isExamMode
}

const PracticeByCategoryMode: React.FC<PracticeByCategoryModeProps> = ({
  onNavigateHome,
  selectedLanguageCode,
  enablePracticeTranslation, // This might be used to conditionally show translations if QuestionDisplay is adapted
}) => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questionsForDisplay, setQuestionsForDisplay] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/data/question.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Question[] = await response.json();
        setAllQuestions(data);

        // Extract categories - assuming 'category' property exists or using 'state_code' as fallback
        const uniqueCategories = new Set<string>();
        data.forEach(q => {
          if (q.category) { // Prefer 'category' if it exists
            uniqueCategories.add(q.category as string);
          } else if (q.state_code) { // Fallback to state_code
            // Potentially map state_code to a more readable category name if needed
            uniqueCategories.add(q.state_code);
          }
        });
        setCategories(["Show All", ...Array.from(uniqueCategories)]);
        setQuestionsForDisplay(data); // Initially show all questions
        setSelectedCategory("Show All");

      } catch (e) {
        if (e instanceof Error) {
          setError(`Failed to load questions: ${e.message}`);
        } else {
          setError("Failed to load questions due to an unknown error.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    if (category === null || category === "Show All") {
      setQuestionsForDisplay(allQuestions);
    } else {
      setQuestionsForDisplay(allQuestions.filter(q => (q.category as string === category) || q.state_code === category));
    }
  }, [allQuestions]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsForDisplay.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading questions...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  const currentQuestion = questionsForDisplay[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Practice by Category</h1>
        <button
          onClick={onNavigateHome}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Back to Home
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Select a Category:</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`py-2 px-4 rounded shadow transition-colors
                ${selectedCategory === category
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {questionsForDisplay.length > 0 && currentQuestion ? (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <QuestionDisplay
            currentQuestion={currentQuestion}
            examUserAnswers={{}} // Not tracking answers in this component via QuestionDisplay
            handleExamAnswerSelection={() => {}} // Dummy function
            currentExamQuestionIndex={currentQuestionIndex}
            totalQuestions={questionsForDisplay.length}
            isExamMode={false} // Important for QuestionDisplay's rendering logic
            selectedLanguageCode={selectedLanguageCode}
          />
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questionsForDisplay.length - 1}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-10">
          {selectedCategory && selectedCategory !== "Show All"
            ? `No questions found for "${selectedCategory}".`
            : "No questions available for display."}
        </p>
      )}
    </div>
  );
};

export default PracticeByCategoryMode;
