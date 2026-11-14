import React, { useState } from 'react';
import { BoardCell, PlacedTile, Player, TileData } from '../types/game';
import { BOARD_SIZE, CENTER_ROW, CENTER_COL, isBoardEmpty, validatePlacementDirection } from '../utils/boardLogic';
import { sound } from '../utils/audio';
import { Sparkles, ArrowDown, ArrowRight, Info, AlertCircle } from 'lucide-react';

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
}) => {
  const isAr = language === 'ar';
  const [boardAlert, setBoardAlert] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);

  const boardEmpty = isBoardEmpty(board) && tempPlacements.length === 0;

  // Compute active bounds that expand as tiles are placed across the board up to 20x20
  const activeBounds = React.useMemo(() => {
    if (!isAutoExpandMode) {
      return { minRow: 0, maxRow: BOARD_SIZE - 1, minCol: 0, maxCol: BOARD_SIZE - 1 };
    }

    const occupiedRows: number[] = [];
    const occupiedCols: number[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
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

    // Always include starting center
    occupiedRows.push(CENTER_ROW);
    occupiedCols.push(CENTER_COL);

    const minR = Math.min(...occupiedRows);
    const maxR = Math.max(...occupiedRows);
    const minC = Math.min(...occupiedCols);
    const maxC = Math.max(...occupiedCols);

    // Provide buffer of 1-2 cells around all placed tiles, with initial minimum 5x5 window centered around CENTER_ROW/CENTER_COL
    const minRow = Math.max(0, Math.min(minR - 1, CENTER_ROW - 2));
    const maxRow = Math.min(BOARD_SIZE - 1, Math.max(maxR + 1, CENTER_ROW + 2));
    const minCol = Math.max(0, Math.min(minC - 1, CENTER_COL - 2));
    const maxCol = Math.min(BOARD_SIZE - 1, Math.max(maxC + 1, CENTER_COL + 2));

    return { minRow, maxRow, minCol, maxCol };
  }, [board, tempPlacements, isAutoExpandMode]);

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
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) return false;
      return !!board[nr][nc]?.tile || tempPlacements.some((p) => p.row === nr && p.col === nc);
    });
  };

  // Determine if empty cell (r, c) is eligible for placement
  const isCellEligible = (r: number, c: number): boolean => {
    if (tempPlacements.length === 0) {
      return boardEmpty ? (r === CENTER_ROW && c === CENTER_COL) : isAdjacentToPlacedTile(r, c);
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

  // 20 Columns: A through T
  const colLabels = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  ];
  const visibleColLabels = colLabels.slice(activeBounds.minCol, activeBounds.maxCol + 1);

  // Dynamic responsive sizing based on active width
  const cellSizeClass =
    visibleWidth <= 7
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : visibleWidth <= 12
      ? 'w-10 h-10 sm:w-12 sm:h-12'
      : visibleWidth <= 16
      ? 'w-9 h-9 sm:w-10 sm:h-10'
      : 'w-8 h-8 sm:w-9 sm:h-9';

  const colHeaderWidthClass =
    visibleWidth <= 7
      ? 'w-12 sm:w-14'
      : visibleWidth <= 12
      ? 'w-10 sm:w-12'
      : visibleWidth <= 16
      ? 'w-9 sm:w-10'
      : 'w-8 sm:w-9';

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Floating Interactive Alert Toast */}
      {boardAlert && (
        <div
          className={`sticky top-2 z-40 mb-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xl border-2 flex items-center gap-2.5 animate-in zoom-in-95 duration-150 max-w-xl text-center ${
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

      {/* Main Board Container */}
      <div className="w-full overflow-auto max-h-[64vh] flex justify-center p-2 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 inline-block p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner"
        >
          {/* Top Column Coordinate Headers */}
          <div className="flex mb-1 ml-6">
            {visibleColLabels.map((col) => (
              <div
                key={col}
                className={`${colHeaderWidthClass} text-center text-[10px] font-mono text-slate-500 font-semibold`}
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
                <div className="w-6 text-right pr-1.5 text-[10px] font-mono text-slate-500 font-semibold">
                  {r + 1}
                </div>

                {/* Row Cells */}
                <div className="flex gap-[3px] mb-[3px]">
                  {visibleRowCells.map((cell, cOffset) => {
                    const c = activeBounds.minCol + cOffset;
                    const tile = getTileAt(r, c);
                    const isTemp = isTempAt(r, c);
                    const isCenter = r === CENTER_ROW && c === CENTER_COL;
                    const isComputer = isComputerTileAt(r, c);
                    const isEligible = isCellEligible(r, c);
                    const isCenterReady = isCenter && boardEmpty && selectedRackTile;
                    const isTargetReady = selectedRackTile && !tile && isEligible;

                    const isToRight =
                      tempPlacements.length >= 1 && r === tempPlacements[0].row && c > tempPlacements[0].col;
                    const isToBottom =
                      tempPlacements.length >= 1 && c === tempPlacements[0].col && r > tempPlacements[0].row;

                  return (
                    <div
                      key={c}
                      onClick={() => handleCellPress(r, c, tile, isTemp)}
                      className={`relative ${cellSizeClass} rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        tile
                          ? isTemp
                            ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-xl ring-2 ring-amber-400/50 transform -translate-y-0.5'
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
                        <div className="w-full h-full flex flex-col items-center justify-center p-0.5 relative">
                          <span
                            className={`font-bold text-center leading-tight tracking-tight ${
                              tile.word.length > 7
                                ? 'text-[9px] sm:text-[10px]'
                                : tile.word.length > 4
                                ? 'text-[11px] sm:text-[12px]'
                                : 'text-xs sm:text-sm'
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
  );
};
