import React from 'react';

// Header component with app name on the left and GitHub link on the right.
const Header = () => {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: App Name */}
                    <div className="flex-shrink-0">
                        {/* The app name with a gradient effect for a modern look */}
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                            Einbürgerungstest Practice
                        </span>
                    </div>

                    {/* Right Section: GitHub Link */}
                    <div className="flex items-center">
                        {/* Link to the GitHub repository */}
                        <a
                            href="https://github.com/hi-manshu/einburgerungstest"
                            target="_blank" // Opens the link in a new tab
                            rel="noopener noreferrer" // Recommended for security when using target="_blank"
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            {/* GitHub Icon (inline SVG for self-containment and easy styling) */}
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
                            {/* GitHub username text */}
                            <span>hi-manshu</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
