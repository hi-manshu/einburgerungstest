import React from 'react';

// Placeholder icons (replace with actual SVGs or an icon library later)
const PracticeIcon = () => <span className="text-4xl mb-4 text-indigo-500">📝</span>; // Using emoji as placeholder
const ExamIcon = () => <span className="text-4xl mb-4 text-green-500">⏱️</span>; // Using emoji as placeholder
const FlashcardIcon = () => <span className="text-4xl mb-4 text-purple-500">🗂️</span>; // Using emoji as placeholder

const HomePage = ({ onStartPractice, onStartExam, onStartFlashcards, selectedState }) => {
    // selectedState is passed from App.jsx. It's implicitly used by the action handlers
    // which are defined in App.jsx and already have access to selectedState from App's state.
    // No explicit check for selectedState here is needed as App.jsx handles the onboarding flow
    // and ensures selectedState is set before rendering HomePage.

    const cardsData = [
        {
            id: 'practice',
            icon: <PracticeIcon />,
            title: 'Practice Questions',
            subtitle: 'Sharpen your knowledge with topic-specific questions. Review answers and explanations.',
            buttonText: 'Start Practice',
            action: onStartPractice,
            colorClass: 'hover:border-indigo-400',
        },
        {
            id: 'exam',
            icon: <ExamIcon />,
            title: 'Mock Exam',
            subtitle: 'Simulate the official test with 33 questions under timed conditions (60 minutes).',
            buttonText: 'Start Exam',
            action: onStartExam,
            colorClass: 'hover:border-green-400',
        },
        {
            id: 'flashcards',
            icon: <FlashcardIcon />,
            title: 'Flashcard Mode',
            subtitle: 'Review key questions and concepts with interactive flashcards for quick learning.',
            buttonText: 'Start Flashcards',
            action: onStartFlashcards,
            colorClass: 'hover:border-purple-400',
        },
    ];

    return (
        <div className="text-center py-8 px-4">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Choose Your Learning Mode</h2>
            <p className="text-md text-gray-600 mb-10 max-w-2xl mx-auto">
                Your preferences for state and language are set. Select an activity below to begin your preparation for the Einbürgerungstest.
            </p>

            {/* Cards Container */}
            <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 max-w-5xl mx-auto">
                {cardsData.map((card) => (
                    <div
                        key={card.id}
                        className={`group relative bg-white p-6 rounded-xl shadow-lg border border-gray-200
                                    transition-all duration-300 ease-in-out transform hover:scale-105
                                    flex flex-col items-center text-center md:w-1/3 ${card.colorClass} cursor-pointer`}
                        onClick={card.action} // Make the whole card clickable
                        style={{ minHeight: '300px' }} // Ensure cards have a minimum height, adjusted for content
                    >
                        {card.icon}
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                        <div className="flex-grow flex items-center"> {/* Wrapper for subtitle to center it vertically */}
                            <p className="text-sm text-gray-600 mb-4">{card.subtitle}</p>
                        </div>
                        <div className="h-16"> {/* Reserved space for the button to prevent layout shift */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card's onClick if button is clicked directly
                                    card.action();
                                }}
                                className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white
                                           py-2 px-6 rounded-md shadow-md
                                           opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out
                                           transform group-hover:translate-y-0 translate-y-3 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {card.buttonText}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
