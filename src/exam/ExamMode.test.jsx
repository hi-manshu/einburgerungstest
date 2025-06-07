import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamMode from './ExamMode'; // Adjust path as needed
import '@testing-library/jest-dom';

// Mock props for ExamMode
const mockNavigateHome = jest.fn();
const mockShowResultsPage = jest.fn();
const initialQuestions = [
    { id: 'q1', question_text: 'Q1', question_text_de: 'F1', options: [{id: 'a', text: 'A'}, {id: 'b', text: 'B'}], correct_answer: 'a' },
    { id: 'q2', question_text: 'Q2', question_text_de: 'F2', options: [{id: 'c', text: 'C'}, {id: 'd', text: 'D'}], correct_answer: 'd' },
];

// Mocking child components to simplify testing focus on ExamMode itself,
// especially if they have internal complexities or async operations not relevant here.
// For this test suite, we are focusing on the popup logic within ExamMode.
jest.mock('./ExamTimer', () => () => <div data-testid="exam-timer">Exam Timer Mock</div>);
jest.mock('./QuestionDisplay', () => ({ currentQuestion, examUserAnswers, handleExamAnswerSelection, currentExamQuestionIndex, totalQuestions }) => (
    <div data-testid="question-display">
        <p>Q {currentExamQuestionIndex + 1}/{totalQuestions}</p>
        {currentQuestion && currentQuestion.options.map(opt => (
            <button key={opt.id} onClick={() => handleExamAnswerSelection(currentQuestion.id, opt.id)}>
                {opt.text}
            </button>
        ))}
    </div>
));
jest.mock('./ExamNavigation', () => () => <div data-testid="exam-navigation">Exam Navigation Mock</div>);


describe('ExamMode - Submit Confirmation Popup', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockNavigateHome.mockClear();
        mockShowResultsPage.mockClear();
    });

    test('Submit Check button is disabled initially and enables after an answer', () => {
        render(
            <ExamMode
                questions={initialQuestions}
                onNavigateHome={mockNavigateHome}
                onShowResultsPage={mockShowResultsPage}
                examDuration={3600}
            />
        );
        expect(screen.getByRole('button', { name: 'Submit Check' })).toBeDisabled();
        // Simulate answering a question by clicking one of the mocked QuestionDisplay option buttons
        fireEvent.click(screen.getByText('A'));
        expect(screen.getByRole('button', { name: 'Submit Check' })).toBeEnabled();
    });

    test('clicking "Submit Check" opens confirmation popup with correct unanswered count', () => {
        render(
            <ExamMode
                questions={initialQuestions} // 2 questions total
                onNavigateHome={mockNavigateHome}
                onShowResultsPage={mockShowResultsPage}
                examDuration={3600}
            />
        );
        // Answer one question
        fireEvent.click(screen.getByText('A'));
        fireEvent.click(screen.getByRole('button', { name: 'Submit Check' }));

        expect(screen.getByText('Confirm Submission')).toBeInTheDocument();
        // One question answered, one unanswered
        expect(screen.getByText(/You have 1 unanswered question\(s\). Are you sure you want to submit\?/)).toBeInTheDocument();
    });

    test('popup "No" button closes the popup', () => {
        render(
            <ExamMode
                questions={initialQuestions}
                onNavigateHome={mockNavigateHome}
                onShowResultsPage={mockShowResultsPage}
                examDuration={3600}
            />
        );
        fireEvent.click(screen.getByText('A'));
        fireEvent.click(screen.getByRole('button', { name: 'Submit Check' }));

        expect(screen.getByText('Confirm Submission')).toBeInTheDocument(); // Popup is open
        fireEvent.click(screen.getByRole('button', { name: 'No' }));
        expect(screen.queryByText('Confirm Submission')).not.toBeInTheDocument(); // Popup is closed
    });

    test('popup "Confirm" button calls handleSubmitExam (mocked by onShowResultsPage)', () => {
        render(
            <ExamMode
                questions={initialQuestions}
                onNavigateHome={mockNavigateHome}
                onShowResultsPage={mockShowResultsPage} // This is called by handleSubmitExam
                examDuration={3600}
            />
        );
        fireEvent.click(screen.getByText('A')); // Answer a question
        fireEvent.click(screen.getByRole('button', { name: 'Submit Check' })); // Open popup
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' })); // Click confirm

        expect(mockShowResultsPage).toHaveBeenCalledTimes(1);
        // Expect popup to be closed as well
        expect(screen.queryByText('Confirm Submission')).not.toBeInTheDocument();
    });
});
