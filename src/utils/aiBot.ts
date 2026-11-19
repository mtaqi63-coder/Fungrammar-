import { BoardCell, PlacedTile, SentenceEvaluation, TileData } from '../types/game';
import { WILDCARD_SUGGESTIONS } from '../data/tiles';
import { getBoardCenter, isBoardEmpty, validateMove } from './boardLogic';
import { validateFullSequence } from './grammarValidator';

export interface BotMoveCandidate {
  placedTiles: PlacedTile[];
  score: number;
  sentenceText: string;
  sentences: SentenceEvaluation[];
}

const INVALID_START_TOKENS = new Set([
  '.',
  'not',
  'and',
  'but',
  'me',
  'him',
  'them',
  'us',
  'doing',
  'in',
  'to',
  'for',
  'up',
  'down',
  'out',
]);

const INVALID_END_TOKENS = new Set([
  'a',
  'the',
  'my',
  'his',
  'their',
  'your',
  'her',
  'in',
  'to',
  'for',
  'not',
  'and',
  'but',
  'can',
  'will',
  'where',
  'when',
  'who',
  'whom',
  'whose',
  'which',
  'what',
  'why',
  'how',
]);

function assignSmartWildcardNames(board: BoardCell[][], rack: TileData[]): TileData[] {
  const usedNames = new Set<string>();
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const tile = board[r][c].tile;
      if (tile?.isWildcard && tile.customName) {
        usedNames.add(tile.customName.toLowerCase());
      }
    }
  }

  return rack.map((t) => {
    if (t.isWildcard && !t.customName) {
      const len = t.wildcardLen || 4;
      const suggestions = WILDCARD_SUGGESTIONS[len] || ['Sara'];
      const picked =
        suggestions.find((s) => !usedNames.has(s.toLowerCase())) || suggestions[0];
      usedNames.add(picked.toLowerCase());
      return { ...t, customName: picked, displayWord: picked };
    }
    return t;
  });
}

function extractLinearTilesIfValid(
  board: BoardCell[][],
  placed: PlacedTile[],
  direction: 'horizontal' | 'vertical'
): TileData[] | null {
  const placedMap = new Map<string, TileData>();
  for (const p of placed) {
    placedMap.set(`${p.row},${p.col}`, p.tile);
  }

  const getTile = (r: number, c: number): TileData | null => {
    return placedMap.get(`${r},${c}`) || board[r]?.[c]?.tile || null;
  };

  const first = placed[0];
  const tiles: TileData[] = [];
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;

  if (direction === 'horizontal') {
    let sc = first.col;
    while (sc > 0 && getTile(first.row, sc - 1)) sc--;
    let cc = sc;
    while (cc < numCols) {
      const t = getTile(first.row, cc);
      if (!t) break;
      tiles.push(t);
      cc++;
    }
  } else {
    let sr = first.row;
    while (sr > 0 && getTile(sr - 1, first.col)) sr--;
    let cr = sr;
    while (cr < numRows) {
      const t = getTile(cr, first.col);
      if (!t) break;
      tiles.push(t);
      cr++;
    }
  }

  if (tiles.length < 2) return null;
  const firstWord = tiles[0].word.trim().toLowerCase();
  const lastWord = tiles[tiles.length - 1].word.trim().toLowerCase();
  if (INVALID_START_TOKENS.has(firstWord) || INVALID_END_TOKENS.has(lastWord)) {
    return null;
  }
  return tiles;
}

export function findBestBotMove(
  board: BoardCell[][],
  rack: TileData[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): BotMoveCandidate | null {
  const botRack = assignSmartWildcardNames(board, rack);
  const candidates: BotMoveCandidate[] = [];
  const empty = isBoardEmpty(board);

  const tryAcceptMove = (placed: PlacedTile[], direction: 'horizontal' | 'vertical') => {
    const seqTiles = extractLinearTilesIfValid(board, placed, direction);
    if (!seqTiles) return;
    if (!validateFullSequence(seqTiles).isValid) return;

    const val = validateMove(board, placed);
    if (val.isValid) {
      candidates.push({
        placedTiles: placed,
        score: val.score,
        sentenceText: val.sentences.map((s) => s.text).join(' & '),
        sentences: val.sentences,
      });
    }
  };

  // If board is empty, form 2- to 4-word British English sentences centered on the golden star
  const numRows = board.length;
  const numCols = board[0]?.length ?? 0;
  const center = getBoardCenter(board);

  if (empty) {
    const centerRow = center.row;
    const rackWords = botRack.map((t) => t.word.trim().toLowerCase());

    for (let i = 0; i < botRack.length; i++) {
      if (INVALID_START_TOKENS.has(rackWords[i])) continue;
      for (let j = 0; j < botRack.length; j++) {
        if (i === j) continue;

        if (!INVALID_END_TOKENS.has(rackWords[j])) {
          const startCol2 = center.col - 1;
          const placed2: PlacedTile[] = [
            { row: centerRow, col: startCol2, tile: botRack[i] },
            { row: centerRow, col: startCol2 + 1, tile: botRack[j] },
          ];
          tryAcceptMove(placed2, 'horizontal');
        }

        for (let k = 0; k < botRack.length; k++) {
          if (k === i || k === j) continue;

          if (!INVALID_END_TOKENS.has(rackWords[k])) {
            const startCol3 = center.col - 1;
            const placed3: PlacedTile[] = [
              { row: centerRow, col: startCol3, tile: botRack[i] },
              { row: centerRow, col: startCol3 + 1, tile: botRack[j] },
              { row: centerRow, col: startCol3 + 2, tile: botRack[k] },
            ];
            tryAcceptMove(placed3, 'horizontal');
          }

          // 4-word opening sentences (e.g., "He has a friend", "My mother is young", "We are not here")
          for (let l = 0; l < botRack.length; l++) {
            if (l === i || l === j || l === k) continue;
            if (INVALID_END_TOKENS.has(rackWords[l])) continue;
            const startCol4 = center.col - 1;
            const placed4: PlacedTile[] = [
              { row: centerRow, col: startCol4, tile: botRack[i] },
              { row: centerRow, col: startCol4 + 1, tile: botRack[j] },
              { row: centerRow, col: startCol4 + 2, tile: botRack[k] },
              { row: centerRow, col: startCol4 + 3, tile: botRack[l] },
            ];
            tryAcceptMove(placed4, 'horizontal');
          }
        }
      }
    }
  } else {
    const occupiedCells: { r: number; c: number; tile: TileData }[] = [];
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (board[r][c].tile) {
          occupiedCells.push({ r, c, tile: board[r][c].tile! });
        }
      }
    }

    for (const occ of occupiedCells) {
      const canRight1 = occ.c + 1 < numCols && !board[occ.r][occ.c + 1].tile;
      const canRight2 = canRight1 && occ.c + 2 < numCols && !board[occ.r][occ.c + 2].tile;
      const canRight3 = canRight2 && occ.c + 3 < numCols && !board[occ.r][occ.c + 3].tile;

      const canLeft1 = occ.c - 1 >= 0 && !board[occ.r][occ.c - 1].tile;
      const canLeft2 = canLeft1 && occ.c - 2 >= 0 && !board[occ.r][occ.c - 2].tile;

      const canDown1 = occ.r + 1 < numRows && !board[occ.r + 1][occ.c].tile;
      const canDown2 = canDown1 && occ.r + 2 < numRows && !board[occ.r + 2][occ.c].tile;
      const canDown3 = canDown2 && occ.r + 3 < numRows && !board[occ.r + 3][occ.c].tile;

      const canUp1 = occ.r - 1 >= 0 && !board[occ.r - 1][occ.c].tile;
      const canUp2 = canUp1 && occ.r - 2 >= 0 && !board[occ.r - 2][occ.c].tile;

      for (let i = 0; i < botRack.length; i++) {
        const t1 = botRack[i];

        // 1-tile extensions in all 4 directions
        if (canRight1) tryAcceptMove([{ row: occ.r, col: occ.c + 1, tile: t1 }], 'horizontal');
        if (canLeft1) tryAcceptMove([{ row: occ.r, col: occ.c - 1, tile: t1 }], 'horizontal');
        if (canDown1) tryAcceptMove([{ row: occ.r + 1, col: occ.c, tile: t1 }], 'vertical');
        if (canUp1) tryAcceptMove([{ row: occ.r - 1, col: occ.c, tile: t1 }], 'vertical');

        for (let j = 0; j < botRack.length; j++) {
          if (i === j) continue;
          const t2 = botRack[j];

          // 2-tile extensions: Right, Left (strictly left-to-right), Down, Up (strictly top-to-bottom), and Straddles
          if (canRight2) {
            tryAcceptMove(
              [
                { row: occ.r, col: occ.c + 1, tile: t1 },
                { row: occ.r, col: occ.c + 2, tile: t2 },
              ],
              'horizontal'
            );
          }
          if (canLeft2) {
            tryAcceptMove(
              [
                { row: occ.r, col: occ.c - 2, tile: t1 },
                { row: occ.r, col: occ.c - 1, tile: t2 },
              ],
              'horizontal'
            );
          }
          if (canLeft1 && canRight1) {
            tryAcceptMove(
              [
                { row: occ.r, col: occ.c - 1, tile: t1 },
                { row: occ.r, col: occ.c + 1, tile: t2 },
              ],
              'horizontal'
            );
          }

          if (canDown2) {
            tryAcceptMove(
              [
                { row: occ.r + 1, col: occ.c, tile: t1 },
                { row: occ.r + 2, col: occ.c, tile: t2 },
              ],
              'vertical'
            );
          }
          if (canUp2) {
            tryAcceptMove(
              [
                { row: occ.r - 2, col: occ.c, tile: t1 },
                { row: occ.r - 1, col: occ.c, tile: t2 },
              ],
              'vertical'
            );
          }
          if (canUp1 && canDown1) {
            tryAcceptMove(
              [
                { row: occ.r - 1, col: occ.c, tile: t1 },
                { row: occ.r + 1, col: occ.c, tile: t2 },
              ],
              'vertical'
            );
          }

          // 3-tile extensions right and down
          if (canRight3 || canDown3) {
            for (let k = 0; k < botRack.length; k++) {
              if (k === i || k === j) continue;
              const t3 = botRack[k];
              if (canRight3) {
                tryAcceptMove(
                  [
                    { row: occ.r, col: occ.c + 1, tile: t1 },
                    { row: occ.r, col: occ.c + 2, tile: t2 },
                    { row: occ.r, col: occ.c + 3, tile: t3 },
                  ],
                  'horizontal'
                );
              }
              if (canDown3) {
                tryAcceptMove(
                  [
                    { row: occ.r + 1, col: occ.c, tile: t1 },
                    { row: occ.r + 2, col: occ.c, tile: t2 },
                    { row: occ.r + 3, col: occ.c, tile: t3 },
                  ],
                  'vertical'
                );
              }
            }
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);

  if (difficulty === 'hard') {
    return candidates[0];
  } else if (difficulty === 'easy') {
    const pickIdx = Math.min(candidates.length - 1, Math.floor(Math.random() * 3));
    return candidates[pickIdx];
  } else {
    const topChoices = candidates.slice(0, Math.min(3, candidates.length));
    return topChoices[Math.floor(Math.random() * topChoices.length)];
  }
}
