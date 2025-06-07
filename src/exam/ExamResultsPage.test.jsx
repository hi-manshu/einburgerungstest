import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamResultsPage from './ExamResultsPage'; // Adjust path as needed
import '@testing-library/jest-dom';

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
    passMark: 2,
    correctAnswersCount: 1,
    isPassed: false,
    onNavigateHome: mockNavigateHome,
    onRetryTest: mockRetryTest,
    onStartNewTest: mockStartNewTest,
};

describe('ExamResultsPage - New Layout', () => {
    beforeEach(() => {
        mockNavigateHome.mockClear();
        mockRetryTest.mockClear();
        mockStartNewTest.mockClear();
    });

    test('renders overall results correctly (e.g., score, pass/fail message)', () => {
        render(<ExamResultsPage {...baseProps} />);
        expect(screen.getByText('Exam Results')).toBeInTheDocument();
        expect(screen.getByText('Keep Practicing, You Can Do It!')).toBeInTheDocument();
        // Note: Score display might need adjustment if format changed, e.g. toFixed(0)
        expect(screen.getByText(/33% \(1\/3\)/)).toBeInTheDocument(); // Example, check actual format
    });

    test('renders numbered boxes correctly with appropriate colors', () => {
        render(<ExamResultsPage {...baseProps} />);
        const questionNumberButtons = screen.getAllByRole('button', { name: /Question \d+/ });
        expect(questionNumberButtons).toHaveLength(baseProps.questions.length);

        // Question 1 (Correct)
        expect(questionNumberButtons[0]).toHaveClass('bg-green-500');
        expect(questionNumberButtons[0]).toHaveTextContent('1');

        // Question 2 (Incorrect)
        expect(questionNumberButtons[1]).toHaveClass('bg-red-500');
        expect(questionNumberButtons[1]).toHaveTextContent('2');

        // Question 3 (Unanswered)
        expect(questionNumberButtons[2]).toHaveClass('bg-gray-300');
        expect(questionNumberButtons[2]).toHaveTextContent('3');
    });

    test('displays details for the first question by default and highlights its number box', () => {
        render(<ExamResultsPage {...baseProps} />);
        // Check highlighted box (first one by default)
        expect(screen.getByRole('button', { name: 'Question 1', pressed: true })).toBeInTheDocument();

        // Check details for Question 1
        expect(screen.getByText('Question 1 Text?')).toBeInTheDocument();
        expect(screen.getByText('Your answer:')).toHaveTextContent('Your answer: A. Opt A1');
        expect(screen.getByText('(Correct)')).toBeInTheDocument();
        expect(screen.getByText('Expl Q1')).toBeInTheDocument(); // Check explanation
    });

    test('clicking a question number updates the displayed details and highlights the box', () => {
        render(<ExamResultsPage {...baseProps} />);

        // Click Question 2's number box
        const q2Button = screen.getByRole('button', { name: 'Question 2' });
        fireEvent.click(q2Button);

        // Check highlighted box
        expect(screen.getByRole('button', { name: 'Question 2', pressed: true })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Question 1', pressed: true })).not.toBeInTheDocument();


        // Check details for Question 2
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
