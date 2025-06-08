import React, { ChangeEvent } from 'react';
import { StatesData } from '../types';
import LanguageSelector from './ui/LanguageSelector';
import StateSelector from './ui/StateSelector';
import ActivityButtons from './ActivityButtons';

// Defined locally as it's specific to HomePage's language options display
interface Language {
    code: string;
    name: string;
}

interface HomePageProps {
    statesData: StatesData;
    onStartPractice: (stateCode: string) => void;
    onStartExam: (stateCode: string) => void;
    onStartFlashcards: (stateCode: string) => void;
    selectedState: string;
    onStateChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onResetState: () => void;
    selectedLanguage: string;
    onLanguageChange: (newLanguage: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
    statesData,
    onStartPractice,
    onStartExam,
    onStartFlashcards,
    selectedState,
    onStateChange,
    onResetState,
    selectedLanguage,
    onLanguageChange
}) => {

    // This function wraps the navigation call with a state check.
    // It will be passed to ActivityButtons which calls it.
    const handleActivityNavigation = (activityStartFunction: (stateCode: string) => void) => {
        if (!selectedState) {
            console.log("Please select a state to proceed with this mode.");
            // Optionally, show a more user-friendly message/modal here
            return;
        }
        activityStartFunction(selectedState);
    };

    const LANGUAGES: Language[] = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'ru', name: 'Русский' },
        { code: 'fr', name: 'Français' },
        { code: 'ar', name: 'العربية' },
        { code: 'uk', name: 'Українська' },
        { code: 'hi', name: 'हिन्दी' }
    ];

    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-8">Let’s get started — choose how you’d like to learn today!</h2>
            <div className="flex flex-col gap-8 items-center">
                <div className="flex flex-row gap-8 mt-4 items-start w-full max-w-4xl">
                    <div className="md:w-2/4 flex flex-col gap-8">
                        <StateSelector
                            selectedState={selectedState}
                            onStateChange={onStateChange}
                            onResetState={onResetState}
                            statesData={statesData}
                            id="home-state-select"
                        />
                        <LanguageSelector
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={onLanguageChange}
                            languages={LANGUAGES}
                            id="home-language-select"
                        />
                    </div>
                    <ActivityButtons
                        onStartPractice={() => handleActivityNavigation(onStartPractice)}
                        onStartExam={() => handleActivityNavigation(onStartExam)}
                        onStartFlashcards={() => handleActivityNavigation(onStartFlashcards)}
                        disabled={!selectedState}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
