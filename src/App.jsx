import React, { useState, useEffect, useCallback } from 'react'; // Removed useRef as it's not used in App.jsx
import PracticeMode from './practice/PracticeMode.jsx';
import ExamMode from './exam/ExamMode.jsx';
import ExamResultsPage from './exam/ExamResultsPage.jsx'; // Import ExamResultsPage
import Header from './component/header.jsx'
import FlashcardMode from './flashcard/FlashcardMode.jsx';
import shuffleArray from './utils/shuffleArray.js';

// --- HomePage Component Definition ---
// selectedState and its handler are now passed as props
const HomePage = ({ statesData, onStartPractice, onStartExam, onStartFlashcards, selectedState, onStateChange, onResetState }) => {

    const handleNavigation = (navigationFunc, requiresState = true) => {
        if (requiresState && !selectedState) {
            console.log("Please select a state to proceed with this mode.");
            return;
        }
        navigationFunc(selectedState); // Pass selectedState from props
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-8">Let’s get started — choose how you’d like to learn today!</h2>
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
                        value={selectedState} // Use selectedState from props
                        onChange={onStateChange} // Use onStateChange from props
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
                            onClick={onResetState} // Use onResetState from props
                            className="bg-pink-400 hover:bg-black-500 text-white text-sm font-bold py-2 px-3 rounded shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedState}
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

// --- App Component Definition ---
const App = () => {
    const [rawQuestionsData, setRawQuestionsData] = useState(null); // Store raw questions
    const [allQuestionsData, setAllQuestionsData] = useState([]);
    const [statesData, setStatesData] = useState({}); // Assuming states.json is simple and doesn't need raw storage or language processing for its own content
    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('loading');
    const [practiceSessionQuestions, setPracticeSessionQuestions] = useState([]);
    const [examQuestionsForMode, setExamQuestionsForMode] = useState([]); // Renamed from examSessionQuestions
    const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState([]);
    const [examResultsData, setExamResultsData] = useState(null); // For results page
    const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || ''); // Lifted selectedState
    const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'en');

    // Handler for state change, now in App.jsx
    const handleStateChange = useCallback((event) => {
        const newState = event.target.value;
        setSelectedState(newState);
        localStorage.setItem('selectedState', newState);
    }, []);

    // Handler to reset the selected state, now in App.jsx
    const handleResetState = useCallback(() => {
        setSelectedState('');
        localStorage.removeItem('selectedState');
    }, []);

    // Handler for language change
    const handleLanguageChange = useCallback((newLanguage) => {
        setSelectedLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
    }, []);

    // Effect for initial data fetching (runs once)
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            let qError = null, sError = null;
            let fetchedQuestions = null;
            let fetchedStatesData = {};

            try {
                const qResponse = await fetch('/data/question.json');
                if (!qResponse.ok) throw new Error(`Questions fetch failed: ${qResponse.status} ${qResponse.statusText}`);
                fetchedQuestions = await qResponse.json();
                if (!Array.isArray(fetchedQuestions)) {
                    throw new Error('Invalid questions format (expected array).');
                }
            } catch (e) {
                qError = e.message;
                console.error("Error fetching questions:", e);
            }

            try {
                const sResponse = await fetch('/data/states.json');
                if (!sResponse.ok) throw new Error(`States fetch failed: ${sResponse.status} ${sResponse.statusText}`);
                const statesArray = await sResponse.json();
                if (!Array.isArray(statesArray)) {
                    throw new Error('Invalid states format.');
                }
                fetchedStatesData = statesArray.reduce((obj, state) => { obj[state.code] = state.name; return obj; }, {});
            } catch (e) {
                sError = e.message;
                console.error("Error fetching states:", e);
            }

            setRawQuestionsData(fetchedQuestions); // Store raw questions
            setStatesData(fetchedStatesData);

            if (qError || sError) {
                const errors = [qError, sError].filter(Boolean).join('; ');
                setLoadingError(errors);
                setCurrentView(fetchedQuestions && fetchedQuestions.length > 0 ? 'home' : 'error'); // Still allow home if questions loaded but states failed
            } else if (!fetchedQuestions || fetchedQuestions.length === 0) {
                setLoadingError('No questions found in the data file.');
                setCurrentView('error');
            } else {
                setCurrentView('home');
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, []); // Empty dependency array: runs only once on mount

    // Effect for transforming questions when rawQuestionsData or selectedLanguage changes
    useEffect(() => {
        if (!rawQuestionsData) {
            // console.log("Raw questions data not available yet.");
            return; // Don't run if raw data isn't fetched yet
        }

        // console.log(`Transforming data for language: ${selectedLanguage}`);
        const tempQuestions = rawQuestionsData.map(newQuestion => {
            const options = ['a', 'b', 'c', 'd'].reduce((acc, key) => {
                if (newQuestion.hasOwnProperty(key)) {
                    acc.push({
                        id: key,
                        text: newQuestion[key] || '', // German text
                        text_translation: newQuestion.translation?.[selectedLanguage]?.[key] || newQuestion.translation?.en?.[key] || '' // Selected language translation
                    });
                }
                return acc;
            }, []);

            let stateCode = null;
            if (typeof newQuestion.num === 'string' && newQuestion.num.includes('-')) {
                stateCode = newQuestion.num.split('-')[0];
            }

            return {
                id: newQuestion.id,
                question_text: newQuestion.question || '', // German question
                question_text_translation: newQuestion.translation?.[selectedLanguage]?.question || newQuestion.translation?.en?.question || '', // Selected language translation
                options: options,
                correct_answer: newQuestion.solution,
                explanation: newQuestion.translation?.[selectedLanguage]?.context || newQuestion.translation?.en?.context || newQuestion.context || '',
                state_code: stateCode
            };
        });
        setAllQuestionsData(tempQuestions);
        // DO NOT setCurrentView here
        // console.log("Transformed questions set for allQuestionsData.");

    }, [rawQuestionsData, selectedLanguage]); // Runs when rawQuestionsData or selectedLanguage changes

    const handleStartPractice = useCallback((stateCode) => {
        setSelectedState(stateCode);
        localStorage.setItem('selectedState', stateCode);
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCode);

        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setPracticeSessionQuestions(shuffleArray(sessionQuestions));
        // console.log("Practice Mode: Starting with", sessionQuestions.length, "questions for state", stateCode); // Removed console.log
        setCurrentView('practice');
    }, [allQuestionsData, setSelectedState]);

    const handleStartExam = useCallback((stateCodeFromButton) => {
        // stateCodeFromButton is the state selected on HomePage
        // We use selectedState from App's state, which should be in sync
        // or directly use stateCodeFromButton if preferred (ensuring it's always passed)
        if (!stateCodeFromButton) {
             console.log("Please select a state for the exam."); // Or rely on HomePage's button disable
            return;
        }
        setSelectedState(stateCodeFromButton); // Ensure App's state is also set
        localStorage.setItem('selectedState', stateCodeFromButton);


        const EXAM_TOTAL_QUESTIONS = 33;
        const TARGET_STATE_QUESTIONS_IN_EXAM = 3;

        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        // Corrected: use stateCodeFromButton for filtering
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCodeFromButton);

        let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(0, TARGET_STATE_QUESTIONS_IN_EXAM);

        const generalQuestionsNeeded = EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
        let examGeneralQuestions = [];
        if (generalQuestionsNeeded > 0) {
            examGeneralQuestions = shuffleArray(generalQuestions).slice(0, generalQuestionsNeeded);
        }

        let combinedExamQuestions = [...examStateQuestions, ...examGeneralQuestions];

        // Ensure the total does not exceed EXAM_TOTAL_QUESTIONS, even if sources are smaller than targets
        // This also handles cases where combined might be less if not enough questions are available overall.
        const finalExamQuestions = shuffleArray(combinedExamQuestions);
        // No slice here, as we want all available up to 33, based on selection.
        // If fewer than 33 questions are available in total from the combined pool, it will use all of them.

        setExamQuestionsForMode(finalExamQuestions); // Renamed state setter
        setCurrentView('exam');
    }, [allQuestionsData, setSelectedState]); // Added setSelectedState to dependencies, as it's called inside

    const handleStartFlashcards = useCallback((stateCodeFromButton) => {
        setSelectedState(stateCodeFromButton);
        localStorage.setItem('selectedState', stateCodeFromButton);
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        // Corrected: use stateCodeFromButton for filtering
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCodeFromButton);

        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setFlashcardSessionQuestions(shuffleArray(sessionQuestions));
        // console.log("Flashcard Mode: Starting with", sessionQuestions.length, "questions for state", stateCodeFromButton); // Removed console.log
        setCurrentView('flashcards');
    }, [allQuestionsData, setSelectedState]);

    const handleNavigateHome = useCallback(() => {
        setCurrentView('home');
        setExamResultsData(null);
        setExamQuestionsForMode([]);
        // selectedState is kept as is, as user might want to start another activity for the same state
        // If reset is desired:
        // setSelectedState('');
        // localStorage.removeItem('selectedState');
    }, []);

    const handleShowResultsPage = useCallback((results) => {
        setExamResultsData(results);
        setCurrentView('results');
    }, []);

    const handleRetryTestFromResults = useCallback(() => {
        // examQuestionsForMode still holds the questions for the test that was just taken
        setExamResultsData(null); // Clear previous results
        setCurrentView('exam'); // Go back to exam mode
    }, []);

    const handleStartNewTestFromResults = useCallback(() => {
        // Uses selectedState from App's state
        if (selectedState) {
            // Re-run the logic of handleStartExam essentially
            const EXAM_TOTAL_QUESTIONS = 33;
            const TARGET_STATE_QUESTIONS_IN_EXAM = 3;
            const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
            const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
            let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(0, TARGET_STATE_QUESTIONS_IN_EXAM);
            const generalQuestionsNeeded = EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
            let examGeneralQuestions = [];
            if (generalQuestionsNeeded > 0) {
                examGeneralQuestions = shuffleArray(generalQuestions).slice(0, generalQuestionsNeeded);
            }
            let combinedExamQuestions = [...examStateQuestions, ...examGeneralQuestions];
            const finalExamQuestions = shuffleArray(combinedExamQuestions);

            setExamQuestionsForMode(finalExamQuestions);
            setExamResultsData(null);
            setCurrentView('exam');
        } else {
            // Fallback if selectedState is somehow lost
            handleNavigateHome();
        }
    }, [allQuestionsData, selectedState, handleNavigateHome]);


    const renderContent = () => {
        if (isLoading && currentView === 'loading') return <p className="text-center text-gray-500 text-xl py-10">Loading data...</p>;
        if (currentView === 'error') return (
            <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-3">App Error</h2>
                <p className="mb-2">Problem loading data:</p>
                <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">{loadingError || "Unknown error."}</pre>
                <p className="mt-4">Try refreshing. Ensure data files are correct and accessible from the /public directory (e.g. /data/question.json).</p>
            </div>
        );

        switch (currentView) {
            case 'home':
                return <HomePage
                            statesData={statesData}
                            onStartPractice={handleStartPractice}
                            onStartExam={handleStartExam}
                            onStartFlashcards={handleStartFlashcards}
                            selectedState={selectedState}
                            onStateChange={handleStateChange}
                            onResetState={handleResetState}
                        />;
            case 'practice':
                return <PracticeMode
                            questions={practiceSessionQuestions}
                            onNavigateHome={handleNavigateHome}
                            selectedLanguageCode={selectedLanguage}
                        />;
            case 'exam':
                return <ExamMode
                            questions={examQuestionsForMode} // Renamed prop
                            onNavigateHome={handleNavigateHome}
                            onShowResultsPage={handleShowResultsPage} // New prop
                            examDuration={3600} // Reverted to original value
                            selectedLanguageCode={selectedLanguage}
                            // onStartNewTest is removed from ExamMode
                        />;
            case 'results': // New case for results page
                if (!examResultsData) {
                     // Should not happen if logic is correct, but good fallback
                    setTimeout(() => handleNavigateHome(), 0); // Navigate home after render to avoid state update in render
                    return <p>Loading results or error...</p>;
                }
                return <ExamResultsPage
                            {...examResultsData} // Spread all results data
                            onNavigateHome={handleNavigateHome}
                            onRetryTest={handleRetryTestFromResults}
                            onStartNewTest={handleStartNewTestFromResults}
                        />;
            case 'flashcards':
                return <FlashcardMode
                            initialQuestions={flashcardSessionQuestions}
                            onNavigateHome={handleNavigateHome}
                            cardDuration={15}
                            selectedLanguageCode={selectedLanguage}
                        />;
            default:
                return (
                    <div className="text-center text-red-500 p-6">
                        <p className="text-xl">Unexpected error or unknown view.</p>
                        <button onClick={handleNavigateHome} className="mt-4 bg-indigo-500 text-white py-2 px-3 rounded">Home</button>
                    </div>
                );
        }
    };

    return (
        <React.Fragment>
            <Header selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} />
            <main id="main-content" className="container mx-auto p-4 min-h-[calc(100vh-200px)]">
                {renderContent()}
            </main>
            <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Einbürgerungstest Practice by Himanshu</p>
            </footer>
        </React.Fragment>
    );
};

export default App;
