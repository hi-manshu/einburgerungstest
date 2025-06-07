import React, { useState } from 'react'; // Imported useState

const ExamResultsPage = ({
    questions = [],
    userAnswers = {},
    timeTaken = 0,
    score = 0,
    isPassed = false,
    passMark = 0,
    onNavigateHome,
    onRetryTest,
    onStartNewTest
}) => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0); // Added state for selected question

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate correct answers count locally if not passed directly, or prefer passed prop if available
    let correctAnswersCount = 0;
    if (questions.length > 0 && Object.keys(userAnswers).length > 0) {
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correct_answer) {
                correctAnswersCount++;
            }
        });
    }
    // const calculatedScore = questions.length > 0 ? (correctAnswersCount / questions.length) * 100 : 0;
    // const calculatedIsPassed = correctAnswersCount >= passMark;

    // Derive data for the selected question to display
    const questionToDisplay = questions[selectedQuestionIndex];
    const userAnswerDetails = questionToDisplay ? userAnswers[questionToDisplay.id] : undefined;
    const isCorrectDetails = questionToDisplay && userAnswerDetails !== undefined ? userAnswerDetails === questionToDisplay.correct_answer : false;

    let correctAnswerTextDetails = '';
    let userAnswerTextDetails = '';

    if (questionToDisplay) {
        const correctAnswerOption = questionToDisplay.options.find(opt => opt.id === questionToDisplay.correct_answer);
        correctAnswerTextDetails = correctAnswerOption ? correctAnswerOption.text : 'N/A';

        if (userAnswerDetails !== undefined) {
            const userAnswerOption = questionToDisplay.options.find(opt => opt.id === userAnswerDetails);
            userAnswerTextDetails = userAnswerOption ? userAnswerOption.text : 'N/A';
        }
    }

    return (
        <div className={`bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-3xl mx-auto my-8 border-t-8 ${isPassed ? 'border-green-500' : 'border-red-500'}`}>
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Exam Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center md:text-left">
                <div className="bg-gray-100 p-5 rounded-lg shadow-sm"> {/* Changed p-4 to p-5 */}
                    <p className="text-lg text-gray-700">Time Taken:</p>
                    <p className="text-2xl font-semibold text-blue-600">{formatTime(timeTaken)}</p>
                </div>
                <div className="bg-gray-100 p-5 rounded-lg shadow-sm"> {/* Changed p-4 to p-5 */}
                    <p className="text-lg text-gray-700">Your Score:</p>
                    <p className={`text-2xl font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {score.toFixed(0)}% ({correctAnswersCount}/{questions.length})
                    </p>
                </div>
                <div className="bg-gray-100 p-5 rounded-lg shadow-sm md:col-span-2"> {/* Changed p-4 to p-5 */}
                     <p className="text-lg text-gray-700">Outcome:</p>
                    <p className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {isPassed ? 'Congratulations, You Passed!' : 'Keep Practicing, You Can Do It!'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">(Pass mark: {passMark} correct answers needed for {questions.length} questions)</p>
                </div>
            </div>

            {/* Placeholder for detailed question list - to be implemented next */}
            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">Question Review</h3>
                {/* Horizontal list of numbered boxes */}
                <div className="flex overflow-x-auto space-x-2 p-2 mb-4 bg-gray-100 rounded-md shadow-sm"> {/* Added shadow-sm */}
                    {questions.map((question, index) => {
                        const userAnswer = userAnswers[question.id];
                        const isCorrect = userAnswer === question.correct_answer;
                        const isAnswered = userAnswer !== undefined;

                        let boxColor = 'bg-gray-300 hover:bg-gray-400'; // Default for unanswered
                        if (isAnswered) {
                            boxColor = isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
                        }
                        const textColor = isAnswered ? 'text-white' : 'text-gray-700';

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

                {/* Display for selected question details */}
                <div className="mt-4 p-4 border rounded-lg bg-white shadow min-h-[150px]">
                    {questionToDisplay ? (
                        <>
                            <p className="text-sm text-gray-500 mb-1">
                                Question {selectedQuestionIndex + 1} of {questions.length}
                            </p>
                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                {questionToDisplay.question_text}
                            </h4>
                            <p className="text-md text-gray-600 mb-3 italic">
                                {questionToDisplay.question_text_de}
                            </p>

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
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{questionToDisplay.explanation}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500">Select a question number to see details.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={onRetryTest}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg min-w-[150px] transition-colors duration-150 ease-in-out">
                    Retry Test
                </button>
                <button
                    onClick={onStartNewTest}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded text-lg min-w-[150px] transition-colors duration-150 ease-in-out">
                    New Test
                </button>
                <button
                    onClick={onNavigateHome}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded text-lg min-w-[150px] transition-colors duration-150 ease-in-out">
                    Home
                </button>
            </div>
        </div>
    );
};

export default ExamResultsPage;
