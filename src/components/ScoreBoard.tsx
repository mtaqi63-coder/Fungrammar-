import React from 'react';
import { Player } from '../types/game';
import { User, Bot, Layers, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
  activePlayerIndex: number;
  bankCount: number;
  isAiThinking: boolean;
  language: 'en' | 'ar';
  isAutoExpandMode?: boolean;
  onToggleExpand?: () => void;
  turnTimeLeft?: number;
  bankRef?: React.RefObject<HTMLDivElement | null>;
  isDealing?: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  activePlayerIndex,
  bankCount,
  isAiThinking,
  language,
  isAutoExpandMode = true,
  onToggleExpand,
  turnTimeLeft,
  bankRef,
  isDealing = false,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Players Score Cards */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {players.map((p, idx) => {
            const isActive = idx === activePlayerIndex;
            return (
              <div
                key={p.id}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                  isActive
                    ? p.isAi
                      ? 'bg-amber-950/70 border-amber-600 shadow-sm ring-1 ring-amber-500/40'
                      : 'bg-blue-950/70 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 opacity-80'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner ${
                    p.isAi
                      ? 'bg-[#78350f] border border-[#92400e] text-amber-100 shadow-sm'
                      : 'bg-blue-600 border border-blue-400 text-white shadow-sm'
                  }`}
                >
                  {p.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {isAr ? p.nameAr : p.name}
                    </span>
                    {/* Tile color indicator tag */}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold flex items-center gap-1 ${
                        p.isAi
                          ? 'bg-[#78350f] text-amber-100 border border-[#92400e]'
                          : 'bg-blue-900/80 text-blue-200 border border-blue-500/50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-sm ${p.isAi ? 'bg-amber-400' : 'bg-blue-400'}`} />
                      <span>{p.isAi ? (isAr ? 'بني' : 'Brown') : (isAr ? 'أزرق' : 'Blue')}</span>
                    </span>

                    {isActive && (
                      <span className={`text-[10px] font-medium ${p.isAi ? 'text-amber-400' : 'text-blue-400'}`}>
                        {isAiThinking ? (isAr ? 'يفكر...' : 'Thinking...') : isAr ? 'دوره' : 'Turn'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono tabular-nums leading-none">
                      {p.score} <span className="text-[11px] font-normal text-slate-400">{isAr ? 'حرف/نقطة' : 'pts'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({p.rack.length} {isAr ? 'كلمات' : 'tiles'})
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse ${p.isAi ? 'bg-amber-500' : 'bg-blue-500'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Bank & Expanding Control */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Bank Counter Window */}
          <div
            ref={bankRef}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
              isDealing
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-100 shadow-lg ring-2 ring-cyan-400/50 scale-105'
                : 'bg-slate-800/70 border-slate-700 text-slate-300'
            }`}
          >
            <Layers className={`w-4 h-4 text-cyan-400 ${isDealing ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{isAr ? 'بنك الكلمات:' : 'Word Bank:'}</span>
            <span className="font-mono font-bold text-cyan-300 tabular-nums">{bankCount}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>

          {/* Expand / Shrink Grid Toggle: Placed directly after bank counter window */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                !isAutoExpandMode
                  ? 'bg-indigo-900/60 border-indigo-500/60 text-indigo-200 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={
                isAutoExpandMode
                  ? isAr
                    ? 'توسيع اللوحة (عرض 20×20 كامل)'
                    : 'Expand to Full 20x20 View'
                  : isAr
                  ? 'تصغير اللوحة'
                  : 'Shrink to Compact View'
              }
            >
              {isAutoExpandMode ? (
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>
                {isAutoExpandMode
                  ? isAr
                    ? 'توسيع'
                    : 'Expand'
                  : isAr
                  ? 'تصغير'
                  : 'Shrink'}
              </span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'النقطة = 1 حرف لكل كلمة في الجملة' : '1 Char = 1 Point (Rule 11)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
