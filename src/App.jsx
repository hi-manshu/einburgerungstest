import React, { useState, useEffect, useCallback } from 'react';
import PracticeMode from './practice/PracticeMode.jsx';
import ExamMode from './exam/ExamMode.jsx';
import ExamResultsPage from './exam/ExamResultsPage.jsx';
import Header from './component/header.jsx';
import FlashcardMode from './flashcard/FlashcardMode.jsx';
import shuffleArray from './utils/shuffleArray.js';
import HomePage from './component/homePage.jsx';
import OnboardingDialog from './component/OnboardingDialog.jsx'; // Added import

// --- App Component Definition ---

const AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ru', name: 'Русский' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'uk', name: 'Українська' },
    { code: 'hi', name: 'हिन्दी' }
];

const App = () => {
    const [rawQuestionsData, setRawQuestionsData] = useState(null);
    const [allQuestionsData, setAllQuestionsData] = useState([]);
    const [statesData, setStatesData] = useState({}); // For existing logic (e.g., display state name)
    const [rawStatesData, setRawStatesData] = useState([]); // For OnboardingDialog state list
    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('loading'); // Initial view is loading
    const [practiceSessionQuestions, setPracticeSessionQuestions] = useState([]);
    const [examQuestionsForMode, setExamQuestionsForMode] = useState([]);
    const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState([]);
    const [examResultsData, setExamResultsData] = useState(null);

    const initialSelectedState = localStorage.getItem('selectedState') || '';
    const initialSelectedLanguage = localStorage.getItem('selectedLanguage') || AVAILABLE_LANGUAGES[0]?.code || 'en';

    const [selectedState, setSelectedState] = useState(initialSelectedState);
    const [selectedLanguage, setSelectedLanguage] = useState(initialSelectedLanguage);

    const [isOnboardingComplete, setIsOnboardingComplete] = useState(
        !!(initialSelectedState && initialSelectedLanguage)
    );

    // Callback for OnboardingDialog
    const handleSavePreferences = useCallback((state, language) => {
        setSelectedState(state);
        setSelectedLanguage(language);
        localStorage.setItem('selectedState', state);
        localStorage.setItem('selectedLanguage', language);
        setIsOnboardingComplete(true);
        setCurrentView('home'); // Navigate to home after saving preferences
    }, []);

    // Handler for language change from Header or other places
    const handleLanguageChange = useCallback((newLanguage) => {
        setSelectedLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
    }, []);

    // Effect for initial data fetching (runs once)
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setCurrentView('loading'); // Explicitly set to loading at the start
            let qError = null, sError = null;
            let fetchedQuestions = null;
            let fetchedStatesArray = []; // For rawStatesData
            let fetchedStatesObject = {}; // For statesData

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
                fetchedStatesArray = await sResponse.json();
                if (!Array.isArray(fetchedStatesArray)) {
                    throw new Error('Invalid states format (expected array).');
                }
                fetchedStatesObject = fetchedStatesArray.reduce((obj, state) => { obj[state.code] = state.name; return obj; }, {});
            } catch (e) {
                sError = e.message;
                console.error("Error fetching states:", e);
            }

            setRawQuestionsData(fetchedQuestions);
            setStatesData(fetchedStatesObject); // For display purposes if needed elsewhere
            setRawStatesData(fetchedStatesArray); // For OnboardingDialog

            if (qError || sError) {
                const errors = [qError, sError].filter(Boolean).join('; ');
                setLoadingError(errors);
                // If onboarding is not complete, renderContent will handle showing Onboarding or its error
                // If onboarding IS complete, but data failed, then it's an app error.
                if (isOnboardingComplete) {
                     setCurrentView('error');
                }
            } else if (!fetchedQuestions || fetchedQuestions.length === 0) {
                setLoadingError('No questions found in the data file.');
                 if (isOnboardingComplete) {
                    setCurrentView('error');
                }
            } else {
                if (isOnboardingComplete) {
                    setCurrentView('home');
                }
                // If onboarding is not complete, renderContent will take over to show the dialog
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, []); // Empty dependency array: runs only once on mount.

    // Effect for transforming questions when rawQuestionsData or selectedLanguage changes
    useEffect(() => {
        if (!rawQuestionsData) return;

        const tempQuestions = rawQuestionsData.map(newQuestion => {
            const options = ['a', 'b', 'c', 'd'].reduce((acc, key) => {
                if (newQuestion.hasOwnProperty(key)) {
                    acc.push({
                        id: key,
                        text: newQuestion[key] || '',
                        text_translation: newQuestion.translation?.[selectedLanguage]?.[key] || newQuestion.translation?.en?.[key] || ''
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
                question_text: newQuestion.question || '',
                question_text_translation: newQuestion.translation?.[selectedLanguage]?.question || newQuestion.translation?.en?.question || '',
                options: options,
                correct_answer: newQuestion.solution,
                explanation: newQuestion.translation?.[selectedLanguage]?.context || newQuestion.translation?.en?.context || newQuestion.context || '',
                state_code: stateCode
            };
        });
        setAllQuestionsData(tempQuestions);
    }, [rawQuestionsData, selectedLanguage]);

    // Effect to update practice session questions if language changes while in practice mode
    useEffect(() => {
        if (currentView === 'practice' && selectedState && allQuestionsData.length > 0 && practiceSessionQuestions.length > 0) {
            const allQuestionsMap = new Map(allQuestionsData.map(q => [q.id, q]));
            const updatedPracticeQuestions = practiceSessionQuestions.map(practiceQ => {
                const fullQuestionData = allQuestionsMap.get(practiceQ.id);
                if (!fullQuestionData) return practiceQ;
                const updatedOptions = practiceQ.options.map(opt => {
                    const fullOptionData = fullQuestionData.options.find(fullOpt => fullOpt.id === opt.id);
                    return { ...opt, text_translation: fullOptionData ? fullOptionData.text_translation : opt.text_translation };
                });
                return {
                    ...practiceQ,
                    question_text_translation: fullQuestionData.question_text_translation,
                    explanation: fullQuestionData.explanation,
                    options: updatedOptions,
                };
            });
            if (JSON.stringify(practiceSessionQuestions) !== JSON.stringify(updatedPracticeQuestions)) {
                setPracticeSessionQuestions(updatedPracticeQuestions);
            }
        }
    }, [allQuestionsData, currentView, selectedState, practiceSessionQuestions, selectedLanguage]); // Added selectedLanguage

    const handleStartPractice = useCallback(() => { // stateCode argument removed
        if (!selectedState) {
            // This case should ideally be prevented by UI (e.g. disable button if no state selected)
            // or handled by ensuring onboarding happens first.
            alert("Please complete onboarding to select a state first.");
            return;
        }
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setPracticeSessionQuestions(shuffleArray(sessionQuestions));
        setCurrentView('practice');
    }, [allQuestionsData, selectedState]);

    const handleStartExam = useCallback(() => { // stateCodeFromButton argument removed
        if (!selectedState) {
            alert("Please complete onboarding to select a state first.");
            return;
        }
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
        const finalExamQuestions = shuffleArray([...examStateQuestions, ...examGeneralQuestions]);
        setExamQuestionsForMode(finalExamQuestions);
        setCurrentView('exam');
    }, [allQuestionsData, selectedState]);

    const handleStartFlashcards = useCallback(() => { // stateCodeFromButton argument removed
        if (!selectedState) {
            alert("Please complete onboarding to select a state first.");
            return;
        }
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setFlashcardSessionQuestions(shuffleArray(sessionQuestions));
        setCurrentView('flashcards');
    }, [allQuestionsData, selectedState]);

    const handleNavigateHome = useCallback(() => {
        setCurrentView('home');
        setExamResultsData(null);
        setExamQuestionsForMode([]);
    }, []);

    const handleShowResultsPage = useCallback((results) => {
        setExamResultsData(results);
        setCurrentView('results');
    }, []);

    const handleRetryTestFromResults = useCallback(() => {
        setExamResultsData(null);
        setCurrentView('exam');
    }, []);

    const handleStartNewTestFromResults = useCallback(() => {
        if (selectedState && allQuestionsData.length > 0) { // Ensure data is available
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
            const finalExamQuestions = shuffleArray([...examStateQuestions, ...examGeneralQuestions]);
            setExamQuestionsForMode(finalExamQuestions);
            setExamResultsData(null);
            setCurrentView('exam');
        } else {
            handleNavigateHome();
        }
    }, [allQuestionsData, selectedState, handleNavigateHome]);


    const renderContent = () => {
        if (isLoading || currentView === 'loading') {
            return <p className="text-center text-gray-500 text-xl py-10">Loading application data...</p>;
        }

        if (!isOnboardingComplete) {
            if (rawStatesData.length === 0 && !isLoading) { // Check isLoading to avoid showing this during initial data load
                return (
                    <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-3">Setup Error</h2>
                        <p>Could not load state data required for setup. Please check your internet connection or contact support.</p>
                        <p className="mt-2">Error details: {loadingError || "State data is missing."}</p>
                    </div>
                );
            }
            return <OnboardingDialog
                        statesData={rawStatesData}
                        availableLanguages={AVAILABLE_LANGUAGES}
                        onSavePreferences={handleSavePreferences}
                    />;
        }

        if (currentView === 'error') {
            return (
                <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-3">Application Error</h2>
                    <p className="mb-2">A problem occurred:</p>
                    <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">{loadingError || "Unknown error."}</pre>
                    <button onClick={handleNavigateHome} className="mt-4 bg-indigo-500 text-white py-2 px-3 rounded">Go to Home</button>
                </div>
            );
        }

        switch (currentView) {
            case 'home':
                return <HomePage
                            // selectedState and selectedLanguage can be passed if HomePage needs to display them
                            // For now, HomePage doesn't use them directly for UI elements it controls.
                            // statesData (object of state codes to names) can be passed if needed for display.
                            // e.g. selectedStateName={statesData[selectedState]}
                            onStartPractice={handleStartPractice}
                            onStartExam={handleStartExam}
                            onStartFlashcards={handleStartFlashcards}
                            // Removed: onStateChange, onResetState, selectedState, selectedLanguage, onLanguageChange (from HomePage direct props)
                            // HomePage will no longer have state/language selectors itself.
                        />;
            case 'practice':
                return <PracticeMode
                            questions={practiceSessionQuestions}
                            onNavigateHome={handleNavigateHome}
                            selectedLanguageCode={selectedLanguage}
                        />;
            case 'exam':
                return <ExamMode
                            questions={examQuestionsForMode}
                            onNavigateHome={handleNavigateHome}
                            onShowResultsPage={handleShowResultsPage}
                            examDuration={3600}
                            selectedLanguageCode={selectedLanguage}
                        />;
            case 'results':
                if (!examResultsData) {
                    setTimeout(() => handleNavigateHome(), 0);
                    return <p>Loading results or error...</p>;
                }
                return <ExamResultsPage
                            {...examResultsData}
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
                        <p className="text-xl">Unexpected error or unknown view: {currentView}</p>
                        <button onClick={handleNavigateHome} className="mt-4 bg-indigo-500 text-white py-2 px-3 rounded">Home</button>
                    </div>
                );
        }
    };

    return (
        <React.Fragment>
            <Header
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                availableLanguages={AVAILABLE_LANGUAGES}
                showLanguageSelector={isOnboardingComplete && (currentView === 'home' || currentView === 'practice' || currentView === 'flashcards' || currentView === 'exam')}
                // Potentially add selectedState and statesData if Header needs to display state name
                // selectedStateName={isOnboardingComplete && selectedState ? statesData[selectedState] : null}
            />
            <main id="main-content" className="container mx-auto p-4 min-h-[calc(100vh-200px)]">
                {renderContent()}
            </main>
            <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Einbürgerungstest Practice App</p> {/* Updated name */}
            </footer>
        </React.Fragment>
    );
};

export default App;
