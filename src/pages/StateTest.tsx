import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuestions, fetchStates, getQuestionsByState } from '@/utils/dataService';
import { Question } from '@/types';
import { QuestionCard } from '@/components/QuestionCard';
import { TestResults } from '@/components/TestResults';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AllQuestionsPDFButton } from "@/components/AllQuestionsPDFButton";

// Helper: get explanation for question (handles different field names & translation fallback)
function getQuestionExplanation(q: any) {
  // Prefer translation.en.context, then translations.en.context, then context, then explanation
  if (q?.translation?.en?.context && typeof q.translation.en.context === "string")
    return q.translation.en.context.trim();
  if (q?.translations?.en?.context && typeof q.translations.en.context === "string")
    return q.translations.en.context.trim();
  if (typeof q.context === "string" && q.context.trim())
    return q.context.trim();
  if (typeof q.explanation === "string" && q.explanation.trim())
    return q.explanation.trim();
  return "";
}

export const StateTest = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['states'],
    queryFn: fetchStates,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', states],
    queryFn: () => fetchQuestions(states),
    enabled: !!states && states.length > 0,
  });

  const isLoading = questionsLoading || statesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const startTest = () => {
    if (!selectedState) return;
    
    const stateQuestions = getQuestionsByState(questions, selectedState);
    setTestQuestions(stateQuestions);
    setAnswers(new Array(stateQuestions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setTestCompleted(false);
    setTestStarted(true);
    setStartTime(Date.now());
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      finishTest();
    }
  };

  const handleQuestionSelect = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    setShowExplanation(false);
  };

  const finishTest = () => {
    setTestCompleted(true);
  };

  const calculateResult = () => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === testQuestions[index]?.correct
    ).length;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    return {
      score: correctAnswers,
      total: testQuestions.length,
      passed: correctAnswers >= Math.ceil(testQuestions.length * 0.5), // 50% to pass
      timeSpent
    };
  };

  const restartTest = () => {
    setTestStarted(false);
    setSelectedState('');
  };

  if (testCompleted) {
    // Get all questions answered incorrectly for review
    const incorrect: {
      question: Question,
      userAnswer: number,
      index: number
    }[] = [];
    testQuestions.forEach((q, idx) => {
      if (answers[idx] !== q.correct) {
        incorrect.push({
          question: q,
          userAnswer: answers[idx],
          index: idx
        });
      }
    });

    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 flex flex-col items-center justify-center">
        <TestResults 
          result={calculateResult()}
          onRestart={restartTest}
          onHome={() => navigate('/')}
        />
        {incorrect.length > 0 && (
          <div className="w-full max-w-3xl mx-auto mt-10 p-0 md:p-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Question Review</CardTitle>
                <CardDescription>
                  See questions you answered incorrectly with the right answer & explanation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {incorrect.map(({ question, userAnswer, index }) => (
                  <div key={index} className="py-4 border-b last:border-b-0">
                    <div className="mb-3 font-semibold text-base">
                      Q{index + 1}. {question.question}
                    </div>
                    <ul className="mb-2">
                      {question.answers.map((ans, idx) => {
                        let style = "px-2 py-1 rounded inline-block mr-2 mb-1 border ";
                        if (idx === question.correct) {
                          style += "border-green-500 bg-green-50 text-green-900 font-bold dark:bg-green-900/20";
                        } else if (idx === userAnswer) {
                          style += "border-red-500 bg-red-50 text-red-900 font-bold dark:bg-red-900/20";
                        } else {
                          style += "border-gray-200 bg-gray-50 dark:bg-zinc-900/30";
                        }
                        return (
                          <li key={idx} className={style}>
                            {ans}
                            {idx === question.correct && <span className="ml-2 text-green-600 text-xs font-medium">(Correct)</span>}
                            {idx === userAnswer && idx !== question.correct && <span className="ml-2 text-red-600 text-xs font-medium">(Your answer)</span>}
                          </li>
                        );
                      })}
                    </ul>
                    {getQuestionExplanation(question) && (
                      <div className="text-sm mt-3 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r-md text-yellow-900 dark:text-yellow-200">
                        <span className="font-medium">Explanation: </span>{getQuestionExplanation(question)}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>State-Specific Test</CardTitle>
              <CardDescription>Practice only the official questions for your selected German state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select a German State:
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
               {/* Removed PDF Button */}
              </div>
              {selectedState && (
                <div className="text-sm text-muted-foreground">
                  Questions available: {getQuestionsByState(questions, selectedState).length}
                </div>
              )}
              <Button 
                onClick={startTest} 
                disabled={!selectedState || getQuestionsByState(questions, selectedState).length === 0}
                className="w-full"
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No questions found for the selected state.</p>
            <Button onClick={() => setTestStarted(false)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading question...</div>
      </div>
    );
  }

  const showAnswerExplanation = answers[currentQuestionIndex] !== -1 && showExplanation;

  return (
    <div className="min-h-screen bg-background dark:bg-background p-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={() => setTestStarted(false)} 
            variant="ghost"
          >
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Progress: {currentQuestionIndex + 1} / {testQuestions.length}
          </div>
        </div>

        <div className="mb-6">
          <QuestionNavigator
            totalQuestions={testQuestions.length}
            currentQuestion={currentQuestionIndex}
            answers={answers}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          selectedAnswer={answers[currentQuestionIndex]}
          onAnswerSelect={handleAnswerSelect}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={testQuestions.length}
          showExplanation={showAnswerExplanation}
        />

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleNext}
            disabled={answers[currentQuestionIndex] === -1}
          >
            {currentQuestionIndex === testQuestions.length - 1 ? 'Finish Test' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

