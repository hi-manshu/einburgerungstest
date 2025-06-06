import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Shuffle Function ---
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// --- HomePage Component Definition ---
const HomePage = ({ statesData, onStartPractice, onStartExam, onStartFlashcards }) => {
    const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || '');
    const handleStateChange = (event) => {
        const newState = event.target.value;
        setSelectedState(newState);
        localStorage.setItem('selectedState', newState);
    };
    const handleNavigation = (navigationFunc, requiresState = true) => {
        if (requiresState && !selectedState) {
            alert("Please select a state to proceed with this mode.");
            return;
        }
        navigationFunc(selectedState);
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Welcome! Choose your mode:</h2>
            <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Study & Practice</h3>
                <button
                    onClick={() => onStartPractice("")}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2 md:mb-0">
                    Practice All Questions
                </button>
                <button
                    onClick={() => handleNavigation(onStartFlashcards)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    Flashcards (by State)
                </button>
            </div>
            <div className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                <label htmlFor="state-select" className="block text-lg font-medium mb-2 text-gray-700">
                    Select Your State for Specific Content:
                </label>
                <select
                    id="state-select"
                    value={selectedState}
                    onChange={handleStateChange}
                    className="mt-1 block w-full md:w-2/3 mx-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow">
                    <option value="">Select a State (or practice all questions)</option>
                    {Object.entries(statesData || {}).sort(([,a],[,b]) => a.localeCompare(b)).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>
                <button
                    onClick={() => handleNavigation(onStartPractice, false)}
                    className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                    Practice Selected State Questions
                </button>
            </div>
            <div>
                <h3 className="text-xl font-medium mb-2">Test Your Knowledge</h3>
                <button
                    onClick={() => handleNavigation(onStartExam)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Start Full Exam (by State)
                </button>
            </div>
        </div>
    );
};

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

// --- FlashcardMode Component Definition ---
const FlashcardMode = ({ initialQuestions, onNavigateHome, cardDuration = 15 }) => {
    const [remainingQuestions, setRemainingQuestions] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [showingAnswer, setShowingAnswer] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [timer, setTimer] = useState(cardDuration);
    const timerIdRef = useRef(null);
    const feedbackTimeoutIdRef = useRef(null);

    useEffect(() => {
        setRemainingQuestions(shuffleArray(initialQuestions || []));
    }, [initialQuestions]);

    useEffect(() => {
        if (feedbackTimeoutIdRef.current) clearTimeout(feedbackTimeoutIdRef.current);
        if (remainingQuestions.length > 0) {
            setCurrentCard(remainingQuestions[0]);
            setShowingAnswer(false);
            setFeedback("");
            setTimer(cardDuration);
        } else {
            setCurrentCard(null);
        }
    }, [remainingQuestions, cardDuration]);

    useEffect(() => {
        if (currentCard && !showingAnswer && timer > 0) {
            if (timerIdRef.current) clearTimeout(timerIdRef.current);
            timerIdRef.current = setTimeout(() => {
                setTimer(t => t - 1);
            }, 1000);
        } else if (timer === 0 && !showingAnswer && currentCard) {
            handleFlashcardTimeout();
        }
        return () => clearTimeout(timerIdRef.current);
    }, [currentCard, showingAnswer, timer]);

    const getCorrectAnswerText = (card) => {
        if (!card || !card.options || !card.correct_answer) return "N/A";
        const correctOption = card.options.find(opt => opt.id === card.correct_answer);
        return correctOption ? `${card.correct_answer.toUpperCase()}. ${correctOption.text_de || correctOption.text}` : "N/A";
    };

    const handleFlashcardTimeout = () => {
        if (!currentCard) return;
        if (timerIdRef.current) clearTimeout(timerIdRef.current);
        setFeedback(`Time's up! Correct: ${getCorrectAnswerText(currentCard)}`);
        setShowingAnswer(true);
    };

    const handleOptionSelect = (selectedOptionId) => {
        if (showingAnswer || !currentCard) return;
        if (timerIdRef.current) clearTimeout(timerIdRef.current);
        const isCorrect = selectedOptionId === currentCard.correct_answer;
        if (isCorrect) {
            setFeedback("Correct!");
            feedbackTimeoutIdRef.current = setTimeout(() => {
                 setRemainingQuestions(prev => prev.filter(q => q.id !== currentCard.id));
            }, 1500);
        } else {
            setFeedback(`Incorrect. Correct: ${getCorrectAnswerText(currentCard)}`);
            setShowingAnswer(true);
        }
    };

    const handleProceedToNextCard = () => {
        if (!currentCard) return;
        setRemainingQuestions(prev => prev.filter(q => q.id !== currentCard.id));
    };

    const handleRestartFlashcards = () => {
        setRemainingQuestions(shuffleArray(initialQuestions || []));
    };

    if (!initialQuestions || initialQuestions.length === 0) {
        return (
            <div className="text-center p-6">
                <p className="text-xl text-gray-700 mb-6">No questions available for flashcards in this selection.</p>
                <button onClick={onNavigateHome} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded text-lg">
                    Back to Home
                </button>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="text-center p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-green-600 mb-6">Flashcards Done!</h2>
                <p className="text-lg text-gray-700 mb-8">You have completed all flashcards for this session.</p>
                <div className="space-y-4">
                    <button onClick={handleRestartFlashcards} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg transition-colors">
                        Restart Session
                    </button>
                    <button onClick={onNavigateHome} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded text-lg transition-colors">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 md:p-8 rounded-xl shadow-2xl max-w-xl mx-auto my-8 text-center">
            <div className="mb-4">
                {!showingAnswer && <div className="text-2xl font-bold text-blue-600" role="timer">{timer}s</div>}
                {feedback &&
                    <p className={`my-3 p-3 rounded-md text-lg font-medium ${
                        feedback.startsWith("Correct") ? 'bg-green-100 text-green-700' :
                        feedback.startsWith("Time") ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}`
                    }>
                        {feedback}
                    </p>
                }
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-inner min-h-[150px] flex flex-col justify-center items-center mb-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800">{currentCard.question_text}</h3>
                <p className="text-lg text-gray-600 italic mt-1">{currentCard.question_text_de}</p>
            </div>

            {!showingAnswer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentCard.options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
                            {opt.id.toUpperCase()}. {opt.text}
                            <span className="italic text-sm opacity-90"> ({opt.text_de})</span>
                        </button>
                    ))}
                </div>
            ) : (
                <button
                    onClick={handleProceedToNextCard}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
                    Next Card
                </button>
            )}
            <button
                onClick={onNavigateHome}
                className="mt-8 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg w-full transition-colors">
                Finish Session & Go Home
            </button>
        </div>
    );
};


// --- App Component Definition ---
const App = () => {
    const [allQuestionsData, setAllQuestionsData] = useState([]);
    const [statesData, setStatesData] = useState({});
    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('loading');
    const [practiceSessionQuestions, setPracticeSessionQuestions] = useState([]);
    const [examSessionQuestions, setExamSessionQuestions] = useState([]);
    const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            let qError = null, sError = null, tempQuestions = [], tempStatesData = {};
            try {
                // For Vite, files in public directory are served at root.
                const qResponse = await fetch('/data/question.json');
                if (!qResponse.ok) throw new Error(`Questions fetch failed: ${qResponse.status} ${qResponse.statusText}`);
                const newQuestionsData = await qResponse.json();
                if (!Array.isArray(newQuestionsData)) { throw new Error('Invalid questions format (expected array).'); }

                // Transform new data structure to the old one
                tempQuestions = newQuestionsData.map(newQuestion => {
                    const options = ['a', 'b', 'c', 'd'].reduce((acc, key) => {
                        if (newQuestion.hasOwnProperty(key)) {
                            acc.push({
                                id: key,
                                text: newQuestion.translation?.en?.[key] || '',
                                text_de: newQuestion[key] || ''
                            });
                        }
                        return acc;
                    }, []);

                    return {
                        id: newQuestion.id,
                        question_text: newQuestion.translation?.en?.question || '',
                        question_text_de: newQuestion.question || '',
                        options: options,
                        correct_answer: newQuestion.solution,
                        explanation: newQuestion.translation?.en?.context || newQuestion.context || '',
                        state_code: null // Not available in new structure
                    };
                });

            } catch (e) { qError = e.message; }
            try {
                const sResponse = await fetch('/data/states.json');
                if (!sResponse.ok) throw new Error(`States fetch failed: ${sResponse.status} ${sResponse.statusText}`);
                const statesArray = await sResponse.json();
                if (!Array.isArray(statesArray)) { throw new Error('Invalid states format.'); }
                tempStatesData = statesArray.reduce((obj, state) => { obj[state.code] = state.name; return obj; }, {});
            } catch (e) { sError = e.message; }

            setAllQuestionsData(tempQuestions);
            setStatesData(tempStatesData);

            if (qError || sError) {
                setLoadingError([qError, sError].filter(Boolean).join('; '));
                setCurrentView(tempQuestions.length ? 'home' : 'error');
            } else if (!tempQuestions.length && !sError) { // No questions but states might have loaded
                setLoadingError('No questions found in the data file.');
                setCurrentView('error'); // Or 'home' if states list is useful alone
            } else {
                setCurrentView('home');
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleStartPractice = useCallback((stateCode) => {
        localStorage.setItem('selectedState', stateCode);
        let filtered = (stateCode && stateCode !== "") ? allQuestionsData.filter(q => q.state_code === stateCode || !q.state_code || q.state_code === "") : [...allQuestionsData];
        setPracticeSessionQuestions(shuffleArray(filtered));
        setCurrentView('practice');
    }, [allQuestionsData]);

    const handleStartExam = useCallback((stateCode) => {
        if (!stateCode) { alert("Please select state for exam."); return; }
        localStorage.setItem('selectedState', stateCode);
        const generalQ = shuffleArray(allQuestionsData.filter(q => !q.state_code || q.state_code === ""));
        const stateQ = shuffleArray(allQuestionsData.filter(q => q.state_code === stateCode));
        let chosenQ = [];
        chosenQ.push(...stateQ.slice(0, 3));
        const generalNeeded = 10 - chosenQ.length;
        if (generalNeeded > 0) { chosenQ.push(...generalQ.slice(0, generalNeeded)); }
        if (chosenQ.length < 10 && chosenQ.length < stateQ.length) {
            const needed = 10 - chosenQ.length;
            const currentIds = new Set(chosenQ.map(q => q.id));
            chosenQ.push(...stateQ.filter(q => !currentIds.has(q.id)).slice(0, needed));
        }
        setExamSessionQuestions(shuffleArray(chosenQ.slice(0,10)));
        setCurrentView('exam');
    }, [allQuestionsData]);

    const handleStartFlashcards = useCallback((stateCode) => {
        localStorage.setItem('selectedState', stateCode);
        let filtered = (stateCode && stateCode !== "") ? allQuestionsData.filter(q => q.state_code === stateCode || !q.state_code || q.state_code === "") : [...allQuestionsData];
        setFlashcardSessionQuestions(shuffleArray(filtered));
        setCurrentView('flashcards');
    }, [allQuestionsData]);

    const navigateHome = useCallback(() => setCurrentView('home'), []);

    const renderContent = () => {
        if (isLoading && currentView === 'loading') return <p className="text-center text-gray-500 text-xl py-10">Loading data...</p>;
        if (currentView === 'error') return (
            <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-3">App Error</h2>
                <p className="mb-2">Problem loading data:</p>
                <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">{loadingError || "Unknown error."}</pre>
                <p className="mt-4">Try refreshing. Ensure data files are correct and accessible from the /public directory (e.g. /data/question.json).</p>
            </div>
        );

        switch (currentView) {
            case 'home': return <HomePage statesData={statesData} onStartPractice={handleStartPractice} onStartExam={handleStartExam} onStartFlashcards={handleStartFlashcards} />;
            case 'practice': return <PracticeMode questions={practiceSessionQuestions} onNavigateHome={navigateHome} />;
            case 'exam': return <ExamMode questions={examSessionQuestions} onNavigateHome={navigateHome} examDuration={600} />;
            case 'flashcards': return <FlashcardMode initialQuestions={flashcardSessionQuestions} onNavigateHome={navigateHome} cardDuration={15}/>;
            default: return (
                <div className="text-center text-red-500 p-6">
                    <p className="text-xl">Unexpected error or unknown view.</p>
                    <button onClick={navigateHome} className="mt-4 bg-indigo-500 text-white py-2 px-3 rounded">Home</button>
                </div>
            );
        }
    };

    return (
        <React.Fragment>
            <header className="bg-blue-600 text-white p-4 rounded-lg shadow-md mb-6">
                <h1 className="text-3xl font-bold text-center">Einbürgerungstest Practice - React</h1>
            </header>
            <main id="main-content" className="container mx-auto p-4 min-h-[calc(100vh-200px)]">
                {renderContent()}
            </main>
            <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Einbürgerungstest Practice (React Version)</p>
            </footer>
        </React.Fragment>
    );
};

export default App;
