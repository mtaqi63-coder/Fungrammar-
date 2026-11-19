import React, { useState } from 'react';
import {
  Play,
  Languages,
  BookOpen,
  Sparkles,
  Award,
  Layers,
  Grid3X3,
  Copy,
  Check,
  BookCheck,
  FileDown,
  Mail,
  Globe,
  ScrollText,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import coverImg from '../assets/images/fun_grammar_cover_sq.png';
import { GAME_STORY_META, WELCOME_STORY_SHORT } from '../data/gameStoryAndGuide';
import { TOTAL_BANK_TILES } from '../data/tiles';
import { GameMode } from '../types/game';

interface WelcomeScreenProps {
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenGrammarRules: () => void;
  onOpenStory: () => void;
  onOpenMediaKit: () => void;
  onDownloadZip: (e: React.MouseEvent) => void;
  worldwideVisits: number | null;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onToggleLanguage,
  gameMode,
  onSelectGameMode,
  onStartGame,
  onOpenGrammarRules,
  onOpenStory,
  onOpenMediaKit,
  onDownloadZip,
  worldwideVisits,
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
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg border border-blue-400/40 shrink-0">
              <span className="font-extrabold text-white text-base tracking-tighter">FG</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                  Fun Grammar
                </span>
                {isAr && (
                  <span className="text-sm sm:text-base font-bold text-blue-400 font-['Cairo'] leading-tight">
                    القواعد المرحة
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {isAr ? GAME_STORY_META.authorAr : GAME_STORY_META.authorEn}
              </span>
            </div>
          </div>

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 font-['Cairo'] shrink-0"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Welcome Hero Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col justify-start lg:justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-start lg:items-stretch">
          {/* Cover Image & Quick Game Highlights + Mode & Start Playing CTA */}
          <div className="lg:col-span-6 flex flex-col justify-start gap-2 sm:gap-2.5">
            <div className="relative max-w-[300px] sm:max-w-[360px] lg:max-w-[390px] mx-auto w-full rounded-xl overflow-hidden border-2 border-amber-500/35 bg-slate-900 shadow-2xl group">
              <img
                src={coverImg}
                alt={isAr ? 'غلاف لعبة القواعد المرحة Fun Grammar' : 'Fun Grammar Official Game Cover'}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-[630/500]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent px-3 py-2 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isAr ? GAME_STORY_META.registrationAr : GAME_STORY_META.registrationEn}</span>
                </div>
              </div>
            </div>

            {/* Key Stats Cards */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 text-center">
                <Layers className="w-4 h-4 text-cyan-400 mx-auto mb-0.5" />
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">{TOTAL_BANK_TILES}</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {isAr ? 'بطاقة كلمة إنجليزية' : 'English Word Tiles'}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 text-center">
                <Grid3X3 className="w-4 h-4 text-emerald-400 mx-auto mb-0.5" />
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">15×15</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {isAr ? 'لوحة تتوسع تلقائياً' : 'Auto-Expanding Grid'}
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 text-center">
                <Sparkles className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">2005</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {isAr ? 'ابتكار بحريني أصيل' : 'Bahrain Original'}
                </div>
              </div>
            </div>

            {/* Mode Selector & Start Game CTA */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 shadow-xl">
              <div className="space-y-1">
                <label className="block text-[11px] sm:text-xs font-bold text-slate-300">
                  {isAr ? 'اختر وضع اللعب:' : 'Choose Game Mode:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectGameMode('vs_ai')}
                    className={`py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
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
                    className={`py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
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
                    className={`py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold border transition-all ${
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
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span>{isAr ? 'ابدأ اللعبة الآن' : 'Start Playing Now'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenGrammarRules}
                className="w-full py-2 px-3 rounded-xl bg-blue-950/75 hover:bg-blue-900/85 border border-blue-500/50 text-blue-100 font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                title={
                  isAr
                    ? 'عرض وتحميل جميع قواعد اللغة الإنجليزية المستخدمة للتحقق من الجمل'
                    : 'View and download all English grammar validation rules used by the referee'
                }
              >
                <BookCheck className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>
                  {isAr
                    ? 'عرض وتحميل جميع قواعد التحقق النحوية'
                    : 'Show & Download All Grammar Rules'}
                </span>
                <FileDown className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* Concise & Copyable Game Story Panel */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                      {isAr ? 'قصة اللعبة' : 'The Story of Fun Grammar'}
                    </h1>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'ملخص موجز قابل للنسخ' : 'Concise summary · Ready to copy'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyStory}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all shrink-0 cursor-pointer active:scale-95 ${
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
              <div className="select-text cursor-text space-y-2.5">
                <div className="bg-slate-950/75 border border-amber-500/25 rounded-xl p-3">
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                    {isAr ? WELCOME_STORY_SHORT.leadAr : WELCOME_STORY_SHORT.leadEn}
                  </p>
                </div>

                <ul className="space-y-1.5 sm:space-y-2">
                  {(isAr ? WELCOME_STORY_SHORT.pointsAr : WELCOME_STORY_SHORT.pointsEn).map((point, idx) => (
                    <li
                      key={idx}
                      className="bg-slate-950/60 border border-slate-800/90 rounded-lg p-2.5 flex items-start gap-2 text-xs sm:text-[13px] text-slate-300 leading-snug"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-600/25 border border-blue-500/40 text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 select-text">
              <span>{isAr ? GAME_STORY_META.authorAr : GAME_STORY_META.authorEn}</span>
              <span className="text-amber-400/90 font-medium">
                {isAr ? '© 2005 · رقم الإيداع 1213' : '© 2005 · Reg. No. 1213'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer moved from Page 2: Feedback email, Worldwide Visits, Story/Media/ZIP & Copyright */}
      <footer className="relative z-10 w-full bg-slate-900/90 border-t border-slate-800 py-3 px-4 text-center text-xs text-slate-400 mt-auto select-none">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          {/* Email Feedback */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium">
                {isAr ? 'لإرسال الآراء والملاحظات:' : 'To send feedback or suggestions:'}
              </span>
            </div>
            <a
              href="mailto:Mtk6300@hotmail.com?subject=Fun%20Grammar%20Game%20Feedback"
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400 transition-colors flex items-center gap-1"
            >
              <span>Mtk6300@hotmail.com</span>
            </a>
          </div>

          {/* Worldwide Page Visits Counter */}
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs shadow-xs"
            title={
              isAr
                ? 'عدد مرات زيارة وتصفح اللعبة حول العالم'
                : 'Total number of times the game page is visited worldwide'
            }
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 font-medium">
              {isAr ? 'الزيارات حول العالم:' : 'Worldwide Visits:'}
            </span>
            <span className="font-mono font-extrabold text-cyan-300 tabular-nums">
              {worldwideVisits !== null ? worldwideVisits.toLocaleString() : '...'}
            </span>
          </div>

          {/* Story, Cover/Media Kit & Download Game ZIP Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenStory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              title={isAr ? 'قراءة وتنزيل قصة اللعبة وشرحها الكامل' : 'Read & download the game story and complete explanation'}
            >
              <ScrollText className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? 'قصة اللعبة وشرحها' : 'Game Story & Guide'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenMediaKit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              title={isAr ? 'معاينة وتنزيل غلاف اللعبة وملف التعريف المتحرك GIF والصور' : 'Preview & download game cover, intro GIF, and promotional images'}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? 'الغلاف والصور و GIF' : 'Cover, GIF & Images'}</span>
            </button>

            <a
              href="./fun-grammar-game.zip"
              download="fun-grammar-game.zip"
              onClick={onDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              title={isAr ? 'تحميل ملف اللعبة المضغوط (ZIP) لرفعه على منصات الألعاب' : 'Download game ZIP file to upload to game platforms'}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? 'تحميل ملف اللعبة (ZIP)' : 'Download Game ZIP'}</span>
            </a>
          </div>

          {/* Copyright */}
          <span className="text-slate-500 text-[11px]">
            {isAr
              ? 'ابتكار: د. محمد تقي الخنيزي (البحرين © 2005)'
              : 'Invented by Dr. Mohammed Taqi Alkhonaizi (Bahrain © 2005)'}
          </span>
        </div>
      </footer>
    </div>
  );
};
