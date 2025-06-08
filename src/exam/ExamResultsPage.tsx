import React, { useState, useMemo } from 'react';
import { Question, ExamUserAnswers, ExamResultsPageProps } from '../types'; // Import correct props type

// Message Categories (can remain local or be moved to a constants file if desired)
const perfectScoreMessages: string[] = [
    "Perfect Score! You Crushed It!", "Flawless Victory!", "33 Out of 33? You're a Legend!",
    "Nailed It! You’re the Gold Standard!", "This Test Didn’t Stand a Chance!", "Zero Mistakes. All Brilliance."
];
const passedMessages: string[] = [
    "Well Done! You Passed With Style!", "On Point! Keep the Momentum Going!", "Solid Work! You’ve Got This!",
    "Pass Unlocked—Next Level Awaits!", "Good Job! Just a Few More to Perfection.", "You Did It—And You’re Just Getting Started!"
];
const failedMessages: string[] = [
    "Keep Practicing, You Can Do It!", "Not This Time—But You’re Closer Than You Think!", "Failure’s Just a Stepping Stone—Let’s Try Again!",
    "Missed the Mark? Reset and Fire Again!", "Oops! Time to Learn and Level Up!", "Practice Mode: Activated. Powering Up…"
];

const ExamResultsPage: React.FC<ExamResultsPageProps> = ({
    questions = [],
    userAnswers = {},
    timeTaken = 0,
    score = 0,
    isPassed = false,
    passMark = 0, // Expecting percentage
    correctAnswersCount = 0, // Use passed prop
    onNavigateHome,
    onRetryTest,
    onStartNewTest,
    selectedLanguageCode // Added to props
}) => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const languageMap: { [key: string]: string } = {
        en: "English", tr: "Türkçe", ru: "Русский", fr: "Français", ar: "العربية", uk: "Українська", hi: "हिन्दी"
    };
    const getLanguageName = (code: string): string => languageMap[code] || code;


    const outcomeData = useMemo(() => {
        let messageArray: string[];
        let color: string;

        // Using correctAnswersCount directly from props as source of truth for result category
        if (correctAnswersCount === questions.length && questions.length > 0) { // Perfect score condition
             messageArray = perfectScoreMessages;
             color = 'text-green-600';
        } else if (isPassed) {
            messageArray = passedMessages;
            color = 'text-green-600';
        } else {
            messageArray = failedMessages;
            color = 'text-red-600';
        }
        const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : "Results processed.";
        return { message, color };
    }, [isPassed, correctAnswersCount, questions.length]); // Dependencies reflect props used

    const questionToDisplay: Question | undefined = questions[selectedQuestionIndex];
    const userAnswerDetails: string | undefined = questionToDisplay ? userAnswers[questionToDisplay.id] : undefined;
    const isCorrectDetails: boolean = questionToDisplay && userAnswerDetails !== undefined ? userAnswerDetails === questionToDisplay.correct_answer : false;

    let correctAnswerTextDetails: string = 'N/A';
    let userAnswerTextDetails: string = 'N/A';

    if (questionToDisplay) {
        const correctAnswerOption = questionToDisplay.options.find(opt => opt.id === questionToDisplay.correct_answer);
        correctAnswerTextDetails = correctAnswerOption ? correctAnswerOption.text : 'N/A';

        if (userAnswerDetails !== undefined) {
            const userAnswerOption = questionToDisplay.options.find(opt => opt.id === userAnswerDetails);
            userAnswerTextDetails = userAnswerOption ? userAnswerOption.text : 'N/A';
        }
    }

    // Determine the number of correct answers needed based on the passMark percentage and total questions
    // This is for display purposes, as `isPassed` prop determines the actual outcome.
    const passMarkAbsolute = Math.ceil((passMark / 100) * questions.length);


    return (
        <div className={`bg-slate-50 p-6 md:p-8 rounded-lg shadow-lg max-w-3xl mx-auto my-8 border-t-8 ${isPassed ? 'border-green-500' : 'border-red-500'}`}>
            <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700">Exam Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center md:text-left">
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
                    <p className="text-lg text-gray-700">Time Taken:</p>
                    <p className="text-2xl font-semibold text-blue-600">{formatTime(timeTaken)}</p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
                    <p className="text-lg text-gray-700">Your Score:</p>
                    <p className={`text-2xl font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {score.toFixed(0)}% ({correctAnswersCount}/{questions.length})
                    </p>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm md:col-span-2">
                     <p className="text-lg text-gray-700">Outcome:</p>
                    <p className={`text-2xl font-bold ${outcomeData.color}`}>
                        {outcomeData.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        (Pass mark: {passMarkAbsolute} correct out of {questions.length} questions)
                    </p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-indigo-600">Question Review</h3>
                <div className="flex overflow-x-auto space-x-2 p-2 mb-4 bg-slate-200 rounded-md shadow-sm">
                    {questions.map((question: Question, index: number) => {
                        const userAnswer = userAnswers[question.id];
                        const isCorrect = userAnswer === question.correct_answer;
                        const boxColor = isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
                        const textColor = 'text-white';

                        return (
                            <button
                                key={question.id}
                                onClick={() => setSelectedQuestionIndex(index)}
                                className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center font-semibold transition-colors ${boxColor} ${textColor} ${selectedQuestionIndex === index ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                aria-pressed={selectedQuestionIndex === index}
                                aria-label={`Question ${index + 1}`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                    {questions.length === 0 && <p className="text-gray-500 p-2">No questions to review.</p>}
                </div>

                <div className="mt-4 p-5 border border-slate-200 rounded-lg bg-white shadow-md min-h-[150px]">
                    {questionToDisplay ? (
                        <>
                            <p className="text-sm text-gray-500 mb-1">
                                Question {selectedQuestionIndex + 1} of {questions.length}
                            </p>
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                {questionToDisplay.question_text}
                            </h4>
                            {/* Display translated question text if available and language is not German (assuming 'de' is the base) */}
                            {selectedLanguageCode !== 'de' && questionToDisplay.question_text_translation && (
                                <p className="text-md text-gray-600 mb-3 italic">
                                    ({getLanguageName(selectedLanguageCode)}) {questionToDisplay.question_text_translation}
                                </p>
                            )}
                             {/* Display German question text if primary is translation and German text exists */}
                             {selectedLanguageCode === 'de' && questionToDisplay.question_text_de && (
                                <p className="text-md text-gray-600 mb-3 italic">
                                     {questionToDisplay.question_text_de}
                                </p>
                            )}


                            {userAnswerDetails !== undefined ? (
                                <>
                                    <p className={`text-sm ${isCorrectDetails ? 'text-green-700' : 'text-red-700'}`}>
                                        Your answer: <span className="font-bold">{String(userAnswerDetails).toUpperCase()}. {userAnswerTextDetails}</span>
                                        {isCorrectDetails ?
                                            <span className="font-semibold"> (Correct)</span> :
                                            <span className="font-semibold"> (Incorrect)</span>}
                                    </p>
                                    {!isCorrectDetails && (
                                        <p className="text-sm text-blue-700 font-medium mt-1">
                                            Correct answer: <span className="font-bold">{String(questionToDisplay.correct_answer).toUpperCase()}. {correctAnswerTextDetails}</span>
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 font-medium">
                                    You did not answer this question.
                                    <br />
                                     Correct answer: <span className="font-bold">{String(questionToDisplay.correct_answer).toUpperCase()}. {correctAnswerTextDetails}</span>
                                </p>
                            )}
                            {questionToDisplay.explanation && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <h5 className="text-xs font-semibold text-gray-500 mb-1 uppercase">Explanation</h5>
                                    {/* Check for selected language specific explanation first, then fallback */}
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedLanguageCode !== 'de' && (questionToDisplay as any).translation?.[selectedLanguageCode]?.context
                                            ? (questionToDisplay as any).translation[selectedLanguageCode].context
                                            : questionToDisplay.explanation}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500">Select a question number to see details.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-row flex-wrap justify-center items-center gap-4">
                <button
                    onClick={onRetryTest}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg min-w-[160px] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 ease-in-out">
                    Retry Test
                </button>
                <button
                    onClick={onStartNewTest}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg min-w-[160px] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 ease-in-out">
                    New Test
                </button>
                <button
                    onClick={onNavigateHome}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg min-w-[160px] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 ease-in-out">
                    Home
                </button>
            </div>
        </div>
    );
};

export default ExamResultsPage;
