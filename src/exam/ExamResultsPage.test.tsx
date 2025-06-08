import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ExamResultsPage from "./ExamResultsPage";
import "@testing-library/jest-dom";
import {
  Question,
  Option,
  ExamUserAnswers,
  ExamResultsPageProps,
} from "../types";

const perfectScoreMessages: string[] = [
  "Perfect Score! You Crushed It!",
  "Flawless Victory!",
  "33 Out of 33? You're a Legend!",
  "Nailed It! You’re the Gold Standard!",
  "This Test Didn’t Stand a Chance!",
  "Zero Mistakes. All Brilliance.",
];
const passedMessages = [
  "Well Done! You Passed With Style!",
  "On Point! Keep the Momentum Going!",
  "Solid Work! You’ve Got This!",
  "Pass Unlocked—Next Level Awaits!",
  "Good Job! Just a Few More to Perfection.",
  "You Did It—And You’re Just Getting Started!",
];
const failedMessages = [
  "Keep Practicing, You Can Do It!",
  "Not This Time—But You’re Closer Than You Think!",
  "Failure’s Just a Stepping Stone—Let’s Try Again!",
  "Missed the Mark? Reset and Fire Again!",
  "Oops! Time to Learn and Level Up!",
  "Practice Mode: Activated. Powering Up…",
];

const mockNavigateHome: jest.Mock<void, []> = jest.fn();
const mockRetryTest: jest.Mock<void, []> = jest.fn();
const mockStartNewTest: jest.Mock<void, []> = jest.fn();

const baseQuestions: Question[] = [
  {
    id: "q1",
    question_text: "Question 1 Text?",
    question_text_de: "Frage 1 Text?",
    options: [
      { id: "a", text: "Opt A1" },
      { id: "b", text: "Opt B1" },
    ],
    correct_answer: "a",
    explanation: "Expl Q1",
    state_code: null,
  },
  {
    id: "q2",
    question_text: "Question 2 Text?",
    question_text_de: "Frage 2 Text?",
    options: [
      { id: "c", text: "Opt C2" },
      { id: "d", text: "Opt D2" },
    ],
    correct_answer: "d",
    explanation: "Expl Q2",
    state_code: null,
  },
  {
    id: "q3",
    question_text: "Question 3 Text?",
    question_text_de: "Frage 3 Text?",
    options: [
      { id: "e", text: "Opt E3" },
      { id: "f", text: "Opt F3" },
    ],
    correct_answer: "e",
    explanation: "Expl Q3",
    state_code: null,
  },
];

const getTestProps = (
  overrides: Partial<ExamResultsPageProps>,
): ExamResultsPageProps => ({
  questions: baseQuestions,
  userAnswers: { q1: "a", q2: "c" },
  timeTaken: 120,
  score: 33.33,
  passMark: 51.51,
  correctAnswersCount: 1,
  isPassed: false,
  onNavigateHome: mockNavigateHome,
  onRetryTest: mockRetryTest,
  onStartNewTest: mockStartNewTest,
  selectedLanguageCode: "en",
  ...overrides,
});

describe("ExamResultsPage - Fixed Outcome Categories & Messages", () => {
  beforeEach(() => {
    mockNavigateHome.mockClear();
    mockRetryTest.mockClear();
    mockStartNewTest.mockClear();
  });

  test("renders general info (title, score) correctly", () => {
    const props = getTestProps({});
    render(<ExamResultsPage {...props} />);
    expect(screen.getByText("Exam Results")).toBeInTheDocument();
    expect(screen.getByText("33% (1/3)")).toBeInTheDocument();
  });

  test("displays a FAILED message and red text for correctAnswersCount = 0", () => {
    const props = getTestProps({
      correctAnswersCount: 0,
      userAnswers: {},
      isPassed: false,
      score: 0,
    });
    render(<ExamResultsPage {...props} />);
    const outcomeElement = screen.getByText((content) =>
      failedMessages.includes(content),
    );
    expect(outcomeElement).toBeInTheDocument();
    expect(outcomeElement).toHaveClass("text-red-600");
  });

  test("displays a FAILED message and red text for correctAnswersCount = 16", () => {
    const props = getTestProps({ correctAnswersCount: 16, isPassed: false });
    render(<ExamResultsPage {...props} />);
    const outcomeElement = screen.getByText((content) =>
      failedMessages.includes(content),
    );
    expect(outcomeElement).toBeInTheDocument();
    expect(outcomeElement).toHaveClass("text-red-600");
  });

  test("displays a FAILED message (red text) even if isPassed is true but correctAnswersCount <= 16", () => {
    const props = getTestProps({
      questions: baseQuestions.slice(0, 1),
      correctAnswersCount: 1,
      userAnswers: { q1: "a" },
      passMark: 1,
      isPassed: true,
      score: 100,
    });
    render(<ExamResultsPage {...props} />);
    const outcomeElement = screen.getByText((content) =>
      failedMessages.includes(content),
    );
    expect(outcomeElement).toBeInTheDocument();
    expect(outcomeElement).toHaveClass("text-red-600");
  });

  test("displays a PASSED message and green text for correctAnswersCount = 17", () => {
    const props = getTestProps({ correctAnswersCount: 17, isPassed: true });
    render(<ExamResultsPage {...props} />);
    const outcomeElement = screen.getByText((content) =>
      passedMessages.includes(content),
    );
    expect(outcomeElement).toBeInTheDocument();
    expect(outcomeElement).toHaveClass("text-green-600");
  });

  test("displays a PASSED message and green text for correctAnswersCount = 32", () => {
    const props = getTestProps({ correctAnswersCount: 32, isPassed: true });
    render(<ExamResultsPage {...props} />);
    const outcomeElement = screen.getByText((content) =>
      passedMessages.includes(content),
    );
    expect(outcomeElement).toBeInTheDocument();
    expect(outcomeElement).toHaveClass("text-green-600");
  });

  test("displays a PERFECT SCORE message and green text for correctAnswersCount = 33", () => {
    const manyQuestions: Question[] = Array(33)
      .fill(null)
      .map((_, i) => ({
        id: `q${i + 1}`,
        question_text: `Q${i + 1}`,
        question_text_de: `F${i + 1}`,
        options: [
          { id: "a", text: "Opt A" },
          { id: "b", text: "Opt B" },
        ],
        correct_answer: "a",
        explanation: `E${i + 1}`,
        state_code: null,
      }));
    const allUserAnswersCorrect: ExamUserAnswers = manyQuestions.reduce(
      (acc, q) => ({ ...acc, [q.id]: "a" }),
      {},
    );

    const props = getTestProps({
      questions: manyQuestions,
      userAnswers: allUserAnswersCorrect,
      correctAnswersCount: 33,
      score: 100,
      isPassed: true,
      passMark: 51.51,
    });
    render(<ExamResultsPage {...props} />);

    const outcomeElement = screen.getByText((content) =>
      perfectScoreMessages.includes(content),
    );
    expect(outcomeElement).toBeInTheDocument();
    expect(outcomeElement).toHaveClass("text-green-600");
  });

  test("main page border color reflects isPassed prop, even if message category differs", () => {
    const props = getTestProps({
      questions: baseQuestions.slice(0, 1),
      correctAnswersCount: 1,
      userAnswers: { q1: "a" },
      passMark: 1,
      isPassed: true,
      score: 100,
    });

    const { container } = render(<ExamResultsPage {...props} />);
    expect(container.firstChild).toHaveClass("border-green-500");

    const propsFail = getTestProps({
      correctAnswersCount: 18,
      isPassed: false,
      score: 50,
    });

    const { container: containerFail } = render(
      <ExamResultsPage {...propsFail} />,
    );
    expect(containerFail.firstChild).toHaveClass("border-red-500");
  });

  test("renders numbered boxes correctly (unanswered is red)", () => {
    const props = getTestProps({});
    render(<ExamResultsPage {...props} />);
    const questionNumberButtons = screen.getAllByRole("button", {
      name: /Question \d+/,
    });
    expect(questionNumberButtons).toHaveLength(props.questions.length);

    expect(questionNumberButtons[0]).toHaveClass("bg-green-500");
    expect(questionNumberButtons[1]).toHaveClass("bg-red-500");
    expect(questionNumberButtons[2]).toHaveClass("bg-red-500");
  });

  test("displays details for the first question by default", () => {
    const props = getTestProps({});
    render(<ExamResultsPage {...props} />);
    expect(
      screen.getByRole("button", { name: "Question 1", pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Question 1 Text?")).toBeInTheDocument();
    expect(screen.getByText("Your answer:")).toHaveTextContent(
      "Your answer: A. Opt A1",
    );
    expect(screen.getByText("(Correct)")).toBeInTheDocument();
    expect(screen.getByText("Expl Q1")).toBeInTheDocument();
  });

  test("clicking a question number updates details and highlights box", () => {
    const props = getTestProps({});
    render(<ExamResultsPage {...props} />);
    const q2Button = screen.getByRole("button", { name: "Question 2" });
    fireEvent.click(q2Button);

    expect(
      screen.getByRole("button", { name: "Question 2", pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByText("Question 2 Text?")).toBeInTheDocument();
    expect(screen.getByText("(Incorrect)")).toBeInTheDocument();
  });

  test("displays details for an unanswered question correctly", () => {
    const props = getTestProps({});
    render(<ExamResultsPage {...props} />);
    const q3Button = screen.getByRole("button", { name: "Question 3" });
    fireEvent.click(q3Button);

    expect(screen.getByText("Question 3 Text?")).toBeInTheDocument();
    expect(
      screen.getByText("You did not answer this question."),
    ).toBeInTheDocument();
  });

  test("navigation buttons (Home, Retry, New Test) still work", () => {
    const props = getTestProps({});
    render(<ExamResultsPage {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Home/i }));
    expect(mockNavigateHome).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Retry Test/i }));
    expect(mockRetryTest).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /New Test/i }));
    expect(mockStartNewTest).toHaveBeenCalledTimes(1);
  });
});
