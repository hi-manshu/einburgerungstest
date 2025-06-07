import React from 'react';

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
                {questions.map((question, index) => {
                    const userAnswer = userAnswers[question.id];
                    const isCorrect = userAnswer === question.correct_answer;
                    const correctAnswerText = question.options.find(opt => opt.id === question.correct_answer)?.text;
                    const userAnswerText = question.options.find(opt => opt.id === userAnswer)?.text;

                    return (
                        <div key={question.id} className={`p-4 mb-3 rounded-lg border ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                            <p className="font-semibold text-gray-800">Q{index + 1}: {question.question_text}</p>
                            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                Your answer: {userAnswer ? `${userAnswer.toUpperCase()}. ${userAnswerText}` : 'Not answered'}
                                {isCorrect ? <span className="font-bold"> (Correct)</span> : <span className="font-bold"> (Incorrect)</span>}
                            </p>
                            {!isCorrect && (
                                <p className="text-sm text-blue-700 font-medium">Correct answer: {question.correct_answer.toUpperCase()}. {correctAnswerText}</p>
                            )}
                        </div>
                    );
                })}
                {questions.length === 0 && <p className="text-gray-500">No questions to review.</p>}
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
