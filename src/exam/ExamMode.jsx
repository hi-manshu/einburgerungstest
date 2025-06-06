import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- ExamMode Component Definition ---
const ExamMode = ({ questions: initialExamQuestions, onNavigateHome, examDuration = 600 }) => {
    const [questions, setQuestions] = useState([]);
    const [currentExamQuestionIndex, setCurrentExamQuestionIndex] = useState(0);
    const [examUserAnswers, setExamUserAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(examDuration);
    const [showExamResults, setShowExamResults] = useState(false);
    const examTimerId = useRef(null);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSubmitExam = useCallback((isAutoSubmit = false) => {
        setShowExamResults(true);
        if (examTimerId.current) {
            clearInterval(examTimerId.current);
            examTimerId.current = null;
        }
    }, []);

    useEffect(() => {
        setQuestions(initialExamQuestions);
        setCurrentExamQuestionIndex(0);
        setExamUserAnswers({});
        setShowExamResults(false);
        setTimeRemaining(examDuration);
    }, [initialExamQuestions, examDuration]);

    useEffect(() => {
        if (!showExamResults && questions.length > 0) {
            examTimerId.current = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(examTimerId.current);
                        examTimerId.current = null;
                        handleSubmitExam(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (examTimerId.current) {
            clearInterval(examTimerId.current);
            examTimerId.current = null;
        }
        return () => {
            if (examTimerId.current) {
                clearInterval(examTimerId.current);
                examTimerId.current = null;
            }
        };
    }, [showExamResults, questions, handleSubmitExam]);

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

    if (!initialExamQuestions || initialExamQuestions.length === 0) {
        return (
            <div className="text-center p-4">
                <p className="text-xl text-gray-700 mb-4">No exam questions available.</p>
                <button onClick={onNavigateHome} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">Home</button>
            </div>
        );
    }

    if (showExamResults) {
        let correctAnswersCount = 0;
        questions.forEach(q => {
            if (examUserAnswers[q.id] === q.correct_answer) {
                correctAnswersCount++;
            }
        });
        const score = questions.length > 0 ? (correctAnswersCount / questions.length) * 100 : 0;
        const passMark = questions.length > 0 ? Math.ceil(questions.length * (17/33)) : 0;
        const isPassed = correctAnswersCount >= passMark;
        return (
            <div className={`bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center border-t-8 ${isPassed ? 'border-green-500' : 'border-red-500'}`}>
                <h2 className="text-3xl font-bold mb-4">Exam Results</h2>
                <p className="text-xl mb-2">Time: {formatTime(examDuration - timeRemaining)}</p>
                <p className="text-xl mb-2">Correct: <span className="font-bold">{correctAnswersCount}</span>/{questions.length}</p>
                <p className={`text-2xl font-semibold mb-6 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {isPassed ? `Passed (${score.toFixed(0)}%)` : `Not Passed (${score.toFixed(0)}%)`}
                </p>
                <p className="text-sm text-gray-600 mb-4">(Pass mark: {passMark} for {questions.length}Q)</p>
                <button onClick={onNavigateHome} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded text-lg">Home</button>
            </div>
        );
    }

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
                <div className="text-2xl font-bold text-red-500" role="timer" aria-live="polite">{formatTime(timeRemaining)}</div>
            </div>
            <p className="text-sm text-gray-500 mb-2">Q {currentExamQuestionIndex + 1}/{questions.length}</p>
            <h3 className="text-lg md:text-xl font-medium mb-1">{currentQuestion.question_text}</h3>
            <p className="text-md text-gray-600 mb-5 italic">{currentQuestion.question_text_de}</p>
            <div className="space-y-3 mb-6">
                {currentQuestion.options.map(opt => (
                    <label key={opt.id} className={`flex items-center p-3 border rounded-md transition-all cursor-pointer hover:bg-gray-50 ${examUserAnswers[currentQuestion.id] === opt.id ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300' : 'border-gray-300'}`}>
                        <input
                            type="radio"
                            name={`exam_option_${currentQuestion.id}`}
                            value={opt.id}
                            checked={examUserAnswers[currentQuestion.id] === opt.id}
                            onChange={() => handleExamAnswerSelection(currentQuestion.id, opt.id)}
                            className="form-radio h-5 w-5 text-blue-600 mr-3 focus:ring-blue-500"
                        />
                        <span className="font-medium mr-1">{opt.id.toUpperCase()}.</span>
                        <span className="text-gray-800">{opt.text}</span>
                        <span className="italic text-sm text-gray-500 ml-1">({opt.text_de})</span>
                    </label>
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                <button onClick={() => handleNavigation(-1)} disabled={currentExamQuestionIndex === 0} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-opacity">
                    Prev
                </button>
                {currentExamQuestionIndex < questions.length - 1 ? (
                    <button onClick={() => handleNavigation(1)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                        Next
                    </button>
                ) : (
                    <button onClick={() => handleSubmitExam(false)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        Submit
                    </button>
                )}
            </div>
            <button onClick={onNavigateHome} className="mt-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded w-full">
                Cancel & Home
            </button>
        </div>
    );
};

export default ExamMode;
