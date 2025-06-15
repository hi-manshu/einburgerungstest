import { jsPDF } from "jspdf";

export type PDFQuestion = {
  question: string;
  answers: string[];
  correct: number;
  image?: string;
};

export async function generateAllQuestionsPDF({
  questions,
  stateName,
  fileName,
}: {
  questions: PDFQuestion[];
  stateName: string;
  fileName: string;
}) {
  // ----- PDF Constants -----
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  // Adjust: marginY smaller for more usable page space
  const marginY = 12; // reduced from 18 to 12
  const colGap = 7;
  const colWidth = (pageWidth - marginX * 2 - colGap) / 2;
  const startY = marginY + 24 + 6;
  const fontSizeQ = 11;
  const fontSizeA = 10.3;
  const lineSpacingQ = 5.3;
  const lineSpacingA = 4.9;
  const answerGapY = 6.0;
  const imgMaxH = 23;
  const imgMarginY = 2.5;
  const minSpaceAfterAnswers = 7;
  const questionBoxPad = 2.0;
  const questionBoxBgColor = "#f3f4f6"; // Light gray

  const doc = new jsPDF();

  // Improved wrapTextWithIndent: inserted space at beginning of wrapped lines for natural word break
  function wrapTextWithIndent(
    txt: string,
    prefix: string,
    maxWidth: number,
    fontSize: number,
    doc: jsPDF
  ) {
    const words = txt.split(' ');
    let lines: string[] = [];
    let currentLine = '';
    let isFirstLine = true;
    let thisPrefix: string;
    for (let i = 0; i < words.length; i++) {
      thisPrefix = isFirstLine ? prefix : "".padEnd(prefix.length, " ");
      let testLine = currentLine === '' ? words[i] : currentLine + ' ' + words[i];
      const width = doc.getTextWidth(thisPrefix + testLine) * (fontSize / 12);

      if (width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        // Always add a space at the start of the next line
        currentLine = words[i];
        isFirstLine = false;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Add a space to the beginning of wrapped lines, preserving word separation
    if (lines.length > 1) {
      for (let i = 1; i < lines.length; i++) {
        // Add a single space if the line doesn't already start with one
        if (!lines[i].startsWith(' ')) {
          lines[i] = ' ' + lines[i];
        }
      }
    }
    return lines;
  }

  async function getImageData(imageUrl?: string) {
    if (
      !imageUrl ||
      !(imageUrl.endsWith(".jpg") ||
        imageUrl.endsWith(".jpeg") ||
        imageUrl.endsWith(".png"))
    )
      return null;
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  // Precompute blocks (logic unchanged, but accounts for added spacing below!)
  const precomputedBlocks = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qPrefix = `${i + 1}. `;
    const qTextContent = q.question;

    // Use updated wrapTextWithIndent
    const qLines = wrapTextWithIndent(
      qTextContent, qPrefix, colWidth - 2 * questionBoxPad - 5, fontSizeQ, doc
    );
    let qFirstLinePrefix = qPrefix;
    let qNoPrefix = "".padEnd(qPrefix.length, " ") + " ";

    let imgData = null,
      imgType = "JPEG",
      imgHeight = 0;
    if (q.image) {
      imgData = await getImageData(q.image);
      imgType = q.image.endsWith("png") ? "PNG" : "JPEG";
      imgHeight = imgData ? imgMaxH : 0;
    }

    const ansLines: string[][] = [];
    const ansPrefixes: string[] = [];
    for (let a = 0; a < q.answers.length; a++) {
      const answerPrefix = `${String.fromCharCode(65 + a)}. `;
      const answerText = q.answers[a];
      // Use wrapTextWithIndent for answers too, for proper word separation
      const rawLines = wrapTextWithIndent(
        answerText,
        answerPrefix,
        colWidth - 10,
        fontSizeA,
        doc
      );
      // Additional: ensure for wrapped answer lines, visual indent of +4px like for questions after the prefix
      for (let li = 1; li < rawLines.length; li++) {
        // Visually, the PDF already adds +4px on wrapped lines later
        // But we ensure a space is prepended after the indent/char prefix
        if (!rawLines[li].startsWith(' ')) {
          rawLines[li] = ' ' + rawLines[li];
        }
      }
      ansLines.push(rawLines);
      ansPrefixes.push(answerPrefix);
    }

    let blockHeight = 0;
    const questionBoxHeight = qLines.length * lineSpacingQ + questionBoxPad * 2;
    blockHeight += questionBoxHeight + 2;

    // Add extra spacing between question and options as requested
    const extraGapBetweenQandOptions = 4.8;
    blockHeight += extraGapBetweenQandOptions;

    let totalAnsHeight = 0;
    for (const al of ansLines)
      totalAnsHeight += al.length * lineSpacingA + answerGapY * 0.5;
    blockHeight += totalAnsHeight;

    if (imgData) {
      blockHeight += imgMarginY + imgHeight + imgMarginY;
    }
    blockHeight += minSpaceAfterAnswers;

    precomputedBlocks.push({
      qLines,
      qPrefix,
      qNoPrefix,
      imgData,
      imgType,
      imgHeight,
      ansLines,
      ansPrefixes,
      blockHeight,
      questionBoxHeight,
      extraGapBetweenQandOptions,
    });
  }

  // the rest is unchanged, except where questions/answers are rendered
  let curQuestionIdx = 0;
  const totalQuestions = questions.length;
  let pageNum = 0;

  while (curQuestionIdx < totalQuestions) {
    if (curQuestionIdx !== 0) {
      doc.addPage();
    }

    // HEADER ONLY ON FIRST PAGE, adjust header Y for new marginY
    if (pageNum === 0) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("All Questions & Answers", marginX, marginY + 4);
      doc.setFontSize(9.2);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Official Questions: 300 National + 10 State-Specific",
        marginX,
        marginY + 10
      );
      doc.text(`State: ${stateName}`, marginX, marginY + 16);
    }

    let col = 0;
    let colYs = [startY, startY];

    for (; curQuestionIdx < totalQuestions; ) {
      const block = precomputedBlocks[curQuestionIdx];
      if (colYs[col] + block.blockHeight > marginY + 273) { // 297 - new marginY*2 ~ 273
        if (col === 0) {
          col = 1;
          continue;
        } else {
          break;
        }
      }

      let x = marginX + (col === 1 ? colWidth + colGap : 0);
      let y = colYs[col];

      // GRAY BOX FOR QUESTION
      doc.setFillColor(questionBoxBgColor);
      doc.setDrawColor("#e5e7eb");
      doc.roundedRect(
        x,
        y,
        colWidth,
        block.questionBoxHeight,
        2.5,
        2.5,
        "F"
      );

      doc.setFontSize(fontSizeQ);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);

      let qTextStartX = x + questionBoxPad + 2;
      let qTextStartY = y + questionBoxPad + lineSpacingQ;

      // Print question lines: first line with prefix, wrapped with char space added by wrapTextWithIndent.
      for (let ql = 0; ql < block.qLines.length; ql++) {
        let prefix = ql === 0 ? block.qPrefix : block.qNoPrefix;
        // For wrapped lines after the first, shift right by +4 px
        let textX = ql === 0 ? qTextStartX : qTextStartX + 4;
        doc.text(
          prefix + block.qLines[ql],
          textX,
          qTextStartY + ql * lineSpacingQ,
          {
            maxWidth: colWidth - 2 * questionBoxPad - 5 - (ql === 0 ? 0 : 4),
          }
        );
      }

      // After question box, leave 2 units plus the extra requested space
      let yA = y + block.questionBoxHeight + 2 + block.extraGapBetweenQandOptions;

      // ANSWER OPTIONS: wrap follows left alignment w/ indent for subsequent lines
      for (let a = 0; a < block.ansLines.length; a++) {
        const answerBlock = block.ansLines[a];
        const answerPrefix = block.ansPrefixes[a];
        doc.setFontSize(fontSizeA);
        doc.setFont(
          "helvetica",
          a === questions[curQuestionIdx].correct ? "bold" : "normal"
        );
        doc.setTextColor(
          a === questions[curQuestionIdx].correct ? 8 : 40,
          a === questions[curQuestionIdx].correct ? 170 : 40,
          a === questions[curQuestionIdx].correct ? 30 : 40
        );
        let ansLineX = x + 6;
        let answerPadPrefix = "".padEnd(answerPrefix.length, " ");

        for (let ab = 0; ab < answerBlock.length; ab++) {
          let prefix = ab === 0 ? answerPrefix : answerPadPrefix;
          // For wrapped answer lines after the first, +4 px visual indent
          let ansTextX = ab === 0 ? ansLineX : ansLineX + 4;
          doc.text(
            prefix + answerBlock[ab],
            ansTextX,
            yA,
            { maxWidth: colWidth - 10 - (ab === 0 ? 0 : 4) }
          );
          yA += lineSpacingA;
        }
        yA += answerGapY * 0.6;
      }

      // IMAGE below options, if present
      let yImg = yA;
      if (block.imgData) {
        doc.addImage(
          block.imgData,
          block.imgType,
          x + 6,
          yImg + imgMarginY,
          colWidth * 0.85,
          block.imgHeight
        );
        yImg = yImg + imgMarginY + block.imgHeight + imgMarginY;
      } else {
        yImg = yA;
      }

      let finalY = yImg + minSpaceAfterAnswers * 0.9;

      doc.setTextColor(0, 0, 0);

      colYs[col] = finalY;
      curQuestionIdx++;
    }
    pageNum++;
  }

  doc.save(fileName);
}
