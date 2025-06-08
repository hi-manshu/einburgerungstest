import React from 'react';

interface ExamTimerProps {
    timeRemaining: number;
    examDuration: number;
}

const ExamTimer: React.FC<ExamTimerProps> = ({ timeRemaining, examDuration }) => {
    const formatTime = (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    let timerColorClass = 'text-red-500';
    if (examDuration > 0) {
        const percentageRemaining = (timeRemaining / examDuration) * 100;
        if (percentageRemaining >= 50) {
            timerColorClass = 'text-green-500';
        } else if (percentageRemaining >= (10/60)*100) {
            timerColorClass = 'text-yellow-500';
        }
    } else if (timeRemaining > 0) {
        timerColorClass = 'text-green-500';
    }

    return (
        <div className={`text-2xl font-bold ${timerColorClass}`} role="timer" aria-live="polite">
            {formatTime(timeRemaining)}
        </div>
    );
};
export default ExamTimer;
