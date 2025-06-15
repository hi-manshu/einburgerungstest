
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuestions } from "@/utils/dataService";
import { Question } from "@/types";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Helper to get topics from the "category" field
function getTopicsFromQuestion(q: Question): string[] {
  const cat = (q as any).category;
  if (Array.isArray(cat)) return cat;
  if (typeof cat === "string") return [cat];
  return ["others"];
}

// Extract all unique topic keys + names from all questions
function extractUniqueCategories(questions: Question[]) {
  const categoryMap: Record<string, { key: string; name: string }> = {};
  questions.forEach((q) => {
    const cats = getTopicsFromQuestion(q);
    cats.forEach((c) => {
      if (!categoryMap[c]) {
        categoryMap[c] = { key: c, name: c.charAt(0).toUpperCase() + c.slice(1) };
      }
    });
  });
  return Object.values(categoryMap);
}

function getQuestionsByTopic(questions: Question[], topicKey: string): Question[] {
  return questions.filter((q) => getTopicsFromQuestion(q).includes(topicKey));
}

export const TopicPractice = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [started, setStarted] = useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", "all"],
    queryFn: () => fetchQuestions([]),
  });

  // Extract real topics from dataset (dynamic)
  const availableTopics = extractUniqueCategories(questions);

  // Only show the selected topic's questions if available
  const topicQuestions = selectedTopic
    ? getQuestionsByTopic(questions, selectedTopic)
    : [];

  const startPractice = () => {
    setStarted(true);
    setAnswers(new Array(topicQuestions.length).fill(-1));
    setQuestionIndex(0);
  };

  const handleAnswerSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (questionIndex < topicQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-background p-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Topic-based Practice</CardTitle>
              <CardDescription>
                Select a topic below to practice relevant questions from the citizenship test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="topic-select" className="block text-sm font-medium mb-2">
                  Choose a Topic:
                </label>
                <select
                  id="topic-select"
                  className="w-full rounded-md border p-2"
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                >
                  <option value="">Select…</option>
                  {availableTopics.map((topic) => (
                    <option value={topic.key} key={topic.key}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTopic && (
                <div className="text-sm text-muted-foreground">
                  Questions available: {topicQuestions.length}
                </div>
              )}
              <Button
                onClick={startPractice}
                disabled={!selectedTopic || topicQuestions.length === 0}
                className="w-full"
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (topicQuestions.length === 0) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No questions found for this topic.</p>
            <Button onClick={() => setStarted(false)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = topicQuestions[questionIndex];

  return (
    <div className="min-h-screen bg-background p-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button onClick={() => setStarted(false)} variant="ghost">
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Progress: {questionIndex + 1} / {topicQuestions.length}
          </div>
        </div>

        <div className="mb-6">
          <QuestionNavigator
            totalQuestions={topicQuestions.length}
            currentQuestion={questionIndex}
            answers={answers}
            onQuestionSelect={setQuestionIndex}
            testQuestions={topicQuestions}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          selectedAnswer={answers[questionIndex]}
          onAnswerSelect={handleAnswerSelect}
          questionNumber={questionIndex + 1}
          totalQuestions={topicQuestions.length}
          showExplanation={false}
        />

        <div className="mt-6 flex justify-between">
          <Button onClick={handlePrev} disabled={questionIndex === 0}>
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={questionIndex === topicQuestions.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicPractice;

