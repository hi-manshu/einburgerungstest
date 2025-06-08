import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import shuffleArray from './utils/shuffleArray';
import { Option, Question, RawQuestion, StatesData, ExamResultsData, Language } from './types'; // Added Option back
import MainLayout from './component/MainLayout';
import AppRoutes from './AppRoutes';
import OnboardingDialog from './component/ui/OnboardingDialog';

// Define above the App component
// interface Language {
//     code: string;
//     name: string;
// }

const LANGUAGES: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ru', name: 'Русский' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'uk', name: 'Українська' },
    { code: 'hi', name: 'हिन्दी' }
];

// --- App Component Definition ---
const App: React.FC = () => {
    const navigate = useNavigate();
    const [rawQuestionsData, setRawQuestionsData] = useState<RawQuestion[] | null>(null);
    const [allQuestionsData, setAllQuestionsData] = useState<Question[]>([]);
    const [statesData, setStatesData] = useState<StatesData>({});
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<Question[]>([]);
    const [examQuestionsForMode, setExamQuestionsForMode] = useState<Question[]>([]);
    const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState<Question[]>([]);
    const [examResultsData, setExamResultsData] = useState<ExamResultsData | null>(null); // Use ExamResultsData
    const [selectedState, setSelectedState] = useState<string>(localStorage.getItem('selectedState') || '');
    const [selectedLanguage, setSelectedLanguage] = useState<string>(localStorage.getItem('selectedLanguage') || 'en');
    const [showOnboardingDialog, setShowOnboardingDialog] = useState<boolean>(
        !localStorage.getItem('selectedState') || !localStorage.getItem('selectedLanguage')
    );
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

    const handleStateChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const newState = event.target.value;
        setSelectedState(newState);
        localStorage.setItem('selectedState', newState);
    }, []);

    const handleResetState = useCallback(() => {
        setSelectedState('');
        localStorage.removeItem('selectedState');
    }, []);

    const handleLanguageChange = useCallback((newLanguage: string) => {
        setSelectedLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
    }, []);

    const handleSavePreferences = useCallback(() => {
        // The button in OnboardingDialog is enabled by its 'disabled' prop,
        // which checks if selectedState and selectedLanguage (props from App.tsx's state) are set.
        // If this handleSavePreferences function is called, it means the button was enabled,
        // implying that selectedState and selectedLanguage in App.tsx's state are populated.
        // The handleStateChange and handleLanguageChange callbacks (also passed to the dialog)
        // are responsible for updating both App.tsx's React state and localStorage.
        // Therefore, we can directly proceed to hide the dialog.
        setShowOnboardingDialog(false);
    }, [setShowOnboardingDialog]); // setShowOnboardingDialog is stable and correctly listed as a dependency.

    const handleToggleSettingsModal = useCallback(() => {
        setShowSettingsModal(prevShow => !prevShow);
    }, []); // setShowSettingsModal is stable

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            let qError: string | null = null;
            let sError: string | null = null;
            let fetchedQuestions: RawQuestion[] | null = null;
            let fetchedStatesData: StatesData = {};

            try {
                const qResponse = await fetch('/data/question.json');
                if (!qResponse.ok) throw new Error(`Questions fetch failed: ${qResponse.status} ${qResponse.statusText}`);
                fetchedQuestions = await qResponse.json() as RawQuestion[];
                if (!Array.isArray(fetchedQuestions)) {
                    throw new Error('Invalid questions format (expected array).');
                }
            } catch (e: any) {
                qError = e.message;
                console.error("Error fetching questions:", e);
            }

            try {
                const sResponse = await fetch('/data/states.json');
                if (!sResponse.ok) throw new Error(`States fetch failed: ${sResponse.status} ${sResponse.statusText}`);
                const statesArray = await sResponse.json() as { code: string, name: string }[];
                if (!Array.isArray(statesArray)) {
                    throw new Error('Invalid states format.');
                }
                fetchedStatesData = statesArray.reduce((obj, state) => { obj[state.code] = state.name; return obj; }, {} as StatesData);
            } catch (e: any) {
                sError = e.message;
                console.error("Error fetching states:", e);
            }

            setRawQuestionsData(fetchedQuestions);
            setStatesData(fetchedStatesData);

            if (qError || sError) {
                const errors = [qError, sError].filter(Boolean).join('; ');
                setLoadingError(errors);
            } else if (!fetchedQuestions || fetchedQuestions.length === 0) {
                setLoadingError('No questions found in the data file.');
            }
            setIsLoading(false);
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!rawQuestionsData) {
            return;
        }

        const tempQuestions: Question[] = rawQuestionsData.map((newQuestion: RawQuestion) => {
            const options: Option[] = ['a', 'b', 'c', 'd'].reduce((acc: Option[], key: string) => {
                if (newQuestion.hasOwnProperty(key)) {
                    acc.push({
                        id: key,
                        text: newQuestion[key] || '',
                        text_translation: newQuestion.translation?.[selectedLanguage]?.[key] || newQuestion.translation?.en?.[key] || ''
                    });
                }
                return acc;
            }, []);

            let stateCode: string | null = null;
            if (typeof newQuestion.num === 'string' && newQuestion.num.includes('-')) {
                stateCode = newQuestion.num.split('-')[0];
            }

            return {
                id: newQuestion.id,
                question_text: newQuestion.question || '',
                question_text_translation: newQuestion.translation?.[selectedLanguage]?.question || newQuestion.translation?.en?.question || '',
                options: options,
                correct_answer: newQuestion.solution || '',
                explanation: newQuestion.translation?.[selectedLanguage]?.context || newQuestion.translation?.en?.context || newQuestion.context || '',
                state_code: stateCode
            };
        });
        setAllQuestionsData(tempQuestions);

    }, [rawQuestionsData, selectedLanguage]);

    useEffect(() => {
        if (selectedState && allQuestionsData.length > 0 && practiceSessionQuestions.length > 0) {
            const allQuestionsMap = new Map(allQuestionsData.map(q => [q.id, q]));

            const updatedPracticeQuestions = practiceSessionQuestions.map((practiceQ: Question) => {
                const fullQuestionData = allQuestionsMap.get(practiceQ.id);
                if (!fullQuestionData) {
                    return practiceQ;
                }

                const updatedOptions = practiceQ.options.map((opt: Option) => {
                    const fullOptionData = fullQuestionData.options.find(fullOpt => fullOpt.id === opt.id);
                    return {
                        ...opt,
                        text_translation: fullOptionData ? fullOptionData.text_translation : opt.text_translation,
                    };
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
    }, [allQuestionsData, selectedState, practiceSessionQuestions]);

    const handleStartPractice = useCallback((stateCode: string) => {
        setSelectedState(stateCode);
        localStorage.setItem('selectedState', stateCode);
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCode);

        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setPracticeSessionQuestions(shuffleArray(sessionQuestions) as Question[]);
        navigate('/practice');
    }, [allQuestionsData, setSelectedState, navigate]);

    const handleStartExam = useCallback((stateCodeFromButton: string) => {
        if (!stateCodeFromButton) {
            console.log("Please select a state for the exam.");
            return;
        }
        setSelectedState(stateCodeFromButton);
        localStorage.setItem('selectedState', stateCodeFromButton);

        const EXAM_TOTAL_QUESTIONS = 33;
        const TARGET_STATE_QUESTIONS_IN_EXAM = 3;

        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCodeFromButton);

        let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(0, TARGET_STATE_QUESTIONS_IN_EXAM) as Question[];

        const generalQuestionsNeeded = EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
        let examGeneralQuestions: Question[] = [];
        if (generalQuestionsNeeded > 0) {
            examGeneralQuestions = shuffleArray(generalQuestions).slice(0, generalQuestionsNeeded) as Question[];
        }

        let combinedExamQuestions = [...examStateQuestions, ...examGeneralQuestions];
        const finalExamQuestions = shuffleArray(combinedExamQuestions) as Question[];

        setExamQuestionsForMode(finalExamQuestions);
        navigate('/exam');
    }, [allQuestionsData, setSelectedState, navigate]);

    const handleStartFlashcards = useCallback((stateCodeFromButton: string) => {
        setSelectedState(stateCodeFromButton);
        localStorage.setItem('selectedState', stateCodeFromButton);
        const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
        const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === stateCodeFromButton);

        const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
        setFlashcardSessionQuestions(shuffleArray(sessionQuestions) as Question[]);
        navigate('/flashcards');
    }, [allQuestionsData, setSelectedState, navigate]);

    const handleNavigateHome = useCallback(() => {
        setExamResultsData(null);
        setExamQuestionsForMode([]);
        navigate('/');
    }, [navigate]);

    // The 'results' type here should match ExamResultsData from ExamMode.tsx / types.ts
    const handleShowResultsPage = useCallback((results: ExamResultsData) => {
        setExamResultsData(results);
        navigate('/results');
    }, [navigate]);

    const handleRetryTestFromResults = useCallback(() => {
        setExamResultsData(null); // Keep current examQuestionsForMode
        navigate('/exam');
    }, [navigate]);

    const handleStartNewTestFromResults = useCallback(() => {
        if (selectedState) {
            const EXAM_TOTAL_QUESTIONS = 33;
            const TARGET_STATE_QUESTIONS_IN_EXAM = 3;
            const generalQuestions = allQuestionsData.filter(q => q.state_code === null);
            const stateSpecificQuestions = allQuestionsData.filter(q => q.state_code === selectedState);
            let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(0, TARGET_STATE_QUESTIONS_IN_EXAM) as Question[];
            const generalQuestionsNeeded = EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
            let examGeneralQuestions: Question[] = [];
            if (generalQuestionsNeeded > 0) {
                examGeneralQuestions = shuffleArray(generalQuestions).slice(0, generalQuestionsNeeded) as Question[];
            }
            let combinedExamQuestions = [...examStateQuestions, ...examGeneralQuestions];
            const finalExamQuestions = shuffleArray(combinedExamQuestions) as Question[];

            setExamQuestionsForMode(finalExamQuestions);
            setExamResultsData(null);
            navigate('/exam');
        } else {
            handleNavigateHome(); // Fallback if no state is selected for some reason
        }
    }, [allQuestionsData, selectedState, handleNavigateHome, navigate]);


    if (isLoading) return <p className="text-center text-gray-500 text-xl py-10">Loading data...</p>;

    if (loadingError) return (
        <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-3">App Error</h2>
            <p className="mb-2">Problem loading data:</p>
            <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">{loadingError}</pre>
            <p className="mt-4">Try refreshing. Ensure data files are correct and accessible from the /public directory (e.g. /data/question.json).</p>
        </div>
    );

    return (
        <MainLayout onSettingsClick={handleToggleSettingsModal}> {/* Prop for MainLayout */}
            {/* Existing Onboarding Dialog for first-time users */}
            {showOnboardingDialog && (
                <OnboardingDialog
                    statesData={statesData}
                    selectedState={selectedState}
                    onStateChange={handleStateChange}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    onSavePreferences={handleSavePreferences} // This closes the onboarding dialog
                    availableLanguages={LANGUAGES}
                    // title and introText will use defaults for onboarding
                />
            )}

            {/* New Settings Dialog/Modal */}
            {showSettingsModal && (
                <OnboardingDialog
                    statesData={statesData}
                    selectedState={selectedState} // Show current selection
                    onStateChange={handleStateChange} // Allow changes
                    selectedLanguage={selectedLanguage} // Show current selection
                    onLanguageChange={handleLanguageChange} // Allow changes
                    onSavePreferences={() => {
                        // Preferences are already saved by onStateChange/onLanguageChange via localStorage.
                        // We just need to close this settings modal.
                        setShowSettingsModal(false);
                    }}
                    availableLanguages={LANGUAGES}
                    title="Settings" // Custom title
                    introText={null} // No intro text, or specific settings intro
                />
            )}

            <AppRoutes
                statesData={statesData}
                onStartPractice={handleStartPractice}
                onStartExam={handleStartExam}
                onStartFlashcards={handleStartFlashcards}
                selectedState={selectedState}
                onStateChange={handleStateChange}
                onResetState={handleResetState}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                practiceSessionQuestions={practiceSessionQuestions}
                examQuestionsForMode={examQuestionsForMode}
                onShowResultsPage={handleShowResultsPage}
                examResultsData={examResultsData}
                onRetryTest={handleRetryTestFromResults}
                onStartNewTest={handleStartNewTestFromResults}
                flashcardSessionQuestions={flashcardSessionQuestions}
                onNavigateHome={handleNavigateHome}
            />
        </MainLayout>
    );
};

export default App;
