import React, { ChangeEvent } from 'react';
import { StatesData } from '../../types'; // Assuming StatesData is in types.ts

interface StateSelectorProps {
    selectedState: string;
    onStateChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    onResetState: () => void;
    statesData: StatesData;
    id?: string;
}

const StateSelector: React.FC<StateSelectorProps> = ({
    selectedState,
    onStateChange,
    onResetState,
    statesData,
    id = "state-select"
}) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 self-start w-full">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">1. Select Your State</h3>
            <label htmlFor={id} className="sr-only">
                Select Your State:
            </label>
            <select
                id={id}
                value={selectedState}
                onChange={onStateChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow"
            >
                <option value="">Select a State</option>
                {Object.entries(statesData || {}).sort(([, a]: [string, string], [, b]: [string, string]) => a.localeCompare(b)).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                ))}
            </select>
            {!selectedState && (
                 <p className="text-sm text-gray-500 mt-2">Please select a state to enable activities.</p>
            )}
            <div className="flex justify-center mt-4">
                <button
                    onClick={onResetState}
                    className="bg-pink-400 hover:bg-black-500 text-white text-sm font-bold py-2 px-3 rounded shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedState}
                >
                    Reset State
                </button>
            </div>
        </div>
    );
};

export default StateSelector;
