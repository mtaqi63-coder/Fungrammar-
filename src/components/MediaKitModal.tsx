import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Film, Sparkles, Check, Package } from 'lucide-react';

import coverImg from '../assets/images/fun_grammar_cover_sq.png';
import gameplayImg from '../assets/images/grammar_board_sq.png';
import rackImg from '../assets/images/word_rack_sq.png';
import scoringImg from '../assets/images/grammar_scoring_sq.png';
import arenaImg from '../assets/images/multiplayer_arena_sq.png';

interface MediaKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

interface MediaAsset {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  previewSrc: string;
  downloadUrl: string;
  fileName: string;
  badgeEn: string;
  badgeAr: string;
}

export const MediaKitModal: React.FC<MediaKitModalProps> = ({ isOpen, onClose, language }) => {
  const isAr = language === 'ar';
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const coverAsset: MediaAsset = {
    id: 'cover',
    titleEn: 'Official Game Cover',
    titleAr: 'غلاف اللعبة الرسمي',
    descEn: '630×500 PNG promotional cover artwork ready for game portals and social feeds.',
    descAr: 'تصميم غلاف اللعبة الرسمي بصيغة PNG بمقاس 630×500 بكسل جاهز للنشر في منصات الألعاب.',
    previewSrc: coverImg,
    downloadUrl: './media/fun-grammar-cover.png',
    fileName: 'fun-grammar-cover.png',
    badgeEn: 'PNG Cover · 630×500',
    badgeAr: 'غلاف PNG · 630×500',
  };

  const gifAsset: MediaAsset = {
    id: 'gif',
    titleEn: 'Animated Game Intro (GIF)',
    titleAr: 'ملف التعريف المتحرك باللعبة (GIF)',
    descEn: 'Square 1:1 looping animated GIF slideshow introducing Fun Grammar rules, rack, multiplayer & scoring.',
    descAr: 'ملف GIF مربع متحرك (1:1) يعرض خطوات اللعب، الحامل، المنافسة، وطريقة احتساب النقاط.',
    previewSrc: './media/fun-grammar-intro.gif',
    downloadUrl: './media/fun-grammar-intro.gif',
    fileName: 'fun-grammar-intro.gif',
    badgeEn: 'Animated GIF · 1:1',
    badgeAr: 'GIF مربع · 1:1',
  };

  const galleryAssets: MediaAsset[] = [
    {
      id: 'gameplay',
      titleEn: 'Board & Sentence Intersections',
      titleAr: 'لوحة اللعب وتقاطع الجمل',
      descEn: '630×500 PNG board view showing intersecting blue & brown word tiles with valid sentence highlights.',
      descAr: 'صورة PNG بمقاس 630×500 تبرز لوحة اللعب وتقاطع الجمل الإنجليزية مع تمييز الجملة الصحيحة.',
      previewSrc: gameplayImg,
      downloadUrl: './media/fun-grammar-gameplay.png',
      fileName: 'fun-grammar-gameplay.png',
      badgeEn: 'PNG · 630×500',
      badgeAr: 'PNG · 630×500',
    },
    {
      id: 'rack',
      titleEn: '10-Word Rack & Tile Bank',
      titleAr: 'حامل الكلمات العشر والبطاقات',
      descEn: '630×500 PNG showcase of the white 10-word rack and bank word tiles.',
      descAr: 'صورة PNG بمقاس 630×500 لحامل الـ 10 كلمات والبطاقات الكاملة للّاعبين.',
      previewSrc: rackImg,
      downloadUrl: './media/fun-grammar-rack.png',
      fileName: 'fun-grammar-rack.png',
      badgeEn: 'PNG · 630×500',
      badgeAr: 'PNG · 630×500',
    },
    {
      id: 'scoring',
      titleEn: 'Scoring, Timer & Trophy',
      titleAr: 'احتساب النقاط والمؤقت والكأس',
      descEn: '630×500 PNG artwork highlighting character-count scoring, 60s turn timer, and rules.',
      descAr: 'صورة PNG بمقاس 630×500 توضح نظام النقاط بالحروف ومؤقت الدور وقواعد الفوز.',
      previewSrc: scoringImg,
      downloadUrl: './media/fun-grammar-scoring.png',
      fileName: 'fun-grammar-scoring.png',
      badgeEn: 'PNG · 630×500',
      badgeAr: 'PNG · 630×500',
    },
    {
      id: 'arena',
      titleEn: 'VS Computer & 2-Player Arena',
      titleAr: 'مباراة ضد الكمبيوتر أو لاعبين',
      descEn: '630×500 PNG match setup showing Player 1 (Blue) competing against Computer / Player 2.',
      descAr: 'صورة PNG بمقاس 630×500 لمباراة استراتيجية بين اللاعب الأول والكمبيوتر أو اللاعب الثاني.',
      previewSrc: arenaImg,
      downloadUrl: './media/fun-grammar-arena.png',
      fileName: 'fun-grammar-arena.png',
      badgeEn: 'PNG · 630×500',
      badgeAr: 'PNG · 630×500',
    },
  ];

  const handleDownloadAsset = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    asset: { id: string; downloadUrl: string; fileName: string; previewSrc?: string }
  ) => {
    e.preventDefault();
    try {
      const response = await fetch(asset.downloadUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = asset.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = asset.previewSrc || asset.downloadUrl;
      link.download = asset.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloadedId(asset.id);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>
                  {isAr ? 'غلاف اللعبة والصور التعريفية (GIF & صور)' : 'Game Cover, Intro GIF & Media Gallery'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'يمكنك معاينة وتنزيل غلاف اللعبة، ملف التعريف المتحرك GIF، والصور الترويجية مباشرة'
                  : 'Preview and download the official game cover, animated GIF intro, and promotional images'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="./media/fun-grammar-media-kit.zip"
              download="fun-grammar-media-kit.zip"
              onClick={(e) =>
                handleDownloadAsset(e, {
                  id: 'all-zip',
                  downloadUrl: './media/fun-grammar-media-kit.zip',
                  fileName: 'fun-grammar-media-kit.zip',
                })
              }
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all active:scale-95"
            >
              {downloadedId === 'all-zip' ? <Check className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
              <span>{isAr ? 'تحميل جميع الصور والغلاف (ZIP)' : 'Download All Media (ZIP)'}</span>
            </a>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Mobile Download All Button */}
          <a
            href="./media/fun-grammar-media-kit.zip"
            download="fun-grammar-media-kit.zip"
            onClick={(e) =>
              handleDownloadAsset(e, {
                id: 'all-zip',
                downloadUrl: './media/fun-grammar-media-kit.zip',
                fileName: 'fun-grammar-media-kit.zip',
              })
            }
            className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
          >
            {downloadedId === 'all-zip' ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            <span>{isAr ? 'تحميل جميع الصور والغلاف وملف GIF (ZIP)' : 'Download All Media (ZIP)'}</span>
          </a>

          {/* Top Highlight Grid: Cover & Animated Intro GIF */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Game Cover Card */}
            <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <div className="relative aspect-[630/500] bg-slate-900 overflow-hidden group">
                <img
                  src={coverAsset.previewSrc}
                  alt={isAr ? coverAsset.titleAr : coverAsset.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-amber-500/90 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3" />
                  <span>{isAr ? coverAsset.badgeAr : coverAsset.badgeEn}</span>
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-300">
                    {isAr ? coverAsset.titleAr : coverAsset.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr ? coverAsset.descAr : coverAsset.descEn}
                  </p>
                </div>
                <a
                  href={coverAsset.downloadUrl}
                  download={coverAsset.fileName}
                  onClick={(e) => handleDownloadAsset(e, coverAsset)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  {downloadedId === coverAsset.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isAr ? 'تم تنزيل الغلاف!' : 'Cover Downloaded!'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isAr ? 'تنزيل غلاف اللعبة (PNG)' : 'Download Game Cover (PNG)'}</span>
                    </>
                  )}
                </a>
              </div>
            </div>

            {/* Animated GIF Card */}
            <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <div className="relative aspect-square bg-slate-900 overflow-hidden group">
                <img
                  src={gifAsset.previewSrc}
                  alt={isAr ? gifAsset.titleAr : gifAsset.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-cyan-500/90 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow">
                  <Film className="w-3 h-3" />
                  <span>{isAr ? gifAsset.badgeAr : gifAsset.badgeEn}</span>
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300">
                    {isAr ? gifAsset.titleAr : gifAsset.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr ? gifAsset.descAr : gifAsset.descEn}
                  </p>
                </div>
                <a
                  href={gifAsset.downloadUrl}
                  download={gifAsset.fileName}
                  onClick={(e) => handleDownloadAsset(e, gifAsset)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  {downloadedId === gifAsset.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isAr ? 'تم تنزيل ملف GIF!' : 'GIF Downloaded!'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isAr ? 'تنزيل ملف التعريف المتحرك (GIF)' : 'Download Intro Slideshow (GIF)'}</span>
                    </>
                  )}
                </a>
              </div>
            </div>
          </div>

          {/* Various Downloadable Game Images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>{isAr ? 'صور متنوعة للعبة قابلة للتنزيل' : 'Different Game Showcase Images'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {isAr ? `${galleryAssets.length} صور بدقة عالية` : `${galleryAssets.length} High-Res Images`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {galleryAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-600 rounded-xl overflow-hidden flex flex-col transition-colors"
                >
                  <div className="relative aspect-[630/500] bg-slate-900 overflow-hidden group">
                    <img
                      src={asset.previewSrc}
                      alt={isAr ? asset.titleAr : asset.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/85 text-slate-200 border border-slate-700 font-mono text-[10px]">
                      {isAr ? asset.badgeAr : asset.badgeEn}
                    </span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                        {isAr ? asset.titleAr : asset.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {isAr ? asset.descAr : asset.descEn}
                      </p>
                    </div>
                    <a
                      href={asset.downloadUrl}
                      download={asset.fileName}
                      onClick={(e) => handleDownloadAsset(e, asset)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-semibold transition-all active:scale-95"
                    >
                      {downloadedId === asset.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isAr ? 'تم التنزيل!' : 'Downloaded!'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تنزيل الصورة (PNG)' : 'Download Image (PNG)'}</span>
                        </>
                      )}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
