import { Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from './LanguageContext';

const AVAILABLE_TRANSLATION_LANGS = ["en", "tr", "ru", "fr", "ar", "uk", "hi"];

// Get explanation from translation -> en -> context, then fallback to context
function getExplanationFromContext(question: Question): string {
  if (
    (question as any).translation && (question as any).translation.en &&
    typeof (question as any).translation.en.context === "string" &&
    (question as any).translation.en.context.trim()
  ) {
    return (question as any).translation.en.context.trim();
  }
  // fallback for other JSON data patterns (for extra robustness)
  if (
    (question as any).translations && (question as any).translations.en &&
    typeof (question as any).translations.en.context === "string" &&
    (question as any).translations.en.context.trim()
  ) {
    return (question as any).translations.en.context.trim();
  }
  // fallback to context
  if (
    typeof (question as any).context === "string" &&
    (question as any).context.trim()
  ) {
    return (question as any).context.trim();
  }
  return "";
}

function getTranslation(question: Question, lang: string): string | undefined {
  if (
    lang &&
    (question as any).translations &&
    typeof (question as any).translations === "object" &&
    Object.prototype.hasOwnProperty.call((question as any).translations, lang) &&
    (question as any).translations[lang]?.question
  ) {
    return (question as any).translations[lang].question;
  }
  return undefined;
}
function getExplanationTranslation(question: Question, lang: string): string | undefined {
  if (
    lang &&
    (question as any).translations &&
    typeof (question as any).translations === "object" &&
    Object.prototype.hasOwnProperty.call((question as any).translations, lang) &&
    (question as any).translations[lang]?.context
  ) {
    return (question as any).translations[lang].context;
  }
  return undefined;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  onNext,
  questionNumber,
  totalQuestions,
  showExplanation = false,
  pathname,
}: any) => {
  const AVAILABLE_TRANSLATION_LANGS = ["en", "tr", "ru", "fr", "ar", "uk", "hi"];
  const { showTranslation, translationLang } = useLanguage();

  const isGeneralTest = pathname === "/general-test" || window?.location?.pathname === "/general-test";
  const showTranslationFeature =
    showTranslation &&
    translationLang &&
    AVAILABLE_TRANSLATION_LANGS.includes(translationLang) &&
    isGeneralTest &&
    Boolean((question as any).translations);

  const translationText = showTranslationFeature
    ? getTranslation(question, translationLang)
    : undefined;

  const imageSrc =
    typeof (question as any).image === 'string' && (question as any).image !== '-'
      ? (question as any).image
      : undefined;

  if (!question) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load question.</p>
        </CardContent>
      </Card>
    );
  }

  const highlightAnswers = selectedAnswer !== undefined && selectedAnswer !== -1;

  // Ensures images always rendered if available (already supported)
  // Update answer style: correct answer is bold, italic, green

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">
          {questionNumber && totalQuestions && (
            <span className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
          )}
          {/* Question image shown above the question */}
          {typeof (question as any).image === 'string' && (question as any).image !== '-' && (
            <div className="mt-2 flex justify-center">
              <img
                src={(question as any).image}
                alt="Frage Illustration"
                className="max-h-44 object-contain mx-auto rounded-md border"
                loading="lazy"
              />
            </div>
          )}
          <div className="mt-2">{question.question}</div>
          {translationText && (
            <div className="text-primary/80 text-base mt-2 font-medium italic border-l-4 border-yellow-400 py-1 px-3 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 max-w-3xl">
              {translationText}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => onAnswerSelect(parseInt(value))}
          disabled={showResult || highlightAnswers}
        >
          {question.answers.map((answer, index) => {
            let optionClass = "flex items-center space-x-2 p-3 rounded-lg border transition-colors ";
            let textClass = ""; // to style correct answer
            if (highlightAnswers || showResult) {
              if (index === question.correct) {
                optionClass +=
                  "bg-green-100 border-green-500 text-green-900 dark:bg-green-900/15 dark:border-green-400 dark:text-green-100 font-semibold";
                textClass = "font-bold italic text-green-600 dark:text-green-400";
              } else if (selectedAnswer === index && index !== question.correct) {
                optionClass +=
                  "bg-red-100 border-red-500 text-red-900 dark:bg-red-900/20 dark:border-red-400 dark:text-red-100 font-semibold";
              } else {
                optionClass += "bg-gray-50 dark:bg-zinc-900/40 border-gray-200 dark:border-zinc-700";
              }
            } else {
              optionClass += "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-white";
            }
            return (
              <div
                key={index}
                className={optionClass}
              >
                <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                <Label htmlFor={`answer-${index}`} className={`flex-1 cursor-pointer ${textClass}`}>
                  {answer}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        {showResult && onNext && (
          <div className="flex justify-center pt-4">
            <Button onClick={onNext}>Next Question</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
