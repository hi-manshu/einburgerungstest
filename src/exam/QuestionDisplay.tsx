import React from 'react';
import { Question, Option, ExamUserAnswers } from '../types';

interface QuestionDisplayProps {
    currentQuestion: Question | null;
    examUserAnswers: ExamUserAnswers;
    handleExamAnswerSelection: (questionId: string, selectedOptionId: string) => void;
    currentExamQuestionIndex: number;
    totalQuestions: number;
    isExamMode: boolean;
    selectedLanguageCode: string;
}

const languageMap: { [key: string]: string } = {
    en: "English",
    tr: "Türkçe",
    ru: "Русский",
    fr: "Français",
    ar: "العربية",
    uk: "Українська",
    hi: "हिन्दी"
};

const getLanguageName = (code: string): string => {
    return languageMap[code] || code;
};


const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    currentQuestion,
    examUserAnswers,
    handleExamAnswerSelection,
    currentExamQuestionIndex,
    totalQuestions,
    isExamMode,
    selectedLanguageCode
}) => {
    if (!currentQuestion) {
        return <p className="text-xl text-gray-700 p-4 text-center">Loading question...</p>;
    }

    return (
        <>
            <p className="text-sm text-gray-500 mb-2">Q {currentExamQuestionIndex + 1}/{totalQuestions}</p>
            <h3 className="text-lg md:text-xl font-medium mb-1">{currentQuestion.question_text}</h3>
            {!isExamMode && currentQuestion.question_text_translation && (
                <p className="text-sm text-gray-500 mt-1 mb-4 italic">
                    {`(${getLanguageName(selectedLanguageCode)}) ${currentQuestion.question_text_translation}`}
                </p>
            )}
            <div className="space-y-3 mb-6">
                {currentQuestion.options.map((opt: Option) => (
                    <label key={opt.id} className={`flex flex-col items-start p-3 border rounded-md transition-all cursor-pointer hover:bg-gray-50 ${examUserAnswers[currentQuestion!.id] === opt.id ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300' : 'border-gray-300'}`}>
                        <div className="flex items-center w-full">
                            <input
                                type="radio"
                                name={`exam_option_${currentQuestion!.id}`}
                                value={opt.id}
                                checked={examUserAnswers[currentQuestion!.id] === opt.id}
                                onChange={() => handleExamAnswerSelection(currentQuestion!.id, opt.id)}
                                className="form-radio h-5 w-5 text-blue-600 mr-3 focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className="font-medium mr-1">{opt.id.toUpperCase()}.</span>
                            <span className="text-gray-800">{opt.text}</span>
                        </div>
                        {!isExamMode && opt.text_translation && (
                            <span className="italic text-xs text-gray-500 ml-8 mt-1">
                                {`(${getLanguageName(selectedLanguageCode)}) ${opt.text_translation}`}
                            </span>
                        )}
                    </label>
                ))}
            </div>
        </>
    );
};
export default QuestionDisplay;
