import React from "react";

interface SubmitConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  unansweredQuestionsCount: number;
}

const SubmitConfirmPopup: React.FC<SubmitConfirmPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  unansweredQuestionsCount,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full mx-4 border-t-4 border-blue-500">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          Confirm Submission
        </h3>
        <p className="mb-6 text-gray-700">
          {unansweredQuestionsCount > 0
            ? `You have ${unansweredQuestionsCount} unanswered question(s).`
            : "You have answered all questions."}{" "}
          Are you sure you want to submit?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmPopup;
