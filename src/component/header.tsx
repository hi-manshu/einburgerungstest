import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// HeaderProps is no longer needed if onSettingsClick is the only prop.
// If there were other props, they would remain. For now, assuming it becomes an empty interface or removed.
// Let's remove HeaderProps if it becomes empty.

const Header: React.FC = () => { // No props needed now for this specific change
    const navigate = useNavigate(); // Initialize navigate

    const handleSettingsClick = () => {
        navigate('/settings'); // Navigate to /settings route
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: App Name */}
                    <div className="flex-shrink-0">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                            Einbürgerungstest Practice
                        </span>
                    </div>

                    {/* Right Section: Settings Icon and GitHub Link */}
                    <div className="flex items-center">
                        {/* Settings Icon Button */}
                        <button
                            onClick={handleSettingsClick} // Updated onClick handler
                            aria-label="Settings"
                            className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors mr-4"
                        >
                            {/* Gear Icon (inline SVG) */}
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </button>

                        {/* Link to the GitHub repository (existing code) */}
                        <a
                            href="https://github.com/hi-manshu/einburgerungstest"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.47.087.683-.205.683-.456 0-.223-.009-.817-.013-1.616-2.782.603-3.37-1.341-3.37-1.341-.454-1.157-1.11-1.467-1.11-1.467-.91-.62.069-.608.069-.608 1.007.07 1.532 1.03 1.532 1.03.89 1.533 2.338 1.09 2.903.832.09-.64.35-1.09.636-1.342-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.682-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 5.042c.85.006 1.7.119 2.5.352 1.906-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.099 2.65.64.698 1.028 1.591 1.028 2.682 0 3.841-2.339 4.686-4.566 4.935.359.307.678.917.678 1.846 0 1.341-.012 2.417-.012 2.747 0 .252.213.547.689.455C21.139 20.197 24 16.442 24 12.017 24 6.484 19.522 2 14 2h-2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>hi-manshu</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
