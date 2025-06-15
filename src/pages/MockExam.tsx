import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQuestions, fetchStates, generateMockExam } from '@/utils/dataService';
import { Question, State } from '@/types';
import { QuestionCard } from '@/components/QuestionCard';
import { TestResults } from '@/components/TestResults';
import { QuestionNavigator } from '@/components/QuestionNavigator';
import { Timer } from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SponsorCard } from "@/components/SponsorCard";
import { jsPDF } from "jspdf";

export const MockExam = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [showSponsor, setShowSponsor] = useState(false);
  const [sponsorShown, setSponsorShown] = useState(false);

  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ['states'],
    queryFn: fetchStates,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', states],
    queryFn: ({ queryKey }) => fetchQuestions(queryKey[1] as State[]),
    enabled: !!states && states.length > 0,
  });

  const startExam = () => {
    if (!selectedState) return;
    
    const examQuestions = generateMockExam(questions, selectedState);
    setTestQuestions(examQuestions);
    setAnswers(new Array(33).fill(-1));
    setTestStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  // change handleNext only to step, not finish the exam
  const handleNext = () => {
    // Sponsor logic: show after answering question 9 (i.e. moving to 10th), show only once per session
    if (
      currentQuestionIndex === 9 && // user on Q10 (index 9, 0-based)
      !sponsorShown
    ) {
      setShowSponsor(true);
      setSponsorShown(true);
      // Don't advance to next question yet, wait until sponsor is dismissed
      return;
    }
    if (currentQuestionIndex < 32) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    // Remove finishExam from handleNext so user can finish from anywhere
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
  };

  const finishExam = () => {
    setTestCompleted(true);
  };

  const handleTimeUp = () => {
    finishExam();
  };

  const calculateResult = () => {
    const correctAnswers = answers.filter((answer, index) => 
      answer === testQuestions[index]?.correct
    ).length;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    return {
      score: correctAnswers,
      total: 33,
      passed: correctAnswers >= 17, // Need 17 out of 33 to pass
      timeSpent
    };
  };

  const restartExam = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(33).fill(-1));
    setTestCompleted(false);
    setTestStarted(false);
  };

  const isLoading = statesLoading || questionsLoading;

  // --- PDF Generation ---
  const handleDownloadPDF = async () => {
    // Helper to get image url safely from an unknown structure
    function getImageFromQuestion(q: Question): string | undefined {
      if ("image" in q && typeof (q as any).image === "string" && (q as any).image !== "-") {
        return (q as any).image as string;
      }
      return undefined;
    }

    const doc = new jsPDF();
    doc.setFontSize(12);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const padding = 10;
    const colGap = 8;
    const colWidth = (pageWidth - padding * 2 - colGap) / 2;
    const startY = 20;

    let leftColY = startY;
    let rightColY = startY;

    if (!testQuestions || testQuestions.length === 0) {
      doc.text("No questions available.", 10, 10);
    } else {
      doc.text("Mock Exam: All Questions with Correct Answers", padding, 10);

      for (let i = 0; i < testQuestions.length; i++) {
        const q = testQuestions[i];

        // Pick column with less height so far
        let col = leftColY <= rightColY ? 0 : 1;
        let x = padding + col * (colWidth + colGap);
        let y = col === 0 ? leftColY : rightColY;

        // Estimate the required space for this question card
        let spaceNeeded = 7; // question
        const imageUrl = getImageFromQuestion(q);
        if (imageUrl) spaceNeeded += 22;
        spaceNeeded += (q.answers.length * 6 + 4);

        // Add page if this question doesn't fit on the column
        if (y + spaceNeeded > pageHeight - 12) {
          doc.addPage();
          leftColY = startY;
          rightColY = startY;
          col = 0;
          x = padding;
          y = leftColY;
        }

        // Question text
        doc.setTextColor(0, 0, 0).setFont("helvetica", "normal");
        doc.text(`${i + 1}. ${q.question}`, x, y, { maxWidth: colWidth });
        y += 7;

        // Add image if available
        if (imageUrl) {
          try {
            const imageDataUrl = await fetch(imageUrl)
              .then(response => response.blob())
              .then(blob => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              }));
            doc.addImage(imageDataUrl, "JPEG", x, y, colWidth * 0.9, 20, undefined, "FAST");
            y += 22;
          } catch {
            // fail silently if image cannot be fetched (CORS, etc)
          }
        }

        // Answers: correct bold italic green, rest normal
        q.answers.forEach((ans, idx) => {
          if (idx === q.correct) {
            doc.setTextColor(0, 128, 0); // green
            doc.setFont("helvetica", "bolditalic");
            doc.text(`✅ ${String.fromCharCode(65 + idx)}. ${ans}`, x + 6, y, { maxWidth: colWidth - 6 });
          } else {
            doc.setTextColor(40, 40, 40);
            doc.setFont("helvetica", "normal");
            doc.text(`${String.fromCharCode(65 + idx)}. ${ans}`, x + 6, y, { maxWidth: colWidth - 6 });
          }
          y += 6;
        });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);

        y += 4;

        // Commit y change back to the correct column tracker
        if (col === 0) {
          leftColY = y;
        } else {
          rightColY = y;
        }
      }
    }

    doc.save("mock_exam_questions.pdf");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 flex items-center justify-center">
        <div className="w-full">
          <TestResults 
            result={calculateResult()}
            onRestart={restartExam}
            onHome={() => navigate('/')}
          />
          {/* Removed PDF Download button here */}
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Official Mock Exam</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• 33 questions total (30 general + 3 state-specific)</p>
                <p>• 60 minutes time limit</p>
                <p>• You need 17 correct answers to pass</p>
                <p>• This simulates the real citizenship test</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select your German State:
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
                onClick={startExam} 
                disabled={!selectedState}
                className="w-full"
              >
                Start Mock Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Error Loading Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn't load the questions for the mock exam.</p>
            <p className="text-sm text-muted-foreground mt-2">
              There might be an issue with the question data file.
            </p>
            <Button 
              onClick={restartExam} 
              className="w-full mt-4"
            >
              Back to State Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background p-4 py-6">
      {showSponsor && (
        <SponsorCard
          onClose={() => setShowSponsor(false)}
        />
      )}
      <div className={`max-w-4xl mx-auto ${showSponsor ? "blur-sm pointer-events-none select-none" : ""}`}>
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={() => setTestStarted(false)} 
            variant="ghost"
          >
            Back
          </Button>
          
          <Timer 
            duration={3600}
            onTimeUp={handleTimeUp}
            isActive={true}
          />
          
          <div className="text-sm text-muted-foreground">
            Question: {currentQuestionIndex + 1} / 33
          </div>
        </div>
        <div className="mb-6">
          <QuestionNavigator
            totalQuestions={33}
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
          totalQuestions={33}
        />
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <Button 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleNext}
              disabled={currentQuestionIndex === 32 || answers[currentQuestionIndex] === -1}
              variant="default"
            >
              Next
            </Button>
            <Button
              onClick={finishExam}
              variant="destructive"
            >
              Finish Exam
            </Button>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground">
            Answered: {answers.filter(a => a !== -1).length} / 33
          </div>
        </div>
      </div>
    </div>
  );
};
