import { jsPDF } from 'jspdf';
import {
  GAME_STORY_META,
  STORY_CHAPTERS,
  GUIDE_SECTIONS,
} from '../data/gameStoryAndGuide';

/**
 * Wraps text on an HTML5 Canvas 2D context for both RTL (Arabic) and LTR (English)
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates and downloads a crisp multi-page A4 PDF containing the Game Story & Complete Explanation
 * in the selected language (supports full Arabic RTL typography via Canvas rendering -> jsPDF).
 */
export async function downloadStoryAndGuidePdf(language: 'en' | 'ar'): Promise<void> {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Proceed even if font ready check throws
  }

  const isAr = language === 'ar';
  const W = 1240; // A4 width at ~150 DPI
  const H = 1754; // A4 height at ~150 DPI
  const M = 76;   // Margin
  const contentW = W - M * 2;

  const fontFamily = isAr
    ? "'Cairo', 'DejaVu Sans', sans-serif"
    : "'Plus Jakarta Sans', 'DejaVu Sans', sans-serif";

  const pages: HTMLCanvasElement[] = [];

  const createNewPage = (pageNum: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; y: number } => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Clean warm white paper background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Subtle top accent bar
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, W, 14);

    // Footer separator & text
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(M, H - 70);
    ctx.lineTo(W - M, H - 70);
    ctx.stroke();

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.fillStyle = '#64748b';
    ctx.font = `600 18px ${fontFamily}`;
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.fillText(
      isAr
        ? 'القواعد المرحة (Fun Grammar) · د. محمد تقي الخنيزي · مملكة البحرين © 2005'
        : 'Fun Grammar · By Dr. Mohammed Taqi Alkhonaizi · Bahrain © 2005',
      isAr ? W - M : M,
      H - 36
    );

    ctx.textAlign = isAr ? 'left' : 'right';
    ctx.fillText(
      isAr ? `صفحة ${pageNum}` : `Page ${pageNum}`,
      isAr ? M : W - M,
      H - 36
    );

    pages.push(canvas);
    return { canvas, ctx, y: 64 };
  };

  let { ctx, y } = createNewPage(1);

  const ensureSpace = (needed: number) => {
    if (y + needed > H - 100) {
      const next = createNewPage(pages.length + 1);
      ctx = next.ctx;
      y = next.y;
    }
  };

  // --- HERO BANNER ON PAGE 1 ---
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(M, y, contentW, 185, 18);
  ctx.fill();

  // Blue vertical accent strip
  ctx.fillStyle = '#2563eb';
  if (isAr) {
    ctx.fillRect(W - M - 16, y, 16, 185);
  } else {
    ctx.fillRect(M, y, 16, 185);
  }

  ctx.direction = isAr ? 'rtl' : 'ltr';
  ctx.textAlign = isAr ? 'right' : 'left';
  const headerTextX = isAr ? W - M - 40 : M + 40;

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 42px ${fontFamily}`;
  ctx.fillText(
    isAr ? 'قصة لعبة القواعد المرحة (Fun Grammar) وشرحها' : 'FUN GRAMMAR — STORY & COMPLETE GUIDE',
    headerTextX,
    y + 62
  );

  ctx.fillStyle = '#93c5fd';
  ctx.font = `600 24px ${fontFamily}`;
  ctx.fillText(
    isAr ? GAME_STORY_META.subtitleAr : GAME_STORY_META.subtitleEn,
    headerTextX,
    y + 108
  );

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `500 19px ${fontFamily}`;
  ctx.fillText(
    isAr
      ? `${GAME_STORY_META.authorAr} · ${GAME_STORY_META.registrationAr}`
      : `${GAME_STORY_META.authorEn} · ${GAME_STORY_META.registrationEn}`,
    headerTextX,
    y + 150
  );

  y += 225;

  // --- SECTION 1 HEADER: STORY ---
  const drawSectionHeading = (title: string, color: string) => {
    ensureSpace(80);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(M, y, contentW, 52, 10);
    ctx.fill();

    ctx.fillStyle = color;
    if (isAr) {
      ctx.fillRect(W - M - 10, y, 10, 52);
    } else {
      ctx.fillRect(M, y, 10, 52);
    }

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = `800 26px ${fontFamily}`;
    ctx.fillText(title, isAr ? W - M - 26 : M + 26, y + 35);

    y += 74;
  };

  drawSectionHeading(
    isAr ? 'أولاً: قصة اللعبة ونشأتها' : 'PART 1: THE STORY & ORIGIN OF FUN GRAMMAR',
    '#d97706'
  );

  // Render story chapters
  for (const ch of STORY_CHAPTERS) {
    ctx.font = `500 21px ${fontFamily}`;
    const bodyText = isAr ? ch.bodyAr : ch.bodyEn;
    const wrappedLines = wrapCanvasText(ctx, bodyText, contentW - 56);
    const cardHeight = 68 + wrappedLines.length * 34 + 24;

    ensureSpace(cardHeight + 18);

    // Card background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(M, y, contentW, cardHeight, 14);
    ctx.fill();
    ctx.stroke();

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.textAlign = isAr ? 'right' : 'left';
    const textX = isAr ? W - M - 28 : M + 28;

    ctx.fillStyle = '#1e40af';
    ctx.font = `800 23px ${fontFamily}`;
    ctx.fillText(isAr ? ch.titleAr : ch.titleEn, textX, y + 40);

    ctx.fillStyle = '#334155';
    ctx.font = `500 21px ${fontFamily}`;
    let lineY = y + 78;
    for (const line of wrappedLines) {
      ctx.fillText(line, textX, lineY);
      lineY += 34;
    }

    y += cardHeight + 20;
  }

  y += 16;

  // --- SECTION 2 HEADER: GAME EXPLANATION ---
  drawSectionHeading(
    isAr ? 'ثانياً: الشرح الكامل لطريقة اللعب والقواعد' : 'PART 2: COMPLETE HOW-TO-PLAY EXPLANATION',
    '#059669'
  );

  for (const sec of GUIDE_SECTIONS) {
    const pts = isAr ? sec.pointsAr : sec.pointsEn;
    const example = isAr ? sec.exampleAr : sec.exampleEn;

    ctx.font = `500 20px ${fontFamily}`;
    const wrappedPoints = pts.map((p) => wrapCanvasText(ctx, `• ${p}`, contentW - 60));
    const totalPointLines = wrappedPoints.reduce((acc, lines) => acc + lines.length, 0);
    const exampleLines = example ? wrapCanvasText(ctx, example, contentW - 72) : [];

    const cardHeight =
      62 +
      totalPointLines * 32 +
      pts.length * 8 +
      (exampleLines.length > 0 ? exampleLines.length * 30 + 30 : 0) +
      16;

    ensureSpace(cardHeight + 18);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(M, y, contentW, cardHeight, 14);
    ctx.fill();
    ctx.stroke();

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.textAlign = isAr ? 'right' : 'left';
    const textX = isAr ? W - M - 28 : M + 28;

    ctx.fillStyle = '#065f46';
    ctx.font = `800 23px ${fontFamily}`;
    ctx.fillText(isAr ? sec.titleAr : sec.titleEn, textX, y + 38);

    ctx.fillStyle = '#1e293b';
    ctx.font = `500 20px ${fontFamily}`;
    let lineY = y + 74;
    for (const pLines of wrappedPoints) {
      for (const l of pLines) {
        ctx.fillText(l, textX, lineY);
        lineY += 32;
      }
      lineY += 8;
    }

    if (exampleLines.length > 0) {
      ctx.fillStyle = '#eff6ff';
      ctx.beginPath();
      ctx.roundRect(M + 24, lineY - 12, contentW - 48, exampleLines.length * 30 + 20, 8);
      ctx.fill();

      ctx.fillStyle = '#1d4ed8';
      ctx.font = `700 19px ${fontFamily}`;
      let exY = lineY + 14;
      for (const exLine of exampleLines) {
        ctx.fillText(exLine, isAr ? W - M - 38 : M + 38, exY);
        exY += 30;
      }
    }

    y += cardHeight + 18;
  }

  // Convert pages to jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const pdfW = doc.internal.pageSize.getWidth();
  const pdfH = doc.internal.pageSize.getHeight();

  pages.forEach((canvas, idx) => {
    if (idx > 0) doc.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.94);
    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
  });

  doc.save(isAr ? 'Fun-Grammar-Story-and-Guide-AR.pdf' : 'Fun-Grammar-Story-and-Guide-EN.pdf');
}

/**
 * Generates and downloads a standalone styled HTML booklet (bilingual Arabic + English)
 */
export function downloadStoryAndGuideHtml() {
  const html = `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fun Grammar - قصة اللعبة وشرحها</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; font-family: 'Cairo', 'Plus Jakarta Sans', sans-serif; line-height: 1.75; }
    .container { max-width: 920px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
    .hero { background: linear-gradient(135deg, #1e3a8a, #0f172a); padding: 36px 32px; border-bottom: 3px solid #3b82f6; text-align: center; }
    .hero h1 { margin: 0; font-size: 2rem; color: #fff; }
    .hero p { margin: 8px 0 0; color: #93c5fd; font-size: 1rem; }
    .meta { margin-top: 10px; font-size: 0.85rem; color: #cbd5e1; }
    .content { padding: 32px; }
    h2 { color: #fbbf24; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-top: 28px; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 18px; }
    .card h3 { margin: 0 0 8px; color: #60a5fa; font-size: 1.15rem; }
    .en { direction: ltr; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; color: #cbd5e1; border-top: 1px dashed #334155; margin-top: 12px; padding-top: 12px; font-size: 0.95rem; }
    .ar { direction: rtl; text-align: right; font-size: 1rem; }
    ul { padding-inline-start: 22px; margin: 8px 0; }
    li { margin-bottom: 6px; }
    .example { background: rgba(37, 99, 235, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 10px 14px; border-radius: 10px; color: #93c5fd; margin-top: 10px; font-weight: 600; }
    .footer { text-align: center; padding: 18px; font-size: 0.85rem; color: #94a3b8; border-top: 1px solid #334155; background: #0f172a; }
    @media print { body { background: #fff; color: #000; } .container { box-shadow: none; border-color: #ccc; } .card, .hero, .footer { background: #fff; color: #000; border-color: #ccc; } .hero h1, h2, .card h3 { color: #1e3a8a; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>Fun Grammar · القواعد المرحة</h1>
      <p>${GAME_STORY_META.subtitleAr} | ${GAME_STORY_META.subtitleEn}</p>
      <div class="meta">${GAME_STORY_META.authorAr} · ${GAME_STORY_META.registrationAr}</div>
    </div>
    <div class="content">
      <h2 class="ar">أولاً: قصة اللعبة ونشأتها · Part 1: Game Story & Origin</h2>
      ${STORY_CHAPTERS.map(
        (ch) => `
      <div class="card">
        <div class="ar">
          <h3>${ch.titleAr}</h3>
          <p>${ch.bodyAr}</p>
        </div>
        <div class="en">
          <strong>${ch.titleEn}</strong>
          <p>${ch.bodyEn}</p>
        </div>
      </div>`
      ).join('')}

      <h2 class="ar">ثانياً: الشرح الكامل لطريقة اللعب · Part 2: Complete How-to-Play Guide</h2>
      ${GUIDE_SECTIONS.map(
        (sec) => `
      <div class="card">
        <div class="ar">
          <h3>${sec.titleAr}</h3>
          <ul>${sec.pointsAr.map((p) => `<li>${p}</li>`).join('')}</ul>
          ${sec.exampleAr ? `<div class="example">${sec.exampleAr}</div>` : ''}
        </div>
        <div class="en">
          <strong>${sec.titleEn}</strong>
          <ul>${sec.pointsEn.map((p) => `<li>${p}</li>`).join('')}</ul>
          ${sec.exampleEn ? `<div class="example">${sec.exampleEn}</div>` : ''}
        </div>
      </div>`
      ).join('')}
    </div>
    <div class="footer">
      ${GAME_STORY_META.authorEn} · ${GAME_STORY_META.registrationEn}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Fun-Grammar-Story-and-Guide.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a plain text (TXT) file with the Game Story & Explanation
 */
export function downloadStoryAndGuideTxt(language: 'en' | 'ar') {
  const isAr = language === 'ar';
  const lines: string[] = [];

  lines.push('============================================================');
  lines.push(isAr ? 'قصة لعبة القواعد المرحة (Fun Grammar) وشرحها الكامل' : 'FUN GRAMMAR — GAME STORY & COMPLETE EXPLANATION');
  lines.push(isAr ? GAME_STORY_META.authorAr : GAME_STORY_META.authorEn);
  lines.push(isAr ? GAME_STORY_META.registrationAr : GAME_STORY_META.registrationEn);
  lines.push('============================================================\n');

  lines.push(isAr ? '--- أولاً: قصة اللعبة ونشأتها ---\n' : '--- PART 1: GAME STORY & ORIGIN ---\n');
  STORY_CHAPTERS.forEach((ch) => {
    lines.push(isAr ? ch.titleAr : ch.titleEn);
    lines.push(isAr ? ch.bodyAr : ch.bodyEn);
    lines.push('');
  });

  lines.push(isAr ? '--- ثانياً: شرح طريقة اللعب والقواعد ---\n' : '--- PART 2: COMPLETE HOW-TO-PLAY EXPLANATION ---\n');
  GUIDE_SECTIONS.forEach((sec) => {
    lines.push(isAr ? sec.titleAr : sec.titleEn);
    (isAr ? sec.pointsAr : sec.pointsEn).forEach((p) => lines.push(`  • ${p}`));
    const ex = isAr ? sec.exampleAr : sec.exampleEn;
    if (ex) lines.push(`  [${ex}]`);
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = isAr ? 'Fun-Grammar-Story-AR.txt' : 'Fun-Grammar-Story-EN.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
