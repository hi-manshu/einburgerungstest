import React, { useState, useEffect } from 'react';

const OnboardingDialog = ({ statesData, onSavePreferences, availableLanguages }) => {
    const [selectedState, setSelectedState] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages && availableLanguages.length > 0 ? availableLanguages[0].code : '');

    // Pre-select first language if availableLanguages is populated
    useEffect(() => {
        if (availableLanguages && availableLanguages.length > 0 && !selectedLanguage) {
            setSelectedLanguage(availableLanguages[0].code);
        }
    }, [availableLanguages, selectedLanguage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedState || !selectedLanguage) {
            alert("Please select both a state and a language."); // Simple validation
            return;
        }
        onSavePreferences(selectedState, selectedLanguage);
    };

    if (!statesData || statesData.length === 0) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full">
                    <p className="text-center text-gray-700">Loading state data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome!</h2>
                <p className="text-md mb-6 text-center text-gray-600">Let's set up your preferences to get started.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="state-select-onboarding" className="block text-sm font-medium text-gray-700 mb-1">
                            Your State
                        </label>
                        <select
                            id="state-select-onboarding"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        >
                            <option value="" disabled>Select your state</option>
                            {statesData.sort((a,b) => a.name.localeCompare(b.name)).map((state) => (
                                <option key={state.code} value={state.code}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-8">
                        <label htmlFor="language-select-onboarding" className="block text-sm font-medium text-gray-700 mb-1">
                            Practice Translation Language
                        </label>
                        <select
                            id="language-select-onboarding"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        >
                            {(availableLanguages && availableLanguages.length > 0) ? (
                                availableLanguages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Loading languages...</option>
                            )}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Translations are shown during practice. Main content is in German.</p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    >
                        Save Preferences & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingDialog;
