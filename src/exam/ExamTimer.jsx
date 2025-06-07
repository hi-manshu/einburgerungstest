import React from 'react';

// Pass examDuration to ExamTimer
const ExamTimer = ({ timeRemaining, examDuration }) => {
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    let timerColorClass = 'text-red-500'; // Default red
    if (examDuration > 0) { // Avoid division by zero if examDuration isn't loaded yet
        const percentageRemaining = (timeRemaining / examDuration) * 100;
        if (percentageRemaining >= 50) {
            timerColorClass = 'text-green-500';
        } else if (percentageRemaining >= (10/60)*100) { // Approx 16.67% (10 mins of 60 mins)
            timerColorClass = 'text-yellow-500';
        }
    } else if (timeRemaining > 0) { // If duration is 0 but time > 0, show green (edge case)
        timerColorClass = 'text-green-500';
    }
    // If examDuration is 0 and timeRemaining is 0, it remains red, which is fine.

    return (
        <div className={`text-2xl font-bold ${timerColorClass}`} role="timer" aria-live="polite">
            {formatTime(timeRemaining)}
        </div>
    );
};
export default ExamTimer;
