import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileDown,
  FileText,
  FileCode,
  Sparkles,
  History,
  Compass,
  Check,
  Award,
} from 'lucide-react';
import {
  GAME_STORY_META,
  STORY_CHAPTERS,
  GUIDE_SECTIONS,
} from '../data/gameStoryAndGuide';
import {
  downloadStoryAndGuidePdf,
  downloadStoryAndGuideHtml,
  downloadStoryAndGuideTxt,
} from '../utils/generateStoryPdf';

interface StoryAndGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

export const StoryAndGuideModal: React.FC<StoryAndGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [viewLang, setViewLang] = useState<'en' | 'ar'>(language);
  const [activeTab, setActiveTab] = useState<'story' | 'guide'>('story');
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadedType, setDownloadedType] = useState<string | null>(null);

  React.useEffect(() => {
    setViewLang(language);
  }, [language, isOpen]);

  if (!isOpen) return null;

  const isAr = viewLang === 'ar';

  const handleDownloadPdf = async () => {
    setDownloadingType('pdf');
    try {
      await downloadStoryAndGuidePdf(viewLang);
      setDownloadedType('pdf');
      setTimeout(() => setDownloadedType(null), 2200);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadHtml = () => {
    downloadStoryAndGuideHtml();
    setDownloadedType('html');
    setTimeout(() => setDownloadedType(null), 2200);
  };

  const handleDownloadTxt = () => {
    downloadStoryAndGuideTxt(viewLang);
    setDownloadedType('txt');
    setTimeout(() => setDownloadedType(null), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>
                  {isAr
                    ? 'قصة لعبة القواعد المرحة وشرحها الكامل'
                    : 'Fun Grammar — Story & Complete Guide'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? GAME_STORY_META.registrationAr : GAME_STORY_META.registrationEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch reading/download language inside modal */}
            <button
              onClick={() => setViewLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-300 transition-colors font-['Cairo']"
            >
              {isAr ? 'Read in English' : 'قراءة بالعربية'}
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Toolbar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">
              {isAr ? 'تنزيل القصة والشرح:' : 'Download Story & Guide:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingType === 'pdf'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all active:scale-95 disabled:opacity-60"
            >
              {downloadedType === 'pdf' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>
                {downloadingType === 'pdf'
                  ? isAr
                    ? 'جارٍ تجهيز PDF...'
                    : 'Generating PDF...'
                  : downloadedType === 'pdf'
                  ? isAr
                    ? 'تم تنزيل PDF!'
                    : 'PDF Saved!'
                  : isAr
                  ? 'تنزيل PDF'
                  : 'Download PDF'}
              </span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active:scale-95"
            >
              {downloadedType === 'html' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileCode className="w-3.5 h-3.5" />
              )}
              <span>
                {downloadedType === 'html'
                  ? isAr
                    ? 'تم التنزيل!'
                    : 'Saved!'
                  : isAr
                  ? 'تنزيل كتيّب HTML (عربي + إنجليزي)'
                  : 'Download Bilingual HTML'}
              </span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
            >
              {downloadedType === 'txt' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isAr ? 'ملف نصي TXT' : 'TXT File'}</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 sm:px-6 gap-3 pt-2">
          <button
            onClick={() => setActiveTab('story')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'story'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isAr ? 'قصة اللعبة ونشأتها' : 'Game Story & Origin'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isAr ? 'شرح اللعبة وطريقة اللعب' : 'How to Play & Explanation'}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 ${isAr ? "font-['Cairo']" : ''}`}>
          {/* Top Author Hero Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Award className="w-4 h-4" />
                <span>{isAr ? GAME_STORY_META.authorAr : GAME_STORY_META.authorEn}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {isAr ? 'Fun Grammar · القواعد المرحة' : 'Fun Grammar'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-200">
                {isAr ? GAME_STORY_META.subtitleAr : GAME_STORY_META.subtitleEn}
              </p>
            </div>
          </div>

          {activeTab === 'story' ? (
            <div className="space-y-4">
              {STORY_CHAPTERS.map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition-colors space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-blue-300">
                      {isAr ? ch.titleAr : ch.titleEn}
                    </h4>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {isAr ? ch.eraAr : ch.eraEn}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isAr ? ch.bodyAr : ch.bodyEn}
                  </p>
                </div>
              ))}

              {/* Prompt to switch to Guide tab */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setActiveTab('guide')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isAr ? 'انتقل إلى شرح طريقة اللعب ➔' : 'Next: Complete How-to-Play Guide ➔'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {GUIDE_SECTIONS.map((sec) => (
                <div
                  key={sec.id}
                  className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-3"
                >
                  <h4 className="text-sm sm:text-base font-bold text-emerald-300">
                    {isAr ? sec.titleAr : sec.titleEn}
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    {(isAr ? sec.pointsAr : sec.pointsEn).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  {(isAr ? sec.exampleAr : sec.exampleEn) && (
                    <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs sm:text-sm font-semibold text-blue-200">
                      {isAr ? sec.exampleAr : sec.exampleEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
