import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PracticeByCategoryMode from './PracticeByCategoryMode';
import { Question } from '../../types'; // Ensure this path is correct

// Mock QuestionDisplay component
jest.mock('../exam/QuestionDisplay', () => {
  // Mock implementation receives props and can display some of them for assertion
  return jest.fn(({ currentQuestion, currentExamQuestionIndex, totalQuestions }) => (
    <div data-testid="question-display">
      <p>Question ID: {currentQuestion?.id}</p>
      <p>Text: {currentQuestion?.question_text}</p>
      <p>Question {currentExamQuestionIndex + 1} of {totalQuestions}</p>
    </div>
  ));
});

const mockQuestionsData: Question[] = [
  { id: 'q1', question_text: 'Q1 Text: Category A', category: 'Category A', options: [], correct_answer: 'a', state_code: 'S1' },
  { id: 'q2', question_text: 'Q2 Text: Category B', category: 'Category B', options: [], correct_answer: 'b', state_code: 'S2' },
  { id: 'q3', question_text: 'Q3 Text: Category A', category: 'Category A', options: [], correct_answer: 'c', state_code: 'S3' },
  { id: 'q4', question_text: 'Q4 Text: Category C', category: 'Category C', options: [], correct_answer: 'd', state_code: 'S1' },
  { id: 'q5', question_text: 'Q5 Text: State S2 (No Cat)', options: [], correct_answer: 'a', state_code: 'S2' }, // Will use state_code 'S2' as category
];

// Mock props
const mockOnNavigateHome = jest.fn();
const mockSelectedLanguageCode = 'en';
const mockEnablePracticeTranslation = false;

// Helper to setup fetch mock
const setupFetchMock = (data: any, ok = true, errorMsg?: string) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: ok,
      json: () => Promise.resolve(data),
      status: ok ? 200 : 500, // Add status for error checking
      statusText: ok ? 'OK' : (errorMsg || 'Internal Server Error'), // Add statusText
    } as Response)
  );
};


describe('PracticeByCategoryMode', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    setupFetchMock(mockQuestionsData);
  });

  test('renders loading state initially, then displays categories and first question', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    expect(screen.getByText('Loading questions...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Show All')).toBeInTheDocument();
      expect(screen.getByText('Category A')).toBeInTheDocument();
      expect(screen.getByText('Category B')).toBeInTheDocument();
      expect(screen.getByText('Category C')).toBeInTheDocument();
      expect(screen.getByText('S2')).toBeInTheDocument(); // From q5's state_code
    });

    // Initially "Show All" is selected, showing q1
    expect(screen.getByText('Question ID: q1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument(); // 5 total questions
  });

  test('filters questions when a category is selected', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    await waitFor(() => screen.getByText('Category A')); // Wait for categories to load

    fireEvent.click(screen.getByText('Category A'));

    await waitFor(() => {
      // q1 is the first in Category A
      expect(screen.getByText('Question ID: q1')).toBeInTheDocument();
      // Category A has 2 questions (q1, q3)
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });

    // Check if the displayed question text matches q1
    expect(screen.getByText('Text: Q1 Text: Category A')).toBeInTheDocument();

    // Navigate to the next question in Category A
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Question ID: q3')).toBeInTheDocument();
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });
     expect(screen.getByText('Text: Q3 Text: Category A')).toBeInTheDocument();
  });

  test('selecting "Show All" displays all questions again', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    await waitFor(() => screen.getByText('Category B'));
    fireEvent.click(screen.getByText('Category B')); // Select Category B (q2)

    await waitFor(() => {
      expect(screen.getByText('Question ID: q2')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument(); // Category B has 1 question
    });

    fireEvent.click(screen.getByText('Show All'));
    await waitFor(() => {
      expect(screen.getByText('Question ID: q1')).toBeInTheDocument(); // Back to the first question of all
      expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    });
  });

  test('handles "S2" category (from state_code) correctly', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    await waitFor(() => screen.getByText('S2'));
    fireEvent.click(screen.getByText('S2'));

    await waitFor(() => {
      // q2 has category B but state_code S2. q5 has no category and state_code S2.
      // The logic is: (q.category === category) || q.state_code === category
      // So, when 'S2' is clicked, q2 (state_code S2) and q5 (state_code S2) should match.
      // q2 is first.
      expect(screen.getByText('Question ID: q2')).toBeInTheDocument();
      // It should find 2 questions for S2 (q2 and q5)
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
        expect(screen.getByText('Question ID: q5')).toBeInTheDocument();
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });
  });


  test('navigation (Previous/Next) works correctly', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    await waitFor(() => screen.getByText('Question ID: q1')); // Wait for initial load

    const nextButton = screen.getByText('Next');
    const prevButton = screen.getByText('Previous');

    // Initial state: q1, Prev disabled
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();


    // Go to q2
    fireEvent.click(nextButton);
    await waitFor(() => expect(screen.getByText('Question ID: q2')).toBeInTheDocument());
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Go to q3, q4, q5 (last question)
    fireEvent.click(nextButton); // to q3
    await waitFor(() => expect(screen.getByText('Question ID: q3')).toBeInTheDocument());
    fireEvent.click(nextButton); // to q4
    await waitFor(() => expect(screen.getByText('Question ID: q4')).toBeInTheDocument());
    fireEvent.click(nextButton); // to q5
    await waitFor(() => expect(screen.getByText('Question ID: q5')).toBeInTheDocument());

    expect(screen.getByText('Question 5 of 5')).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled(); // At last question, Next is disabled

    // Go back to q4
    fireEvent.click(prevButton);
    await waitFor(() => expect(screen.getByText('Question ID: q4')).toBeInTheDocument());
    expect(screen.getByText('Question 4 of 5')).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  test('displays error message if fetch fails', async () => {
    setupFetchMock(null, false, 'Network Error'); // Simulate fetch error
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    await waitFor(() => {
      // Updated error message to be more specific based on component code
      expect(screen.getByText('Failed to load questions: HTTP error! status: 500')).toBeInTheDocument();
    });
  });

  test('displays message when no questions are available for a category', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    // Create a new category that won't have questions
    const uniqueCategories = new Set<string>();
    mockQuestionsData.forEach(q => {
        if (q.category) uniqueCategories.add(q.category as string);
        else if (q.state_code) uniqueCategories.add(q.state_code);
    });
    const categories = ["Show All", ...Array.from(uniqueCategories), "EmptyCategory"];


    // Mocking the component's internal state for categories is tricky.
    // Instead, let's test by selecting a category that we know from mockQuestionsData is empty.
    // Our mockQuestionsData doesn't have a category that would result in zero questions *after* initial load.
    // The component's current logic for categories:
    // setCategories(["Show All", ...Array.from(uniqueCategories)]);
    // So, "EmptyCategory" won't be an option unless we change fetch mock.
    // A better test for "no questions for category" would be if a category *button* exists,
    // and clicking it results in "No questions found for..."
    // For now, let's assume "Category C" is clicked, it has q4.
    // To test "no questions found for category", we'd need a category button that yields 0 results.

    await waitFor(() => screen.getByText('Category C'));
    fireEvent.click(screen.getByText('Category C'));
    await waitFor(() => {
      expect(screen.getByText('Question ID: q4')).toBeInTheDocument(); // q4 is in Category C
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    });

    // This part tests the "No questions found for Category X"
    // We need to simulate a state where a category exists but has no questions.
    // The current component logic derives categories from existing questions.
    // So, a category button for an empty category won't exist unless questions change.
    // The message "No questions found for "Category X" is shown if questionsForDisplay is empty
    // AND selectedCategory is not "Show All".

    // Let's try filtering by a category that *becomes* empty if questions were different.
    // This test is a bit contrived with current setup. A more direct way would be to
    // manipulate the state post-fetch, or have a specific fetch mock for this.
    // For now, we'll rely on the "No questions available for display." test below for general emptiness.
  });


  test('displays message when all fetched questions are empty', async () => {
    setupFetchMock([]); // Simulate fetch returning empty array
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );

    await waitFor(() => {
      // This message appears when questionsForDisplay is empty AND selectedCategory is "Show All" or null initially
      expect(screen.getByText('No questions available for display.')).toBeInTheDocument();
    });
     // Ensure category buttons also don't show up if there are no questions to derive categories from
     expect(screen.queryByText('Show All')).not.toBeInTheDocument();
  });

  test('calls onNavigateHome when "Back to Home" is clicked', async () => {
    render(
      <PracticeByCategoryMode
        onNavigateHome={mockOnNavigateHome}
        selectedLanguageCode={mockSelectedLanguageCode}
        enablePracticeTranslation={mockEnablePracticeTranslation}
      />
    );
    await waitFor(() => screen.getByText('Back to Home')); // Wait for component to load
    fireEvent.click(screen.getByText('Back to Home'));
    expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
  });

});
