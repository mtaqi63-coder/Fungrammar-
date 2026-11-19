import { jsPDF } from 'jspdf';
import { BoardCell, GameMode, PlacedTile, PlayedSentenceRecord, Player } from '../types/game';
import { measureBoardSnapshotSize, renderBoardSnapshotToContext } from './boardSnapshot';

interface HistoryPdfOptions {
  players: Player[];
  bankCount: number;
  totalBankTiles: number;
  gameMode: GameMode;
  language: 'en' | 'ar';
  board?: BoardCell[][];
  tempPlacements?: PlacedTile[];
  isAutoExpandMode?: boolean;
  boardCanvas?: HTMLCanvasElement | null;
  dateStamp?: string;
}

interface EnrichedHistoryRecord extends PlayedSentenceRecord {
  playerName: string;
  playerNameAr: string;
  isAi: boolean;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function downloadSentenceGrammarHistoryPdf({
  players,
  bankCount,
  totalBankTiles,
  gameMode,
  language,
  board,
  tempPlacements = [],
  isAutoExpandMode = true,
  boardCanvas,
  dateStamp,
}: HistoryPdfOptions): Promise<boolean> {
  try {
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 150)),
        ]);
      }
    } catch {
      // Continue with fallback fonts
    }

    const isAr = language === 'ar';
    const W = 1240;
    const H = 1754;
    const pdfPixelScale = 1.6; // ~240 DPI ultra-sharp A4 canvas output
    const M = 68;
    const contentW = W - M * 2;
    const footerReserved = 92;

    const fontEn = "'Plus Jakarta Sans', 'DejaVu Sans', sans-serif";
    const fontAr = "'Cairo', 'DejaVu Sans', sans-serif";
    const primaryFont = isAr ? fontAr : fontEn;

    const pages: HTMLCanvasElement[] = [];

    const createPage = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(W * pdfPixelScale);
      canvas.height = Math.round(H * pdfPixelScale);
      const ctx = canvas.getContext('2d')!;
      ctx.scale(pdfPixelScale, pdfPixelScale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clean warm off-white page surface
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W, H);

      // Top navy accent strip
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, W, 14);

      pages.push(canvas);
      return { canvas, ctx, y: 52 };
    };

    let { ctx, y } = createPage();

    const ensureSpace = (needed: number) => {
      if (y + needed > H - footerReserved) {
        const next = createPage();
        ctx = next.ctx;
        y = next.y;
      }
    };

    // Flatten and chronologically sort all played & disputed sentences
    const allRecords: EnrichedHistoryRecord[] = [];
    for (const p of players) {
      for (const s of p.sentencesFormed) {
        allRecords.push({
          ...s,
          playerName: p.name,
          playerNameAr: p.nameAr,
          isAi: p.isAi,
        });
      }
    }
    allRecords.sort((a, b) => (a.playOrder ?? a.turn) - (b.playOrder ?? b.turn));

    const acceptedCount = allRecords.filter((r) => r.disputeType !== 'rejected_player_move').length;
    const disputedCount = allRecords.filter((r) => r.isDisputed).length;

    // --- HEADER BANNER ---
    const bannerH = 166;
    roundedRectPath(ctx, M, y, contentW, bannerH, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#3b82f6';
    roundedRectPath(ctx, M, y, 8, bannerH, 4);
    ctx.fill();

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.textBaseline = 'alphabetic';
    const bannerTextX = isAr ? W - M - 28 : M + 32;

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 32px ${primaryFont}`;
    ctx.fillText(
      isAr
        ? 'القواعد المرحة — نسخة اللوحة وسجل القواعد النحوية'
        : 'Fun Grammar — Board Copy & Sentence History',
      bannerTextX,
      y + 52
    );

    ctx.fillStyle = '#93c5fd';
    ctx.font = `600 20px ${primaryFont}`;
    ctx.fillText(
      isAr
        ? 'صورة اللوحة وتوثيق كل جملة ملعوبة وما يقابلها من القواعد النحوية والاعتراضات'
        : 'Board picture and chronological matching of played sentences, grammar rules & disputes',
      bannerTextX,
      y + 92
    );

    const modeLabel =
      gameMode === 'vs_ai'
        ? isAr
          ? 'ضد الكمبيوتر'
          : 'vs Computer'
        : gameMode === 'pass_and_play'
        ? isAr
          ? 'لاعبان'
          : '2 Players'
        : isAr
        ? 'فردي'
        : 'Solo';
    const nowText = new Date().toLocaleString(isAr ? 'ar-BH' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 17px ${primaryFont}`;
    ctx.fillText(
      isAr
        ? `${nowText}  ·  ${modeLabel}  ·  المقبولة: ${acceptedCount}  ·  المعترض عليها: ${disputedCount}  ·  البنك: ${bankCount}/${totalBankTiles}`
        : `${nowText}  ·  ${modeLabel}  ·  Accepted: ${acceptedCount}  ·  Disputed: ${disputedCount}  ·  Bank: ${bankCount}/${totalBankTiles}`,
      bannerTextX,
      y + 134
    );

    y += bannerH + 22;

    // --- PLAYER SCORE SUMMARY ROW ---
    if (players.length > 0) {
      const gap = 16;
      const cardW = (contentW - gap * (players.length - 1)) / players.length;
      const cardH = 82;

      players.forEach((p, idx) => {
        const cx = M + idx * (cardW + gap);
        const pAccepted = p.sentencesFormed.filter((s) => s.disputeType !== 'rejected_player_move').length;
        const pDisputed = p.sentencesFormed.filter((s) => s.isDisputed).length;

        roundedRectPath(ctx, cx, y, cardW, cardH, 12);
        ctx.fillStyle = p.isAi ? '#fffbeb' : '#eff6ff';
        ctx.fill();
        ctx.strokeStyle = p.isAi ? '#d97706' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.direction = isAr ? 'rtl' : 'ltr';
        ctx.textAlign = isAr ? 'right' : 'left';
        const px = isAr ? cx + cardW - 18 : cx + 18;

        ctx.fillStyle = p.isAi ? '#78350f' : '#1e3a8a';
        ctx.font = `800 21px ${primaryFont}`;
        ctx.fillText(
          `${isAr ? p.nameAr : p.name} (${p.isAi ? (isAr ? 'بني' : 'Brown') : isAr ? 'أزرق' : 'Blue'})`,
          px,
          y + 34
        );

        ctx.fillStyle = '#334155';
        ctx.font = `700 17px ${primaryFont}`;
        const disputedSuffix =
          pDisputed > 0
            ? isAr
              ? `  ·  اعتراضات: ${pDisputed}`
              : `  ·  Disputed: ${pDisputed}`
            : '';
        ctx.fillText(
          isAr
            ? `النقاط: ${p.score} نقطة  ·  الجمل: ${pAccepted}${disputedSuffix}`
            : `Score: ${p.score} pts  ·  Sentences: ${pAccepted}${disputedSuffix}`,
          px,
          y + 64
        );
      });

      y += cardH + 24;
    }

    // --- EMBEDDED BOARD PICTURE INSIDE THE SENTENCE HISTORY PDF ---
    const hasBoardGrid = Boolean(board && board.length > 0 && (board[0]?.length ?? 0) > 0);
    const hasFallbackCanvas = Boolean(boardCanvas && boardCanvas.width > 0 && boardCanvas.height > 0);

    if (hasBoardGrid || hasFallbackCanvas) {
      const maxImgW = contentW;
      const maxImgH = 1120;
      const naturalSize = hasBoardGrid
        ? measureBoardSnapshotSize(board!, tempPlacements, isAutoExpandMode)
        : null;
      const imgAspect = naturalSize
        ? naturalSize.canvasWidth / naturalSize.canvasHeight
        : boardCanvas!.width / boardCanvas!.height;

      let drawW = maxImgW;
      let drawH = drawW / imgAspect;
      if (drawH > maxImgH) {
        drawH = maxImgH;
        drawW = drawH * imgAspect;
      }

      const boardSectionH = 54 + drawH + 26;
      ensureSpace(boardSectionH);

      roundedRectPath(ctx, M, y, contentW, 44, 10);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.fillStyle = '#0891b2';
      roundedRectPath(ctx, isAr ? W - M - 8 : M, y, 8, 44, 4);
      ctx.fill();

      ctx.direction = isAr ? 'rtl' : 'ltr';
      ctx.textAlign = isAr ? 'right' : 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = `800 22px ${primaryFont}`;
      ctx.fillText(
        isAr ? 'صورة اللوحة الحالية' : 'BOARD PICTURE',
        isAr ? W - M - 22 : M + 22,
        y + 29
      );
      y += 54;

      const imgX = M + (contentW - drawW) / 2;
      roundedRectPath(ctx, imgX - 6, y - 6, drawW + 12, drawH + 12, 14);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      if (hasBoardGrid) {
        renderBoardSnapshotToContext(
          ctx,
          {
            board: board!,
            tempPlacements,
            players,
            bankCount,
            totalBankTiles,
            isAutoExpandMode,
            language,
          },
          imgX,
          y,
          drawW,
          drawH
        );
      } else if (boardCanvas) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(boardCanvas, imgX, y, drawW, drawH);
      }
      y += drawH + 26;
    }

    // --- SECTION HEADING: SENTENCE-TO-RULE MATCHING HISTORY ---
    ensureSpace(84);
    roundedRectPath(ctx, M, y, contentW, 44, 10);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.fillStyle = '#1d4ed8';
    roundedRectPath(ctx, isAr ? W - M - 8 : M, y, 8, 44, 4);
    ctx.fill();

    ctx.direction = isAr ? 'rtl' : 'ltr';
    ctx.textAlign = isAr ? 'right' : 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = `800 22px ${primaryFont}`;
    ctx.fillText(
      isAr
        ? 'سجل التطابق: الجمل الملعوبة ↔ القواعد النحوية والاعتراضات'
        : 'MATCHING HISTORY: PLAYED SENTENCES  ↔  GRAMMATICAL RULES',
      isAr ? W - M - 22 : M + 22,
      y + 29
    );
    y += 58;

    // --- HISTORY CARDS OR EMPTY STATE ---
    if (allRecords.length === 0) {
      ensureSpace(120);
      roundedRectPath(ctx, M, y, contentW, 106, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.direction = isAr ? 'rtl' : 'ltr';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      ctx.font = `700 21px ${primaryFont}`;
      ctx.fillText(
        isAr
          ? 'لم يتم لعب أي جمل على اللوحة حتى الآن.'
          : 'No sentences have been played on the board yet.',
        W / 2,
        y + 44
      );
      ctx.fillStyle = '#64748b';
      ctx.font = `500 18px ${primaryFont}`;
      ctx.fillText(
        isAr
          ? 'كوّن جملاً على اللوحة لتظهر هنا مطابقتها مع القواعد النحوية المعتمدة.'
          : 'Form valid sentences on the board to record every sentence-to-grammar-rule match here.',
        W / 2,
        y + 78
      );
      y += 126;
    } else {
      allRecords.forEach((rec, index) => {
        const playNum = index + 1;
        const isDisputed = Boolean(rec.isDisputed);
        const isRejectedMove = rec.disputeType === 'rejected_player_move';

        const ruleNameText =
          rec.ruleName ||
          (isAr
            ? 'بنية نحوية مكتملة (فاعل + فعل + مكمل)'
            : 'Subject-Verb-Complement Construction');

        let explanationText =
          rec.ruleExplanation ||
          (isAr
            ? `تطابق نحوي صحيح وفق قواعد اللغة الإنجليزية (${rec.score} نقطة).`
            : `Rule 4 & 11: Grammatically valid English structure worth ${rec.score} character points.`);

        if (isDisputed && isRejectedMove) {
          explanationText = rec.disputeReason
            ? `Rejected by Computer: ${rec.disputeReason} — Marked as DISPUTED by player for later review.`
            : `Statement formed by player was rejected by Computer and marked DISPUTED for later review.`;
        } else if (isDisputed) {
          explanationText = `[DISPUTED BY PLAYER FOR LATER REVIEW] ${explanationText}`;
        }

        // Measure wrapped text lines cleanly
        ctx.font = `700 23px ${fontEn}`;
        const sentenceLines = wrapText(ctx, `"${rec.text}"`, contentW - 76);

        ctx.font = `700 19px ${primaryFont}`;
        const ruleNameLines = wrapText(
          ctx,
          isRejectedMove
            ? isAr
              ? `الحالة: ${ruleNameText}`
              : `Status: ${ruleNameText}`
            : isAr
            ? `القاعدة المطابقة: ${ruleNameText}`
            : `Matched Rule: ${ruleNameText}`,
          contentW - 60
        );

        ctx.font = `500 17px ${fontEn}`;
        const explanationLines = wrapText(ctx, explanationText, contentW - 60);

        const sentenceBoxH = sentenceLines.length * 30 + 22;
        const cardH =
          56 +
          sentenceBoxH +
          14 +
          ruleNameLines.length * 26 +
          8 +
          explanationLines.length * 24 +
          20;

        ensureSpace(cardH + 16);

        // Card container
        roundedRectPath(ctx, M, y, contentW, cardH, 14);
        ctx.fillStyle = isDisputed ? '#fff1f2' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = isDisputed ? '#dc2626' : rec.isAi ? '#d97706' : '#3b82f6';
        ctx.lineWidth = isDisputed ? 2.5 : 2;
        ctx.stroke();

        // Colored accent stripe
        ctx.fillStyle = isDisputed ? '#dc2626' : rec.isAi ? '#92400e' : '#1d4ed8';
        roundedRectPath(ctx, M, y, 8, cardH, 4);
        ctx.fill();

        // Top metadata row
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        const dirText =
          rec.direction === 'vertical'
            ? isAr
              ? 'رأسي (V)'
              : 'Vertical (V)'
            : isAr
            ? 'أفقي (H)'
            : 'Horizontal (H)';
        const playerLabel = isAr ? rec.playerNameAr : rec.playerName;

        // #Play badge
        roundedRectPath(ctx, M + 22, y + 14, 54, 28, 8);
        ctx.fillStyle = isDisputed ? '#fee2e2' : rec.isAi ? '#fef3c7' : '#dbeafe';
        ctx.fill();
        ctx.fillStyle = isDisputed ? '#991b1b' : rec.isAi ? '#78350f' : '#1e3a8a';
        ctx.font = `800 16px ${fontEn}`;
        ctx.textAlign = 'center';
        ctx.fillText(`#${playNum}`, M + 49, y + 34);

        // Player + Turn + Direction
        ctx.direction = isAr ? 'rtl' : 'ltr';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1e293b';
        ctx.font = `700 18px ${primaryFont}`;
        ctx.fillText(
          `${playerLabel}   ·   ${isAr ? `الدور ${rec.turn}` : `Turn ${rec.turn}`}   ·   ${dirText}`,
          M + 88,
          y + 34
        );

        // Score pill on right
        const scoreLabel = isRejectedMove
          ? isAr
            ? 'مرفوضة · 0 ن'
            : 'Rejected · 0 pts'
          : `+${rec.score} ${isAr ? 'نقاط' : 'pts'}`;
        ctx.font = `800 16px ${primaryFont}`;
        const scorePillW = Math.max(92, ctx.measureText(scoreLabel).width + 24);
        const scorePillX = W - M - scorePillW - 18;
        roundedRectPath(ctx, scorePillX, y + 14, scorePillW, 28, 10);
        ctx.fillStyle = isRejectedMove ? '#fee2e2' : '#dcfce7';
        ctx.fill();
        ctx.strokeStyle = isRejectedMove ? '#dc2626' : '#16a34a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isRejectedMove ? '#991b1b' : '#166534';
        ctx.textAlign = 'center';
        ctx.fillText(scoreLabel, scorePillX + scorePillW / 2, y + 34);

        // Prominent Red DISPUTED badge to the left of score pill
        if (isDisputed) {
          const dispLabel = isAr ? 'محل اعتراض للمراجعة' : 'DISPUTED · FOR REVIEW';
          ctx.font = `800 14px ${primaryFont}`;
          const dispW = Math.max(150, ctx.measureText(dispLabel).width + 22);
          const dispX = scorePillX - dispW - 10;
          roundedRectPath(ctx, dispX, y + 14, dispW, 28, 10);
          ctx.fillStyle = '#dc2626';
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(dispLabel, dispX + dispW / 2, y + 33);
        }

        // Sentence box (LTR English sentence)
        const sBoxY = y + 54;
        roundedRectPath(ctx, M + 22, sBoxY, contentW - 44, sentenceBoxH, 10);
        ctx.fillStyle = isDisputed ? '#450a0a' : '#0f172a';
        ctx.fill();

        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 23px ${fontEn}`;
        let sy = sBoxY + 32;
        for (const sLine of sentenceLines) {
          ctx.fillText(sLine, M + 38, sy);
          sy += 30;
        }

        // Matched Rule / Dispute heading
        let ry = sBoxY + sentenceBoxH + 30;
        ctx.direction = isAr ? 'rtl' : 'ltr';
        ctx.textAlign = isAr ? 'right' : 'left';
        ctx.fillStyle = isDisputed ? '#b91c1c' : '#b45309';
        ctx.font = `800 19px ${primaryFont}`;
        const ruleX = isAr ? W - M - 26 : M + 26;
        for (const rLine of ruleNameLines) {
          ctx.fillText(rLine, ruleX, ry);
          ry += 26;
        }

        // Rule / Dispute Explanation
        ry += 4;
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.fillStyle = isDisputed ? '#7f1d1d' : '#334155';
        ctx.font = `500 17px ${fontEn}`;
        for (const eLine of explanationLines) {
          ctx.fillText(eLine, M + 26, ry);
          ry += 24;
        }

        y += cardH + 16;
      });
    }

    // --- APPLY PAGE FOOTERS WITH TOTAL PAGE COUNT ---
    const totalPages = pages.length;
    pages.forEach((pageCanvas, idx) => {
      const pCtx = pageCanvas.getContext('2d')!;
      pCtx.strokeStyle = '#cbd5e1';
      pCtx.lineWidth = 2;
      pCtx.beginPath();
      pCtx.moveTo(M, H - 68);
      pCtx.lineTo(W - M, H - 68);
      pCtx.stroke();

      pCtx.direction = isAr ? 'rtl' : 'ltr';
      pCtx.fillStyle = '#64748b';
      pCtx.font = `600 17px ${primaryFont}`;
      pCtx.textAlign = isAr ? 'right' : 'left';
      pCtx.fillText(
        isAr
          ? 'القواعد المرحة (Fun Grammar) · د. محمد تقي الخنيزي · مملكة البحرين © 2005'
          : 'Fun Grammar · By Dr. Mohammed Taqi Alkhonaizi · Bahrain © 2005',
        isAr ? W - M : M,
        H - 36
      );

      pCtx.textAlign = isAr ? 'left' : 'right';
      pCtx.fillText(
        isAr ? `صفحة ${idx + 1} من ${totalPages}` : `Page ${idx + 1} of ${totalPages}`,
        isAr ? M : W - M,
        H - 36
      );
    });

    // Build and save A4 PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pdfW = doc.internal.pageSize.getWidth();
    const pdfH = doc.internal.pageSize.getHeight();

    pages.forEach((canvas, idx) => {
      if (idx > 0) doc.addPage();
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');
    });

    const stamp = dateStamp || new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    doc.save(`fun-grammar-history-${stamp}.pdf`);
    return true;
  } catch {
    return false;
  }
}
