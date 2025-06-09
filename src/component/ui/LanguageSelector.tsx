import React, { ChangeEvent } from "react";

interface Language {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (newLanguage: string) => void;
  languages: Language[];
  id?: string;
  disabled?: boolean; // Added this line
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  languages,
  id = "language-select",
  disabled = false, // Added this, and defaulting to false
}) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 self-start w-full ${disabled ? 'opacity-50' : ''}`}> {/* Optional: Add opacity to whole container if disabled */}
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Language for Practice Translations
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        Choose the language in which you'd like to see translations for
        questions during practice mode. The primary language will always be
        German. Exam mode does not show translations.
      </p>
      <label htmlFor={id} className="sr-only">
        Select Translation Language:
      </label>
      <select
        id={id}
        value={selectedLanguage}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onLanguageChange(e.target.value)
        }
        disabled={disabled} // Added this line
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow disabled:bg-gray-100 disabled:cursor-not-allowed" // Added disabled:bg-gray-100 and disabled:cursor-not-allowed
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      {disabled && (
        <p className="text-xs text-gray-500 mt-1">
          Enable "Translate questions and answers" in settings to change this.
        </p>
      )}
    </div>
  );
};

export default LanguageSelector;
