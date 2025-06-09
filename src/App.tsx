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
} from "./types";
import MainLayout from "./component/MainLayout";
import AppRoutes from "./AppRoutes";
import OnboardingDialog from "./component/ui/OnboardingDialog";

import useScreenTracking from "./analytics/useScreenTracking";
import { logAnalyticsEvent } from "./analytics/analytics";

const LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "tr", name: "Türkçe" },
  { code: "ru", name: "Русский" },
  { code: "fr", name: "Français" },
  { code: "ar", name: "العربية" },
  { code: "uk", name: "Українська" },
  { code: "hi", name: "हिन्दी" },
];

const App: React.FC = () => {
  useScreenTracking();

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
  const [statePracticeSessionQuestions, setStatePracticeSessionQuestions] = useState<Question[]>([]);
  const [examQuestionsForMode, setExamQuestionsForMode] = useState<Question[]>(
    []
  );
  const [flashcardSessionQuestions, setFlashcardSessionQuestions] = useState<
    Question[]
  >([]);
  const [examResultsData, setExamResultsData] =
    useState<ExamResultsData | null>(null);

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [showOnboardingDialog, setShowOnboardingDialog] =
    useState<boolean>(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);
  const [enablePracticeTranslation, setEnablePracticeTranslation] =
    useState<boolean>(true);

  useEffect(() => {
    const storedStateVal = localStorage.getItem("selectedState");
    const storedLangVal = localStorage.getItem("selectedLanguage");

    const currentSelectedState =
      storedStateVal && storedStateVal.trim() !== "" ? storedStateVal : "";

    const currentSelectedLanguage =
      storedLangVal && storedLangVal.trim() !== "" ? storedLangVal : "en";

    setSelectedState(currentSelectedState);
    setSelectedLanguage(currentSelectedLanguage);

    const needsOnboarding = !localStorage.getItem("hasOnboarded");

    setShowOnboardingDialog(needsOnboarding);
    setPreferencesLoaded(true);

    const storedEnablePracticeTranslation = localStorage.getItem(
      "enablePracticeTranslation"
    );
    if (storedEnablePracticeTranslation !== null) {
      setEnablePracticeTranslation(storedEnablePracticeTranslation === "true");
    } else {
      localStorage.setItem("enablePracticeTranslation", "true"); // Set default if not found
    }
  }, []);

  const handleStateChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const newState = event.target.value;
      setSelectedState(newState);
      localStorage.setItem("selectedState", newState);
      logAnalyticsEvent("select_item", {
        item_list_id: "state_selection",
        item_list_name: "State Selection",
        items: [{ item_id: newState, item_name: statesData[newState]?.name }],
      });
    },
    [statesData]
  );

  const handleResetState = useCallback(() => {
    setSelectedState("");
    localStorage.removeItem("selectedState");
    logAnalyticsEvent("select_content", {
      content_type: "button",
      item_id: "reset_state",
    });
  }, []);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    localStorage.setItem("selectedLanguage", newLanguage);
    logAnalyticsEvent("select_item", {
      item_list_id: "language_selection",
      item_list_name: "Language Selection",
      items: [{ item_id: newLanguage }],
    });
  }, []);

  const handleSavePreferences = useCallback(() => {
    logAnalyticsEvent("select_content", {
      content_type: "button",
      item_id: "save_preferences",
    });

    setShowOnboardingDialog(false);
    localStorage.setItem("hasOnboarded", "true");
  }, [setShowOnboardingDialog]);

  const handleTogglePracticeTranslation = useCallback(() => {
    setEnablePracticeTranslation((prevValue) => {
      const newValue = !prevValue;
      localStorage.setItem("enablePracticeTranslation", String(newValue));
      logAnalyticsEvent("select_content", {
        content_type: "setting_toggle",
        item_id: "toggle_practice_translation",
        value: newValue, // Log the new state
      });
      return newValue;
    });
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
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
        // console.error("Error fetching questions:", e); // Removed console.error
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
        // console.error("Error fetching states:", e); // Removed console.error
      }

      setRawQuestionsData(fetchedQuestions);
      setStatesData(fetchedStatesData);

      if (qError || sError) {
        const errors = [qError, sError].filter(Boolean).join("; ");
        setLoadingError(errors);
      } else if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setLoadingError("No questions found in the data file.");
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!rawQuestionsData || !preferencesLoaded) {
      return;
    }

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
          image: (newQuestion.image && newQuestion.image.trim() !== "" && newQuestion.image !== "-") ? newQuestion.image : undefined, // Added image handling
        };
      }
    );
    setAllQuestionsData(tempQuestions);
  }, [rawQuestionsData, selectedLanguage, preferencesLoaded]);

  useEffect(() => {
    if (
      selectedState &&
      allQuestionsData.length > 0 &&
      practiceSessionQuestions.length > 0 &&
      preferencesLoaded
    ) {
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
  ]);

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

  const handleStartStatePractice = useCallback(
    async (stateCode: string) => {
      if (!allQuestionsData || allQuestionsData.length === 0) {
        console.error("All questions data is not loaded yet."); // Or handle more gracefully
        return;
      }

      // It's good practice to ensure the selected state is updated if this function can be called with a new state.
      setSelectedState(stateCode);
      localStorage.setItem("selectedState", stateCode);

      const stateSpecificQuestions = allQuestionsData.filter(
        (q) => q.state_code === stateCode
      );

      if (stateSpecificQuestions.length === 0) {
        // Handle case with no questions for the state - maybe navigate to a different page or show a message.
        // For now, we'll set an empty array and navigate. The target page should handle this.
        console.warn(`No specific questions found for state ${stateCode}.`);
        setStatePracticeSessionQuestions([]);
      } else {
        const shuffledStateQuestions = shuffleArray(stateSpecificQuestions) as Question[];
        const selectedQuestions = shuffledStateQuestions.slice(0, 10);
        setStatePracticeSessionQuestions(selectedQuestions);
      }

      navigate("/state-practice");
    },
    [allQuestionsData, navigate, setSelectedState] // Add other dependencies as needed
  );

  const handleStartExam = useCallback(
    (stateCodeFromButton: string) => {
      if (!stateCodeFromButton) {
        // console.log("Please select a state for the exam."); // Removed console.log
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

  const handleShowResultsPage = useCallback(
    (results: ExamResultsData) => {
      setExamResultsData(results);
      navigate("/results");
    },
    [navigate]
  );

  const handleRetryTestFromResults = useCallback(() => {
    setExamResultsData(null);
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
      handleNavigateHome();
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
    );

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
      </MainLayout>
    );
  }

  if (!preferencesLoaded) {
    return (
      <p className="text-center text-gray-500 text-xl py-10">
        Loading preferences...
      </p>
    );
  }

  return (
    <MainLayout>
      <AppRoutes
        statesData={statesData}
        onStartPractice={handleStartPractice}
        onStartExam={handleStartExam}
        onStartFlashcards={handleStartFlashcards}
        onStartStatePractice={handleStartStatePractice}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        onResetState={handleResetState}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        availableLanguages={LANGUAGES}
        practiceSessionQuestions={practiceSessionQuestions}
        examQuestionsForMode={examQuestionsForMode}
        statePracticeSessionQuestions={statePracticeSessionQuestions}
        onShowResultsPage={handleShowResultsPage}
        examResultsData={examResultsData}
        onRetryTest={handleRetryTestFromResults}
        onStartNewTest={handleStartNewTestFromResults}
        flashcardSessionQuestions={flashcardSessionQuestions}
        onNavigateHome={handleNavigateHome}
        enablePracticeTranslation={enablePracticeTranslation}
        onTogglePracticeTranslation={handleTogglePracticeTranslation}
      />
    </MainLayout>
  );
};

export default App;
