import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatePracticeMode from './StatePracticeMode';
import { Question } from '../../types';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    topic_id: 't1',
    chapter_id: 'c1',
    question_text: 'What is the capital of France?',
    question_text_translation: 'Quelle est la capitale de la France?',
    options: [
      { id: 'o1', text: 'Paris', text_translation: 'Paris' },
      { id: 'o2', text: 'London', text_translation: 'Londres' },
    ],
    correct_answer: 'o1',
    explanation: 'Paris is the capital of France.',
    difficulty: 'easy',
    image: null,
  },
  {
    id: 'q2',
    topic_id: 't1',
    chapter_id: 'c1',
    question_text: 'What is 2 + 2?',
    question_text_translation: 'Qu\'est-ce que 2 + 2?',
    options: [
      { id: 'o1', text: '3', text_translation: '3' },
      { id: 'o2', text: '4', text_translation: '4' },
    ],
    correct_answer: 'o2',
    explanation: '2 + 2 equals 4.',
    difficulty: 'easy',
    image: null,
  },
];

const mockOnNavigateHome = jest.fn();

describe('StatePracticeMode', () => {
  beforeEach(() => {
    mockOnNavigateHome.mockClear();
  });

  test('displays results correctly after completing all questions', () => {
    render(
      <StatePracticeMode
        questions={mockQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enableTranslation={false}
      />
    );

    // Answer first question
    fireEvent.click(screen.getByText('Paris')); // Correct answer for q1
    expect(screen.getByText('Correct!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Answer second question
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('4')); // Correct answer for q2
    // Results should show automatically

    // Check for results UI
    expect(screen.getByText('Practice Complete!')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Congratulations! You've completed all questions for this state!"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('You answered 2 out of 2 questions correctly.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Keep practicing to master the material! Review your answers and try again to solidify your knowledge.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restart Practice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();

    // Check that question UI is hidden
    expect(screen.queryByText('What is 2 + 2?')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Previous/i })).not.toBeInTheDocument();
  });

  test('restarts practice correctly when "Restart Practice" is clicked', () => {
    render(
      <StatePracticeMode
        questions={mockQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enableTranslation={false}
      />
    );

    // Complete all questions to show results
    fireEvent.click(screen.getByText('Paris'));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByText('4'));

    // Click Restart Practice
    fireEvent.click(screen.getByRole('button', { name: /Restart Practice/i }));

    // Check that UI reverts to the first question
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument(); // Option for Q1
    expect(screen.getByText('State Practice: Question 1 of 2')).toBeInTheDocument();


    // Check that results UI is hidden
    expect(screen.queryByText('Practice Complete!')).not.toBeInTheDocument();
    expect(
      screen.queryByText('You answered 2 out of 2 questions correctly.')
    ).not.toBeInTheDocument();

    // Check that an option from Q1 is clickable (i.e., not disabled due to being answered)
    const firstOptionQ1 = screen.getByText('Paris');
    expect(firstOptionQ1).not.toHaveClass('pointer-events-none'); // Check it's interactive

     // Answer first question again to see if state is truly reset
    fireEvent.click(firstOptionQ1);
    expect(screen.getByText('Correct!')).toBeInTheDocument(); // Should show feedback
  });

  test('calls onNavigateHome when "Home" button is clicked from results', () => {
    render(
      <StatePracticeMode
        questions={mockQuestions}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enableTranslation={false}
      />
    );

    // Complete all questions
    fireEvent.click(screen.getByText('Paris'));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    fireEvent.click(screen.getByText('4'));

    // Click Home button
    fireEvent.click(screen.getByRole('button', { name: /Home/i }));
    expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
  });

  test('handles empty or no questions gracefully', () => {
    render(
      <StatePracticeMode
        questions={[]}
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode="en"
        enableTranslation={false}
      />
    );
    expect(screen.getByText(/No specific practice questions available/i)).toBeInTheDocument();
  });

});
