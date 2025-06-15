import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getQuestionsByState, getNonStateQuestions } from "@/utils/dataService";
import { State, Question } from "@/types";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type Props = {
  selectedState: string;
  setSelectedState: (val: string) => void;
  states: State[];
  questions: Question[];
  isLoading: boolean;
};

export function AllQuestionsPDFButton({
  selectedState,
  setSelectedState,
  states,
  questions,
  isLoading,
}: Props) {
  // Helper to get image url safely from an unknown structure
  function getImageFromQuestion(q: Question): string | undefined {
    if ("image" in q && typeof (q as any).image === "string" && (q as any).image !== "-") {
      return (q as any).image as string;
    }
    return undefined;
  }

  const handleDownload = async () => {
    if (!selectedState || !questions.length) return;
    const nationalQuestions: Question[] = getNonStateQuestions(questions);
    const stateQuestions: Question[] = getQuestionsByState(questions, selectedState);

    // Sort and slice for consistent ordering
    const sortById = (arr: Question[]) => [...arr].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const selectedNational = sortById(nationalQuestions).slice(0, 300);
    const selectedStateQuestions = sortById(stateQuestions).slice(0, 10);
    const combined = [...selectedNational, ...selectedStateQuestions];

    const questionsPerPage = 16; // 8 left, 8 right

    // Prepare the filename as lid<StateName>.pdf
    const stateObj = states.find((s) => s.code === selectedState);
    const fullStateName = stateObj?.name || selectedState;
    const safeStateName = fullStateName.replace(/[^a-zA-Z0-9]/g, "");
    const pdfFileName = `lid${safeStateName}.pdf`;

    // Create a new PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 595.28; // A4 px
    const pageHeight = 841.89;
    const margin = 24;
    const colGap = 16;
    const colWidth = (pageWidth - margin * 2 - colGap) / 2;
    const startY = 76;
    const questionsPerCol = 8;
    const lineHeight = 16;
    const answerIndent = 12;

    const totalPages = Math.ceil(combined.length / questionsPerPage);

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      // BETA label top right
      page.drawText("Beta", {
        x: pageWidth - margin - 40,
        y: pageHeight - margin - 16,
        size: 14,
        font: fontBold,
        color: rgb(0.21, 0.38, 0.85),
      });

      // Title and meta
      page.drawText("All Questions & Answers (Beta)", {
        x: margin,
        y: pageHeight - margin - 22,
        size: 16,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      page.drawText("Official Questions: 300 National + 10 State-Specific", {
        x: margin,
        y: pageHeight - margin - 38,
        size: 13,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(`State: ${fullStateName}`, {
        x: margin,
        y: pageHeight - margin - 54,
        size: 13,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });

      let leftColY = pageHeight - startY;
      let rightColY = pageHeight - startY;

      for (let i = 0; i < questionsPerPage; i++) {
        const idx = pageNum * questionsPerPage + i;
        if (idx >= combined.length) break;
        const q = combined[idx];
        const isLeft = i < questionsPerCol;
        let x = margin + (isLeft ? 0 : colWidth + colGap);
        let y = isLeft ? leftColY : rightColY;

        // Draw question text
        page.drawText(`${idx + 1}. ${q.question}`, {
          x,
          y,
          size: 11,
          font,
          maxWidth: colWidth,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;

        // Draw image if present (can only embed jpg/png)
        const imageUrl = getImageFromQuestion(q);
        if (imageUrl && (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.png'))) {
          try {
            const imgBlob = await fetch(imageUrl).then(r => r.blob());
            const imgArr = new Uint8Array(await imgBlob.arrayBuffer());
            let imgEmbed = null;
            if (imageUrl.endsWith(".png")) {
              imgEmbed = await pdfDoc.embedPng(imgArr);
            } else {
              imgEmbed = await pdfDoc.embedJpg(imgArr);
            }
            page.drawImage(imgEmbed, {
              x: x,
              y: y - 60,
              width: colWidth * 0.95,
              height: 54,
            });
            y -= 60;
          } catch (e) {
            // Fail silently for image issues
          }
        }

        // Draw answers (A, B, ...)
        q.answers.forEach((ans, idxAns) => {
          if (idxAns === q.correct) {
            // Draw correct answer in green and bold with check
            page.drawText(`✅ ${String.fromCharCode(65 + idxAns)}. ${ans}`, {
              x: x + answerIndent,
              y,
              size: 11,
              font: fontBold,
              color: rgb(0, 0.6, 0),
              maxWidth: colWidth - answerIndent,
            });
          } else {
            page.drawText(`${String.fromCharCode(65 + idxAns)}. ${ans}`, {
              x: x + answerIndent,
              y,
              size: 11,
              font,
              color: rgb(0.25, 0.25, 0.25),
              maxWidth: colWidth - answerIndent,
            });
          }
          y -= lineHeight - 3;
        });

        y -= 10;

        // Update column Y for next question
        if (isLeft) {
          leftColY = y;
        } else {
          rightColY = y;
        }
      }
    }

    // Download the file
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = pdfFileName;
    link.click();

    // Inform via console for debug and clarity for user
    console.log(`PDF generated as: ${pdfFileName}`);
  };

  return (
    <div className="flex gap-2 items-center flex-wrap mt-2">
      <Button
        onClick={handleDownload}
        disabled={!selectedState || isLoading}
        variant="outline"
        className="relative"
      >
        Download All Questions &amp; Answers
        {/* Visible, curved, German gradient Beta badge */}
        <Badge
          className="ml-2 px-4 py-1 text-white font-bold text-sm rounded-full shadow
            bg-gradient-to-r from-black via-red-500 to-yellow-400
            border-none"
          variant="secondary"
        >
          Beta
        </Badge>
      </Button>
    </div>
  );
}
