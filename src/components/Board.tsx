import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BoardCell, PlacedTile, Player, TileData } from '../types/game';
import {
  BOARD_SIZE,
  EDGE_MARGIN_TILES,
  getBoardCenter,
  getColumnLabel,
  getVisibleBoardBounds,
  isBoardEmpty,
  validatePlacementDirection,
} from '../utils/boardLogic';
import { sound } from '../utils/audio';
import { Sparkles, ArrowDown, ArrowRight, Info, AlertCircle, Bot } from 'lucide-react';

export interface AiMoveHighlight {
  moveId: number;
  sentenceCoords: { row: number; col: number }[];
  placedCoords: { row: number; col: number }[];
  sentenceText: string;
}

interface BoardProps {
  board: BoardCell[][];
  tempPlacements: PlacedTile[];
  selectedRackTile: TileData | null;
  onCellClick: (row: number, col: number) => void;
  onRecallTempTile: (row: number, col: number) => void;
  onInspectTile?: (tile: TileData, row: number, col: number) => void;
  zoomLevel?: number;
  onZoomChange?: (level: number) => void;
  language: 'en' | 'ar';
  players?: Player[];
  isAutoExpandMode?: boolean;
  aiHighlightMove?: AiMoveHighlight | null;
}

export const Board: React.FC<BoardProps> = ({
  board,
  tempPlacements,
  selectedRackTile,
  onCellClick,
  onRecallTempTile,
  onInspectTile,
  zoomLevel = 1.0,
  onZoomChange,
  language,
  players,
  isAutoExpandMode = true,
  aiHighlightMove = null,
}) => {
  const isAr = language === 'ar';
  const [boardAlert, setBoardAlert] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const aiSentenceSet = useMemo(() => {
    const set = new Set<string>();
    if (aiHighlightMove) {
      for (const c of aiHighlightMove.sentenceCoords) {
        set.add(`${c.row},${c.col}`);
      }
    }
    return set;
  }, [aiHighlightMove]);

  const aiPlacedSet = useMemo(() => {
    const set = new Set<string>();
    if (aiHighlightMove) {
      for (const c of aiHighlightMove.placedCoords) {
        set.add(`${c.row},${c.col}`);
      }
    }
    return set;
  }, [aiHighlightMove]);

  // Smoothly scroll the board viewport (and page section if needed) to bring computer's played sentence into center focus
  useEffect(() => {
    if (!aiHighlightMove || aiHighlightMove.sentenceCoords.length === 0) return;

    let innerTimer: ReturnType<typeof setTimeout> | null = null;
    const rafId = requestAnimationFrame(() => {
      innerTimer = setTimeout(() => {
        const targets = aiHighlightMove.sentenceCoords
          .map(({ row, col }) => cellRefs.current[`${row}-${col}`])
          .filter((el): el is HTMLDivElement => Boolean(el));

        if (targets.length === 0) return;

        const midTarget = targets[Math.floor(targets.length / 2)];
        midTarget.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }, 80);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, [aiHighlightMove]);

  const numRows = board.length;
  const numCols = board[0]?.length ?? BOARD_SIZE;
  const center = React.useMemo(() => getBoardCenter(board), [board]);
  const boardEmpty = isBoardEmpty(board) && tempPlacements.length === 0;

  // Always expand visible bounds to allow space for at least 3 tiles on each side
  const activeBounds = React.useMemo(
    () => getVisibleBoardBounds(board, tempPlacements, isAutoExpandMode),
    [board, tempPlacements, isAutoExpandMode]
  );

  const visibleWidth = activeBounds.maxCol - activeBounds.minCol + 1;
  const visibleHeight = activeBounds.maxRow - activeBounds.minRow + 1;

  const isTempAt = (r: number, c: number) => {
    return tempPlacements.some((p) => p.row === r && p.col === c);
  };

  const getTileAt = (r: number, c: number): TileData | null => {
    const temp = tempPlacements.find((p) => p.row === r && p.col === c);
    if (temp) return temp.tile;
    return board[r]?.[c]?.tile || null;
  };

  const isComputerTileAt = (r: number, c: number): boolean => {
    const cellPlayerId = board[r]?.[c]?.playerId;
    if (!cellPlayerId) return false;
    return players?.find((p) => p.id === cellPlayerId)?.isAi ?? false;
  };

  const isAdjacentToPlacedTile = (r: number, c: number): boolean => {
    const neighbors = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    return neighbors.some(([nr, nc]) => {
      if (nr < 0 || nr >= numRows || nc < 0 || nc >= numCols) return false;
      return !!board[nr][nc]?.tile || tempPlacements.some((p) => p.row === nr && p.col === nc);
    });
  };

  // Determine if empty cell (r, c) is eligible for placement
  const isCellEligible = (r: number, c: number): boolean => {
    if (tempPlacements.length === 0) {
      return boardEmpty ? (r === center.row && c === center.col) : isAdjacentToPlacedTile(r, c);
    }
    const check = validatePlacementDirection(tempPlacements, r, c);
    return check.allowed;
  };

  const handleCellPress = (r: number, c: number, tile: TileData | null, isTemp: boolean) => {
    if (isTemp) {
      onRecallTempTile(r, c);
    } else if (!tile) {
      if (selectedRackTile) {
        // Enforce placement direction rule
        const check = validatePlacementDirection(tempPlacements, r, c);
        if (!check.allowed) {
          sound.playInvalid();
          const msg = isAr ? (check.reasonAr || check.reasonEn!) : (check.reasonEn || check.reasonAr!);
          setBoardAlert({ message: msg, type: 'warning' });
          setTimeout(() => setBoardAlert(null), 4000);
          return;
        }

        setBoardAlert(null);
        onCellClick(r, c);
      } else {
        // User clicked an empty location without selecting a tile first
        const msg = isAr
          ? 'اضغط على كلمة في الحامل بالأسفل أولاً، ثم اضغط هنا!'
          : 'Hit a word in your rack below first, then hit this location!';
        setBoardAlert({ message: msg, type: 'info' });
        setTimeout(() => setBoardAlert(null), 3000);
      }
    } else if (tile && onInspectTile) {
      onInspectTile(tile, r, c);
    }
  };

  // Dynamic column coordinate headers (A, B, ..., Z, AA, AB, ...)
  const visibleColLabels = React.useMemo(() => {
    const labels: string[] = [];
    for (let c = activeBounds.minCol; c <= activeBounds.maxCol; c++) {
      labels.push(getColumnLabel(c));
    }
    return labels;
  }, [activeBounds.minCol, activeBounds.maxCol]);

  // Dynamic responsive sizing based on active width (minimum 36px/40px so longer words never clip)
  const cellSizeClass =
    visibleWidth <= 7
      ? 'w-11 h-11 sm:w-12 sm:h-12'
      : visibleWidth <= 12
      ? 'w-10 h-10 sm:w-11 sm:h-11'
      : 'w-9 h-9 sm:w-10 sm:h-10';

  const colHeaderWidthClass =
    visibleWidth <= 7
      ? 'w-11 sm:w-12'
      : visibleWidth <= 12
      ? 'w-10 sm:w-11'
      : 'w-9 sm:w-10';

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Floating Interactive Alert Toast */}
      {boardAlert && (
        <div
          className={`sticky top-1 z-40 mb-1 px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xl border-2 flex items-center gap-2 animate-in zoom-in-95 duration-150 max-w-xl text-center ${
            boardAlert.type === 'warning'
              ? 'bg-rose-950/95 text-rose-100 border-rose-500 shadow-rose-950/50 ring-2 ring-rose-500/30'
              : 'bg-amber-500 text-slate-950 border-amber-300'
          }`}
        >
          {boardAlert.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-slate-950 shrink-0" />
          )}
          <span>{boardAlert.message}</span>
        </div>
      )}

      {/* Computer Move Focus Banner */}
      {!boardAlert && aiHighlightMove && (
        <div className="sticky top-1 z-40 mb-1 px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xl border-2 border-yellow-300 bg-amber-950/95 text-yellow-100 ring-2 ring-yellow-400/50 flex items-center gap-2 animate-pulse max-w-xl text-center">
          <Bot className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>
            {isAr
              ? `لعب الكمبيوتر: "${aiHighlightMove.sentenceText}"`
              : `Computer played: "${aiHighlightMove.sentenceText}"`}
          </span>
        </div>
      )}

      {/* Main Board Container */}
      <div
        ref={scrollContainerRef}
        dir="ltr"
        className="w-full overflow-auto max-h-[44vh] sm:max-h-[50vh] p-1.5 sm:p-2 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl"
      >
        <div className="min-w-full w-max flex justify-center">
          <div
            style={{ zoom: zoomLevel }}
            className="inline-block px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 shadow-inner"
          >
            {/* Top Column Coordinate Headers */}
            <div className="flex items-center gap-[2px] mb-1 pl-7">
              {visibleColLabels.map((col) => (
                <div
                  key={col}
                  className={`shrink-0 ${colHeaderWidthClass} text-center text-[9px] font-mono text-slate-500 font-semibold`}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Grid Rows (Visible subset) */}
            {board.slice(activeBounds.minRow, activeBounds.maxRow + 1).map((row, rOffset) => {
              const r = activeBounds.minRow + rOffset;
              const visibleRowCells = row.slice(activeBounds.minCol, activeBounds.maxCol + 1);

              return (
                <div key={r} className="flex items-center">
                  {/* Row Coordinate Header */}
                  <div className="w-7 shrink-0 text-right pr-1.5 text-[9px] font-mono text-slate-500 font-semibold">
                    {r + 1}
                  </div>

                  {/* Row Cells */}
                  <div className="flex items-center gap-[2px] mb-[2px]">
                    {visibleRowCells.map((cell, cOffset) => {
                      const c = activeBounds.minCol + cOffset;
                      const tile = getTileAt(r, c);
                      const isTemp = isTempAt(r, c);
                      const isCenter = r === center.row && c === center.col;
                      const isComputer = isComputerTileAt(r, c);
                      const isEligible = isCellEligible(r, c);
                      const isCenterReady = isCenter && boardEmpty && selectedRackTile;
                      const isTargetReady = selectedRackTile && !tile && isEligible;

                      const isToRight =
                        tempPlacements.length >= 1 && r === tempPlacements[0].row && c > tempPlacements[0].col;
                      const isToBottom =
                        tempPlacements.length >= 1 && c === tempPlacements[0].col && r > tempPlacements[0].row;
                      const coordKey = `${r},${c}`;
                      const isAiSentenceCell = aiSentenceSet.has(coordKey);
                      const isAiPlacedCell = aiPlacedSet.has(coordKey);

                    return (
                      <div
                        key={c}
                        ref={(el) => {
                          cellRefs.current[`${r}-${c}`] = el;
                        }}
                        onClick={() => handleCellPress(r, c, tile, isTemp)}
                        className={`relative shrink-0 ${cellSizeClass} rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        tile
                          ? isTemp
                            ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-xl ring-2 ring-amber-400/50 transform -translate-y-0.5'
                            : isAiSentenceCell
                            ? `${
                                isAiPlacedCell
                                  ? 'bg-amber-700 border-2 border-yellow-300 text-amber-50'
                                  : isComputer
                                  ? 'bg-[#7c3d15] border-2 border-yellow-300 text-amber-50'
                                  : 'bg-blue-600 border-2 border-yellow-300 text-white'
                              } animate-ai-tile-blink`
                            : isComputer
                            ? 'bg-[#653312] border-2 border-[#8c4c1e] text-[#fff7ed] shadow-lg hover:brightness-110 ring-1 ring-[#451f08]/60'
                            : 'bg-blue-700 border-2 border-blue-500 text-white shadow-md hover:brightness-110'
                          : isCenterReady
                          ? 'bg-amber-950/60 border-2 border-amber-400 shadow-xl ring-4 ring-amber-400/40 animate-pulse'
                          : isTargetReady
                          ? 'bg-emerald-950/50 border-2 border-dashed border-emerald-400 hover:bg-emerald-900/60 shadow-md ring-2 ring-emerald-500/20'
                          : isCenter
                          ? 'bg-slate-800/80 border border-blue-500/40 hover:bg-slate-800'
                          : 'bg-slate-800/40 border border-slate-800/70 hover:bg-slate-750 hover:border-slate-700'
                      }`}
                    >
                      {/* Empty center cell indicator */}
                      {!tile && isCenter && (
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                          {isCenterReady ? (
                            <div className="flex flex-col items-center justify-center text-amber-300 animate-bounce">
                              <ArrowDown className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-extrabold uppercase tracking-tight">
                                {isAr ? 'اضغط هنا' : 'Hit Here!'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-blue-400/60">
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Start</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Directional Target Ready Indicator */}
                      {!tile && !isCenter && isTargetReady && (
                        <div className="flex items-center justify-center pointer-events-none">
                          {isToRight ? (
                            <div className="flex items-center text-emerald-300 text-[10px] font-bold animate-pulse">
                              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : isToBottom ? (
                            <div className="flex items-center text-emerald-300 text-[10px] font-bold animate-pulse">
                              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 animate-ping" />
                          )}
                        </div>
                      )}

                      {!tile && !isCenter && !isTargetReady && selectedRackTile && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700/30 pointer-events-none" />
                      )}

                      {/* Placed Tile */}
                      {tile && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-0.5 relative overflow-hidden">
                          <span
                            className={`font-bold text-center leading-none max-w-full px-0.5 whitespace-nowrap ${
                              tile.word.length >= 9
                                ? 'text-[6.5px] sm:text-[7.5px] tracking-tighter'
                                : tile.word.length > 7
                                ? 'text-[7.5px] sm:text-[8.5px] tracking-tighter'
                                : tile.word.length > 4
                                ? 'text-[10px] sm:text-[11.5px] tracking-tight'
                                : 'text-xs sm:text-sm tracking-tight'
                            }`}
                          >
                            {tile.isWildcard && tile.customName ? tile.customName : tile.displayWord}
                          </span>

                          {/* Wildcard indicator */}
                          {tile.isWildcard && (
                            <span className="absolute top-0.5 left-0.5 text-[8px] font-mono text-amber-300 font-bold">
                              {tile.word}
                            </span>
                          )}

                          {/* Character Score Badge (Rule 11) */}
                          <span
                            className={`absolute bottom-0.5 right-1 text-[8px] font-mono font-bold ${
                              isComputer ? 'text-amber-200' : isTemp ? 'text-amber-100' : 'text-blue-200'
                            }`}
                          >
                            {tile.charCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};
