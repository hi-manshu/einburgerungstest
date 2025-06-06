import React, { useState, useEffect } from 'react';

// --- PracticeMode Component Definition ---
const PracticeMode = ({ questions: initialQuestions, onNavigateHome }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setQuestions(initialQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);
    }, [initialQuestions]);

    const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null;

    const handleAnswerSelection = (questionId, selectedOptionId) => {
        if (userAnswers[questionId]?.answer) return;
        const question = questions.find(q => q.id === questionId);
        if (!question) return;
        const isCorrect = selectedOptionId === question.correct_answer;
        setUserAnswers(prev => ({ ...prev, [questionId]: { answer: selectedOptionId, correct: isCorrect, marked: prev[questionId]?.marked || false }}));
    };
    const toggleMarkForLater = (questionId) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: { ...(prev[questionId] || { answer: null, correct: null }), marked: !prev[questionId]?.marked }}));
    };
    const handleNavigate = (direction) => {
        const newIndex = currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < questions.length) {
            setCurrentQuestionIndex(newIndex);
        } else if (newIndex >= questions.length) {
            setShowResults(true);
        }
    };
    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);
    };

    if (!initialQuestions || initialQuestions.length === 0) {
        return (
            <div className="text-center p-4">
                <p className="text-xl text-gray-700 mb-4">No practice questions available.</p>
                <button onClick={onNavigateHome} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">Home</button>
            </div>
        );
    }

    if (showResults) {
        const answeredCount = Object.keys(userAnswers).filter(qid => userAnswers[qid].answer !== null).length;
        const correctCount = Object.values(userAnswers).filter(ans => ans.correct).length;
        const markedCount = Object.values(userAnswers).filter(ans => ans.marked).length;
        return (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Practice Results</h2>
                <p className="text-lg mb-2">Total: {questions.length}</p>
                <p className="text-lg mb-2">Answered: {answeredCount}</p>
                <p className="text-lg mb-2">Correct: <span className="font-semibold text-green-600">{correctCount}</span></p>
                <p className="text-lg mb-4">Marked: {markedCount}</p>
                <div className="mt-6">
                    <button onClick={handleRestart} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-3">Restart</button>
                    <button onClick={onNavigateHome} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">Home</button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="text-center p-4">
                <p className="text-xl text-gray-700 mb-4">Loading...</p>
                <button onClick={onNavigateHome} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">Home</button>
            </div>
        );
    }

    const userAnswerInfo = userAnswers[currentQuestion.id];
    const isAnswered = userAnswerInfo?.answer !== null && userAnswerInfo?.answer !== undefined;

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">Q {currentQuestionIndex + 1}/{questions.length}</p>
                <button
                    onClick={() => toggleMarkForLater(currentQuestion.id)}
                    className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${userAnswerInfo?.marked ? 'bg-yellow-400 text-white border-yellow-500 hover:bg-yellow-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}>
                    {userAnswerInfo?.marked ? '✓ Marked' : 'Mark'}
                </button>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-1">{currentQuestion.question_text}</h3>
            <p className="text-md text-gray-700 mb-4 italic">{currentQuestion.question_text_de}</p>
            <div className="space-y-3">
                {currentQuestion.options.map(opt => {
                    let btnClass = 'border-gray-300 hover:bg-gray-100 text-gray-800';
                    if (isAnswered) {
                        if (opt.id === userAnswerInfo.answer) {
                            btnClass = userAnswerInfo.correct ? 'bg-green-200 border-green-400 text-green-800 pointer-events-none' : 'bg-red-200 border-red-400 text-red-800 pointer-events-none';
                        } else if (opt.id === currentQuestion.correct_answer) {
                            btnClass = 'bg-green-100 border-green-300 text-green-700 pointer-events-none opacity-90';
                        } else {
                            btnClass = 'border-gray-200 text-gray-500 pointer-events-none opacity-70';
                        }
                    }
                    return (
                        <button
                            key={opt.id}
                            onClick={() => handleAnswerSelection(currentQuestion.id, opt.id)}
                            disabled={isAnswered}
                            className={`option-btn block w-full text-left p-3 border rounded-md transition-all ${btnClass}`}>
                            <span className="font-bold mr-2">{opt.id.toUpperCase()}.</span> {opt.text}
                            <span className="italic text-sm text-gray-600"> ({opt.text_de})</span>
                        </button>
                    );
                })}
            </div>
            {isAnswered && (
                <div className={`mt-4 p-3 rounded-md ${userAnswerInfo.correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {userAnswerInfo.correct ? 'Correct!' : 'Incorrect.'}
                    {!userAnswerInfo.correct && <span> Correct: <span className="font-bold">{currentQuestion.correct_answer.toUpperCase()}</span>.</span>}
                    {currentQuestion.explanation && <p className="text-sm mt-1">{currentQuestion.explanation}</p>}
                </div>
            )}
            <div className="mt-6 flex justify-between items-center">
                <button onClick={() => handleNavigate(-1)} disabled={currentQuestionIndex === 0} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                    Prev
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={() => handleNavigate(1)} disabled={!isAnswered} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                        Next
                    </button>
                ) : (
                    <button onClick={() => setShowResults(true)} disabled={!isAnswered} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                        Results
                    </button>
                )}
            </div>
            <button onClick={onNavigateHome} className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded w-full">
                Home
            </button>
        </div>
    );
};

export default PracticeMode;
