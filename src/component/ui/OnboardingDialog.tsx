import React, { ChangeEvent } from "react";
import { StatesData, Language } from "../../types";
import StateSelector from "./StateSelector";
import LanguageSelector from "./LanguageSelector";

interface OnboardingDialogProps {
  statesData: StatesData;
  selectedState: string;
  onStateChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  selectedLanguage: string;
  onLanguageChange: (newLanguage: string) => void;
  onSavePreferences: () => void;
  availableLanguages: Language[];
  enablePracticeTranslation: boolean;
  onTogglePracticeTranslation: () => void;
  title?: string;
  introText?: string | null;
  saveButtonText?: string;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
  statesData,
  selectedState,
  onStateChange,
  selectedLanguage,
  onLanguageChange,
  onSavePreferences,
  availableLanguages,
  enablePracticeTranslation,
  onTogglePracticeTranslation,
  title,
  introText,
  saveButtonText,
}) => {
  const handleSave = () => {
    if (!selectedState || !selectedLanguage) {
      alert("Please select both a state and a language.");
      return;
    }
    onSavePreferences();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {title || "Welcome!"}
        </h2>
        {introText === undefined && (
          <p className="text-gray-600 mb-6 text-center">
            Please select your state and preferred language to get started.
          </p>
        )}
        {introText && (
          <p className="text-gray-600 mb-6 text-center">{introText}</p>
        )}

        <div className="space-y-6">
          <StateSelector
            selectedState={selectedState}
            onStateChange={onStateChange}
            statesData={statesData}
            id="onboarding-state-select"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">
            Practice Mode Settings
          </h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <span className="flex-grow flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  Translate questions and answers
                </span>
                <span className="text-xs text-gray-500">
                  Show translations in practice mode for selected language
                </span>
              </span>
              <button
                type="button"
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  enablePracticeTranslation ? "bg-indigo-600" : "bg-gray-200"
                }`}
                onClick={onTogglePracticeTranslation}
                aria-pressed={enablePracticeTranslation}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    enablePracticeTranslation
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div
              className={`transition-opacity duration-300 ${
                !enablePracticeTranslation ? "opacity-50" : "opacity-100"
              }`}
            >
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                languages={availableLanguages}
                id="onboarding-language-select"
                disabled={!enablePracticeTranslation}
              />
              {!enablePracticeTranslation && (
                <p className="text-xs text-gray-500 mt-1 px-1">
                  Enable "Translate questions and answers" to change the
                  practice language.
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50"
          disabled={!selectedState || !selectedLanguage}
        >
          {saveButtonText || "Save Preferences & Get Started"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingDialog;
