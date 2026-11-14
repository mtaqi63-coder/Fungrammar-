import React from 'react';
import { Volume2, VolumeX, BookOpen, Sparkles, RotateCcw, LayoutGrid, FileText, Play, Image as ImageIcon } from 'lucide-react';
import { GameMode } from '../types/game';

interface HeaderProps {
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  onOpenDemo: () => void;
  onOpenRules: () => void;
  onOpenReferee: () => void;
  onOpenSampleBoard: () => void;
  onOpenManualPdf: () => void;
  onOpenMediaKit: () => void;
  onRestartGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameMode,
  onSelectGameMode,
  onOpenDemo,
  onOpenRules,
  onOpenReferee,
  onOpenSampleBoard,
  onOpenManualPdf,
  onOpenMediaKit,
  onRestartGame,
  soundEnabled,
  onToggleSound,
  language,
  onToggleLanguage,
}) => {
  const isAr = language === 'ar';

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md border border-blue-400/30">
            <span className="font-extrabold text-white text-base tracking-tighter">FG</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Fun Grammar
              </span>
              {isAr && (
                <span className="text-sm font-semibold text-blue-400 font-['Cairo'] whitespace-nowrap">
                  القواعد المرحة
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap">
              By Dr. Mohammed Taqi Alkhonaizi · Bahrain © 2005
            </span>
          </div>
        </div>

        {/* Navigation & Mode Controls */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-300">
          {/* Demo button before rules button */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 transition-all shadow-sm whitespace-nowrap font-semibold"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAr ? 'عرض توضيحي' : 'Demo'}</span>
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'القواعد والصور الأصلية' : 'Official Rules & Photos'}</span>
          </button>

          <button
            onClick={onOpenSampleBoard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'لوحة 2005' : '2005 Board'}</span>
          </button>

          <button
            onClick={onOpenManualPdf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-600/25 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all whitespace-nowrap font-semibold shadow-sm"
          >
            <FileText className="w-4 h-4 text-indigo-400 group-hover:text-white" />
            <span>{isAr ? 'وصف PDF' : 'PDF Manual'}</span>
          </button>

          <button
            onClick={onOpenMediaKit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 transition-all whitespace-nowrap font-semibold shadow-sm"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isAr ? 'الغلاف والصور و GIF' : 'Cover, GIF & Images'}</span>
          </button>

          <button
            onClick={onOpenReferee}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'حَكَم القواعد (القاعدة 7)' : 'Referee (Rule 7)'}</span>
          </button>
        </nav>

        {/* Right Action & Utility Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Game Mode Select */}
          <div className="flex items-center p-0.5 bg-slate-800 border border-slate-700 rounded-lg text-xs">
            <button
              onClick={() => onSelectGameMode('vs_ai')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                gameMode === 'vs_ai' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'ضد الكمبيوتر' : 'VS Computer'}
            </button>
            <button
              onClick={() => onSelectGameMode('pass_and_play')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                gameMode === 'pass_and_play' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'لاعبان (تناوب)' : '2P Pass & Play'}
            </button>
            <button
              onClick={() => onSelectGameMode('solo_sandbox')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap hidden sm:inline-block ${
                gameMode === 'solo_sandbox' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'تدرّب حر' : 'Solo Sandbox'}
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors whitespace-nowrap font-['Cairo']"
          >
            {isAr ? 'English' : 'عربي'}
          </button>

          {/* Quick Restart */}
          <button
            onClick={onRestartGame}
            title={isAr ? 'لعبة جديدة' : 'New Game'}
            className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 text-[11px] text-slate-300 bg-slate-900/90 overflow-x-auto gap-1">
        <button onClick={onOpenDemo} className="flex items-center gap-1 text-blue-300 hover:text-white py-1 px-1.5 font-semibold shrink-0">
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isAr ? 'عرض' : 'Demo'}</span>
        </button>
        <button onClick={onOpenRules} className="flex items-center gap-1 hover:text-white py-1 px-1.5 shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>{isAr ? 'القواعد' : 'Rules'}</span>
        </button>
        <button onClick={onOpenMediaKit} className="flex items-center gap-1 text-amber-300 hover:text-white py-1 px-1.5 font-semibold shrink-0">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'الغلاف وGIF' : 'Cover/GIF'}</span>
        </button>
        <button onClick={onOpenManualPdf} className="flex items-center gap-1 text-indigo-300 hover:text-white py-1 px-1.5 font-semibold shrink-0">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isAr ? 'PDF' : 'PDF'}</span>
        </button>
        <button onClick={onOpenSampleBoard} className="flex items-center gap-1 hover:text-white py-1 px-1.5 shrink-0">
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isAr ? 'لوحة 2005' : '2005 Board'}</span>
        </button>
        <button onClick={onOpenReferee} className="flex items-center gap-1 hover:text-white py-1 px-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'الحكم' : 'Referee'}</span>
        </button>
      </div>
    </header>
  );
};
