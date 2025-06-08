import React, { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatesData, Language } from '../types'; // Assuming types.ts is at src/types.ts
import OnboardingDialog from './ui/OnboardingDialog'; // Adjust path if OnboardingDialog is elsewhere

interface SettingsPageProps {
    statesData: StatesData;
    selectedState: string;
    onStateChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    selectedLanguage: string;
    onLanguageChange: (newLanguage: string) => void;
    availableLanguages: Language[];
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    statesData,
    selectedState,
    onStateChange,
    selectedLanguage,
    onLanguageChange,
    availableLanguages,
}) => {
    const navigate = useNavigate();

    const handleSettingsSave = () => {
        // Preferences are already saved to localStorage by onStateChange/onLanguageChange
        // passed to OnboardingDialog.
        // After "saving" (i.e., confirming selections in the dialog), navigate home.
        navigate('/');
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {/*
                We are re-using OnboardingDialog here.
                It creates a modal overlay. For a dedicated settings *page*,
                we might not want the modal overlay effect (fixed position, background dim).
                Instead, we might want the OnboardingDialog's content to render directly
                within the page flow.

                Let's assume for now OnboardingDialog's internal structure is:
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 ..."> // Outer modal shell
                    <div className="bg-white p-8 rounded-lg shadow-xl ..."> // Inner content box
                        // ... title, selectors, button ...
                    </div>
                </div>

                If we want to embed its content directly, OnboardingDialog would need refactoring
                to separate its shell from its content, or we'd replicate its content structure here.

                For this iteration, let's proceed with using OnboardingDialog as is.
                This means the SettingsPage will effectively look like a modal taking up the screen,
                which might be acceptable, or could be refined later.
                The alternative is to pass a prop to OnboardingDialog like `renderAsPage={true}`
                which would then skip rendering its modal shell.

                Simpler approach for now: Wrap OnboardingDialog in a way that it appears
                centered on the page, but not necessarily as a full-screen modal overlay if possible.
                However, OnboardingDialog is designed as a modal.
                So, the SettingsPage will essentially just launch this modal.
            */}
            <OnboardingDialog
                statesData={statesData}
                selectedState={selectedState}
                onStateChange={onStateChange}
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                onSavePreferences={handleSettingsSave} // Closes modal and navigates
                availableLanguages={availableLanguages}
                title="Settings"
                introText="Modify your preferred state and translation language." // More descriptive intro
                saveButtonText="Save Changes"
            />
            {/*
                If OnboardingDialog is strictly a modal, the above will darken the rest of SettingsPage.
                A user might expect to see the settings *within* the page layout (header, footer visible).
                This implies OnboardingDialog might need an 'embedded' mode.

                Let's make a note: If OnboardingDialog cannot be easily used here without the modal
                effect, we might need to extract its core form into a new component,
                say `PreferencesForm.tsx`, and use that here and inside OnboardingDialog.

                For now, the subtask is to create SettingsPage.tsx assuming OnboardingDialog
                is used as is. The visual result will be the modal appearing.
            */}
        </div>
    );
};

export default SettingsPage;
