import React, { useState, useEffect, useRef } from 'react';
import shuffleArray from '../utils/shuffleArray.js';

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

export default FlashcardMode;
