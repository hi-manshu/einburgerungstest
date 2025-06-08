import React from "react";
import { logAnalyticsEvent } from "../../analytics/analytics";

interface ExamUserAnswers {
  [key: string]: string;
}

interface ExamNavigationProps {
  currentExamQuestionIndex: number;
  totalQuestions: number;
  handleNavigation: (direction: number) => void;
  handleSubmitExam: (isTimeUp: boolean) => void;
  examUserAnswers: ExamUserAnswers;
}

const ExamNavigation: React.FC<ExamNavigationProps> = ({
  currentExamQuestionIndex,
  totalQuestions,
  handleNavigation,
  handleSubmitExam,
  examUserAnswers,
}) => {
  const hasAnswers = Object.keys(examUserAnswers).length > 0;

  return (
    <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
      <button
        onClick={() => {
          logAnalyticsEvent("select_content", {
            content_type: "button",
            item_id: "exam_nav_previous",
            current_question_index: currentExamQuestionIndex,
          });
          handleNavigation(-1);
        }}
        disabled={currentExamQuestionIndex === 0}
        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-opacity"
      >
        Prev
      </button>

      {hasAnswers && currentExamQuestionIndex < totalQuestions - 1 && (
        <button
          onClick={() => {
            handleSubmitExam(false);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Finish Exam
        </button>
      )}

      {currentExamQuestionIndex < totalQuestions - 1 ? (
        <button
          onClick={() => {
            logAnalyticsEvent("select_content", {
              content_type: "button",
              item_id: "exam_nav_next",
              current_question_index: currentExamQuestionIndex,
            });
            handleNavigation(1);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Next
        </button>
      ) : (
        <button
          onClick={() => {
            handleSubmitExam(false);
          }}
          disabled={!hasAnswers}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          Submit Results
        </button>
      )}
    </div>
  );
};
export default ExamNavigation;
