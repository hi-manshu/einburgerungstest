
import { cn } from '@/lib/utils';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: number[]; // index matches testQuestions, value is answer index or -1
  onQuestionSelect: (questionIndex: number) => void;
  testQuestions?: { correct: number }[]; // optional, used for marking correctness
}

export const QuestionNavigator = ({
  totalQuestions,
  currentQuestion,
  answers,
  onQuestionSelect,
  testQuestions = [],
}: QuestionNavigatorProps) => {
  return (
    <div className="question-navigator w-full overflow-x-auto pb-2 sm:pb-0">
      <div className="flex gap-3 min-w-max px-4">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isCurrent = index === currentQuestion;
          const answer = answers[index];
          const correctIndex = testQuestions && typeof testQuestions[index]?.correct === "number"
            ? testQuestions[index].correct
            : undefined;
          const hasAnswered = answer !== undefined && answer !== -1;

          // Default appearance and logic
          let baseClass =
            "relative flex-shrink-0 transition-all duration-150 flex items-center justify-center font-semibold focus:outline-none overflow-visible w-10 h-10 select-none";
          let numberClass = "flex items-center justify-center text-lg font-semibold w-full h-full";

          if (isCurrent) {
            baseClass += " rounded-full ring-2 ring-primary/80 ring-offset-2 bg-primary text-primary-foreground shadow";
            numberClass += " text-primary-foreground";
          } else {
            baseClass += " rounded-md";
            // Answered: show green/red, else muted/gray
            if (hasAnswered) {
              if (typeof correctIndex === "number" && answer === correctIndex) {
                // Correct answer selected
                baseClass += " border-2 border-green-500 bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-100";
              } else if (typeof correctIndex === "number" && answer !== correctIndex) {
                // Incorrect answer selected
                baseClass += " border-2 border-red-500 bg-red-50 dark:bg-red-900/15 text-red-800 dark:text-red-100";
              } else {
                baseClass += " border border-muted bg-muted/70 text-muted-foreground";
              }
            } else {
              baseClass += " border border-muted bg-muted/70 text-muted-foreground";
            }
          }

          return (
            <button
              key={index}
              type="button"
              aria-current={isCurrent ? "true" : undefined}
              className={baseClass}
              style={{
                boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.10)' : undefined,
                outline: "none"
              }}
              onClick={() => onQuestionSelect(index)}
              tabIndex={0}
            >
              <span className={numberClass}>
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
