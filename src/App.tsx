import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import shuffleArray from "./utils/shuffleArray";
import {
  Option,
  Question,
  RawQuestion,
  StatesData,
  ExamResultsData,
  Language,
} from "./types"; // Added Option back
import MainLayout from "./component/MainLayout";
import AppRoutes from "./AppRoutes";
import OnboardingDialog from "./component/ui/OnboardingDialog";
// import { analytics } from "../firebaseConfig"; // Will be replaced by new firebase.ts
// import { logEvent } from "firebase/analytics"; // Will be replaced by new firebase.ts
import useScreenTracking from './utils/useScreenTracking'; // Adjust path if needed
import { logAnalyticsEvent } from './utils/analytics';

const LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "tr", name: "Türkçe" },
  { code: "ru", name: "Русский" },
  { code: "fr", name: "Français" },
  { code: "ar", name: "العربية" },
  { code: "uk", name: "Українська" },
  { code: "hi", name: "हिन्दी" },
];

// --- App Component Definition ---
const App: React.FC = () => {
  useScreenTracking(); // Call the hook here
  // console.log("home"); // Optional: remove or keep existing logging
  // logEvent(analytics, "app event", { // Optional: remove or keep existing logging
  //   screen: "home",
  // });

  const navigate = useNavigate();
  const [rawQuestionsData, setRawQuestionsData] = useState<
    RawQuestion[] | null
  >(null);
  const [allQuestionsData, setAllQuestionsData] = useState<Question[]>([]);
  const [statesData, setStatesData] = useState<StatesData>({});
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [practiceSessionQuestions, setPracticeSessionQuestions] = useState<
    Question[]
  >([]);
  const [examQuestionsForMode, setExamQuestionsForMode] = useState<Question[]>(
    []
  );
  const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState<
    Question[]
  >([]);
  const [examResultsData, setExamResultsData] =
    useState<ExamResultsData | null>(null); // Use ExamResultsData

  // New state initializations for preferences
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(""); // Will default to 'en' in useEffect if not found
  const [showOnboardingDialog, setShowOnboardingDialog] =
    useState<boolean>(false); // Default to false, useEffect will decide
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);

  // Remove old direct localStorage check for showOnboardingDialog:
  // const storedSelectedState = localStorage.getItem('selectedState');
  // const storedSelectedLanguage = localStorage.getItem('selectedLanguage');
  // const shouldShowOnboarding = ...
  // const [showOnboardingDialog, setShowOnboardingDialog] = useState<boolean>(shouldShowOnboarding);

  // useEffect for loading preferences and deciding on onboarding dialog
  useEffect(() => {
    const storedStateVal = localStorage.getItem("selectedState");
    const storedLangVal = localStorage.getItem("selectedLanguage");

    const currentSelectedState =
      storedStateVal && storedStateVal.trim() !== "" ? storedStateVal : "";
    // Default to 'en' if language is missing/empty in storage, but keep track if it was originally missing for dialog logic
    const currentSelectedLanguage =
      storedLangVal && storedLangVal.trim() !== "" ? storedLangVal : "en";

    setSelectedState(currentSelectedState);
    setSelectedLanguage(currentSelectedLanguage);

    // Show dialog if state is effectively empty (never validly chosen)
    // OR if language was originally missing/empty from localStorage (user hasn't confirmed 'en' default)
    const needsOnboarding = false;

    setShowOnboardingDialog(needsOnboarding);
    setPreferencesLoaded(true);
  }, []); // Empty dependency array ensures this runs once on mount

  // Callbacks like handleStateChange, handleLanguageChange, handleSavePreferences remain largely the same,
  // as they operate on the React state and localStorage.
  const handleStateChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newState = event.target.value;
      setSelectedState(newState);
      localStorage.setItem("selectedState", newState);
      logAnalyticsEvent('select_item', {
        item_list_id: 'state_selection',
        item_list_name: 'State Selection',
        items: [{ item_id: newState, item_name: statesData[newState]?.name }]
      });
    },
    [statesData] // Added statesData dependency
  );

  const handleResetState = useCallback(() => {
    setSelectedState(""); // Update React state
    localStorage.removeItem("selectedState"); // Remove from localStorage
    logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'reset_state' });
    // When state is reset, the user should ideally go through onboarding again on next load if they don't select a new state.
    // Or, if they are in settings, this would just clear it, and they'd need to pick one to save.
    // If they are on the main app, a refresh would trigger onboarding.
  }, []);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    localStorage.setItem("selectedLanguage", newLanguage);
    logAnalyticsEvent('select_item', {
      item_list_id: 'language_selection',
      item_list_name: 'Language Selection',
      items: [{ item_id: newLanguage }]
    });
  }, []);

  const handleSavePreferences = useCallback(() => {
    logAnalyticsEvent('select_content', { content_type: 'button', item_id: 'save_preferences' });
    // For initial onboarding dialog
    setShowOnboardingDialog(false);
    // At this point, selectedState and selectedLanguage should be set in React state
    // and localStorage by handleStateChange/handleLanguageChange.
    // If selectedState is still somehow empty, the dialog's save button should be disabled.
    // If it's not disabled, it implies valid selections were made.
  }, [setShowOnboardingDialog]);

  // ... other useEffect hooks for data fetching and processing remain the same ...
  // Make sure they correctly use selectedLanguage if its loading is now deferred.
  // The main data processing useEffect depends on `rawQuestionsData` and `selectedLanguage`.
  // Since selectedLanguage is set in the new preferences useEffect, this should be fine.

  useEffect(() => {
    const fetchInitialData = async () => {
      // setIsLoading(true); // isLoading is for main data, not preferences
      // ... fetchInitialData logic remains the same ...
      setIsLoading(true); // Keep this for main data loading state
      let qError: string | null = null;
      let sError: string | null = null;
      let fetchedQuestions: RawQuestion[] | null = null;
      let fetchedStatesData: StatesData = {};

      try {
        const qResponse = await fetch("/data/question.json");
        if (!qResponse.ok)
          throw new Error(
            `Questions fetch failed: ${qResponse.status} ${qResponse.statusText}`
          );
        fetchedQuestions = (await qResponse.json()) as RawQuestion[];
        if (!Array.isArray(fetchedQuestions)) {
          throw new Error("Invalid questions format (expected array).");
        }
      } catch (e: any) {
        qError = e.message;
        console.error("Error fetching questions:", e);
      }

      try {
        const sResponse = await fetch("/data/states.json");
        if (!sResponse.ok)
          throw new Error(
            `States fetch failed: ${sResponse.status} ${sResponse.statusText}`
          );
        const statesArray = (await sResponse.json()) as {
          code: string;
          name: string;
        }[];
        if (!Array.isArray(statesArray)) {
          throw new Error("Invalid states format.");
        }
        fetchedStatesData = statesArray.reduce((obj, state) => {
          obj[state.code] = state.name;
          return obj;
        }, {} as StatesData);
      } catch (e: any) {
        sError = e.message;
        console.error("Error fetching states:", e);
      }

      setRawQuestionsData(fetchedQuestions);
      setStatesData(fetchedStatesData);

      if (qError || sError) {
        const errors = [qError, sError].filter(Boolean).join("; ");
        setLoadingError(errors);
      } else if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setLoadingError("No questions found in the data file.");
      }
      setIsLoading(false); // Keep this for main data loading state
    };
    fetchInitialData();
  }, []); // This useEffect for fetching questions/states data is separate

  useEffect(() => {
    if (!rawQuestionsData || !preferencesLoaded) {
      // Ensure preferences (especially language) are loaded before processing
      return;
    }
    // ... tempQuestions mapping logic using selectedLanguage ...
    // This ensures question processing waits for selectedLanguage to be settled.
    const tempQuestions: Question[] = rawQuestionsData.map(
      (newQuestion: RawQuestion) => {
        const options: Option[] = ["a", "b", "c", "d"].reduce(
          (acc: Option[], key: string) => {
            if (newQuestion.hasOwnProperty(key)) {
              acc.push({
                id: key,
                text: newQuestion[key] || "",
                text_translation:
                  newQuestion.translation?.[selectedLanguage]?.[key] ||
                  newQuestion.translation?.en?.[key] ||
                  "",
              });
            }
            return acc;
          },
          []
        );

        let stateCode: string | null = null;
        if (
          typeof newQuestion.num === "string" &&
          newQuestion.num.includes("-")
        ) {
          stateCode = newQuestion.num.split("-")[0];
        }

        return {
          id: newQuestion.id,
          question_text: newQuestion.question || "",
          question_text_translation:
            newQuestion.translation?.[selectedLanguage]?.question ||
            newQuestion.translation?.en?.question ||
            "",
          options: options,
          correct_answer: newQuestion.solution || "",
          explanation:
            newQuestion.translation?.[selectedLanguage]?.context ||
            newQuestion.translation?.en?.context ||
            newQuestion.context ||
            "",
          state_code: stateCode,
        };
      }
    );
    setAllQuestionsData(tempQuestions);
  }, [rawQuestionsData, selectedLanguage, preferencesLoaded]); // Added preferencesLoaded here

  // ... other useEffects and handlers (handleStartPractice, etc.) remain ...
  useEffect(() => {
    if (
      selectedState &&
      allQuestionsData.length > 0 &&
      practiceSessionQuestions.length > 0 &&
      preferencesLoaded
    ) {
      // ... logic for updating practiceSessionQuestions ...
      const allQuestionsMap = new Map(allQuestionsData.map((q) => [q.id, q]));

      const updatedPracticeQuestions = practiceSessionQuestions.map(
        (practiceQ: Question) => {
          const fullQuestionData = allQuestionsMap.get(practiceQ.id);
          if (!fullQuestionData) {
            return practiceQ;
          }

          const updatedOptions = practiceQ.options.map((opt: Option) => {
            const fullOptionData = fullQuestionData.options.find(
              (fullOpt) => fullOpt.id === opt.id
            );
            return {
              ...opt,
              text_translation: fullOptionData
                ? fullOptionData.text_translation
                : opt.text_translation,
            };
          });

          return {
            ...practiceQ,
            question_text_translation:
              fullQuestionData.question_text_translation,
            explanation: fullQuestionData.explanation,
            options: updatedOptions,
          };
        }
      );

      if (
        JSON.stringify(practiceSessionQuestions) !==
        JSON.stringify(updatedPracticeQuestions)
      ) {
        setPracticeSessionQuestions(updatedPracticeQuestions);
      }
    }
  }, [
    allQuestionsData,
    selectedState,
    practiceSessionQuestions,
    preferencesLoaded,
  ]); // Added preferencesLoaded

  const handleStartPractice = useCallback(
    (stateCode: string) => {
      setSelectedState(stateCode);
      localStorage.setItem("selectedState", stateCode);
      const generalQuestions = allQuestionsData.filter(
        (q) => q.state_code === null
      );
      const stateSpecificQuestions = allQuestionsData.filter(
        (q) => q.state_code === stateCode
      );

      const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
      setPracticeSessionQuestions(shuffleArray(sessionQuestions) as Question[]);
      navigate("/practice");
    },
    [allQuestionsData, setSelectedState, navigate]
  );

  const handleStartExam = useCallback(
    (stateCodeFromButton: string) => {
      if (!stateCodeFromButton) {
        console.log("Please select a state for the exam.");
        return;
      }
      setSelectedState(stateCodeFromButton);
      localStorage.setItem("selectedState", stateCodeFromButton);

      const EXAM_TOTAL_QUESTIONS = 33;
      const TARGET_STATE_QUESTIONS_IN_EXAM = 3;

      const generalQuestions = allQuestionsData.filter(
        (q) => q.state_code === null
      );
      const stateSpecificQuestions = allQuestionsData.filter(
        (q) => q.state_code === stateCodeFromButton
      );

      let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(
        0,
        TARGET_STATE_QUESTIONS_IN_EXAM
      ) as Question[];

      const generalQuestionsNeeded =
        EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
      let examGeneralQuestions: Question[] = [];
      if (generalQuestionsNeeded > 0) {
        examGeneralQuestions = shuffleArray(generalQuestions).slice(
          0,
          generalQuestionsNeeded
        ) as Question[];
      }

      let combinedExamQuestions = [
        ...examStateQuestions,
        ...examGeneralQuestions,
      ];
      const finalExamQuestions = shuffleArray(
        combinedExamQuestions
      ) as Question[];

      setExamQuestionsForMode(finalExamQuestions);
      navigate("/exam");
    },
    [allQuestionsData, setSelectedState, navigate]
  );

  const handleStartFlashcards = useCallback(
    (stateCodeFromButton: string) => {
      setSelectedState(stateCodeFromButton);
      localStorage.setItem("selectedState", stateCodeFromButton);
      const generalQuestions = allQuestionsData.filter(
        (q) => q.state_code === null
      );
      const stateSpecificQuestions = allQuestionsData.filter(
        (q) => q.state_code === stateCodeFromButton
      );

      const sessionQuestions = [...generalQuestions, ...stateSpecificQuestions];
      setFlashcardSessionQuestions(
        shuffleArray(sessionQuestions) as Question[]
      );
      navigate("/flashcards");
    },
    [allQuestionsData, setSelectedState, navigate]
  );

  const handleNavigateHome = useCallback(() => {
    setExamResultsData(null);
    setExamQuestionsForMode([]);
    navigate("/");
  }, [navigate]);

  // The 'results' type here should match ExamResultsData from ExamMode.tsx / types.ts
  const handleShowResultsPage = useCallback(
    (results: ExamResultsData) => {
      setExamResultsData(results);
      navigate("/results");
    },
    [navigate]
  );

  const handleRetryTestFromResults = useCallback(() => {
    setExamResultsData(null); // Keep current examQuestionsForMode
    navigate("/exam");
  }, [navigate]);

  const handleStartNewTestFromResults = useCallback(() => {
    if (selectedState) {
      const EXAM_TOTAL_QUESTIONS = 33;
      const TARGET_STATE_QUESTIONS_IN_EXAM = 3;
      const generalQuestions = allQuestionsData.filter(
        (q) => q.state_code === null
      );
      const stateSpecificQuestions = allQuestionsData.filter(
        (q) => q.state_code === selectedState
      );
      let examStateQuestions = shuffleArray(stateSpecificQuestions).slice(
        0,
        TARGET_STATE_QUESTIONS_IN_EXAM
      ) as Question[];
      const generalQuestionsNeeded =
        EXAM_TOTAL_QUESTIONS - examStateQuestions.length;
      let examGeneralQuestions: Question[] = [];
      if (generalQuestionsNeeded > 0) {
        examGeneralQuestions = shuffleArray(generalQuestions).slice(
          0,
          generalQuestionsNeeded
        ) as Question[];
      }
      let combinedExamQuestions = [
        ...examStateQuestions,
        ...examGeneralQuestions,
      ];
      const finalExamQuestions = shuffleArray(
        combinedExamQuestions
      ) as Question[];

      setExamQuestionsForMode(finalExamQuestions);
      setExamResultsData(null);
      navigate("/exam");
    } else {
      handleNavigateHome(); // Fallback if no state is selected for some reason
    }
  }, [allQuestionsData, selectedState, handleNavigateHome, navigate]);

  if (isLoading)
    return (
      <p className="text-center text-gray-500 text-xl py-10">Loading data...</p>
    );
  if (loadingError)
    return (
      <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-3">App Error</h2>
        <p className="mb-2">Problem loading data:</p>
        <pre className="text-sm bg-white p-3 rounded border border-red-200 whitespace-pre-wrap">
          {loadingError}
        </pre>
        <p className="mt-4">
          Try refreshing. Ensure data files are correct and accessible from the
          /public directory (e.g. /data/question.json).
        </p>
      </div>
    ); // Remains same

  // If onboarding is needed, it takes precedence. preferencesLoaded will be true by then.
  if (showOnboardingDialog) {
    return (
      <MainLayout>
        <OnboardingDialog
          statesData={statesData}
          selectedState={selectedState}
          onStateChange={handleStateChange}
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          onSavePreferences={handleSavePreferences}
          availableLanguages={LANGUAGES}
        />
        {/* Optionally render a minimal AppRoutes or nothing behind the modal */}
      </MainLayout>
    );
  }

  // If not onboarding, but preferences still loading (should be quick)
  if (!preferencesLoaded) {
    return (
      <p className="text-center text-gray-500 text-xl py-10">
        Loading preferences...
      </p>
    );
  }

  // If here, onboarding is not needed, and preferences are loaded.
  return (
    <MainLayout>
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
        availableLanguages={LANGUAGES} // Add this prop
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
