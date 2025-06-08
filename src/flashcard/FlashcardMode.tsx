import React, { useState, useEffect, useRef } from "react";
import { logAnalyticsEvent } from "../utils/analytics";
import shuffleArray from "../utils/shuffleArray";
import { Question, Option } from "../types"; // Import shared types

interface FlashcardModeProps {
  initialQuestions: Question[];
  onNavigateHome: () => void;
  cardDuration?: number;
  selectedLanguageCode: string;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({
  initialQuestions,
  onNavigateHome,
  cardDuration = 15,
  selectedLanguageCode,
}) => {
  const [remainingQuestions, setRemainingQuestions] = useState<Question[]>([]);
  const [currentCard, setCurrentCard] = useState<Question | null>(null);
  const [showingAnswer, setShowingAnswer] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [timer, setTimer] = useState<number>(cardDuration);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const entryTimeRef = useRef<number | null>(null);

  const handleCancelFlashcards = () => {
    logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'cancel_flashcards' });
    onNavigateHome();
  };

  useEffect(() => {
    entryTimeRef.current = Date.now();
    return () => {
      if (entryTimeRef.current) {
        const duration = Date.now() - entryTimeRef.current;
        logAnalyticsEvent('timing_complete', {
            name: 'flashcard_mode',
            value: duration,
            event_category: 'engagement',
            event_label: 'time_spent_on_flashcards'
        });
        entryTimeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setRemainingQuestions(shuffleArray(initialQuestions || []) as Question[]);
  }, [initialQuestions]);

  useEffect(() => {
    if (feedbackTimeoutIdRef.current)
      clearTimeout(feedbackTimeoutIdRef.current);
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
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && !showingAnswer && currentCard) {
      handleFlashcardTimeout();
    }
    return () => {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    };
  }, [currentCard, showingAnswer, timer, cardDuration]);

  const getCorrectAnswerText = (card: Question | null): string => {
    if (!card || !card.options || !card.correct_answer) return "N/A";
    const correctOption = card.options.find(
      (opt) => opt.id === card.correct_answer
    );
    if (!correctOption) return "N/A";
    return `${card.correct_answer.toUpperCase()}. ${correctOption.text}`;
  };

  const handleFlashcardTimeout = () => {
    if (!currentCard) return;
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
    setFeedback(
      `Zeit abgelaufen! Richtig: ${getCorrectAnswerText(currentCard)}`
    );
    setShowingAnswer(true);
  };

  const handleOptionSelect = (selectedOptionId: string) => {
    if (showingAnswer || !currentCard) return;
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
    const isCorrect = selectedOptionId === currentCard.correct_answer;
    logAnalyticsEvent('select_content', {
        content_type: 'button',
        item_id: 'flashcard_option_select',
        card_id: currentCard.id,
        selected_option: selectedOptionId,
        is_correct: isCorrect
    });
    if (isCorrect) {
      setFeedback("Richtig!");
      // Marking as known implicitly by getting it right
      logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'flashcard_mark_known', card_id: currentCard.id });
      feedbackTimeoutIdRef.current = setTimeout(() => {
        setRemainingQuestions((prev) =>
          prev.filter((q) => q.id !== currentCard!.id)
        );
      }, 1500);
    } else {
      setFeedback(`Falsch. Richtig: ${getCorrectAnswerText(currentCard)}`);
      // Marking as unknown implicitly by getting it wrong
      logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'flashcard_mark_unknown', card_id: currentCard.id });
      setShowingAnswer(true); // Show answer, user will then click next
    }
  };

  const handleProceedToNextCard = () => {
    if (!currentCard) return;
    logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'flashcard_next_card', card_id: currentCard.id });
    setRemainingQuestions((prev) =>
      prev.filter((q) => q.id !== currentCard!.id)
    );
  };

  const handleRestartFlashcards = () => {
    logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'flashcard_restart' });
    setRemainingQuestions(shuffleArray(initialQuestions || []) as Question[]);
  };

  // Note: selectedLanguageCode is passed but not directly used in this component's rendering logic for now.
  // It might be used if translations were to be displayed on flashcards.

  if (!initialQuestions || initialQuestions.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-xl text-gray-700 mb-6">Keine Fragen verfügbar.</p>
        <button
          onClick={handleCancelFlashcards}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded text-lg"
        >
          Zurück zur Startseite
        </button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-green-600 mb-6">Fertig!</h2>
        <p className="text-lg text-gray-700 mb-8">
          Du hast alle Karten dieser Sitzung durchgesehen.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleRestartFlashcards}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg transition-colors"
          >
            Wiederholen
          </button>
          <button
            onClick={handleCancelFlashcards}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded text-lg transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 md:p-8 rounded-xl shadow-2xl max-w-xl mx-auto my-8 text-center">
      <div className="mb-4">
        {!showingAnswer && (
          <div className="text-2xl font-bold text-blue-600" role="timer">
            {timer}s
          </div>
        )}
        {feedback && (
          <p
            className={`my-3 p-3 rounded-md text-lg font-medium ${
              feedback.startsWith("Richtig")
                ? "bg-green-100 text-green-700"
                : feedback.startsWith("Zeit")
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-inner min-h-[150px] flex flex-col justify-center items-center mb-6">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
          {currentCard.question_text}
        </h3>
      </div>

      {!showingAnswer ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentCard.options.map((opt: Option) => (
            <button
              key={opt.id}
              onClick={() => {
                  handleOptionSelect(opt.id);
                  // Flipping the card is implicit in selecting an option
                  logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'flashcard_flip', card_id: currentCard.id });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            >
              <div className="text-base">
                {opt.id.toUpperCase()}. {opt.text}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={handleProceedToNextCard}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
        >
          Nächste Karte (Next Card)
        </button>
      )}
      <button
        onClick={handleCancelFlashcards}
        className="mt-8 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg w-full transition-colors"
      >
        Return to Home
      </button>
    </div>
  );
};

export default FlashcardMode;
