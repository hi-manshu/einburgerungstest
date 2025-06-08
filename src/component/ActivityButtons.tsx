import React from 'react';

interface ActivityButtonsProps {
    onStartPractice: () => void;
    onStartExam: () => void;
    onStartFlashcards: () => void;
    disabled: boolean;
}

const ActivityButtons: React.FC<ActivityButtonsProps> = ({
    onStartPractice,
    onStartExam,
    onStartFlashcards,
    disabled
}) => {
    return (
        <div className="md:w-2/4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 self-start">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">2. Choose an Activity</h3>
            <div className="space-y-4">
                <button
                    onClick={onStartPractice}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    Practice
                </button>
                <button
                    onClick={onStartExam}
                    className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    Test
                </button>
                <button
                    onClick={onStartFlashcards}
                    className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    Flashcards
                </button>
            </div>
        </div>
    );
};

export default ActivityButtons;
