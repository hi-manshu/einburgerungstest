import React, { useState, useEffect, useCallback, useRef } from 'react';
import PracticeMode from './practice/PracticeMode.jsx';
import ExamMode from './exam/ExamMode.jsx';
import FlashcardMode from './flashcard/FlashcardMode.jsx';
import shuffleArray from './utils/shuffleArray.js';

// --- HomePage Component Definition ---
const HomePage = ({ statesData, onStartPractice, onStartExam, onStartFlashcards }) => {
    const [selectedState, setSelectedState] = useState(localStorage.getItem('selectedState') || '');
    const handleStateChange = (event) => {
        const newState = event.target.value;
        setSelectedState(newState);
        localStorage.setItem('selectedState', newState);
    };
    const handleNavigation = (navigationFunc, requiresState = true) => {
        if (requiresState && !selectedState) {
            alert("Please select a state to proceed with this mode.");
            return;
        }
        navigationFunc(selectedState);
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Welcome! Choose your mode:</h2>
            <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Study & Practice</h3>
                <button
                    onClick={() => onStartPractice("")}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2 md:mb-0">
                    Practice All Questions
                </button>
                <button
                    onClick={() => handleNavigation(onStartFlashcards)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    Flashcards (by State)
                </button>
            </div>
            <div className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                <label htmlFor="state-select" className="block text-lg font-medium mb-2 text-gray-700">
                    Select Your State for Specific Content:
                </label>
                <select
                    id="state-select"
                    value={selectedState}
                    onChange={handleStateChange}
                    className="mt-1 block w-full md:w-2/3 mx-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow">
                    <option value="">Select a State (or practice all questions)</option>
                    {Object.entries(statesData || {}).sort(([,a],[,b]) => a.localeCompare(b)).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>
                <button
                    onClick={() => handleNavigation(onStartPractice, false)}
                    className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                    Practice Selected State Questions
                </button>
            </div>
            <div>
                <h3 className="text-xl font-medium mb-2">Test Your Knowledge</h3>
                <button
                    onClick={() => handleNavigation(onStartExam)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Start Full Exam (by State)
                </button>
            </div>
        </div>
    );
};

// --- App Component Definition ---
const App = () => {
    const [allQuestionsData, setAllQuestionsData] = useState([]);
    const [statesData, setStatesData] = useState({});
    const [loadingError, setLoadingError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('loading');
    const [practiceSessionQuestions, setPracticeSessionQuestions] = useState([]);
    const [examSessionQuestions, setExamSessionQuestions] = useState([]);
    const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            let qError = null, sError = null, tempQuestions = [], tempStatesData = {};
            try {
                // For Vite, files in public directory are served at root.
                const qResponse = await fetch('/data/question.json');
                if (!qResponse.ok) throw new Error(`Questions fetch failed: ${qResponse.status} ${qResponse.statusText}`);
                const newQuestionsData = await qResponse.json();
                if (!Array.isArray(newQuestionsData)) { throw new Error('Invalid questions format (expected array).'); }

                // Transform new data structure to the old one
                tempQuestions = newQuestionsData.map(newQuestion => {
                    const options = ['a', 'b', 'c', 'd'].reduce((acc, key) => {
                        if (newQuestion.hasOwnProperty(key)) {
                            acc.push({
                                id: key,
                                text: newQuestion.translation?.en?.[key] || '',
                                text_de: newQuestion[key] || ''
                            });
                        }
                        return acc;
                    }, []);

                    return {
                        id: newQuestion.id,
                        question_text: newQuestion.translation?.en?.question || '',
                        question_text_de: newQuestion.question || '',
                        options: options,
                        correct_answer: newQuestion.solution,
                        explanation: newQuestion.translation?.en?.context || newQuestion.context || '',
                        state_code: null // Not available in new structure
                    };
                });

            } catch (e) { qError = e.message; }
            try {
                const sResponse = await fetch('/data/states.json');
                if (!sResponse.ok) throw new Error(`States fetch failed: ${sResponse.status} ${sResponse.statusText}`);
                const statesArray = await sResponse.json();
                if (!Array.isArray(statesArray)) { throw new Error('Invalid states format.'); }
                tempStatesData = statesArray.reduce((obj, state) => { obj[state.code] = state.name; return obj; }, {});
            } catch (e) { sError = e.message; }

            setAllQuestionsData(tempQuestions);
            setStatesData(tempStatesData);

            if (qError || sError) {
                setLoadingError([qError, sError].filter(Boolean).join('; '));
                setCurrentView(tempQuestions.length ? 'home' : 'error');
            } else if (!tempQuestions.length && !sError) { // No questions but states might have loaded
                setLoadingError('No questions found in the data file.');
                setCurrentView('error'); // Or 'home' if states list is useful alone
            } else {
                setCurrentView('home');
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleStartPractice = useCallback((stateCode) => {
        localStorage.setItem('selectedState', stateCode);
        let filtered = (stateCode && stateCode !== "") ? allQuestionsData.filter(q => q.state_code === stateCode || !q.state_code || q.state_code === "") : [...allQuestionsData];
        setPracticeSessionQuestions(shuffleArray(filtered));
        setCurrentView('practice');
    }, [allQuestionsData]);

    const handleStartExam = useCallback((stateCode) => {
        if (!stateCode) { alert("Please select state for exam."); return; }
        localStorage.setItem('selectedState', stateCode);
        const generalQ = shuffleArray(allQuestionsData.filter(q => !q.state_code || q.state_code === ""));
        const stateQ = shuffleArray(allQuestionsData.filter(q => q.state_code === stateCode));
        let chosenQ = [];
        chosenQ.push(...stateQ.slice(0, 3));
        const generalNeeded = 10 - chosenQ.length;
        if (generalNeeded > 0) { chosenQ.push(...generalQ.slice(0, generalNeeded)); }
        if (chosenQ.length < 10 && chosenQ.length < stateQ.length) {
            const needed = 10 - chosenQ.length;
            const currentIds = new Set(chosenQ.map(q => q.id));
            chosenQ.push(...stateQ.filter(q => !currentIds.has(q.id)).slice(0, needed));
        }
        setExamSessionQuestions(shuffleArray(chosenQ.slice(0,10)));
        setCurrentView('exam');
    }, [allQuestionsData]);

    const handleStartFlashcards = useCallback((stateCode) => {
        localStorage.setItem('selectedState', stateCode);
        let filtered = (stateCode && stateCode !== "") ? allQuestionsData.filter(q => q.state_code === stateCode || !q.state_code || q.state_code === "") : [...allQuestionsData];
        setFlashcardSessionQuestions(shuffleArray(filtered));
        setCurrentView('flashcards');
    }, [allQuestionsData]);

    const navigateHome = useCallback(() => setCurrentView('home'), []);

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
            case 'home': return <HomePage statesData={statesData} onStartPractice={handleStartPractice} onStartExam={handleStartExam} onStartFlashcards={handleStartFlashcards} />;
            case 'practice': return <PracticeMode questions={practiceSessionQuestions} onNavigateHome={navigateHome} />;
            case 'exam': return <ExamMode questions={examSessionQuestions} onNavigateHome={navigateHome} examDuration={600} />;
            case 'flashcards': return <FlashcardMode initialQuestions={flashcardSessionQuestions} onNavigateHome={navigateHome} cardDuration={15}/>;
            default: return (
                <div className="text-center text-red-500 p-6">
                    <p className="text-xl">Unexpected error or unknown view.</p>
                    <button onClick={navigateHome} className="mt-4 bg-indigo-500 text-white py-2 px-3 rounded">Home</button>
                </div>
            );
        }
    };

    return (
        <React.Fragment>
            <header className="bg-blue-600 text-white p-4 rounded-lg shadow-md mb-6">
                <h1 className="text-3xl font-bold text-center">Einbürgerungstest Practice - React</h1>
            </header>
            <main id="main-content" className="container mx-auto p-4 min-h-[calc(100vh-200px)]">
                {renderContent()}
            </main>
            <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Einbürgerungstest Practice (React Version)</p>
            </footer>
        </React.Fragment>
    );
};

export default App;
