export default HomePage = ({ statesData, onStartPractice, onStartExam, onStartFlashcards }) => {
    const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || '');

    const handleStateChange = (event) => {
        const newState = event.target.value;
        setSelectedState(newState);
        localStorage.setItem('selectedState', newState);
    };

    // Handler to reset the selected state
    const handleResetState = () => {
        setSelectedState(''); // Reset selected state to empty
        localStorage.removeItem('selectedState'); // Clear from local storage
    };

    const handleNavigation = (navigationFunc, requiresState = true) => {
        if (requiresState && !selectedState) {
            // Replaced alert with a simple console log for Canvas environment
            console.log("Please select a state to proceed with this mode.");
            return;
        }
        navigationFunc(selectedState);
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-8">Welcome! Choose your mode:</h2>
            {/* The flex container for the two columns. items-start aligns them to the top */}
            <div className="flex flex-row gap-8 mt-4 items-start">
                {/* Left Column: State Selection - now wraps content with self-start */}
                <div className="md:w-2/4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 self-start">
                    <h3 className="text-xl font-semibold mb-3 text-gray-700">1. Select Your State</h3>
                    <label htmlFor="state-select" className="sr-only">
                        Select Your State:
                    </label>
                    <select
                        id="state-select"
                        value={selectedState}
                        onChange={handleStateChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow">
                        <option value="">Select a State</option>
                        {Object.entries(statesData || {}).sort(([,a],[,b]) => a.localeCompare(b)).map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                        ))}
                    </select>
                    {!selectedState && (
                         <p className="text-sm text-gray-500 mt-2">Please select a state to enable activities.</p>
                    )}
                    {/* New Reset State Button */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleResetState}
                            className="bg-gray-400 hover:bg-gray-500 text-white text-sm font-bold py-2 px-3 rounded shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedState} // Enabled only if a state is selected
                        >
                            Reset State
                        </button>
                    </div>
                </div>

                {/* Right Column: Activity Buttons */}
                <div className="md:w-2/4 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">2. Choose an Activity</h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => handleNavigation(onStartPractice)}
                            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedState}>
                            Practice
                        </button>
                        <button
                            onClick={() => handleNavigation(onStartExam)}
                            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedState}>
                            Test
                        </button>
                        <button
                            onClick={() => handleNavigation(onStartFlashcards)}
                            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedState}>
                            Flashcards
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

