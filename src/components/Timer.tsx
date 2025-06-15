
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp?: () => void;
  isActive: boolean;
}

export const Timer = ({ duration, onTimeUp, isActive }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // Last 5 minutes

  return (
    <div className={`flex items-center gap-2 font-mono text-lg ${isLowTime ? 'text-red-600' : 'text-gray-700'}`}>
      <Clock className="w-5 h-5" />
      {formatTime(timeLeft)}
    </div>
  );
};
