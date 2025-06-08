import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamMode from './ExamMode';
import '@testing-library/jest-dom';
import { Question, Option, ExamUserAnswers, ExamResultsData } from '../types'; // Import necessary types

// Mock props for ExamMode
const mockNavigateHome: jest.Mock<void, []> = jest.fn();
const mockShowResultsPage: jest.Mock<void, [ExamResultsData]> = jest.fn();

const initialQuestions: Question[] = [
    { id: 'q1', question_text: 'Q1', question_text_de: 'F1', options: [{id: 'a', text: 'A'}, {id: 'b', text: 'B'}], correct_answer: 'a', state_code: null, question_text_translation: "Q1_trans", explanation: "Exp1" },
    { id: 'q2', question_text: 'Q2', question_text_de: 'F2', options: [{id: 'c', text: 'C'}, {id: 'd', text: 'D'}], correct_answer: 'd', state_code: null, question_text_translation: "Q2_trans", explanation: "Exp2" },
];

// Define types for mocked component props
interface MockQuestionDisplayProps {
    currentQuestion: Question | null;
    examUserAnswers: ExamUserAnswers;
    handleExamAnswerSelection: (questionId: string, optId: string) => void;
    currentExamQuestionIndex: number;
    totalQuestions: number;
    isExamMode: boolean; // Added as it's a prop of QuestionDisplay
    selectedLanguageCode: string; // Added
}

jest.mock('./ExamTimer', () => () => <div data-testid="exam-timer">Exam Timer Mock</div>);
jest.mock('./QuestionDisplay', () => ({ currentQuestion, examUserAnswers, handleExamAnswerSelection, currentExamQuestionIndex, totalQuestions }: MockQuestionDisplayProps) => (
    <div data-testid="question-display">
        <p>Q {currentExamQuestionIndex + 1}/{totalQuestions}</p>
        {currentQuestion && currentQuestion.options.map((opt: Option) => (
            <button key={opt.id} onClick={() => handleExamAnswerSelection(currentQuestion!.id, opt.id)}>
                {opt.text}
            </button>
        ))}
    </div>
));
jest.mock('./ExamNavigation', () => () => <div data-testid="exam-navigation">Exam Navigation Mock</div>);

const defaultProps = {
    questions: initialQuestions,
    onNavigateHome: mockNavigateHome,
    onShowResultsPage: mockShowResultsPage,
    examDuration: 3600,
    selectedLanguageCode: 'en',
};

describe('ExamMode - Submit Confirmation Popup', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockNavigateHome.mockClear();
        mockShowResultsPage.mockClear();
    });

    test('Submit Exam button is disabled initially and enables after an answer', () => {
        render(<ExamMode {...defaultProps} />);
        // Note: The button name in ExamMode is "Submit Exam", not "Submit Check"
        expect(screen.getByRole('button', { name: 'Submit Exam' })).toBeDisabled();
        // Simulate answering a question
        fireEvent.click(screen.getAllByText('A')[0]); // Assuming 'A' is an option for the first question
        expect(screen.getByRole('button', { name: 'Submit Exam' })).toBeEnabled();
    });

    test('clicking "Submit Exam" opens confirmation popup with correct unanswered count', () => {
        render(<ExamMode {...defaultProps} />);
        // Answer one question
        fireEvent.click(screen.getAllByText('A')[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));

        expect(screen.getByText('Confirm Submission')).toBeInTheDocument();
        // One question answered, one unanswered from initialQuestions
        expect(screen.getByText(/You have 1 unanswered question\(s\). Are you sure you want to submit\?/)).toBeInTheDocument();
    });

    test('popup "No" button closes the popup', () => {
        render(<ExamMode {...defaultProps} />);
        fireEvent.click(screen.getAllByText('A')[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));

        expect(screen.getByText('Confirm Submission')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'No' }));
        expect(screen.queryByText('Confirm Submission')).not.toBeInTheDocument();
    });

    test('popup "Confirm" button calls onShowResultsPage and closes popup', () => {
        render(<ExamMode {...defaultProps} />);
        fireEvent.click(screen.getAllByText('A')[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(mockShowResultsPage).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Confirm Submission')).not.toBeInTheDocument();
    });
});
