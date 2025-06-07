import React from 'react';

const QuestionDisplay = ({ currentQuestion, examUserAnswers, handleExamAnswerSelection, currentExamQuestionIndex, totalQuestions }) => {
    if (!currentQuestion) {
        // This case might be hit if questions array is empty or currentExamQuestionIndex is out of bounds
        // ExamMode itself has a higher-level check for initialExamQuestions.length === 0
        // And another for !currentQuestion after initial load, so this might be redundant or a safeguard.
        return <p className="text-xl text-gray-700 p-4 text-center">Loading question...</p>;
    }

    return (
        <>
            <p className="text-sm text-gray-500 mb-2">Q {currentExamQuestionIndex + 1}/{totalQuestions}</p>
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
        </>
    );
};
export default QuestionDisplay;
