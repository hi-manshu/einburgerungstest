import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { generateAllQuestionsPDF, PDFQuestion } from "@/utils/generatePDF";
import { SponsorDownloadDialogs } from "./SponsorDownloadDialogs";
import { useAnalytics } from "@/hooks/useAnalytics";

type StateType = { code: string; name: string; };

type Props = {
  states: StateType[];
  questions: any[];
  isLoading: boolean;
};

export default function DownloadQuestionsCard({ states, questions, isLoading }: Props) {
  const [selectedState, setSelectedState] = useState<string>("");
  // Dialog state for sponsor
  const [sponsorDialog, setSponsorDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const { logEvent } = useAnalytics();

  async function actualDownload() {
    const stateObj = states.find((s: any) => s.code === selectedState);
    const fullStateName = stateObj?.name || selectedState;
    const safeStateName = fullStateName.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `lid${safeStateName}.pdf`;

    // Prepare selection
    const nationalQuestions = questions.filter((q: any) => !q.state);
    const stateQuestions = questions.filter((q: any) => q.state === selectedState);
    const sortById = (arr: any[]) => [...arr].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const selectedNational = sortById(nationalQuestions).slice(0, 300);
    const selectedStateQs = sortById(stateQuestions).slice(0, 10);
    const combined: PDFQuestion[] = [...selectedNational, ...selectedStateQs].map((q: any) => ({
      question: q.question,
      answers: q.answers,
      correct: q.correct,
      image: typeof q.image === "string" && q.image !== "-" ? q.image : undefined,
    }));

    logEvent("pdf_download_initiated", {
      state: fullStateName,
      count: combined.length,
    });

    await generateAllQuestionsPDF({
      questions: combined,
      stateName: fullStateName,
      fileName,
    });

    logEvent("pdf_download_complete", {
      state: fullStateName,
      count: combined.length,
    });
  }

  async function handleDownloadFlow() {
    setSponsorDialog(true);
    logEvent("sponsor_dialog_shown", { location: "download_pdf" });
  }

  function handleSponsor() {
    setSponsorDialog(false);
    setConfirmDialog(false);
    logEvent("sponsor_dialog_support_clicked", { location: "download_pdf" });
    // No further action needed, handled by link opening
  }

  function handleNotNow() {
    setSponsorDialog(false);
    setConfirmDialog(true);
    logEvent("sponsor_dialog_cancel", { location: "download_pdf" });
  }

  function handleGiveUp() {
    setConfirmDialog(false);
    logEvent("sponsor_dialog_proceed_after_cancel", { location: "download_pdf" });
    setTimeout(() => {
      actualDownload();
    }, 200); // Small delay for UI smoothness
  }

  return (
    <>
      <SponsorDownloadDialogs
        open={sponsorDialog}
        onSponsor={handleSponsor}
        onCancelSponsor={handleNotNow}
        confirmOpen={confirmDialog}
        onConfirmProceed={handleSponsor}
        onGiveUp={handleGiveUp}
      />
      <Card
        className="
          group relative flex flex-col px-4 py-4 rounded-xl border bg-card
          shadow-sm transition-all duration-200 hover:scale-[1.03]
          cursor-pointer hover:-translate-y-1
          focus-visible:scale-[1.03] ring-1 ring-transparent
          hover:ring-primary/40
          min-h-[150px] animate-fade-in
        "
        style={{ minHeight: 0 }}
        tabIndex={0}
        role="region"
        aria-label="Download all quiz questions as PDF"
      >
        <CardHeader className="flex-row items-center gap-4 mb-1 p-0 pb-2">
          <div className="bg-muted text-primary rounded-full p-2 shadow-sm" aria-hidden="true">
            {/* Download icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-download"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base mb-1 flex items-center">
                Download All Questions &amp; Answers
                <span
                  className="ml-1 text-xs font-bold"
                  style={{
                    background: "none",
                    padding: 0,
                    border: "none",
                    fontSize: "10px",
                    backgroundClip: "text",
                    color: "transparent",
                    backgroundImage: "linear-gradient(90deg,#DD1E2F 60%,#FFCD00 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Beta
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Download a PDF with 300 national & 10 state questions,
              with all correct answers marked.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2 pt-2 p-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="flex-1 w-full">
              <label htmlFor="download-state" className="sr-only">
                Choose State
              </label>
              <select
                id="download-state"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                disabled={isLoading}
                aria-label="Choose State"
              >
                <option value="">Choose a state...</option>
                {states.map((state: any) => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Button
                onClick={handleDownloadFlow}
                disabled={!selectedState || isLoading}
                variant="outline"
                className="relative flex items-center"
                aria-label="Download PDF of questions"
              >
                Download PDF (310 Qs)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
