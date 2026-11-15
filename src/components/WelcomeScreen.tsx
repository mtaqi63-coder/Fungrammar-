import React, { useState } from 'react';
import { Play, Languages, BookOpen, Sparkles, Award, Layers, Grid3X3, Copy, Check } from 'lucide-react';
import coverImg from '../assets/images/fun_grammar_cover_sq.png';
import { GAME_STORY_META, WELCOME_STORY_SHORT } from '../data/gameStoryAndGuide';
import { GameMode } from '../types/game';

interface WelcomeScreenProps {
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  onStartGame: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onToggleLanguage,
  gameMode,
  onSelectGameMode,
  onStartGame,
}) => {
  const isAr = language === 'ar';
  const [copied, setCopied] = useState(false);

  const storyTextToCopy = isAr
    ? [
        'قصة لعبة القواعد المرحة (Fun Grammar)',
        GAME_STORY_META.authorAr,
        GAME_STORY_META.registrationAr,
        '',
        WELCOME_STORY_SHORT.leadAr,
        ...WELCOME_STORY_SHORT.pointsAr.map((p) => `• ${p}`),
      ].join('\n')
    : [
        'The Story of Fun Grammar',
        GAME_STORY_META.authorEn,
        GAME_STORY_META.registrationEn,
        '',
        WELCOME_STORY_SHORT.leadEn,
        ...WELCOME_STORY_SHORT.pointsEn.map((p) => `• ${p}`),
      ].join('\n');

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(storyTextToCopy);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = storyTextToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif] ${
        isAr ? 'rtl' : 'ltr'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar with Brand & Language Toggle */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/75 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg border border-blue-400/40">
              <span className="font-extrabold text-white text-lg tracking-tighter">FG</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">Fun Grammar</span>
                {isAr && (
                  <span className="text-base font-bold text-blue-400 font-['Cairo']">
                    القواعد المرحة
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {isAr ? GAME_STORY_META.authorAr : GAME_STORY_META.authorEn}
              </span>
            </div>
          </div>

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 font-['Cairo']"
          >
            <Languages className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Welcome Hero Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Cover Image & Quick Game Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="relative max-w-lg mx-auto w-full rounded-2xl overflow-hidden border-2 border-amber-500/35 bg-slate-900 shadow-2xl group">
              <img
                src={coverImg}
                alt={isAr ? 'غلاف لعبة القواعد المرحة Fun Grammar' : 'Fun Grammar Official Game Cover'}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-[630/500]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isAr ? GAME_STORY_META.registrationAr : GAME_STORY_META.registrationEn}</span>
                </div>
              </div>
            </div>

            {/* Key Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <Layers className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-extrabold text-white">100</div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'بطاقة كلمة إنجليزية' : 'English Word Tiles'}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <Grid3X3 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-sm font-extrabold text-white">15×15</div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'لوحة متوسعة حتى 20×20' : 'Auto-Expanding Grid'}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-sm font-extrabold text-white">2005</div>
                <div className="text-[11px] text-slate-400">
                  {isAr ? 'ابتكار بحريني أصيل' : 'Bahrain Original'}
                </div>
              </div>
            </div>

            {/* Mode Selector & Start Game CTA */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {isAr ? 'اختر وضع اللعب:' : 'Choose Game Mode:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectGameMode('vs_ai')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      gameMode === 'vs_ai'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {isAr ? 'ضد الكمبيوتر' : 'VS Computer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGameMode('pass_and_play')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      gameMode === 'pass_and_play'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {isAr ? 'لاعبان (تناوب)' : '2P Pass & Play'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGameMode('solo_sandbox')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      gameMode === 'solo_sandbox'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {isAr ? 'تدرّب حر' : 'Solo Sandbox'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={onStartGame}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{isAr ? 'ابدأ اللعبة الآن' : 'Start Playing Now'}</span>
              </button>
            </div>
          </div>

          {/* Concise & Copyable Game Story Panel */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-white">
                      {isAr ? 'قصة اللعبة' : 'The Story of Fun Grammar'}
                    </h1>
                    <p className="text-xs text-slate-400">
                      {isAr ? 'ملخص موجز قابل للنسخ' : 'Concise summary · Ready to copy'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyStory}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer active:scale-95 ${
                    copied
                      ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white'
                  }`}
                  title={isAr ? 'نسخ نص القصة' : 'Copy story text'}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ القصة' : 'Copy Story'}</span>
                </button>
              </div>

              {/* Selectable & Copyable Story Body */}
              <div className="select-text cursor-text space-y-4">
                <div className="bg-slate-950/75 border border-amber-500/25 rounded-xl p-4">
                  <p className="text-sm sm:text-[15px] text-slate-100 leading-relaxed font-medium">
                    {isAr ? WELCOME_STORY_SHORT.leadAr : WELCOME_STORY_SHORT.leadEn}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {(isAr ? WELCOME_STORY_SHORT.pointsAr : WELCOME_STORY_SHORT.pointsEn).map((point, idx) => (
                    <li
                      key={idx}
                      className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600/25 border border-blue-500/40 text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 select-text">
              <span>{isAr ? GAME_STORY_META.authorAr : GAME_STORY_META.authorEn}</span>
              <span className="text-amber-400/90 font-medium">
                {isAr ? '© 2005 · رقم الإيداع 1213' : '© 2005 · Reg. No. 1213'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
