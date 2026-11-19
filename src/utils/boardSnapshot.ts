import { BoardCell, PlacedTile, Player, TileData } from '../types/game';
import { getBoardCenter, getColumnLabel, getVisibleBoardBounds } from './boardLogic';

export interface CaptureBoardOptions {
  board: BoardCell[][];
  tempPlacements: PlacedTile[];
  players: Player[];
  bankCount: number;
  totalBankTiles: number;
  isAutoExpandMode: boolean;
  language: 'en' | 'ar';
}

function drawRoundedRect(
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

export function getSnapshotBoardBounds(
  board: BoardCell[][],
  tempPlacements: PlacedTile[] = [],
  isAutoExpandMode: boolean = true
): { minRow: number; maxRow: number; minCol: number; maxCol: number } {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  if (numRows === 0 || numCols === 0) {
    return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
  }

  let hasPlacedTiles = tempPlacements.length > 0;
  const center = getBoardCenter(board);
  let minR = numRows;
  let maxR = -1;
  let minC = numCols;
  let maxC = -1;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (board[r][c]?.tile) {
        hasPlacedTiles = true;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  for (const p of tempPlacements) {
    if (p.row < minR) minR = p.row;
    if (p.row > maxR) maxR = p.row;
    if (p.col < minC) minC = p.col;
    if (p.col > maxC) maxC = p.col;
  }

  if (!hasPlacedTiles) {
    return getVisibleBoardBounds(board, tempPlacements, isAutoExpandMode);
  }

  // Always include center star and a clean 1-cell border around all placed tiles
  minR = Math.min(minR, center.row);
  maxR = Math.max(maxR, center.row);
  minC = Math.min(minC, center.col);
  maxC = Math.max(maxC, center.col);

  const margin = isAutoExpandMode ? 1 : 1;
  return {
    minRow: Math.max(0, minR - margin),
    maxRow: Math.min(numRows - 1, maxR + margin),
    minCol: Math.max(0, minC - margin),
    maxCol: Math.min(numCols - 1, maxC + margin),
  };
}

export function measureBoardSnapshotSize(
  board: BoardCell[][],
  tempPlacements: PlacedTile[] = [],
  isAutoExpandMode: boolean = true
): {
  bounds: { minRow: number; maxRow: number; minCol: number; maxCol: number };
  colsCount: number;
  rowsCount: number;
  cellSize: number;
  cellGap: number;
  rowHeaderWidth: number;
  colHeaderHeight: number;
  padX: number;
  headerHeight: number;
  footerHeight: number;
  gridWidth: number;
  gridHeight: number;
  canvasWidth: number;
  canvasHeight: number;
} {
  const bounds = getSnapshotBoardBounds(board, tempPlacements, isAutoExpandMode);
  const colsCount = Math.max(1, bounds.maxCol - bounds.minCol + 1);
  const rowsCount = Math.max(1, bounds.maxRow - bounds.minRow + 1);

  const cellSize = 80;
  const cellGap = 4;
  const rowHeaderWidth = 42;
  const colHeaderHeight = 30;
  const padX = 28;
  const headerHeight = 68;
  const footerHeight = 34;

  const gridWidth = rowHeaderWidth + colsCount * (cellSize + cellGap) - cellGap;
  const gridHeight = colHeaderHeight + rowsCount * (cellSize + cellGap) - cellGap;
  const canvasWidth = Math.max(580, gridWidth + padX * 2);
  const canvasHeight = headerHeight + gridHeight + footerHeight + 20;

  return {
    bounds,
    colsCount,
    rowsCount,
    cellSize,
    cellGap,
    rowHeaderWidth,
    colHeaderHeight,
    padX,
    headerHeight,
    footerHeight,
    gridWidth,
    gridHeight,
    canvasWidth,
    canvasHeight,
  };
}

export function renderBoardSnapshotToContext(
  ctx: CanvasRenderingContext2D,
  {
    board,
    tempPlacements,
    players,
    bankCount,
    totalBankTiles,
    isAutoExpandMode,
    language,
  }: CaptureBoardOptions,
  targetX: number = 0,
  targetY: number = 0,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const isAr = language === 'ar';
  const layout = measureBoardSnapshotSize(board, tempPlacements, isAutoExpandMode);
  const {
    bounds,
    cellSize,
    cellGap,
    rowHeaderWidth,
    colHeaderHeight,
    headerHeight,
    gridWidth,
    canvasWidth,
    canvasHeight,
  } = layout;
  const center = getBoardCenter(board);

  ctx.save();
  ctx.translate(targetX, targetY);
  if (targetWidth && targetHeight) {
    ctx.scale(targetWidth / canvasWidth, targetHeight / canvasHeight);
  }
  ctx.direction = 'ltr';

  // Outer background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Board frame
  drawRoundedRect(ctx, 10, 10, canvasWidth - 20, canvasHeight - 20, 14);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(isAr ? 'Fun Grammar — نسخة اللوحة' : 'Fun Grammar — Board Copy', 28, 32);

  const scoresText = players
    .map((p) => `${isAr ? p.nameAr : p.name}: ${p.score} ${isAr ? 'ن' : 'pts'}`)
    .join('  |  ');
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13.5px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `${scoresText}${scoresText ? '  |  ' : ''}${isAr ? 'البنك' : 'Bank'}: ${bankCount}/${totalBankTiles}`,
    28,
    54
  );

  // Grid origin (centered horizontally if canvasWidth > gridWidth + padX * 2)
  const gridOriginX = Math.round((canvasWidth - gridWidth) / 2);
  const gridOriginY = headerHeight + 10;

  // Column coordinate headers
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
    const cOffset = c - bounds.minCol;
    const cx = gridOriginX + rowHeaderWidth + cOffset * (cellSize + cellGap) + cellSize / 2;
    const cy = gridOriginY + colHeaderHeight / 2;
    ctx.fillText(getColumnLabel(c), cx, cy);
  }

  // Helpers for cell lookup
  const tempMap = new Map<string, TileData>();
  for (const p of tempPlacements) {
    tempMap.set(`${p.row},${p.col}`, p.tile);
  }

  const aiPlayerIds = new Set(players.filter((p) => p.isAi).map((p) => p.id));

  // Rows + Cells
  for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
    const rOffset = r - bounds.minRow;
    const cellY = gridOriginY + colHeaderHeight + rOffset * (cellSize + cellGap);

    // Row number label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(r + 1), gridOriginX + rowHeaderWidth - 9, cellY + cellSize / 2);

    for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
      const cOffset = c - bounds.minCol;
      const cellX = gridOriginX + rowHeaderWidth + cOffset * (cellSize + cellGap);

      const tempTile = tempMap.get(`${r},${c}`) || null;
      const boardCell = board[r]?.[c];
      const tile = tempTile || boardCell?.tile || null;
      const isTemp = Boolean(tempTile);
      const isComputer = Boolean(boardCell?.playerId && aiPlayerIds.has(boardCell.playerId));
      const isCenter = r === center.row && c === center.col;

      drawRoundedRect(ctx, cellX, cellY, cellSize, cellSize, 8);

      if (tile) {
        if (isTemp) {
          ctx.fillStyle = '#d97706';
          ctx.fill();
          ctx.strokeStyle = '#fcd34d';
        } else if (isComputer) {
          ctx.fillStyle = '#653312';
          ctx.fill();
          ctx.strokeStyle = '#8c4c1e';
        } else {
          ctx.fillStyle = '#1d4ed8';
          ctx.fill();
          ctx.strokeStyle = '#3b82f6';
        }
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Word label
        const label = (tile.isWildcard && tile.customName ? tile.customName : tile.displayWord) || tile.word || '';
        let fontSize = 19;
        if (label.length > 8) fontSize = 12.5;
        else if (label.length > 6) fontSize = 14.5;
        else if (label.length > 4) fontSize = 16.5;

        ctx.fillStyle = isComputer ? '#fff7ed' : '#ffffff';
        ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cellX + cellSize / 2, cellY + cellSize / 2 - 2, cellSize - 10);

        // Wildcard tag
        if (tile.isWildcard) {
          ctx.fillStyle = '#fcd34d';
          ctx.font = '700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(tile.word, cellX + 6, cellY + 4);
        }

        // Score badge
        const tileScore = tile.charCount ?? label.replace(/\s+/g, '').length;
        ctx.fillStyle = isComputer ? '#fde68a' : isTemp ? '#fef3c7' : '#bfdbfe';
        ctx.font = '700 11.5px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(tileScore), cellX + cellSize - 6, cellY + cellSize - 4);
      } else {
        ctx.fillStyle = isCenter ? '#1e293b' : '#131d31';
        ctx.fill();
        ctx.strokeStyle = isCenter ? '#3b82f6' : '#1e293b';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        if (isCenter) {
          ctx.fillStyle = '#60a5fa';
          ctx.font = '700 11.5px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★ START', cellX + cellSize / 2, cellY + cellSize / 2);
        }
      }
    }
  }

  // Footer
  const timestamp = new Date().toLocaleString(isAr ? 'ar-BH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(timestamp, canvasWidth - 26, canvasHeight - 21);

  ctx.restore();
  return { width: canvasWidth, height: canvasHeight };
}

export async function copyBoardSnapshot(options: CaptureBoardOptions): Promise<{
  copiedToClipboard: boolean;
  downloaded: boolean;
  canvas: HTMLCanvasElement | null;
  dateStamp: string;
}> {
  const dateStamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const layout = measureBoardSnapshotSize(
    options.board,
    options.tempPlacements,
    options.isAutoExpandMode
  );

  // Dynamically cap backing canvas dimensions to stay safely inside all desktop/mobile GPU limits
  const maxDim = 2800;
  const maxArea = 6_000_000;
  const scale = Math.max(
    0.15,
    Math.min(
      3,
      maxDim / layout.canvasWidth,
      maxDim / layout.canvasHeight,
      Math.sqrt(maxArea / (layout.canvasWidth * layout.canvasHeight))
    )
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(layout.canvasWidth * scale));
  canvas.height = Math.max(1, Math.round(layout.canvasHeight * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { copiedToClipboard: false, downloaded: false, canvas: null, dateStamp };
  }

  ctx.scale(scale, scale);
  renderBoardSnapshotToContext(ctx, options, 0, 0);

  // Attempt copying the board picture directly to the clipboard when supported
  let copiedToClipboard = false;
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.write === 'function' &&
      typeof ClipboardItem !== 'undefined'
    ) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        copiedToClipboard = true;
      }
    }
  } catch {
    copiedToClipboard = false;
  }

  return { copiedToClipboard, downloaded: false, canvas, dateStamp };
}
