import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuestions, fetchStates, getNonStateQuestions, getQuestionsByState } from '@/utils/dataService';
import { Question, State } from '@/types';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Flashcards = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [sessionStarted, setSessionStarted] = useState(false);

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['states'],
    queryFn: fetchStates,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', states],
    queryFn: () => fetchQuestions(states),
    enabled: !!states && states.length > 0,
  });

  useEffect(() => {
    if (!isActive || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, showResult]);

  const startSession = () => {
    if (!selectedState) return;

    const nonStateQuestions = getNonStateQuestions(questions);
    const stateQuestions = getQuestionsByState(questions, selectedState);
    const allQuestions = [...nonStateQuestions, ...stateQuestions];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(-1);
    setShowResult(false);
    setStats({ correct: 0, incorrect: 0 });
    setSessionStarted(true);
    setIsActive(true);
    setTimeLeft(10);
  };

  const handleAnswerSelect = (answer: number) => {
    if (showResult || !isActive) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    setIsActive(false);
    
    const isCorrect = answer === shuffledQuestions[currentQuestionIndex].correct;
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));
  };

  const handleTimeUp = () => {
    if (showResult) return;
    
    setShowResult(true);
    setIsActive(false);
    setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Restart with same shuffled questions
      setCurrentQuestionIndex(0);
    }
    setSelectedAnswer(-1);
    setShowResult(false);
    setTimeLeft(10);
    setIsActive(true);
  };

  const resetSession = () => {
    setSessionStarted(false);
    setSelectedState('');
    setIsActive(false);
    setStats({ correct: 0, incorrect: 0 });
  };

  const isLoading = questionsLoading || statesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-6 h-6" />
                Flashcard Practice
              </CardTitle>
              <CardDescription>Quick-fire questions with a 10-second timer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Select a state to include its specific questions.</p>
                <p>• Questions are shuffled randomly.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select a German State
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
              </div>
              
              <Button 
                onClick={startSession} 
                className="w-full"
                disabled={!selectedState}
              >
                Start Flashcard Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Preparing questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={resetSession} 
            variant="ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            End Session
          </Button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              {stats.correct}
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              {stats.incorrect}
            </div>
          </div>
          
          <div className={`text-2xl font-mono ${timeLeft <= 3 ? 'text-red-600' : 'text-gray-700'}`}>
            {timeLeft}s
          </div>
        </div>

        <QuestionCard
          question={shuffledQuestions[currentQuestionIndex]}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          showResult={showResult}
          onNext={handleNext}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={shuffledQuestions.length}
        />

        {!showResult && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Click an answer or wait for time to run out
          </div>
        )}
      </div>
    </div>
  );
};
