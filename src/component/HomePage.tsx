import React from "react";
import { logAnalyticsEvent } from "../analytics/analytics";
import { StatesData } from "../types"; // Add this

interface HomePageProps {
  onStartPractice: (stateCode: string) => void;
  onStartExam: (stateCode: string) => void;
  onStartFlashcards: (stateCode: string) => void;
  onStartStatePractice: (stateCode: string) => void;
  // onStartPracticeByCategory removed
  selectedState: string;
  statesData: StatesData;
}

const HomePage: React.FC<HomePageProps> = ({
  onStartPractice,
  onStartExam,
  onStartFlashcards,
  onStartStatePractice,
  // onStartPracticeByCategory removed
  selectedState,
  statesData,
}) => {
  const handleActivityNavigation = (
    activityStartFunction: (stateCode: string) => void
  ) => {
    if (!selectedState) {
      alert(
        "Please ensure your state is selected (you might need to refresh or clear site data if issues persist)."
      );
      return;
    }
    activityStartFunction(selectedState);
  };

  const stateName =
    selectedState && statesData[selectedState] ? statesData[selectedState] : "";
  const dynamicTitle = stateName
    ? `Practice Question for ${stateName}`
    : "State Practice";
  const dynamicSubtitle = stateName
    ? `10 quick questions for ${stateName}.`
    : "Select a state in settings first.";

  const cardData = [
    {
      id: "state-practice",
      title: dynamicTitle,
      subtitle: dynamicSubtitle,
      icon: (
        <svg
          className="w-12 h-12 mb-4 text-indigo-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {/* Using a map or location pin icon might be more thematic */}
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      action: () => {
        logAnalyticsEvent("select_content", {
          content_type: "button",
          item_id: "start_state_practice",
          selected_state: selectedState,
        });
        handleActivityNavigation(onStartStatePractice);
      },
    },
    {
      id: "practice",
      title: "Practice Questions",
      subtitle: "Sharpen your knowledge with topic-specific questions.",
      icon: (
        <svg
          className="w-12 h-12 mb-4 text-blue-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M6 16h.01"></path>
        </svg>
      ),
      action: () => {
        logAnalyticsEvent("select_content", {
          content_type: "button",
          item_id: "start_practice",
          selected_state: selectedState,
        });
        handleActivityNavigation(onStartPractice);
      },
    },
    // "practice-by-category" card removed
    {
      id: "exam",
      title: "Mock Exam",
      subtitle: "Simulate the real exam experience with timed tests.",
      icon: (
        <svg
          className="w-12 h-12 mb-4 text-green-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      action: () => {
        logAnalyticsEvent("select_content", {
          content_type: "button",
          item_id: "start_exam",
          selected_state: selectedState,
        });
        handleActivityNavigation(onStartExam);
      },
    },
    {
      id: "flashcards",
      title: "Use Flashcards",
      subtitle: "Review key concepts and terms quickly.",
      icon: (
        <svg
          className="w-12 h-12 mb-4 text-purple-500"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4 3H9m3 4H9m3 4H9M9 9V6a3 3 0 013-3h.01"></path>
        </svg>
      ),
      action: () => {
        logAnalyticsEvent("select_content", {
          content_type: "button",
          item_id: "start_flashcards",
          selected_state: selectedState,
        });
        handleActivityNavigation(onStartFlashcards);
      },
    },
  ];

  return (
    <div className="text-center px-4 py-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Hey there! It's your prep day—let’s get things rolling!
      </h2>
      <p className="text-xl text-gray-600 mb-12">
        "Ready to get started? Choose your preferred way to prepare."
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cardData.map((card) => (
          <div
            key={card.id}
            className="group bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-between hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center">
              {card.icon}
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6">{card.subtitle}</p>
            </div>
            <button
              onClick={card.action}
              className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md transition-opacity duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
