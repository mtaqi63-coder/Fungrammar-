import React from 'react';
import { Check, AlertCircle, CheckCircle2, Clock, ArrowRightLeft, RotateCcw, Globe } from 'lucide-react';
import { MoveValidation, TileData } from '../types/game';

interface TurnActionsProps {
  onPlayMove: () => void;
  onPassTurn?: () => void;
  onOpenReferee?: () => void;
  validation: MoveValidation | null;
  hasTempTiles: boolean;
  disabled?: boolean;
  language: 'en' | 'ar';
  turnTimeLeft?: number;
  worldwideVisits?: number | null;

  // Recall placed tiles
  onRecallAll?: () => void;

  // Exchange controls
  selectedTile?: TileData | null;
  isExchangeMode?: boolean;
  selectedForExchange?: string[];
  onConfirmExchange?: () => void;
  onStartExchangeMode?: () => void;
  onCancelExchangeMode?: () => void;
  rackEmpty?: boolean;
}

export const TurnActions: React.FC<TurnActionsProps> = ({
  onPlayMove,
  validation,
  hasTempTiles,
  disabled = false,
  language,
  turnTimeLeft,
  worldwideVisits,
  onRecallAll,
  selectedTile,
  isExchangeMode = false,
  selectedForExchange = [],
  onConfirmExchange,
  onStartExchangeMode,
  onCancelExchangeMode,
  rackEmpty = false,
}) => {
  const isAr = language === 'ar';
  const isValidToPlay = hasTempTiles && !!validation?.isValid;

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-2 select-none">
      {/* Live Move Preview & Grammar Validation Status */}
      {hasTempTiles && validation && (
        <div
          className={`w-full px-3 py-2 rounded-lg border text-xs flex items-center justify-between gap-3 transition-all ${
            validation.isValid
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="truncate">
              {validation.isValid ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">
                    {validation.sentences.map((s) => `"${s.text}"`).join(' & ')}
                  </span>
                  <span className="text-[11px] text-emerald-300">
                    ({isAr ? 'جملة صحيحة بنجاح' : 'Valid English Sentence'})
                  </span>
                </div>
              ) : (
                <span className="text-rose-200">{validation.errorMessage}</span>
              )}
            </div>
          </div>

          {validation.isValid && (
            <div className="flex items-center gap-1.5 shrink-0 bg-emerald-900/60 px-2.5 py-1 rounded-md border border-emerald-400/40">
              <span className="text-white font-mono font-bold text-sm tabular-nums">+{validation.score}</span>
              <span className="text-[10px] text-emerald-200 uppercase font-semibold">
                {isAr ? 'حرف/نقطة' : 'Pts'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Unified Single Line: Timer + Worldwide Visits Counter + Exchange + Play */}
      <div className="w-full flex items-center justify-between gap-2">
        {/* Left: Turn Countdown Timer & Worldwide Visits Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {turnTimeLeft !== undefined && !disabled ? (
            <div
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all shadow-sm shrink-0 ${
                turnTimeLeft <= 10
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/70 animate-pulse ring-1 ring-rose-500/50'
                  : turnTimeLeft <= 20
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/70'
                  : 'bg-slate-800/80 text-emerald-300 border-slate-700'
              }`}
              title={isAr ? 'الوقت المتبقي لدورك (مهلة دقيقة واحدة)' : 'Time remaining for your turn (1 min limit)'}
            >
              <Clock className={`w-3.5 h-3.5 ${turnTimeLeft <= 10 ? 'text-rose-400' : turnTimeLeft <= 20 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>
                {Math.floor(turnTimeLeft / 60)}:{String(turnTimeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div className="w-10 sm:w-14" />
          )}

          {/* Worldwide Visits Counter */}
          {worldwideVisits !== undefined && worldwideVisits !== null && (
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-800/85 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-sm shrink-0 transition-colors"
              title={
                isAr
                  ? 'عدد مرات زيارة وتصفح اللعبة حول العالم'
                  : 'Total number of times the game page is visited worldwide'
              }
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">{isAr ? 'الزيارات:' : 'Visits:'}</span>
              <span className="font-mono font-extrabold text-cyan-300 text-xs sm:text-sm">
                {worldwideVisits.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Center: Recall Placed (if placed) & Exchange Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasTempTiles && onRecallAll && (
            <button
              onClick={onRecallAll}
              disabled={disabled}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm shrink-0"
              title={isAr ? 'استرجاع الكلمات الموضوعة' : 'Recall placed tiles'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isAr ? 'استرجاع الكلمات' : 'Recall Placed'}</span>
              <span className="sm:hidden">{isAr ? 'استرجاع' : 'Recall'}</span>
            </button>
          )}

          {/* Exchange Button */}
          {onConfirmExchange && onStartExchangeMode && (
            <>
              {!isExchangeMode ? (
                <button
                  onClick={() => {
                    if (selectedTile) {
                      onConfirmExchange();
                    } else {
                      onStartExchangeMode();
                    }
                  }}
                  disabled={disabled || rackEmpty}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0 disabled:opacity-50 ${
                    selectedTile
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white ring-2 ring-amber-400/80 shadow-md shadow-amber-500/30 scale-105 active:scale-95 animate-pulse font-bold cursor-pointer'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title={
                    selectedTile
                      ? isAr
                        ? `تبديل "${selectedTile.word}" بكلمة جديدة من البنك`
                        : `Exchange "${selectedTile.word}" with a new tile from bank`
                      : isAr
                      ? 'تبديل كلمات من البنك (قاعدة 6)'
                      : 'Exchange tiles with bank (Rule 6)'
                  }
                >
                  <ArrowRightLeft className={`w-3.5 h-3.5 ${selectedTile ? 'text-white' : 'text-rose-400'}`} />
                  <span>
                    {selectedTile
                      ? isAr
                        ? `تبديل "${selectedTile.word}"`
                        : `Exchange "${selectedTile.word}"`
                      : isAr
                      ? 'تبديل'
                      : 'Exchange'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-rose-300 font-medium hidden sm:inline">
                    {selectedForExchange.length} {isAr ? 'محددة' : 'selected'}
                  </span>
                  <button
                    onClick={onConfirmExchange}
                    disabled={selectedForExchange.length === 0}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs transition-all shadow-md ring-2 ring-amber-400/70 disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-white" />
                    <span>
                      {selectedForExchange.length > 0
                        ? isAr
                          ? `تبديل (${selectedForExchange.length})`
                          : `Exchange (${selectedForExchange.length})`
                        : isAr
                        ? 'تبديل'
                        : 'Exchange'}
                    </span>
                  </button>
                  {onCancelExchangeMode && (
                    <button
                      onClick={onCancelExchangeMode}
                      className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Play Action Button */}
        <button
          onClick={onPlayMove}
          disabled={disabled || !isValidToPlay}
          className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-lg shrink-0 ${
            isValidToPlay
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white ring-4 ring-emerald-400/70 shadow-xl shadow-emerald-500/40 transform scale-105 active:scale-95 animate-pulse'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{isAr ? 'العب' : 'Play'}</span>
          {isValidToPlay && validation?.score !== undefined && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded bg-white/20 text-white text-xs font-mono font-bold">
              +{validation.score}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

