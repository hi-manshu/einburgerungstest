import React, { useState, useEffect, useCallback, useRef } from 'react';
import ExamTimer from './ExamTimer';
import QuestionDisplay from './QuestionDisplay';
import ExamNavigation from './ExamNavigation';

// --- ExamMode Component Definition ---
const ExamMode = ({ questions: initialExamQuestions, onNavigateHome, examDuration = 3600, onShowResultsPage }) => {
    const [questions, setQuestions] = useState([]);
    const [currentExamQuestionIndex, setCurrentExamQuestionIndex] = useState(0);
    const [examUserAnswers, setExamUserAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(examDuration);
    const [showSubmitConfirmPopup, setShowSubmitConfirmPopup] = useState(false);
    const examTimerId = useRef(null);

    // formatTime function removed, it's now in ExamTimer.jsx

    const handleSubmitExam = useCallback((isAutoSubmit = false) => {
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
        const passMark = questions.length > 0 ? Math.ceil(questions.length * (17 / 33)) : 0; // Assuming 17/33 pass mark
        const isPassed = correctAnswersCount >= passMark;
        const timeTaken = examDuration - timeRemaining;

        if (onShowResultsPage) {
            onShowResultsPage({
                questions,
                userAnswers: examUserAnswers,
                timeTaken,
                score,
                isPassed,
                passMark,
                correctAnswersCount
            });
        }
        // No longer setting showExamResults(true) here
    }, [questions, examUserAnswers, examDuration, timeRemaining, onShowResultsPage]);

    useEffect(() => {
        setQuestions(initialExamQuestions);
        setCurrentExamQuestionIndex(0);
        setExamUserAnswers({});
        // setShowExamResults(false); // Removed
        setTimeRemaining(examDuration);
    }, [initialExamQuestions, examDuration]);

    useEffect(() => {
        // Timer runs as long as ExamMode is mounted and not yet submitted.
        // handleSubmitExam now handles clearing the timer.
        if (questions.length > 0) {
            examTimerId.current = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(examTimerId.current);
                        examTimerId.current = null;
                        handleSubmitExam(true); // Auto-submit
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
        };
    }, [questions, handleSubmitExam]); // Removed showExamResults from dependencies

    const currentQuestion = questions && questions.length > 0 ? questions[currentExamQuestionIndex] : null;
    const handleExamAnswerSelection = (questionId, selectedOptionId) => {
        setExamUserAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
    };
    const handleNavigation = (direction) => {
        const newIndex = currentExamQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < questions.length) {
            setCurrentExamQuestionIndex(newIndex);
        }
    };

    // handleRetryTest is removed. Relies on App.jsx to reset/re-mount ExamMode.
    // The useEffect for [initialExamQuestions, examDuration] handles resetting state.

    const unansweredQuestionsCount = questions.length - Object.keys(examUserAnswers).length;

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
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h2 className="text-xl md:text-2xl font-semibold text-blue-700">Exam</h2>
                <ExamTimer timeRemaining={timeRemaining} />
            </div>

            <QuestionDisplay
                currentQuestion={currentQuestion}
                examUserAnswers={examUserAnswers}
                handleExamAnswerSelection={handleExamAnswerSelection}
                currentExamQuestionIndex={currentExamQuestionIndex}
                totalQuestions={questions.length}
            />

            <ExamNavigation
                currentExamQuestionIndex={currentExamQuestionIndex}
                totalQuestions={questions.length}
                handleNavigation={handleNavigation}
                handleSubmitExam={handleSubmitExam}
                examUserAnswers={examUserAnswers}
            />

<div className="mt-12 flex space-x-4">
  <button
    onClick={onNavigateHome}
    className="border border-indigo-500 text-indigo-500 font-bold py-2 px-4 md:w-2/4 rounded hover:bg-indigo-100 transition-colors"
  >
    Cancel Exam
  </button>
  <button
    onClick={() => setShowSubmitConfirmPopup(true)}
    disabled={Object.keys(examUserAnswers).length === 0}
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 md:w-2/4 rounded disabled:opacity-50 transition-opacity"
  >
    Submit Exam
  </button>
</div>


            {/* Modal for Submit Confirmation */}
            {showSubmitConfirmPopup && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full mx-4 border-t-4 border-blue-500">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Confirm Submission</h3>
                        <p className="mb-6 text-gray-700">
                            You have {unansweredQuestionsCount} unanswered question(s). Are you sure you want to submit?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowSubmitConfirmPopup(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={() => {
                                    handleSubmitExam(false);
                                    setShowSubmitConfirmPopup(false);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamMode;
