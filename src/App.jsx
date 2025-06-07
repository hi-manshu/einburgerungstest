import React, { useState, useEffect, useCallback } from 'react';
import PracticeMode from './practice/PracticeMode.jsx';
import ExamMode from './exam/ExamMode.jsx';
import ExamResultsPage from './exam/ExamResultsPage.jsx';
import Header from './component/header.jsx';
import FlashcardMode from './flashcard/FlashcardMode.jsx';
import shuffleArray from './utils/shuffleArray.js';
import HomePage from './component/homePage.jsx';
import OnboardingDialog from './component/OnboardingDialog.jsx';

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
    const [statesData, setStatesData] = useState({});
    const [rawStatesData, setRawStatesData] = useState([]);
    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('loading'); // Initial view

    let initialSelectedState = '';
    let initialSelectedLanguage = AVAILABLE_LANGUAGES[0]?.code || 'en'; // Default language

    try {
        const storedState = localStorage.getItem('selectedState');
        if (storedState) {
            initialSelectedState = storedState;
        }
    } catch (e) {
        console.warn("Could not access localStorage for selectedState:", e);
        // initialSelectedState remains ''
    }

    try {
        const storedLanguage = localStorage.getItem('selectedLanguage');
        if (storedLanguage) {
            initialSelectedLanguage = storedLanguage;
        }
        // If not found, it keeps the default from AVAILABLE_LANGUAGES
    } catch (e) {
        console.warn("Could not access localStorage for selectedLanguage:", e);
        // initialSelectedLanguage remains the default
    }

    const [selectedState, setSelectedState] = useState(initialSelectedState);
    const [selectedLanguage, setSelectedLanguage] = useState(initialSelectedLanguage);

    const [isOnboardingComplete, setIsOnboardingComplete] = useState(
        !!(initialSelectedState && initialSelectedLanguage)
    );

    const handleSavePreferences = useCallback((state, language) => {
        setSelectedState(state);
        setSelectedLanguage(language);
        localStorage.setItem('selectedState', state);
        localStorage.setItem('selectedLanguage', language);
        setIsOnboardingComplete(true);
        setCurrentView('home');
    }, []);

    const handleLanguageChange = useCallback((newLanguage) => {
        setSelectedLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true); // Ensure loading state is true at the start
            // setCurrentView('loading'); // Not strictly needed here as it's the initial state and renderContent checks isLoading first

            let qError = null, sError = null;
            let fetchedQuestions = null;
            let fetchedStatesArray = [];
            let fetchedStatesObject = {};

            try {
                const qResponse = await fetch('/data/question.json');
                if (!qResponse.ok) throw new Error(`Questions fetch failed: ${qResponse.status} ${qResponse.statusText}`);
                fetchedQuestions = await qResponse.json();
                if (!Array.isArray(fetchedQuestions)) throw new Error('Invalid questions format.');
            } catch (e) { qError = e.message; console.error("Error fetching questions:", e); }

            try {
                const sResponse = await fetch('/data/states.json');
                if (!sResponse.ok) throw new Error(`States fetch failed: ${sResponse.status} ${sResponse.statusText}`);
                fetchedStatesArray = await sResponse.json();
                if (!Array.isArray(fetchedStatesArray)) throw new Error('Invalid states format.');
                fetchedStatesObject = fetchedStatesArray.reduce((obj, state) => { obj[state.code] = state.name; return obj; }, {});
            } catch (e) { sError = e.message; console.error("Error fetching states:", e); }

            setRawQuestionsData(fetchedQuestions);
            setStatesData(fetchedStatesObject);
            setRawStatesData(fetchedStatesArray);

            const hasQuestionsError = qError || !fetchedQuestions || fetchedQuestions.length === 0;
            const hasStatesError = sError; // Explicitly using sError for clarity on state data failure

            // Determine error states (using names from prompt for clarity, though hasQuestionsError/hasStatesError are equivalent)
            const questionsFetchFailed = qError || !fetchedQuestions || fetchedQuestions.length === 0;
            const statesFetchFailed = sError;

            let errorMessages = [];
            if (qError) errorMessages.push(qError);
            if (!fetchedQuestions || fetchedQuestions.length === 0) {
                // Add "No questions found." if questions are missing.
                // This ensures the message is present if questions are empty, even if qError (network error) isn't set.
                // If qError *also* indicates no questions, this might lead to similar messages; however,
                // qError usually indicates a fetch problem, while this checks the result.
                // For the purpose of this subtask, we follow the prompt's structure.
                errorMessages.push("No questions found.");
            }
            if (sError) errorMessages.push(sError);

            if (errorMessages.length > 0) {
                setLoadingError(errorMessages.join('; '));
            }

            if (isOnboardingComplete) {
                if (questionsFetchFailed || statesFetchFailed) {
                    setCurrentView('error');
                } else {
                    setCurrentView('home');
                }
            } else { // Needs onboarding
                // If states data failed (sError), renderContent will show a specific error for onboarding.
                // Otherwise, OnboardingDialog will be shown.
                // This view indicates data fetching is done, and we're ready to decide on onboarding UI.
                setCurrentView('awaiting_onboarding');
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, []); // Runs once on mount

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
    }, [allQuestionsData, currentView, selectedState, practiceSessionQuestions, selectedLanguage]);

    const handleStartPractice = useCallback(() => {
        if (!selectedState) { alert("Please complete onboarding to select a state first."); return; }
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
        setPracticeSessionQuestions(shuffleArray([...generalQuestions, ...stateSpecificQuestions]));
        setCurrentView('practice');
    }, [allQuestionsData, selectedState]);

    const handleStartExam = useCallback(() => {
        if (!selectedState) { alert("Please complete onboarding to select a state first."); return; }
        const EXAM_TOTAL_QUESTIONS = 33;
        const TARGET_STATE_QUESTIONS_IN_EXAM = 3;
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
        let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(0, TARGET_STATE_QUESTIONS_IN_EXAM);
        const generalQuestionsNeeded = EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
        let examGeneralQuestions = generalQuestionsNeeded > 0 ? shuffleArray(generalQuestions).slice(0, generalQuestionsNeeded) : [];
        setExamQuestionsForMode(shuffleArray([...examStateQuestions, ...examGeneralQuestions]));
        setCurrentView('exam');
    }, [allQuestionsData, selectedState]);

    const handleStartFlashcards = useCallback(() => {
        if (!selectedState) { alert("Please complete onboarding to select a state first."); return; }
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
        setFlashcardSessionQuestions(shuffleArray([...generalQuestions, ...stateSpecificQuestions]));
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
        if (selectedState && allQuestionsData.length > 0) {
            const EXAM_TOTAL_QUESTIONS = 33;
            const TARGET_STATE_QUESTIONS_IN_EXAM = 3;
            const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
            const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
            let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(0, TARGET_STATE_QUESTIONS_IN_EXAM);
            const generalQuestionsNeeded = EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
            let examGeneralQuestions = generalQuestionsNeeded > 0 ? shuffleArray(generalQuestions).slice(0, generalQuestionsNeeded) : [];
            setExamQuestionsForMode(shuffleArray([...examStateQuestions, ...examGeneralQuestions]));
            setExamResultsData(null);
            setCurrentView('exam');
        } else {
            handleNavigateHome();
        }
    }, [allQuestionsData, selectedState, handleNavigateHome]);

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-gray-500 text-xl py-10">Loading application data...</p>;
        }

        if (!isOnboardingComplete) {
            // currentView would be 'awaiting_onboarding' if states loaded, or possibly still 'loading' if fetchInitialData hasn't finished setting it.
            // The critical check here is rawStatesData for the OnboardingDialog itself.
            if (rawStatesData.length === 0) {
                return (
                    <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md max-w-lg mx-auto">
                        <h2 className="text-2xl font-bold mb-3">Setup Error</h2>
                        <p className="mb-2">Could not load state data required for initial setup.</p>
                        <p className="text-sm text-gray-700">Details: {loadingError || "State data is missing or failed to load."}</p>
                        <p className="mt-3 text-sm text-gray-600">Please try refreshing the page. If the problem persists, contact support.</p>
                    </div>
                );
            }
            return <OnboardingDialog
                        statesData={rawStatesData}
                        availableLanguages={AVAILABLE_LANGUAGES}
                        onSavePreferences={handleSavePreferences}
                    />;
        }

        // Onboarding is complete, and not loading.
        if (currentView === 'error') {
            return (
                <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold mb-3">Application Error</h2>
                    <p className="mb-2">A problem occurred after initial setup:</p>
                    <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">{loadingError || "An unknown error occurred."}</pre>
                    <button onClick={handleNavigateHome} className="mt-4 bg-indigo-500 text-white py-2 px-3 rounded shadow-md hover:bg-indigo-700">Go to Home</button>
                </div>
            );
        }

        switch (currentView) {
            case 'home':
            case 'awaiting_onboarding': // If onboarding was completed by another tab/localStorage change while view was this, go home.
                                        // Or if fetchInitialData set this and onboarding is now complete.
                return <HomePage
                            onStartPractice={handleStartPractice}
                            onStartExam={handleStartExam}
                            onStartFlashcards={handleStartFlashcards}
                        />;
            case 'practice':
                return <PracticeMode questions={practiceSessionQuestions} onNavigateHome={handleNavigateHome} selectedLanguageCode={selectedLanguage} />;
            case 'exam':
                return <ExamMode questions={examQuestionsForMode} onNavigateHome={handleNavigateHome} onShowResultsPage={handleShowResultsPage} examDuration={3600} selectedLanguageCode={selectedLanguage} />;
            case 'results':
                if (!examResultsData) {
                    setTimeout(() => handleNavigateHome(), 0);
                    return <p>Loading results...</p>;
                }
                return <ExamResultsPage {...examResultsData} onNavigateHome={handleNavigateHome} onRetryTest={handleRetryTestFromResults} onStartNewTest={handleStartNewTestFromResults} />;
            case 'flashcards':
                return <FlashcardMode initialQuestions={flashcardSessionQuestions} onNavigateHome={handleNavigateHome} cardDuration={15} selectedLanguageCode={selectedLanguage} />;
            default: // Fallback for any unexpected view not explicitly handled after loading & onboarding checks
                console.warn(`Unknown currentView: ${currentView}. Navigating home.`);
                // Using setTimeout to avoid direct state update during render, though navigation should be safe.
                setTimeout(() => handleNavigateHome(), 0);
                return (
                    <div className="text-center text-gray-700 p-6">
                        <p className="text-xl">Redirecting...</p>
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
            />
            <main id="main-content" className="container mx-auto p-4 min-h-[calc(100vh-200px)]">
                {renderContent()}
            </main>
            <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Einbürgerungstest Practice App</p>
            </footer>
        </React.Fragment>
    );
};

export default App;
