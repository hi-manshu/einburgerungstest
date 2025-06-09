import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PracticeMode from './PracticeMode';
import { Question } from '../../types';

// Mock logAnalyticsEvent
jest.mock('../../analytics/analytics', () => ({
  logAnalyticsEvent: jest.fn(),
}));

const mockPracticeQuestions: Question[] = [
  {
    id: 'p1',
    topic_id: 'pt1',
    chapter_id: 'pc1',
    question_text: 'Which planet is known as the Red Planet?',
    options: [
      { id: 'o1', text: 'Earth' },
      { id: 'o2', text: 'Mars' },
    ],
    correct_answer: 'o2',
    explanation: 'Mars is known as the Red Planet.',
    difficulty: 'easy',
    image: null,
  },
  {
    id: 'p2',
    topic_id: 'pt1',
    chapter_id: 'pc1',
    question_text: 'What is the largest ocean on Earth?',
    options: [
      { id: 'o1', text: 'Atlantic' },
      { id: 'o2', text: 'Pacific' },
    ],
    correct_answer: 'o2',
    explanation: 'The Pacific Ocean is the largest.',
    difficulty: 'easy',
    image: null,
  },
  {
    id: 'p3',
    topic_id: 'pt1',
    chapter_id: 'pc1',
    question_text: 'What is the chemical symbol for water?',
    options: [
      { id: 'o1', text: 'H2O' },
      { id: 'o2', text: 'CO2' },
    ],
    correct_answer: 'o1',
    explanation: 'H2O is the chemical symbol for water.',
    difficulty: 'easy',
    image: null,
  },
];

// Re-define message arrays as they are in PracticeMode.tsx for assertion
// This makes the test independent of the actual random selection,
// we just check if the displayed message belongs to the correct category.
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


const mockOnNavigateHome = jest.fn();
let originalMathRandom: any;

describe('PracticeMode', () => {
  beforeEach(() => {
    mockOnNavigateHome.mockClear();
    (jest.requireMock('../../analytics/analytics')
      .logAnalyticsEvent as jest.Mock).mockClear();
    // Mock Math.random to ensure predictable message selection
    originalMathRandom = Math.random;
    Math.random = () => 0.5; // Always pick the middle message if array length > 1
  });

  afterEach(() => {
    Math.random = originalMathRandom; // Restore original Math.random
  });

  const answerQuestion = (questionText: string, optionText: string) => {
    expect(screen.getByText(questionText)).toBeInTheDocument();
    fireEvent.click(screen.getByText(optionText));
  };

  const navigateToNextOrResults = () => {
    const nextButton = screen.queryByRole('button', { name: /Next/i });
    if (nextButton) {
      fireEvent.click(nextButton);
    } else {
      const resultsButton = screen.getByRole('button', { name: /Results/i });
      fireEvent.click(resultsButton);
    }
  };

  test('displays perfect score (100%) message correctly', () => {
    render(
      <PracticeMode
        questions={mockPracticeQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enablePracticeTranslation={false}
      />
    );

    answerQuestion('Which planet is known as the Red Planet?', 'Mars'); // Correct
    navigateToNextOrResults();
    answerQuestion('What is the largest ocean on Earth?', 'Pacific'); // Correct
    navigateToNextOrResults();
    answerQuestion('What is the chemical symbol for water?', 'H2O'); // Correct
    navigateToNextOrResults(); // Go to results

    expect(screen.getByText('Practice Results')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    // Check if one of the perfect score messages is present
    const perfectMessage = perfectScoreMessages[Math.floor(0.5 * perfectScoreMessages.length)];
    expect(screen.getByText(perfectMessage)).toBeInTheDocument();
    expect(screen.getByText(perfectMessage)).toHaveClass('text-green-600');
  });

  test('displays passed score (>=60%) message correctly', () => {
    render(
      <PracticeMode
        questions={mockPracticeQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enablePracticeTranslation={false}
      />
    );

    answerQuestion('Which planet is known as the Red Planet?', 'Mars'); // Correct (Q1)
    navigateToNextOrResults();
    answerQuestion('What is the largest ocean on Earth?', 'Pacific'); // Correct (Q2)
    navigateToNextOrResults();
    answerQuestion('What is the chemical symbol for water?', 'CO2'); // Incorrect (Q3)
    navigateToNextOrResults(); // Go to results

    expect(screen.getByText('Practice Results')).toBeInTheDocument();
    const score = Math.round((2 / 3) * 100); // 67%
    expect(screen.getByText(`${score}%`)).toBeInTheDocument();
    const passedMessage = passedMessages[Math.floor(0.5 * passedMessages.length)];
    expect(screen.getByText(passedMessage)).toBeInTheDocument();
    expect(screen.getByText(passedMessage)).toHaveClass('text-green-600');
  });

  test('displays failed score (<60%) message correctly', () => {
    render(
      <PracticeMode
        questions={mockPracticeQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enablePracticeTranslation={false}
      />
    );

    answerQuestion('Which planet is known as the Red Planet?', 'Mars'); // Correct (Q1)
    navigateToNextOrResults();
    answerQuestion('What is the largest ocean on Earth?', 'Atlantic'); // Incorrect (Q2)
    navigateToNextOrResults();
    answerQuestion('What is the chemical symbol for water?', 'CO2'); // Incorrect (Q3)
    navigateToNextOrResults(); // Go to results

    expect(screen.getByText('Practice Results')).toBeInTheDocument();
    const score = Math.round((1 / 3) * 100); // 33%
    expect(screen.getByText(`${score}%`)).toBeInTheDocument();
    const failedMessage = failedMessages[Math.floor(0.5 * failedMessages.length)];
    expect(screen.getByText(failedMessage)).toBeInTheDocument();
    expect(screen.getByText(failedMessage)).toHaveClass('text-red-600');
  });

  test('restarts practice correctly when "Restart" is clicked from results', () => {
    render(
      <PracticeMode
        questions={mockPracticeQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enablePracticeTranslation={false}
      />
    );

    // Answer one question and go to results
    answerQuestion('Which planet is known as the Red Planet?', 'Mars');
    navigateToNextOrResults();
    answerQuestion('What is the largest ocean on Earth?', 'Atlantic');
    navigateToNextOrResults();
    answerQuestion('What is the chemical symbol for water?', 'CO2');
    navigateToNextOrResults(); // Show results

    expect(screen.getByText('Practice Results')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Restart/i }));

    // Check that UI reverts to the first question
    expect(screen.getByText('Which planet is known as the Red Planet?')).toBeInTheDocument();
    expect(screen.getByText('Q 1/3')).toBeInTheDocument(); // Progress indicator

    // Check that results UI is hidden
    expect(screen.queryByText('Practice Results')).not.toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument(); // Score from previous attempt

    // Check an option is clickable
    const firstOptionQ1 = screen.getByText('Mars');
    expect(firstOptionQ1).not.toHaveClass('pointer-events-none');
    fireEvent.click(firstOptionQ1);
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  test('calls onNavigateHome when "Home" button is clicked from results', () => {
     render(
      <PracticeMode
        questions={mockPracticeQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enablePracticeTranslation={false}
      />
    );
    // Go to results
    fireEvent.click(screen.getByRole('button', { name: /Results/i }));


    fireEvent.click(screen.getByRole('button', { name: /Home/i }));
    expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
  });

  test('handles empty or no questions gracefully', () => {
    render(
      <PracticeMode
        questions={[]}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enablePracticeTranslation={false}
      />
    );
    expect(screen.getByText(/No practice questions available/i)).toBeInTheDocument();
  });
});
