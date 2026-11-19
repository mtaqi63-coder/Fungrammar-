import { BoardCell, MoveValidation, PlacedTile, SentenceEvaluation, TileData } from '../types/game';
import { validateFullSequence } from './grammarValidator';

export const BOARD_SIZE = 20;
export const CENTER_ROW = 9;
export const CENTER_COL = 9;
export const EDGE_MARGIN_TILES = 3;

export function createEmptyBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: BoardCell[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push({
        row: r,
        col: c,
        tile: null,
        isCenter: r === CENTER_ROW && c === CENTER_COL,
      });
    }
    board.push(row);
  }
  return board;
}

export function getBoardCenter(board: BoardCell[][]): { row: number; col: number } {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < (board[r]?.length ?? 0); c++) {
      if (board[r][c].isCenter) return { row: r, col: c };
    }
  }
  return {
    row: Math.min(CENTER_ROW, Math.max(0, board.length - 1)),
    col: Math.min(CENTER_COL, Math.max(0, (board[0]?.length ?? BOARD_SIZE) - 1)),
  };
}

export function getColumnLabel(colIndex: number): string {
  let label = '';
  let n = colIndex;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

export function getVisibleBoardBounds(
  board: BoardCell[][],
  tempPlacements: PlacedTile[] = [],
  isAutoExpandMode: boolean = true
): { minRow: number; maxRow: number; minCol: number; maxCol: number } {
  const numRows = board.length;
  const numCols = board[0]?.length ?? BOARD_SIZE;

  if (!isAutoExpandMode || numRows === 0 || numCols === 0) {
    return {
      minRow: 0,
      maxRow: Math.max(0, numRows - 1),
      minCol: 0,
      maxCol: Math.max(0, numCols - 1),
    };
  }

  const center = getBoardCenter(board);
  const occupiedRows: number[] = [center.row];
  const occupiedCols: number[] = [center.col];

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (board[r][c].tile) {
        occupiedRows.push(r);
        occupiedCols.push(c);
      }
    }
  }

  for (const p of tempPlacements) {
    occupiedRows.push(p.row);
    occupiedCols.push(p.col);
  }

  const minR = Math.min(...occupiedRows);
  const maxR = Math.max(...occupiedRows);
  const minC = Math.min(...occupiedCols);
  const maxC = Math.max(...occupiedCols);

  return {
    minRow: Math.max(0, minR - EDGE_MARGIN_TILES),
    maxRow: Math.min(numRows - 1, maxR + EDGE_MARGIN_TILES),
    minCol: Math.max(0, minC - EDGE_MARGIN_TILES),
    maxCol: Math.min(numCols - 1, maxC + EDGE_MARGIN_TILES),
  };
}

/**
 * Always expands the backing grid so there are at least `margin` empty cells
 * on top, bottom, left, and right around every placed/pending tile and center star.
 */
export function ensureBoardMargin(
  board: BoardCell[][],
  tempPlacements: PlacedTile[] = [],
  margin: number = EDGE_MARGIN_TILES
): { board: BoardCell[][]; tempPlacements: PlacedTile[]; shifted: boolean; padTop: number; padLeft: number } {
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  if (numRows === 0 || numCols === 0) {
    return { board, tempPlacements, shifted: false, padTop: 0, padLeft: 0 };
  }

  const center = getBoardCenter(board);
  let minR = center.row;
  let maxR = center.row;
  let minC = center.col;
  let maxC = center.col;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (board[r][c].tile) {
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

  const padTop = Math.max(0, margin - minR);
  const padBottom = Math.max(0, maxR + margin - (numRows - 1));
  const padLeft = Math.max(0, margin - minC);
  const padRight = Math.max(0, maxC + margin - (numCols - 1));

  if (padTop === 0 && padBottom === 0 && padLeft === 0 && padRight === 0) {
    return { board, tempPlacements, shifted: false, padTop: 0, padLeft: 0 };
  }

  const newRows = numRows + padTop + padBottom;
  const newCols = numCols + padLeft + padRight;
  const newBoard: BoardCell[][] = [];

  for (let r = 0; r < newRows; r++) {
    const newRow: BoardCell[] = [];
    for (let c = 0; c < newCols; c++) {
      const oldR = r - padTop;
      const oldC = c - padLeft;
      if (oldR >= 0 && oldR < numRows && oldC >= 0 && oldC < numCols) {
        newRow.push({
          ...board[oldR][oldC],
          row: r,
          col: c,
        });
      } else {
        newRow.push({
          row: r,
          col: c,
          tile: null,
        });
      }
    }
    newBoard.push(newRow);
  }

  const shiftedTemp = tempPlacements.map((p) => ({
    ...p,
    row: p.row + padTop,
    col: p.col + padLeft,
  }));

  return { board: newBoard, tempPlacements: shiftedTemp, shifted: true, padTop, padLeft };
}

export function isBoardEmpty(board: BoardCell[][]): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < (board[r]?.length ?? 0); c++) {
      if (board[r][c].tile && !board[r][c].isTemp) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Validates the placement direction of subsequent tiles in a turn:
 * 1. Second tile must be placed to the right (row === T1.row && col > T1.col)
 *    OR to the bottom (col === T1.col && row > T1.row) of the first tile.
 * 2. Once the second tile is placed, the third and subsequent tiles must continue
 *    in that exact same direction (horizontal right or vertical bottom).
 */
export function validatePlacementDirection(
  tempPlacements: PlacedTile[],
  row: number,
  col: number
): { allowed: boolean; reasonEn?: string; reasonAr?: string } {
  if (tempPlacements.length === 0) {
    return { allowed: true };
  }

  // Already placed in this turn
  if (tempPlacements.some((p) => p.row === row && p.col === col)) {
    return {
      allowed: false,
      reasonEn: 'A tile is already placed in this cell for this turn.',
      reasonAr: 'تم وضع كلمة في هذا المربع بالفعل في هذا الدور.',
    };
  }

  const firstTile = tempPlacements[0];

  if (tempPlacements.length === 1) {
    const isToRight = row === firstTile.row && col > firstTile.col;
    const isToBottom = col === firstTile.col && row > firstTile.row;

    if (isToRight || isToBottom) {
      return { allowed: true };
    }

    if (row === firstTile.row && col < firstTile.col) {
      return {
        allowed: false,
        reasonEn: 'Placing the second tile should be to the right or to the bottom of the first tile (cannot place to the left).',
        reasonAr: 'يجب وضع الكلمة الثانية إلى اليمين أو إلى الأسفل من الكلمة الأولى (لا يمكن الوضع إلى اليسار).',
      };
    }

    if (col === firstTile.col && row < firstTile.row) {
      return {
        allowed: false,
        reasonEn: 'Placing the second tile should be to the right or to the bottom of the first tile (cannot place upwards).',
        reasonAr: 'يجب وضع الكلمة الثانية إلى اليمين أو إلى الأسفل من الكلمة الأولى (لا يمكن الوضع للأعلى).',
      };
    }

    return {
      allowed: false,
      reasonEn: 'Placing the second tile should be to the right or to the bottom of the first tile.',
      reasonAr: 'يجب وضع الكلمة الثانية إلى اليمين أو إلى الأسفل من الكلمة الأولى.',
    };
  }

  // tempPlacements.length >= 2: direction was locked by firstTile and secondTile
  const secondTile = tempPlacements[1];
  const isHorizontal = firstTile.row === secondTile.row;

  if (isHorizontal) {
    if (row === firstTile.row && col > firstTile.col) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reasonEn: 'Once placed the second tile in a direction, the third must be placed in the same direction (to the right).',
      reasonAr: 'بمجرد وضع الكلمة الثانية في اتجاه، يجب وضع الكلمة الثالثة في نفس الاتجاه (نحو اليمين).',
    };
  } else {
    // Vertical direction
    if (col === firstTile.col && row > firstTile.row) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reasonEn: 'Once placed the second tile in a direction, the third must be placed in the same direction (to the bottom).',
      reasonAr: 'بمجرد وضع الكلمة الثانية في اتجاه، يجب وضع الكلمة الثالثة في نفس الاتجاه (نحو الأسفل).',
    };
  }
}

/**
 * Validates a pending move on the board according to Fun Grammar rules
 */
export function validateMove(
  board: BoardCell[][],
  placedTiles: PlacedTile[]
): MoveValidation {
  if (placedTiles.length === 0) {
    return { isValid: false, score: 0, sentences: [], errorMessage: 'No tiles placed on the board' };
  }

  // Check 1: All tiles must be placed in empty board cells
  for (const p of placedTiles) {
    const existing = board[p.row]?.[p.col]?.tile;
    if (existing && !board[p.row][p.col].isTemp) {
      return { isValid: false, score: 0, sentences: [], errorMessage: 'Cannot place tile on an occupied cell' };
    }
  }

  // Check 2: All placed tiles must share either the same row (horizontal) or same col (vertical)
  const isHorizontal = placedTiles.every((p) => p.row === placedTiles[0].row);
  const isVertical = placedTiles.every((p) => p.col === placedTiles[0].col);

  if (!isHorizontal && !isVertical) {
    return {
      isValid: false,
      score: 0,
      sentences: [],
      errorMessage: 'Rule 10: All tiles in a turn must be aligned in a single straight row or column.',
    };
  }

  // Check 2b: Placement order direction (Rule 4: 2nd tile to right or bottom of 1st, 3rd in same direction)
  if (placedTiles.length >= 2) {
    const t1 = placedTiles[0];
    const t2 = placedTiles[1];
    const isToRight = t2.row === t1.row && t2.col > t1.col;
    const isToBottom = t2.col === t1.col && t2.row > t1.row;

    if (!isToRight && !isToBottom) {
      return {
        isValid: false,
        score: 0,
        sentences: [],
        errorMessage: 'Rule 4: Placing the second tile should be to the right or to the bottom of the first tile.',
      };
    }

    if (placedTiles.length >= 3) {
      for (let i = 2; i < placedTiles.length; i++) {
        const ti = placedTiles[i];
        if (isToRight && (ti.row !== t1.row || ti.col <= t1.col)) {
          return {
            isValid: false,
            score: 0,
            sentences: [],
            errorMessage: 'Rule 4: Once placed the second tile in a direction, the third must be placed in the same direction (to the right).',
          };
        }
        if (isToBottom && (ti.col !== t1.col || ti.row <= t1.row)) {
          return {
            isValid: false,
            score: 0,
            sentences: [],
            errorMessage: 'Rule 4: Once placed the second tile in a direction, the third must be placed in the same direction (to the bottom).',
          };
        }
      }
    }
  }

  // Construct a working board with the newly placed tiles
  const testBoard: BoardCell[][] = board.map((row) =>
    row.map((cell) => ({
      ...cell,
      tile: cell.tile,
    }))
  );

  for (const p of placedTiles) {
    testBoard[p.row][p.col] = {
      ...testBoard[p.row][p.col],
      tile: p.tile,
    };
  }

  const boardWasEmpty = isBoardEmpty(board);

  // Check 3: Check continuity along the main axis
  if (isHorizontal) {
    const row = placedTiles[0].row;
    const cols = placedTiles.map((p) => p.col).sort((a, b) => a - b);
    const minCol = cols[0];
    const maxCol = cols[cols.length - 1];

    // Every cell between minCol and maxCol must have a tile (either newly placed or pre-existing)
    for (let c = minCol; c <= maxCol; c++) {
      if (!testBoard[row][c].tile) {
        return {
          isValid: false,
          score: 0,
          sentences: [],
          errorMessage: 'Tiles must be contiguous without empty gaps.',
        };
      }
    }
  } else {
    const col = placedTiles[0].col;
    const rows = placedTiles.map((p) => p.row).sort((a, b) => a - b);
    const minRow = rows[0];
    const maxRow = rows[rows.length - 1];

    for (let r = minRow; r <= maxRow; r++) {
      if (!testBoard[r][col].tile) {
        return {
          isValid: false,
          score: 0,
          sentences: [],
          errorMessage: 'Tiles must be contiguous without empty gaps.',
        };
      }
    }
  }

  // Check 4: If board was not empty, the placed tiles must connect to an existing tile
  if (!boardWasEmpty) {
    const numRows = board.length;
    const numCols = board[0]?.length ?? 0;
    let connects = false;
    for (const p of placedTiles) {
      const neighbors = [
        [p.row - 1, p.col],
        [p.row + 1, p.col],
        [p.row, p.col - 1],
        [p.row, p.col + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
          const neighborTile = board[nr][nc].tile;
          if (neighborTile && !board[nr][nc].isTemp) {
            connects = true;
            break;
          }
        }
      }
      if (connects) break;
    }

    if (!connects) {
      return {
        isValid: false,
        score: 0,
        sentences: [],
        errorMessage: 'New sentence must connect to at least one existing tile on the board.',
      };
    }
  }

  // Extract all formed sentences (Main sentence + any cross sentences)
  const evaluatedSentences: SentenceEvaluation[] = [];

  if (placedTiles.length === 1) {
    // When placing a single tile, check both horizontal and vertical directions
    const single = placedTiles[0];
    const hSeq = extractFullWordSequence(testBoard, single.row, single.col, 'horizontal');
    const vSeq = extractFullWordSequence(testBoard, single.row, single.col, 'vertical');

    if (hSeq.tiles.length < 2 && vSeq.tiles.length < 2) {
      return {
        isValid: false,
        score: 0,
        sentences: [],
        errorMessage: boardWasEmpty
          ? 'Rule 3: The first sentence must contain at least 2 words.'
          : 'Place the tile beside an existing tile to form a sentence of at least 2 words.',
      };
    }

    if (hSeq.tiles.length >= 2) {
      const hGrammar = validateFullSequence(hSeq.tiles.map((t) => t.tile));
      const hText = hSeq.tiles
        .map((t) => (t.tile.isWildcard && t.tile.customName ? t.tile.customName : t.tile.word))
        .join(' ');

      evaluatedSentences.push({
        text: hGrammar.formattedText || hText,
        isValid: hGrammar.isValid,
        charCount: hGrammar.score,
        tiles: hSeq.tiles,
        direction: 'horizontal',
        reason: hGrammar.reason,
        ruleName: hGrammar.ruleName,
        ruleExplanation: hGrammar.ruleExplanation,
      });
    }

    if (vSeq.tiles.length >= 2) {
      const vGrammar = validateFullSequence(vSeq.tiles.map((t) => t.tile));
      const vText = vSeq.tiles
        .map((t) => (t.tile.isWildcard && t.tile.customName ? t.tile.customName : t.tile.word))
        .join(' ');

      evaluatedSentences.push({
        text: vGrammar.formattedText || vText,
        isValid: vGrammar.isValid,
        charCount: vGrammar.score,
        tiles: vSeq.tiles,
        direction: 'vertical',
        reason: vGrammar.reason,
        ruleName: vGrammar.ruleName,
        ruleExplanation: vGrammar.ruleExplanation,
      });
    }
  } else {
    // When placing multiple tiles (sharing either same row or same col)
    const mainDir: 'horizontal' | 'vertical' = isHorizontal ? 'horizontal' : 'vertical';
    const mainSequence = extractFullWordSequence(testBoard, placedTiles[0].row, placedTiles[0].col, mainDir);

    if (mainSequence.tiles.length < 2) {
      return {
        isValid: false,
        score: 0,
        sentences: [],
        errorMessage: 'Sentences must contain at least 2 words.',
      };
    }

    const mainGrammar = validateFullSequence(mainSequence.tiles.map((t) => t.tile));
    const mainText = mainSequence.tiles
      .map((t) => (t.tile.isWildcard && t.tile.customName ? t.tile.customName : t.tile.word))
      .join(' ');

    evaluatedSentences.push({
      text: mainGrammar.formattedText || mainText,
      isValid: mainGrammar.isValid,
      charCount: mainGrammar.score,
      tiles: mainSequence.tiles,
      direction: mainDir,
      reason: mainGrammar.reason,
      ruleName: mainGrammar.ruleName,
      ruleExplanation: mainGrammar.ruleExplanation,
    });

    // 2. Find any perpendicular (cross) sequences formed by newly placed tiles
    const crossDir: 'horizontal' | 'vertical' = isHorizontal ? 'vertical' : 'horizontal';
    for (const p of placedTiles) {
      const crossSeq = extractFullWordSequence(testBoard, p.row, p.col, crossDir);
      // Only if it forms a word of length >= 2
      if (crossSeq.tiles.length >= 2) {
        const crossGrammar = validateFullSequence(crossSeq.tiles.map((t) => t.tile));
        const crossText = crossSeq.tiles
          .map((t) => (t.tile.isWildcard && t.tile.customName ? t.tile.customName : t.tile.word))
          .join(' ');

        // Avoid duplicates
        const exists = evaluatedSentences.some(
          (s) =>
            s.direction === crossDir &&
            s.tiles[0].row === crossSeq.tiles[0].row &&
            s.tiles[0].col === crossSeq.tiles[0].col
        );

        if (!exists) {
          evaluatedSentences.push({
            text: crossGrammar.formattedText || crossText,
            isValid: crossGrammar.isValid,
            charCount: crossGrammar.score,
            tiles: crossSeq.tiles,
            direction: crossDir,
            reason: crossGrammar.reason,
            ruleName: crossGrammar.ruleName,
            ruleExplanation: crossGrammar.ruleExplanation,
          });
        }
      }
    }
  }

  // Check if ALL evaluated sentences are grammatically valid
  const invalidSentence = evaluatedSentences.find((s) => !s.isValid);
  if (invalidSentence) {
    return {
      isValid: false,
      score: 0,
      sentences: evaluatedSentences,
      errorMessage: invalidSentence.reason || `Sentence "${invalidSentence.text}" is not grammatically valid.`,
    };
  }

  // Total score according to Rule 11:
  // "Score = no of characters in a sentence H/V, both if a word is inserted in cross ways."
  const totalScore = evaluatedSentences.reduce((acc, s) => acc + s.charCount, 0);

  return {
    isValid: true,
    score: totalScore,
    sentences: evaluatedSentences,
  };
}

/**
 * Extracts the full contiguous line of tiles going through (row, col) in a given direction
 */
function extractFullWordSequence(
  board: BoardCell[][],
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical'
): { tiles: PlacedTile[] } {
  const tiles: PlacedTile[] = [];
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;

  if (direction === 'horizontal') {
    // Walk left to find start
    let startCol = col;
    while (startCol > 0 && board[row]?.[startCol - 1]?.tile) {
      startCol--;
    }
    // Walk right to find end
    let currCol = startCol;
    while (currCol < numCols && board[row]?.[currCol]?.tile) {
      tiles.push({
        row,
        col: currCol,
        tile: board[row][currCol].tile!,
      });
      currCol++;
    }
  } else {
    // Walk up to find start
    let startRow = row;
    while (startRow > 0 && board[startRow - 1]?.[col]?.tile) {
      startRow--;
    }
    // Walk down to find end
    let currRow = startRow;
    while (currRow < numRows && board[currRow]?.[col]?.tile) {
      tiles.push({
        row: currRow,
        col,
        tile: board[currRow][col].tile!,
      });
      currRow++;
    }
  }

  return { tiles };
}
