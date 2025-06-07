import React from 'react';

const ExamNavigation = ({ currentExamQuestionIndex, totalQuestions, handleNavigation, handleSubmitExam, examUserAnswers }) => {
    const hasAnswers = Object.keys(examUserAnswers).length > 0;

    return (
        <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
            <button
                onClick={() => handleNavigation(-1)}
                disabled={currentExamQuestionIndex === 0}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-opacity">
                Previous
            </button>

            {/* This button only appears if there are answers AND it's NOT the last question */}
            {hasAnswers && currentExamQuestionIndex < totalQuestions - 1 && (
                <button
                    onClick={() => handleSubmitExam(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors">
                    Finish Exam
                </button>
            )}

            {currentExamQuestionIndex < totalQuestions - 1 ? (
                <button
                    onClick={() => handleNavigation(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    Next
                </button>
            ) : (
                <button
                    onClick={() => handleSubmitExam(false)}
                    disabled={!hasAnswers} // Disabled if no answers on the last question
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
                    Submit Results
                </button>
            )}
        </div>
    );
};
export default ExamNavigation;
