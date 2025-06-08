import React, { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatesData, Language } from '../types';
import OnboardingDialog from './ui/OnboardingDialog';

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



        navigate('/');
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">

            <OnboardingDialog
                statesData={statesData}
                selectedState={selectedState}
                onStateChange={onStateChange}
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                onSavePreferences={handleSettingsSave}
                availableLanguages={availableLanguages}
                title="Settings"
                introText="Modify your preferred state and translation language."
                saveButtonText="Save Changes"
            />

        </div>
    );
};

export default SettingsPage;
