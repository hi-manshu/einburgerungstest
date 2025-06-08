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
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
            languages={availableLanguages}
            id="onboarding-language-select"
          />
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
