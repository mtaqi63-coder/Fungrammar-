import { jsPDF } from 'jspdf';
import {
  GRAMMAR_RULES_META,
  VALIDATION_GRAMMAR_SECTIONS,
} from '../data/validationGrammarRules';

export function generateGrammarValidationRulesPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const drawPageDecorations = () => {
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.75);
    doc.line(margin, 10, pageWidth - margin, 10);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Fun Grammar · Sentence Validation Grammar Rules · Referencing British Council LearnEnglish Grammar',
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 7, {
      align: 'right',
    });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 16;
      drawPageDecorations();
    }
  };

  drawPageDecorations();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, contentWidth, 31, 2, 2, 'F');
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, currentY, 4, 31, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FUN GRAMMAR — COMPLETE GRAMMAR VALIDATION RULES', margin + 8, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(147, 197, 253);
  doc.text(
    'Grounded in British Council LearnEnglish Grammar Standards (109-Tile Edition)',
    margin + 8,
    currentY + 17.5
  );

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'Invented by Dr. Mohammed Taqi Alkhonaizi · Bahrain Ministry of Information Reg. 1213 (© 2005)',
    margin + 8,
    currentY + 25
  );

  currentY += 35;

  // Intro Box
  const introLines = doc.splitTextToSize(GRAMMAR_RULES_META.sourceNoteEn, contentWidth - 8);
  const introBoxHeight = Math.max(15, introLines.length * 4 + 8);
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, currentY, contentWidth, introBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text(introLines, margin + 4, currentY + 6);

  currentY += introBoxHeight + 5;

  // Sections
  VALIDATION_GRAMMAR_SECTIONS.forEach((section) => {
    checkPageBreak(28);

    // Section Title Bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, contentWidth, 9, 1.2, 1.2, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, currentY, 3, 9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${section.number}. ${section.titleEn}`, margin + 5.5, currentY + 6);
    currentY += 11;

    // British Council Reference Badge Line
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(3, 105, 161);
    const refLines = doc.splitTextToSize(section.britishCouncilRefEn, contentWidth - 2);
    checkPageBreak(refLines.length * 3.8 + 4);
    doc.text(refLines, margin + 2, currentY + 2.5);
    currentY += refLines.length * 3.8 + 2.5;

    // Summary
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const sumLines = doc.splitTextToSize(section.summaryEn, contentWidth - 4);
    checkPageBreak(sumLines.length * 3.8 + 3);
    doc.text(sumLines, margin + 2, currentY + 2);
    currentY += sumLines.length * 3.8 + 3;

    // Rules Bullets
    section.rulesEn.forEach((rule) => {
      const wrapped = doc.splitTextToSize(`• ${rule}`, contentWidth - 8);
      checkPageBreak(wrapped.length * 3.8 + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(wrapped, margin + 4, currentY + 2);
      currentY += wrapped.length * 3.8 + 1.5;
    });

    // Examples
    currentY += 1;
    section.examples.forEach((ex) => {
      const tag = ex.valid ? '[VALID]  ' : '[INVALID]  ';
      const lineText = `${tag}"${ex.sentence}" — ${ex.noteEn}`;
      const wrapped = doc.splitTextToSize(lineText, contentWidth - 10);
      const boxH = wrapped.length * 3.7 + 4.5;
      checkPageBreak(boxH + 2);

      if (ex.valid) {
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(187, 247, 208);
      } else {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(254, 202, 202);
      }
      doc.setLineWidth(0.25);
      doc.roundedRect(margin + 3, currentY, contentWidth - 6, boxH, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(ex.valid ? 22 : 185, ex.valid ? 101 : 28, ex.valid ? 52 : 28);
      doc.text(wrapped, margin + 6, currentY + 4.2);

      currentY += boxH + 1.8;
    });

    currentY += 4;
  });

  return doc;
}

export function downloadGrammarValidationRulesPdf() {
  const doc = generateGrammarValidationRulesPdf();
  doc.save('Fun-Grammar-Validation-Rules.pdf');
}

export function downloadGrammarValidationRulesTxt(lang: 'en' | 'ar' = 'en') {
  const isAr = lang === 'ar';
  const lines: string[] = [
    isAr ? GRAMMAR_RULES_META.titleAr : GRAMMAR_RULES_META.titleEn,
    isAr ? GRAMMAR_RULES_META.referenceAr : GRAMMAR_RULES_META.referenceEn,
    '',
    isAr ? GRAMMAR_RULES_META.sourceNoteAr : GRAMMAR_RULES_META.sourceNoteEn,
    '====================================================================',
    '',
  ];

  VALIDATION_GRAMMAR_SECTIONS.forEach((section) => {
    lines.push(`${section.number}. ${isAr ? section.titleAr : section.titleEn}`);
    lines.push(
      `   ${isAr ? section.britishCouncilRefAr : section.britishCouncilRefEn}`
    );
    lines.push(`   ${isAr ? section.summaryAr : section.summaryEn}`);
    lines.push('');
    const rules = isAr ? section.rulesAr : section.rulesEn;
    rules.forEach((r) => lines.push(`   - ${r}`));
    lines.push('');
    section.examples.forEach((ex) => {
      const label = ex.valid
        ? isAr
          ? '[صحيحة]'
          : '[VALID]'
        : isAr
        ? '[مرفوضة]'
        : '[INVALID]';
      lines.push(
        `   ${label} "${ex.sentence}" — ${isAr ? ex.noteAr : ex.noteEn}`
      );
    });
    lines.push('');
    lines.push('--------------------------------------------------------------------');
    lines.push('');
  });

  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    lang === 'ar'
      ? 'Fun-Grammar-Validation-Rules-AR.txt'
      : 'Fun-Grammar-Validation-Rules-EN.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
