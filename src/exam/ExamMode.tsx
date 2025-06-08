import React, { useState, useEffect, useCallback, useRef } from 'react';
import { logAnalyticsEvent } from '../utils/analytics';
import ExamTimer from './ExamTimer';
import QuestionDisplay from './QuestionDisplay';
import ExamNavigation from './ExamNavigation';
import SubmitConfirmPopup from './components/SubmitConfirmPopup'; // Import the new component
import { Question, ExamUserAnswers, ExamResultsData } from '../types'; // Removed Option as it's not directly used in ExamMode props/state

interface ExamModeProps {
    questions: Question[];
    onNavigateHome: () => void;
    examDuration?: number;
    onShowResultsPage: (results: ExamResultsData) => void;
    selectedLanguageCode: string;
}

// --- ExamMode Component Definition ---
const ExamMode: React.FC<ExamModeProps> = ({ questions: initialExamQuestions, onNavigateHome, examDuration = 3600, onShowResultsPage, selectedLanguageCode }) => {
    const [questions, setQuestions] = useState<Question[]>(initialExamQuestions);
    const [currentExamQuestionIndex, setCurrentExamQuestionIndex] = useState<number>(0);
    const [examUserAnswers, setExamUserAnswers] = useState<ExamUserAnswers>({});
    const [timeRemaining, setTimeRemaining] = useState<number>(examDuration);
    const [showSubmitConfirmPopup, setShowSubmitConfirmPopup] = useState<boolean>(false);
    const examTimerId = useRef<NodeJS.Timeout | null>(null);
    const entryTimeRef = useRef<number | null>(null);

    const handleCancelExam = () => {
        logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'cancel_exam' });
        onNavigateHome();
    };

    const handleSubmitExam = useCallback((isAutoSubmit: boolean = false) => {
        if (examTimerId.current) {
            clearInterval(examTimerId.current);
            examTimerId.current = null;
        }

        let correctAnswersCount = 0;
        questions.forEach(q => {
            if (examUserAnswers[q.id] === q.correct_answer) {
                correctAnswersCount++;
            }
        });

        const score = questions.length > 0 ? (correctAnswersCount / questions.length) * 100 : 0;
        // Assuming 17 correct answers needed out of 33 total standard questions for passing.
        // This calculation might need adjustment if total questions can vary significantly.
        const passMarkPercentage = (17 / 33) * 100;
        const isPassed = score >= passMarkPercentage;
        const timeTaken = examDuration - timeRemaining;

        if (onShowResultsPage) {
            onShowResultsPage({
                questions,
                userAnswers: examUserAnswers,
                timeTaken,
                score,
                isPassed,
                passMark: passMarkPercentage,
                correctAnswersCount,
                selectedLanguageCode // Make sure this is passed
            });
        }
    }, [questions, examUserAnswers, examDuration, timeRemaining, onShowResultsPage, selectedLanguageCode]);

    useEffect(() => {
        setQuestions(initialExamQuestions);
        setCurrentExamQuestionIndex(0);
        setExamUserAnswers({});
        setTimeRemaining(examDuration);
    }, [initialExamQuestions, examDuration]);

    useEffect(() => {
        entryTimeRef.current = Date.now();

        if (questions.length > 0) { // Only start timer if there are questions
            examTimerId.current = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        if(examTimerId.current) clearInterval(examTimerId.current);
                        examTimerId.current = null;
                        handleSubmitExam(true); // Auto-submit when time is up
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => {
            if (examTimerId.current) {
                clearInterval(examTimerId.current);
                examTimerId.current = null;
            }
            // Calculate duration and log event on unmount
            if (entryTimeRef.current) {
                const duration = Date.now() - entryTimeRef.current;
                logAnalyticsEvent('timing_complete', {
                    name: 'exam_mode',
                    value: duration,
                    event_category: 'engagement',
                    event_label: 'time_spent_on_exam'
                });
                entryTimeRef.current = null; // Reset for potential re-mounts
            }
        };
    }, [questions, handleSubmitExam]); // Added questions to dependency array

    const currentQuestion: Question | null = questions && questions.length > 0 ? questions[currentExamQuestionIndex] : null;

    const handleExamAnswerSelection = (questionId: string, selectedOptionId: string) => {
        setExamUserAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
    };

    const handleNavigation = (direction: number) => {
        const newIndex = currentExamQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < questions.length) {
            setCurrentExamQuestionIndex(newIndex);
        }
        // Navigation beyond the last question or before the first is handled by disabling buttons
    };

    const unansweredQuestionsCount = questions.length - Object.keys(examUserAnswers).length;

    // Calculate progress for the timer bar
    const progressPercentage = examDuration > 0 ? (timeRemaining / examDuration) * 100 : 0;
    let progressBarColorClass;
    const percentageRemainingForColor = examDuration > 0 ? (timeRemaining / examDuration) * 100 : (timeRemaining > 0 ? 100 : 0);

    if (percentageRemainingForColor >= 50) {
        progressBarColorClass = 'bg-green-500';
    } else if (percentageRemainingForColor >= (10/60)*100) { // Approx 16.67%
        progressBarColorClass = 'bg-yellow-500';
    } else {
        progressBarColorClass = 'bg-red-500';
    }

    if (!initialExamQuestions || initialExamQuestions.length === 0) {
        return (
            <div className="text-center p-4">
                <p className="text-xl text-gray-700 mb-4">No exam questions available.</p>
                <button onClick={onNavigateHome} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">Home</button>
            </div>
        );
    }

    // Removed the entire 'if (showExamResults) { ... }' block for rendering results here.

    if (!currentQuestion) {
        return (
            <div className="text-center p-4">
                <p className="text-xl text-gray-700">Loading exam question...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-2 pb-3"> {/* Reduced mb */}
                <h2 className="text-xl md:text-2xl font-semibold text-blue-700">Exam</h2>
                <ExamTimer timeRemaining={timeRemaining} examDuration={examDuration} /> {/* Added examDuration prop */}
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 w-full bg-gray-200 rounded-full mb-4 border border-gray-300">
                <div
                    className={`h-full rounded-full ${progressBarColorClass} transition-[width] duration-1000 ease-linear`}
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={timeRemaining}
                    aria-valuemin={0}
                    aria-valuemax={examDuration}
                    aria-label="Time remaining"
                ></div>
            </div>

            <QuestionDisplay
                currentQuestion={currentQuestion}
                examUserAnswers={examUserAnswers}
                handleExamAnswerSelection={handleExamAnswerSelection}
                currentExamQuestionIndex={currentExamQuestionIndex}
                totalQuestions={questions.length}
                isExamMode={true}
                selectedLanguageCode={selectedLanguageCode}
            />

            <ExamNavigation
                currentExamQuestionIndex={currentExamQuestionIndex}
                totalQuestions={questions.length}
                handleNavigation={handleNavigation}
                handleSubmitExam={handleSubmitExam}
                examUserAnswers={examUserAnswers}
            />

            <div className="mt-8 flex space-x-4">
                <button onClick={handleCancelExam} className="md:w-2/4 border border-indigo-500 text-indigo-500 font-bold py-2 px-4 rounded hover:bg-indigo-100 transition-colors">
                    Cancel Exam
                </button>
                <button
                    onClick={() => {
                        logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'submit_exam_attempt' });
                        setShowSubmitConfirmPopup(true);
                    }}
                    disabled={Object.keys(examUserAnswers).length === 0}
                    className="md:w-2/4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-opacity"
                >
                    Submit Exam
                </button>
            </div>

            <SubmitConfirmPopup
                isOpen={showSubmitConfirmPopup}
                onClose={() => setShowSubmitConfirmPopup(false)}
                onConfirm={() => {
                    logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'submit_exam_confirm', unanswered_questions: unansweredQuestionsCount });
                    handleSubmitExam(false);
                    setShowSubmitConfirmPopup(false);
                }}
                unansweredQuestionsCount={unansweredQuestionsCount}
            />
        </div>
    );
};

export default ExamMode;
