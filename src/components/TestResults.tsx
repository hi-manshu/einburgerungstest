import { TestResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Star, Heart } from 'lucide-react';

interface TestResultsProps {
  result: TestResult;
  onRestart: () => void;
  onHome: () => void;
}

export const TestResults = ({ result, onRestart, onHome }: TestResultsProps) => {
  const percentage = Math.round((result.score / result.total) * 100);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fancy gradient & icon effects for success/failure
  const isPassed = result.passed;

  return (
    <div className="relative">
      {/* Animated/Fancy Glow BG */}
      <div
        className={`
          absolute inset-0 z-0 blur-2xl opacity-60 pointer-events-none transition-all
          ${isPassed
            ? 'bg-gradient-to-br from-yellow-200 via-green-100 to-emerald-200 animate-pulse'
            : 'bg-gradient-to-br from-gray-100 via-red-100 to-neutral-200'}
        `}
        aria-hidden
      />
      <Card className={`relative z-10 w-full max-w-2xl mx-auto shadow-2xl bg-gradient-to-br
        ${isPassed
          ? 'from-green-50 via-yellow-50 to-white border-0 ring-2 ring-green-400/40'
          : 'from-red-50 via-gray-50 to-white border-0 ring-2 ring-red-300/30'} 
        dark:from-green-900/30 dark:via-yellow-900/5 dark:to-background`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl font-extrabold text-primary animate-fade-in">
            {isPassed ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-600 animate-bounce drop-shadow" />
                <span className="inline-flex gap-1 items-center">
                  Well Done!
                  <Star className="w-7 h-7 text-yellow-400 animate-pulse -mt-1" />
                  You Passed!
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-10 h-10 text-red-600 animate-shake drop-shadow" />
                <span className="inline-flex gap-1 items-center">
                  Nice Try!
                  Keep Practicing
                </span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-7 animate-fade-in">
          <div className="mx-auto flex flex-col items-center justify-center gap-2">
            <div className={`
              text-5xl font-black tracking-tight mb-1 drop-shadow 
              ${isPassed ? 'text-green-700' : 'text-red-700'}
            `}>
              {result.score}
              <span className="text-3xl opacity-60 font-extrabold">/</span>
              {result.total}
            </div>
            <div className={`
              text-2xl tracking-wide font-bold
              ${isPassed ? 'text-green-700' : 'text-red-700'}
            `}>
              {percentage}% Correct
            </div>
            <div className="text-lg mt-2">
              Time taken: <span className="font-semibold">{formatTime(result.timeSpent)}</span>
            </div>
            <div className={`text-sm mt-3 font-semibold 
              ${isPassed ? "text-green-600" : "text-red-600"}
            `}>
              You need at least 17 correct answers to pass
            </div>
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <Button onClick={onRestart} variant="outline">
              Try Again
            </Button>
            <Button onClick={onHome} variant="secondary">
              Back to Home
            </Button>
          </div>
          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">💖 Love this project?</span>
            <Button
              asChild
              variant="default"
              className={`
                relative overflow-hidden transition-all font-semibold px-6 py-2 group w-auto rounded-full
                z-10
                sponsor-animated-border
              `}
              style={{
                background: "#FFCD00",
                color: "#222",
                outline: "none"
              }}
            >
              <a
                href="https://buymeacoffee.com/himanshoe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sponsor this project"
                className="flex gap-2 items-center font-bold"
                style={{ zIndex: 2 }}
              >
                <Heart className="w-4 h-4 animate-bounce group-hover:animate-none" />
                <span>Sponsor Project</span>
              </a>
            </Button>
            {/* Custom keyframes for animated border around sponsor button */}
            <style>
              {`
                .sponsor-animated-border {
                  border-radius: 9999px;
                  position: relative;
                  border: 1.5px solid transparent;
                  z-index: 1;
                }
                .sponsor-animated-border::before {
                  content: "";
                  position: absolute;
                  inset: -2px;
                  border-radius: 9999px;
                  padding: 0px;
                  pointer-events: none;
                  z-index: 0;
                  border-width: 1.5px;
                  border-style: solid;
                  border-color: #FFCD00;
                  /* Animated border effect */
                  background: conic-gradient(
                    #FFCD00 0% 10%, 
                    #000 12% 19%, 
                    #D00 20% 32%, 
                    #FFCD00 33% 44%, 
                    #000 45% 69%, 
                    #D00 70% 80%, 
                    #FFCD00 81% 100%
                  );
                  -webkit-mask:
                    linear-gradient(#fff 0 0) content-box, 
                    linear-gradient(#fff 0 0);
                  mask:
                    linear-gradient(#fff 0 0) content-box, 
                    linear-gradient(#fff 0 0);
                  -webkit-mask-composite: xor;
                  mask-composite: exclude;
                  animation: sponsor-border-move 2.2s linear infinite;
                }
                @keyframes sponsor-border-move {
                  0% { transform: rotate(0deg);}
                  100% { transform: rotate(360deg);}
                }
              `}
            </style>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
