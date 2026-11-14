import { BoardCell, PlacedTile, SentenceEvaluation, TileData } from '../types/game';
import { BOARD_SIZE, CENTER_ROW, CENTER_COL, isBoardEmpty, validateMove } from './boardLogic';

export interface BotMoveCandidate {
  placedTiles: PlacedTile[];
  score: number;
  sentenceText: string;
  sentences: SentenceEvaluation[];
}

export function findBestBotMove(
  board: BoardCell[][],
  rack: TileData[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): BotMoveCandidate | null {
  const botRack = rack.map((t) => {
    if (t.isWildcard && !t.customName) {
      const len = t.wildcardLen || 4;
      const defaultName = len === 3 ? 'Ali' : len === 4 ? 'Sara' : len === 5 ? 'Sarah' : 'Fatima';
      return { ...t, customName: defaultName, displayWord: defaultName };
    }
    return t;
  });

  const candidates: BotMoveCandidate[] = [];
  const empty = isBoardEmpty(board);

  // If board is empty, start in center (CENTER_ROW, CENTER_COL)
  if (empty) {
    const centerRow = CENTER_ROW;
    const centerCol = CENTER_COL - 1;

    // Try permutations of 2 to 4 words from rack
    for (let i = 0; i < botRack.length; i++) {
      for (let j = 0; j < botRack.length; j++) {
        if (i === j) continue;
        const pair = [botRack[i], botRack[j]];
        const placed: PlacedTile[] = [
          { row: centerRow, col: centerCol, tile: pair[0] },
          { row: centerRow, col: centerCol + 1, tile: pair[1] },
        ];
        const val = validateMove(board, placed);
        if (val.isValid) {
          candidates.push({
            placedTiles: placed,
            score: val.score,
            sentenceText: val.sentences.map((s) => s.text).join(' & '),
            sentences: val.sentences,
          });
        }

        // Try 3-word sentence
        for (let k = 0; k < botRack.length; k++) {
          if (k === i || k === j) continue;
          const triplet = [botRack[i], botRack[j], botRack[k]];
          const placed3: PlacedTile[] = [
            { row: centerRow, col: centerCol, tile: triplet[0] },
            { row: centerRow, col: centerCol + 1, tile: triplet[1] },
            { row: centerRow, col: centerCol + 2, tile: triplet[2] },
          ];
          const val3 = validateMove(board, placed3);
          if (val3.isValid) {
            candidates.push({
              placedTiles: placed3,
              score: val3.score,
              sentenceText: val3.sentences.map((s) => s.text).join(' & '),
              sentences: val3.sentences,
            });
          }
        }
      }
    }
  } else {
    // Find all occupied cells on the board
    const occupiedCells: { r: number; c: number; tile: TileData }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].tile) {
          occupiedCells.push({ r, c, tile: board[r][c].tile! });
        }
      }
    }

    // Try extending horizontally or vertically from existing tiles
    for (const occ of occupiedCells) {
      // 1. Extend right: place 1 or 2 tiles from rack after existing tile
      for (let i = 0; i < botRack.length; i++) {
        const t1 = botRack[i];
        // After
        if (occ.c + 1 < BOARD_SIZE && !board[occ.r][occ.c + 1].tile) {
          const placed1: PlacedTile[] = [{ row: occ.r, col: occ.c + 1, tile: t1 }];
          const val1 = validateMove(board, placed1);
          if (val1.isValid) {
            candidates.push({
              placedTiles: placed1,
              score: val1.score,
              sentenceText: val1.sentences.map((s) => s.text).join(' & '),
              sentences: val1.sentences,
            });
          }

          if (occ.c + 2 < BOARD_SIZE && !board[occ.r][occ.c + 2].tile) {
            for (let j = 0; j < botRack.length; j++) {
              if (i === j) continue;
              const placed2: PlacedTile[] = [
                { row: occ.r, col: occ.c + 1, tile: t1 },
                { row: occ.r, col: occ.c + 2, tile: botRack[j] },
              ];
              const val2 = validateMove(board, placed2);
              if (val2.isValid) {
                candidates.push({
                  placedTiles: placed2,
                  score: val2.score,
                  sentenceText: val2.sentences.map((s) => s.text).join(' & '),
                  sentences: val2.sentences,
                });
              }

              // Try 3-tile extension right
              if (occ.c + 3 < BOARD_SIZE && !board[occ.r][occ.c + 3].tile) {
                for (let k = 0; k < botRack.length; k++) {
                  if (k === i || k === j) continue;
                  const placed3: PlacedTile[] = [
                    { row: occ.r, col: occ.c + 1, tile: t1 },
                    { row: occ.r, col: occ.c + 2, tile: botRack[j] },
                    { row: occ.r, col: occ.c + 3, tile: botRack[k] },
                  ];
                  const val3 = validateMove(board, placed3);
                  if (val3.isValid) {
                    candidates.push({
                      placedTiles: placed3,
                      score: val3.score,
                      sentenceText: val3.sentences.map((s) => s.text).join(' & '),
                      sentences: val3.sentences,
                    });
                  }
                }
              }
            }
          }
        }

        // Before
        if (occ.c - 1 >= 0 && !board[occ.r][occ.c - 1].tile) {
          const placedBefore: PlacedTile[] = [{ row: occ.r, col: occ.c - 1, tile: t1 }];
          const valB = validateMove(board, placedBefore);
          if (valB.isValid) {
            candidates.push({
              placedTiles: placedBefore,
              score: valB.score,
              sentenceText: valB.sentences.map((s) => s.text).join(' & '),
              sentences: valB.sentences,
            });
          }
        }

        // Vertical Down
        if (occ.r + 1 < BOARD_SIZE && !board[occ.r + 1][occ.c].tile) {
          const placedDown: PlacedTile[] = [{ row: occ.r + 1, col: occ.c, tile: t1 }];
          const valD = validateMove(board, placedDown);
          if (valD.isValid) {
            candidates.push({
              placedTiles: placedDown,
              score: valD.score,
              sentenceText: valD.sentences.map((s) => s.text).join(' & '),
              sentences: valD.sentences,
            });
          }

          if (occ.r + 2 < BOARD_SIZE && !board[occ.r + 2][occ.c].tile) {
            for (let j = 0; j < botRack.length; j++) {
              if (i === j) continue;
              const placedDown2: PlacedTile[] = [
                { row: occ.r + 1, col: occ.c, tile: t1 },
                { row: occ.r + 2, col: occ.c, tile: botRack[j] },
              ];
              const valD2 = validateMove(board, placedDown2);
              if (valD2.isValid) {
                candidates.push({
                  placedTiles: placedDown2,
                  score: valD2.score,
                  sentenceText: valD2.sentences.map((s) => s.text).join(' & '),
                  sentences: valD2.sentences,
                });
              }

              // Try 3-tile extension down
              if (occ.r + 3 < BOARD_SIZE && !board[occ.r + 3][occ.c].tile) {
                for (let k = 0; k < botRack.length; k++) {
                  if (k === i || k === j) continue;
                  const placedDown3: PlacedTile[] = [
                    { row: occ.r + 1, col: occ.c, tile: t1 },
                    { row: occ.r + 2, col: occ.c, tile: botRack[j] },
                    { row: occ.r + 3, col: occ.c, tile: botRack[k] },
                  ];
                  const valD3 = validateMove(board, placedDown3);
                  if (valD3.isValid) {
                    candidates.push({
                      placedTiles: placedDown3,
                      score: valD3.score,
                      sentenceText: valD3.sentences.map((s) => s.text).join(' & '),
                      sentences: valD3.sentences,
                    });
                  }
                }
              }
            }
          }
        }

        // Vertical Up
        if (occ.r - 1 >= 0 && !board[occ.r - 1][occ.c].tile) {
          const placedUp: PlacedTile[] = [{ row: occ.r - 1, col: occ.c, tile: t1 }];
          const valU = validateMove(board, placedUp);
          if (valU.isValid) {
            candidates.push({
              placedTiles: placedUp,
              score: valU.score,
              sentenceText: valU.sentences.map((s) => s.text).join(' & '),
              sentences: valU.sentences,
            });
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  if (difficulty === 'hard') {
    return candidates[0];
  } else if (difficulty === 'easy') {
    const pickIdx = Math.min(candidates.length - 1, Math.floor(Math.random() * 3));
    return candidates[pickIdx];
  } else {
    // medium: pick top 3
    const topChoices = candidates.slice(0, Math.min(3, candidates.length));
    return topChoices[Math.floor(Math.random() * topChoices.length)];
  }
}
