import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PracticeMode from './practice/PracticeMode.jsx';
import ExamMode from './exam/ExamMode.jsx';
import ExamResultsPage from './exam/ExamResultsPage.jsx';
import Header from './component/header.jsx';
import FlashcardMode from './flashcard/FlashcardMode.jsx';
import shuffleArray from './utils/shuffleArray.js';
import HomePage from './component/homePage.jsx';

// --- App Component Definition ---
const App = () => {
    const navigate = useNavigate();
    const [rawQuestionsData, setRawQuestionsData] = useState(null); // Store raw questions
    const [allQuestionsData, setAllQuestionsData] = useState([]);
    const [statesData, setStatesData] = useState({}); // Assuming states.json is simple and doesn't need raw storage or language processing for its own content
    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // const [currentView, setCurrentView] = useState('loading'); // Removed currentView
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
                // setCurrentView(fetchedQuestions && fetchedQuestions.length > 0 ? 'home' : 'error'); // Removed setCurrentView
            } else if (!fetchedQuestions || fetchedQuestions.length === 0) {
                setLoadingError('No questions found in the data file.');
                // setCurrentView('error'); // Removed setCurrentView
            } else {
                // setCurrentView('home'); // Removed setCurrentView
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

    // Effect to update practice session questions if language changes (location independent)
    useEffect(() => {
        // This effect might need to be re-evaluated based on how navigation affects component lifecycle
        // For now, we assume that if practiceSessionQuestions exist, they might need updating
        if (selectedState && allQuestionsData && allQuestionsData.length > 0 && practiceSessionQuestions && practiceSessionQuestions.length > 0) {
            const allQuestionsMap = new Map(allQuestionsData.map(q => [q.id, q]));

            const updatedPracticeQuestions = practiceSessionQuestions.map(practiceQ => {
                const fullQuestionData = allQuestionsMap.get(practiceQ.id);
                if (!fullQuestionData) {
                    return practiceQ; // Should not happen if data is consistent
                }

                const updatedOptions = practiceQ.options.map(opt => {
                    const fullOptionData = fullQuestionData.options.find(fullOpt => fullOpt.id === opt.id);
                    return {
                        ...opt,
                        text_translation: fullOptionData ? fullOptionData.text_translation : opt.text_translation,
                    };
                });

                return {
                    ...practiceQ,
                    question_text_translation: fullQuestionData.question_text_translation,
                    explanation: fullQuestionData.explanation, // Explanation also needs to be updated
                    options: updatedOptions,
                };
            });

            // Only update if the content has actually changed to avoid potential infinite loops
            if (JSON.stringify(practiceSessionQuestions) !== JSON.stringify(updatedPracticeQuestions)) {
                setPracticeSessionQuestions(updatedPracticeQuestions);
            }
        }
    }, [allQuestionsData, selectedState, practiceSessionQuestions]); // Removed currentView from dependencies

    const handleStartPractice = useCallback((stateCode) => {
        setSelectedState(stateCode);
        localStorage.setItem('selectedState', stateCode);
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCode);

        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setPracticeSessionQuestions(shuffleArray(sessionQuestions));
        navigate('/practice');
    }, [allQuestionsData, setSelectedState, navigate]);

    const handleStartExam = useCallback((stateCodeFromButton) => {
        if (!stateCodeFromButton) {
            console.log("Please select a state for the exam.");
            return;
        }
        setSelectedState(stateCodeFromButton);
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
        const finalExamQuestions = shuffleArray(combinedExamQuestions);

        setExamQuestionsForMode(finalExamQuestions);
        navigate('/exam');
    }, [allQuestionsData, setSelectedState, navigate]);

    const handleStartFlashcards = useCallback((stateCodeFromButton) => {
        setSelectedState(stateCodeFromButton);
        localStorage.setItem('selectedState', stateCodeFromButton);
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCodeFromButton);

        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setFlashcardSessionQuestions(shuffleArray(sessionQuestions));
        navigate('/flashcards');
    }, [allQuestionsData, setSelectedState, navigate]);

    const handleNavigateHome = useCallback(() => {
        setExamResultsData(null);
        setExamQuestionsForMode([]);
        navigate('/');
    }, [navigate]);

    const handleShowResultsPage = useCallback((results) => {
        setExamResultsData(results);
        navigate('/results');
    }, [navigate]);

    const handleRetryTestFromResults = useCallback(() => {
        setExamResultsData(null);
        navigate('/exam');
    }, [navigate]);

    const handleStartNewTestFromResults = useCallback(() => {
        if (selectedState) {
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
            navigate('/exam');
        } else {
            handleNavigateHome();
        }
    }, [allQuestionsData, selectedState, handleNavigateHome, navigate]);

    // Render loading state
    if (isLoading) return <p className="text-center text-gray-500 text-xl py-10">Loading data...</p>;

    // Render error state
    if (loadingError) return (
        <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-3">App Error</h2>
            <p className="mb-2">Problem loading data:</p>
            <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">{loadingError || "Unknown error."}</pre>
            <p className="mt-4">Try refreshing. Ensure data files are correct and accessible from the /public directory (e.g. /data/question.json).</p>
        </div>
    );

    return (
        <React.Fragment>
            <Header />
            <main id="main-content" className="container mx-auto p-4 min-h-[calc(100vh-200px)]">
                <Routes>
                    <Route path="/" element={<HomePage
                        statesData={statesData}
                        onStartPractice={handleStartPractice}
                        onStartExam={handleStartExam}
                        onStartFlashcards={handleStartFlashcards}
                        selectedState={selectedState}
                        onStateChange={handleStateChange}
                        onResetState={handleResetState}
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={handleLanguageChange}
                    />} />
                    <Route path="/practice" element={<PracticeMode
                        questions={practiceSessionQuestions}
                        onNavigateHome={handleNavigateHome}
                        selectedLanguageCode={selectedLanguage}
                    />} />
                    <Route path="/exam" element={<ExamMode
                        questions={examQuestionsForMode}
                        onNavigateHome={handleNavigateHome}
                        onShowResultsPage={handleShowResultsPage}
                        examDuration={3600}
                        selectedLanguageCode={selectedLanguage}
                    />} />
                    <Route path="/results" element={examResultsData ? <ExamResultsPage
                        {...examResultsData}
                        onNavigateHome={handleNavigateHome}
                        onRetryTest={handleRetryTestFromResults}
                        onStartNewTest={handleStartNewTestFromResults}
                    /> : <HomePage />} /> {/* Redirect to home if no results */}
                    <Route path="/flashcards" element={<FlashcardMode
                        initialQuestions={flashcardSessionQuestions}
                        onNavigateHome={handleNavigateHome}
                        cardDuration={15}
                        selectedLanguageCode={selectedLanguage}
                    />} />
                </Routes>
            </main>
            <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Einbürgerungstest Practice by Himanshu</p>
            </footer>
        </React.Fragment>
    );
};

export default App;
