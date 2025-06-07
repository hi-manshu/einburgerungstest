import React from 'react';

const ExamTimer = ({ timeRemaining }) => {
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`text-2xl font-bold ${
            timeRemaining >= 30 * 60 ? 'text-green-500' :
            timeRemaining >= 10 * 60 ? 'text-yellow-500' :
            'text-red-500'
        }`} role="timer" aria-live="polite">
            {formatTime(timeRemaining)}
        </div>
    );
};
export default ExamTimer;
