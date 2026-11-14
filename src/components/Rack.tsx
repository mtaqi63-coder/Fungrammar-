import React, { useRef } from 'react';
import { TileData } from '../types/game';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface RackProps {
  rack: TileData[];
  selectedTile: TileData | null;
  onSelectTile: (tile: TileData) => void;
  onShuffleRack?: () => void;
  onRecallAll?: () => void;
  hasTempTiles?: boolean;
  isExchangeMode?: boolean;
  selectedForExchange?: string[];
  onToggleExchangeTile?: (tileId: string) => void;
  onStartExchangeMode?: () => void;
  onCancelExchangeMode?: () => void;
  onConfirmExchange?: () => void;
  onOpenWildcardModal: (tile: TileData) => void;
  disabled?: boolean;
  language: 'en' | 'ar';
}

export const Rack: React.FC<RackProps> = ({
  rack,
  selectedTile,
  onSelectTile,
  onRecallAll,
  hasTempTiles,
  isExchangeMode,
  selectedForExchange = [],
  onToggleExchangeTile,
  onStartExchangeMode,
  onCancelExchangeMode,
  onConfirmExchange,
  onOpenWildcardModal,
  disabled = false,
  language,
}) => {
  const isAr = language === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-2 select-none">
      {/* Scroll Guidance Helper Banner & Step 1 Hint */}
      <div className="w-full flex items-center justify-between px-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-300">
            {isAr ? 'حامل كلماتك (10 كلمات):' : 'Your 10-Word Rack:'}
          </span>
          {!selectedTile && !hasTempTiles && !disabled && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-[10px] animate-pulse flex items-center gap-1">
              <span>👆</span>
              <span>{isAr ? 'الخطوة 1: اضغط على كلمة لاختيارها' : 'Step 1: Hit a tile here to pick it'}</span>
            </span>
          )}
          {selectedTile && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold text-[10px] flex items-center gap-1">
              <span>✓</span>
              <span>
                {isAr
                  ? `تم اختيار "${selectedTile.word}" ➔ اضغط على اللوحة`
                  : `Picked "${selectedTile.word}" ➔ Hit board location`}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <span>{rack.length}/10</span>
        </div>
      </div>

      {/* Main Rack Box with Integrated Left/Right Scroll Arrows */}
      <div className="relative w-full flex items-center gap-1.5">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={handleScrollLeft}
          title={isAr ? 'تمرير لليسار' : 'Scroll Left'}
          className="shrink-0 w-8 h-12 sm:w-9 sm:h-14 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-blue-400" />
        </button>

        {/* Scrollable Tile Track (modeled after the white plastic rack strip) */}
        <div
          ref={scrollRef}
          className="flex-1 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-2 border-slate-300 rounded-xl p-2 sm:p-2.5 shadow-xl flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scroll-smooth min-h-[64px]"
        >
          {rack.map((tile, idx) => {
            const isSelected = selectedTile?.id === tile.id;
            const isMarkedExchange = selectedForExchange.includes(tile.id);

            return (
              <div
                key={`${tile.id}_${idx}`}
                onClick={() => {
                  if (disabled) return;
                  if (isExchangeMode) {
                    onToggleExchangeTile?.(tile.id);
                  } else {
                    if (tile.isWildcard && !tile.customName) {
                      onOpenWildcardModal(tile);
                    }
                    onSelectTile(tile);
                  }
                }}
                className={`relative flex-shrink-0 w-13 h-13 sm:w-14 sm:h-14 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                  isMarkedExchange
                    ? 'bg-rose-600 border-2 border-rose-300 text-white transform scale-95 shadow-inner'
                    : isSelected
                    ? 'bg-blue-600 border-2 border-amber-300 text-white transform -translate-y-2 shadow-2xl ring-4 ring-amber-400/50'
                    : 'bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white shadow-md hover:-translate-y-0.5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Tile Word */}
                <span
                  className={`font-bold text-center leading-tight tracking-tight px-0.5 ${
                    tile.word.length > 7
                      ? 'text-[10px] sm:text-[11px]'
                      : tile.word.length > 4
                      ? 'text-xs sm:text-sm'
                      : 'text-sm sm:text-base'
                  }`}
                >
                  {tile.isWildcard && tile.customName ? tile.customName : tile.displayWord}
                </span>

                {/* Wildcard Badge & Edit */}
                {tile.isWildcard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWildcardModal(tile);
                    }}
                    className="absolute top-0.5 left-0.5 text-[8px] font-mono text-amber-300 font-extrabold flex items-center gap-0.5 bg-blue-950/70 px-1 rounded hover:bg-blue-900"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{tile.word}</span>
                  </button>
                )}

                {/* Character Score Badge (Rule 11) */}
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-blue-200">
                  {tile.charCount}
                </span>

                {/* Exchange checkmark indicator */}
                {isMarkedExchange && (
                  <div className="absolute inset-0 bg-rose-900/60 rounded-lg flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {isAr ? 'تبديل' : 'Swap'}
                  </div>
                )}
              </div>
            );
          })}

          {rack.length === 0 && (
            <div className="text-xs text-slate-500 italic py-2 mx-auto">
              {isAr ? 'الحامل فارغ، جار السحب من البنك...' : 'Rack empty, drawing from bank...'}
            </div>
          )}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={handleScrollRight}
          title={isAr ? 'تمرير لليمين' : 'Scroll Right'}
          className="shrink-0 w-8 h-12 sm:w-9 sm:h-14 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 text-blue-400" />
        </button>
      </div>
    </div>
  );
};
