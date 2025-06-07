import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamResultsPage from './ExamResultsPage'; // Adjust path as needed
import '@testing-library/jest-dom';

// Redefine message arrays for testing
const perfectScoreMessages = [
    "Perfect Score! You Crushed It!", "Flawless Victory!",
    "33 Out of 33? You're a Legend!", "Nailed It! You’re the Gold Standard!",
    "This Test Didn’t Stand a Chance!", "Zero Mistakes. All Brilliance."
];
const passedMessages = [
    "Well Done! You Passed With Style!", "On Point! Keep the Momentum Going!",
    "Solid Work! You’ve Got This!", "Pass Unlocked—Next Level Awaits!",
    "Good Job! Just a Few More to Perfection.", "You Did It—And You’re Just Getting Started!"
];
const failedMessages = [
    "Keep Practicing, You Can Do It!", "Not This Time—But You’re Closer Than You Think!",
    "Failure’s Just a Stepping Stone—Let’s Try Again!", "Missed the Mark? Reset and Fire Again!",
    "Oops! Time to Learn and Level Up!", "Practice Mode: Activated. Powering Up…"
];


// Mock callback functions
const mockNavigateHome = jest.fn();
const mockRetryTest = jest.fn();
const mockStartNewTest = jest.fn();

const baseQuestions = [
    { id: 'q1', question_text: 'Question 1 Text?', question_text_de: 'Frage 1 Text?', options: [{id: 'a', text: 'Opt A1'}, {id: 'b', text: 'Opt B1'}], correct_answer: 'a', explanation: 'Expl Q1' },
    { id: 'q2', question_text: 'Question 2 Text?', question_text_de: 'Frage 2 Text?', options: [{id: 'c', text: 'Opt C2'}, {id: 'd', text: 'Opt D2'}], correct_answer: 'd', explanation: 'Expl Q2' },
    { id: 'q3', question_text: 'Question 3 Text?', question_text_de: 'Frage 3 Text?', options: [{id: 'e', text: 'Opt E3'}, {id: 'f', text: 'Opt F3'}], correct_answer: 'e', explanation: 'Expl Q3' },
];

const baseProps = {
    questions: baseQuestions,
    // q1 correct, q2 incorrect, q3 unanswered
    userAnswers: { q1: 'a', q2: 'c' },
    timeTaken: 120,
    score: 33.33, // 1 out of 3
    passMark: 2, // passMark is number of correct answers needed.
    correctAnswersCount: 1, // This matches userAnswers
    isPassed: false, // 1 correct is less than passMark 2
    onNavigateHome: mockNavigateHome,
    onRetryTest: mockRetryTest,
    onStartNewTest: mockStartNewTest,
};

describe('ExamResultsPage - New Layout & Messages', () => {
    beforeEach(() => {
        mockNavigateHome.mockClear();
        mockRetryTest.mockClear();
        mockStartNewTest.mockClear();
    });

    test('renders general info (title, score) correctly', () => {
        render(<ExamResultsPage {...baseProps} />);
        expect(screen.getByText('Exam Results')).toBeInTheDocument();
        // Score display based on component: score.toFixed(0)}% ({correctAnswersCount}/{questions.length})
        // For baseProps: 33.33.toFixed(0) = 33. correctAnswersCount = 1. questions.length = 3.
        expect(screen.getByText("33% (1/3)")).toBeInTheDocument();
    });

    test('renders correctly for a failing score with a random message', () => {
        render(<ExamResultsPage {...baseProps} isPassed={false} />); // baseProps is already failing
        const outcomeElement = screen.getByText((content, element) => failedMessages.includes(element.textContent));
        expect(outcomeElement).toBeInTheDocument();
        expect(outcomeElement).toHaveClass('text-red-600'); // Check color class
    });

    test('renders correctly for a passing score (but not perfect) with a random message', () => {
        const passingProps = {
            ...baseProps,
            isPassed: true,
            correctAnswersCount: 2,
            userAnswers: { q1: 'a', q2: 'd' }, // q1, q2 correct
            score: 66.67, // 2 out of 3
        };
        render(<ExamResultsPage {...passingProps} />);
        const outcomeElement = screen.getByText((content, element) => passedMessages.includes(element.textContent));
        expect(outcomeElement).toBeInTheDocument();
        expect(outcomeElement).toHaveClass('text-green-600'); // Check color class
    });

    test('renders correctly for a perfect score with a random message', () => {
        const perfectScoreProps = {
            ...baseProps,
            isPassed: true,
            correctAnswersCount: baseQuestions.length,
            userAnswers: { q1: 'a', q2: 'd', q3: 'e' }, // All 3 correct
            score: 100,
        };
        render(<ExamResultsPage {...perfectScoreProps} />);

        let expectedPerfectMessages = perfectScoreMessages.map(msg => {
            if (msg === "33 Out of 33? You're a Legend!" && perfectScoreProps.questions.length !== 33) {
                return `Perfect Score! ${perfectScoreProps.questions.length} out of ${perfectScoreProps.questions.length}! You're a Legend!`;
            }
            return msg;
        });

        const outcomeElement = screen.getByText((content, element) => expectedPerfectMessages.includes(element.textContent));
        expect(outcomeElement).toBeInTheDocument();
        expect(outcomeElement).toHaveClass('text-green-600'); // Check color class
    });


    test('renders numbered boxes correctly with appropriate colors (unanswered is red)', () => {
        render(<ExamResultsPage {...baseProps} />);
        const questionNumberButtons = screen.getAllByRole('button', { name: /Question \d+/ });
        expect(questionNumberButtons).toHaveLength(baseProps.questions.length);

        // Question 1 (Correct)
        expect(questionNumberButtons[0]).toHaveClass('bg-green-500');

        // Question 2 (Incorrect)
        expect(questionNumberButtons[1]).toHaveClass('bg-red-500');

        // Question 3 (Unanswered - now should be red)
        expect(questionNumberButtons[2]).toHaveClass('bg-red-500');
    });

    test('displays details for the first question by default and highlights its number box', () => {
        render(<ExamResultsPage {...baseProps} />);
        expect(screen.getByRole('button', { name: 'Question 1', pressed: true })).toBeInTheDocument();
        expect(screen.getByText('Question 1 Text?')).toBeInTheDocument();
        expect(screen.getByText('Your answer:')).toHaveTextContent('Your answer: A. Opt A1');
        expect(screen.getByText('(Correct)')).toBeInTheDocument();
        expect(screen.getByText('Expl Q1')).toBeInTheDocument();
    });

    test('clicking a question number updates the displayed details and highlights the box', () => {
        render(<ExamResultsPage {...baseProps} />);
        const q2Button = screen.getByRole('button', { name: 'Question 2' });
        fireEvent.click(q2Button);

        expect(screen.getByRole('button', { name: 'Question 2', pressed: true })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Question 1', pressed: true })).not.toBeInTheDocument();
        expect(screen.getByText('Question 2 Text?')).toBeInTheDocument();
        expect(screen.getByText('Your answer:')).toHaveTextContent('Your answer: C. Opt C2');
        expect(screen.getByText('(Incorrect)')).toBeInTheDocument();
        expect(screen.getByText('Correct answer:')).toHaveTextContent('Correct answer: D. Opt D2');
        expect(screen.getByText('Expl Q2')).toBeInTheDocument();
    });

    test('displays details for an unanswered question correctly', () => {
        render(<ExamResultsPage {...baseProps} />);
        const q3Button = screen.getByRole('button', { name: 'Question 3' });
        fireEvent.click(q3Button);

        expect(screen.getByText('Question 3 Text?')).toBeInTheDocument();
        expect(screen.getByText('You did not answer this question.')).toBeInTheDocument();
        expect(screen.getByText('Correct answer:')).toHaveTextContent('Correct answer: E. Opt E3');
        expect(screen.getByText('Expl Q3')).toBeInTheDocument();
    });

    test('navigation buttons (Home, Retry, New Test) still work', () => {
        render(<ExamResultsPage {...baseProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Home/i }));
        expect(mockNavigateHome).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: /Retry Test/i }));
        expect(mockRetryTest).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: /New Test/i }));
        expect(mockStartNewTest).toHaveBeenCalledTimes(1);
    });
});
