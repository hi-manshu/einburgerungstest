
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuestions, fetchStates } from "@/utils/dataService";
import { Question, State } from "@/types";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Helper: filters for "national" questions (num 1-300, no .state field)
function strictlyNational(q: Question) {
  const isNumbered = typeof q.id === "number" && q.id >= 1 && q.id <= 300;
  const notStateBound = !q.state;
  return isNumbered && notStateBound;
}

// Helper: filters for "state" questions for selected state code
function isForState(q: Question, stateCode: string) {
  return q.state === stateCode;
}

function getRandomSubset<T>(arr: T[], count: number): T[] {
  if (count >= arr.length) return arr.slice();
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const GeneralTest = () => {
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Fetch states first
  const {
    data: states = [],
    isLoading: isStatesLoading,
    error: statesError,
  } = useQuery({
    queryKey: ["states"],
    queryFn: fetchStates,
  });

  // Fetch questions after states loaded and ONLY after state selected
  const {
    data: allQuestions = [],
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useQuery({
    queryKey: ["questions", "general-test", selectedStateCode],
    // We still need states for the service, but only call when state selected.
    queryFn: () => fetchQuestions(states),
    enabled: !!selectedStateCode && states.length > 0,
  });

  // Prepare the test questions (310 = 300 national + 10 state questions for the selected state)
  const { testQuestions, nationalCount, stateCount } = useMemo(() => {
    if (!selectedStateCode || !Array.isArray(allQuestions)) {
      return { testQuestions: [], nationalCount: 0, stateCount: 0 };
    }
    // 1. Get 300 national questions (id 1-300, no state binding)
    const nationals = allQuestions.filter(strictlyNational).slice(0, 300);
    // 2. Get 10 random state-binded questions for the selected state (if available)
    const stateQs = allQuestions.filter((q) => isForState(q, selectedStateCode));
    const chosenStateQuestions = getRandomSubset(stateQs, 10);
    // 3. Combine and shuffle for display (but national q's always index 0-299, state q's 300-309)
    const combined = [...nationals, ...chosenStateQuestions];
    return {
      testQuestions: combined,
      nationalCount: nationals.length,
      stateCount: chosenStateQuestions.length,
    };
  }, [allQuestions, selectedStateCode]);

  const isLoading =
    isStatesLoading || (selectedStateCode && isQuestionsLoading);
  const totalQuestions = testQuestions.length;
  const currentQuestion = testQuestions[currentQuestionIndex];

  // Handle select answer
  const handleAnswer = (qid: number, answerIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: answerIdx,
    }));
  };

  const goToQuestion = (idx: number) => setCurrentQuestionIndex(idx);
  const goPrev = () => setCurrentQuestionIndex((idx) => (idx > 0 ? idx - 1 : idx));
  const goNext = () =>
    setCurrentQuestionIndex((idx) =>
      idx < totalQuestions - 1 ? idx + 1 : idx
    );

  // Error handling
  if (statesError)
    return (
      <div className="text-center mt-12 text-lg text-red-500 font-semibold">
        Failed to load states data.
      </div>
    );
  if (questionsError)
    return (
      <div className="text-center mt-12 text-lg text-red-500 font-semibold">
        Failed to load questions.
      </div>
    );

  return (
    <div className="container py-8 px-2 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">
        General Test – 300 Official + 10 State Questions
      </h1>

      {/* Step 1: State selector */}
      {!selectedStateCode && (
        <div className="w-full max-w-sm mx-auto bg-muted/30 p-6 rounded-lg border mb-6 shadow">
          <label
            htmlFor="state-select"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-100"
          >
            Please select your state to begin:
          </label>
          <Select
            onValueChange={(val) => {
              setSelectedStateCode(val);
              setCurrentQuestionIndex(0);
              setAnswers({});
            }}
          >
            <SelectTrigger id="state-select" className="w-full">
              <SelectValue placeholder="Choose a state…" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {states.map((state: State) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 2: Fetch questions and show test after state selected */}
      {selectedStateCode && (
        <>
          {isLoading ? (
            <div className="text-center mt-12 text-lg text-muted-foreground font-medium">
              Loading test questions…
            </div>
          ) : totalQuestions > 0 ? (
            <>
              <div className="mb-6">
                <QuestionNavigator
                  totalQuestions={totalQuestions}
                  currentQuestion={currentQuestionIndex}
                  answers={testQuestions.map((q) => answers[q.id] ?? -1)}
                  onQuestionSelect={goToQuestion}
                  testQuestions={testQuestions.map((q) => ({ correct: q.correct }))}
                />
              </div>
              <div className="w-full flex flex-col items-center">
                {currentQuestion && (
                  <QuestionCard
                    question={currentQuestion}
                    selectedAnswer={answers[currentQuestion.id] ?? -1}
                    onAnswerSelect={(ansIdx: number) =>
                      handleAnswer(currentQuestion.id, ansIdx)
                    }
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={totalQuestions}
                    pathname="/general-test"
                  />
                )}
                {/* Navigation buttons aligned to edges of the card */}
                <div className="w-full max-w-xl mx-auto relative mt-5">
                  <Button
                    onClick={goPrev}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="absolute left-0 top-0 min-w-[112px]"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center justify-center h-10">
                    <span className="text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                  </div>
                  <Button
                    onClick={goNext}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    variant="outline"
                    className="absolute right-0 top-0 min-w-[112px]"
                  >
                    Next
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Showing {nationalCount} national and {stateCount} state questions.
                </div>
              </div>
            </>
          ) : (
            <div className="text-center mt-12 text-lg text-muted-foreground font-medium">
              No test questions found for this state.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GeneralTest;
