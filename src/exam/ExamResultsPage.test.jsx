import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamResultsPage from './ExamResultsPage'; // Adjust path as needed
import '@testing-library/jest-dom';

// Mock callback functions
const mockNavigateHome = jest.fn();
const mockRetryTest = jest.fn();
const mockStartNewTest = jest.fn();

const baseProps = {
    questions: [
        { id: 'q1', question_text: 'Question 1?', question_text_de: 'Frage 1?', options: [{id: 'a', text: 'Opt A'}, {id: 'b', text: 'Opt B'}], correct_answer: 'a' },
        { id: 'q2', question_text: 'Question 2?', question_text_de: 'Frage 2?', options: [{id: 'c', text: 'Opt C'}, {id: 'd', text: 'Opt D'}], correct_answer: 'd' },
    ],
    userAnswers: { q1: 'a', q2: 'c' }, // q1 correct, q2 incorrect
    timeTaken: 120, // 2 minutes
    score: 50,
    passMark: 2, // Assuming 2 correct needed to pass for 2 questions
    correctAnswersCount: 1,
    onNavigateHome: mockNavigateHome,
    onRetryTest: mockRetryTest,
    onStartNewTest: mockStartNewTest,
};

describe('ExamResultsPage', () => {
    beforeEach(() => {
        // Clear mock history before each test
        mockNavigateHome.mockClear();
        mockRetryTest.mockClear();
        mockStartNewTest.mockClear();
    });

    test('renders correctly for a failing score', () => {
        render(<ExamResultsPage {...baseProps} isPassed={false} />);

        expect(screen.getByText('Exam Results')).toBeInTheDocument();
        expect(screen.getByText('Keep Practicing, You Can Do It!')).toBeInTheDocument();
        expect(screen.getByText('50% (1/2)')).toBeInTheDocument(); // Score and count
        // Check for question review section
        expect(screen.getByText(/Q1: Question 1\?/)).toBeInTheDocument();
        expect(screen.getByText(/Your answer: A. Opt A/)).toBeInTheDocument();
        expect(screen.getByText('(Correct)')).toBeInTheDocument();

        expect(screen.getByText(/Q2: Question 2\?/)).toBeInTheDocument();
        expect(screen.getByText(/Your answer: C. Opt C/)).toBeInTheDocument();
        expect(screen.getByText('(Incorrect)')).toBeInTheDocument();
        expect(screen.getByText(/Correct answer: D. Opt D/)).toBeInTheDocument();
    });

    test('renders correctly for a passing score', () => {
        render(<ExamResultsPage {...baseProps} score={100} correctAnswersCount={2} userAnswers={{ q1: 'a', q2: 'd' }} isPassed={true} />);

        expect(screen.getByText('Congratulations, You Passed!')).toBeInTheDocument();
        expect(screen.getByText('100% (2/2)')).toBeInTheDocument();
         // Check one correct answer detail
        expect(screen.getByText(/Q1: Question 1\?/)).toBeInTheDocument();
        expect(screen.queryByText('(Incorrect)')).not.toBeInTheDocument(); // No incorrect answers shown
    });

    test('calls onNavigateHome when Home button is clicked', () => {
        render(<ExamResultsPage {...baseProps} isPassed={false} />);
        fireEvent.click(screen.getByRole('button', { name: /Home/i }));
        expect(mockNavigateHome).toHaveBeenCalledTimes(1);
    });

    test('calls onRetryTest when Retry Test button is clicked', () => {
        render(<ExamResultsPage {...baseProps} isPassed={false} />);
        fireEvent.click(screen.getByRole('button', { name: /Retry Test/i }));
        expect(mockRetryTest).toHaveBeenCalledTimes(1);
    });

     test('calls onStartNewTest when New Test button is clicked', () => {
        render(<ExamResultsPage {...baseProps} isPassed={false} />);
        fireEvent.click(screen.getByRole('button', { name: /New Test/i }));
        expect(mockStartNewTest).toHaveBeenCalledTimes(1);
    });
});
