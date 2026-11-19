import React, { useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Award,
  Hash,
  ArrowRight,
  ArrowDown,
  Check,
} from 'lucide-react';
import { downloadGameDescriptionPdf } from '../utils/generateGamePdf';
import { TileSetView } from './TileSetView';

interface GameManualPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

export const GameManualPdfModal: React.FC<GameManualPdfModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'rules' | 'tiles'>('preview');

  if (!isOpen) return null;
  const isAr = language === 'ar';

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      downloadGameDescriptionPdf();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border border-blue-400/30">
              PDF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isAr ? 'كتيّب وصف اللعبة الرسمي' : 'Official Game Description & Manual'}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  PDF 2005
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'د. محمد تقي الخنيزي · تسجيل وزارة الإعلام بمملكة البحرين رقم 1213'
                  : 'Dr. Mohammed Taqi Alkhonaizi · Bahrain Ministry of Information Reg. 1213'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-md transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'تم التحميل!' : 'PDF Downloaded!'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 animate-bounce" />
                  <span>{isAr ? 'تحميل ملف PDF' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              title={isAr ? 'طباعة' : 'Print'}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-800 bg-slate-900/90 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'عرض الوثيقة الكاملة' : 'Full Document View'}</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'القواعد الـ 13 الرسمية' : '13 Official Rules'}</span>
          </button>
          <button
            onClick={() => setActiveTab('tiles')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'tiles'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'جرد الكلمات (109 بطاقة)' : '109 Tile Inventory'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-300 text-xs sm:text-sm">
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-wide">
                      FUN GRAMMAR
                    </span>
                    {isAr && (
                      <span className="text-lg sm:text-xl font-bold text-blue-400 font-['Cairo']">
                        القواعد المرحة
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Official Game Description, Component Specifications & Complete Rulebook
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Author & Creator: Dr. Mohammed Taqi Alkhonaizi · Bahrain Ministry of Information Reg. 1213 · © 2005
                  </p>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all shrink-0"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isAr ? 'تنزيل PDF الأصلي' : 'Save as PDF (.pdf)'}</span>
                </button>
              </div>

              {/* Section 1: Overview & Concept */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>1. Game Overview & Concept</span>
                </h3>
                <p className="leading-relaxed text-slate-300">
                  <strong>Fun Grammar</strong> is an authentic tabletop English grammar board game invented by{' '}
                  <strong className="text-white">Dr. Mohammed Taqi Alkhonaizi</strong> in 2005 (Bahrain Ministry of Information Reg. 1213). It transforms grammar instruction into a thrilling competitive word strategy game played on a 15×15 grid. Players hold racks of 10 word tiles and form grammatical English sentences horizontally (strictly Left-to-Right) or vertically (strictly Up-to-Down).
                </p>
              </div>

              {/* Section 2: Key Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2">
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Core Specifications</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>• <strong>Board:</strong> 15×15 grid (225 cells) with center star cell at Row 8, Col H (7,7).</li>
                    <li>• <strong>Tile Count:</strong> 109 tiles total (106 word cards including 9 WH-question tools + 3 "." full stop tiles).</li>
                    <li>• <strong>Rack Size:</strong> Exactly 10 tiles per player at all times.</li>
                    <li>• <strong>Players:</strong> 2 to 4 players, or solo training vs Computer.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Distinctive Game Mechanics</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>• <strong>Reading Order:</strong> Left-to-Right (Horizontal) or Up-to-Down (Vertical) strictly.</li>
                    <li>• <strong>Single Tile Placement:</strong> 1 tile can be placed beside an existing tile to form a sentence.</li>
                    <li>• <strong>Wildcards:</strong> N3, N4, N5, N6 represent custom proper names with 3–6 letters.</li>
                    <li>• <strong>Double Points:</strong> Words intersecting both horizontal & vertical lines score in both!</li>
                  </ul>
                </div>
              </div>

              {/* Section 3: Visual Examples */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Scoring & Placement Examples</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
                    <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Horizontal Placement</span>
                    </div>
                    <div className="font-mono text-white bg-slate-900/80 p-2 rounded mb-1 text-[11px]">
                      [ She ] [ Is ] [ Good ]
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Letters: 3 + 2 + 4 = <strong>9 Points</strong>. Read strictly left to right.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Vertical Branching</span>
                    </div>
                    <div className="font-mono text-white bg-slate-900/80 p-2 rounded mb-1 text-[11px]">
                      [ He ] ↓ [ Is ] ↓ [ Here ]
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Single tile or branch: "Is" shared at crossway scores in both sentences!
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/50">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Full Stop "." Chaining</span>
                    </div>
                    <div className="font-mono text-white bg-slate-900/80 p-2 rounded mb-1 text-[11px]">
                      [ He ] [ Was ] [ . ] [ Sara ] [ Is ]
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      The "." full stop ends sentence 1 and begins sentence 2 on the same line.
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Certificate */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-300">Authentic Registration:</span> Kingdom of Bahrain Ministry of Information Reg. No. 1213 · First Edition © 2005 Dr. Mohammed Taqi Alkhonaizi.
                </div>
                <button
                  onClick={handleDownloadPdf}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 ml-3"
                >
                  {isAr ? 'تحميل الوثيقة PDF' : 'Download Document PDF'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400">
                  {isAr ? 'القواعد الـ 13 الأصلية كما صاغها المؤلف' : 'The 13 Authentic Rules as Written by the Author'}
                </span>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصدير كـ PDF' : 'Export to PDF'}</span>
                </button>
              </div>

              {[
                { n: 1, en: 'Make all words face down randomly, this is the bank.', ar: 'اجعل كل الكلمات تشاهد الأرض عشوائيا، هذا هو البنك.' },
                { n: 2, en: 'Get 10 words for each player, replace all words if not mixed well.', ar: 'وزع 10 كلمات لكل لاعب، أعد التوزيع إذا لم تكن الخلطة مناسبة.' },
                { n: 3, en: 'Start with the player having a Longer sentence (by letter count, through center cell).', ar: 'يبدأ اللاعب الذي يستطيع تكوين أطول جملة من حيث عدد الحروف (تمر بالخلية المركزية).' },
                { n: 4, en: 'Sentence should be readable left to right or up down according to 1st player.', ar: 'يجب أن تقرأ الجملة من اليسار إلى اليمين أو من الأعلى للأسفل بالنسبة للاعب الذي ابتدأ اللعب.' },
                { n: 5, en: 'Substitute played words immediately from the bank to maintain 10 tiles.', ar: 'عوض كل الكلمات التي تم اللعب بها بسحب كلمات جديدة من البنك لتحافظ على 10 بطاقات.' },
                { n: 6, en: "Exchanging words from bank is possible but players' turn should be bypassed.", ar: 'يمكن استبدال الكلمات من البنك لكن دور اللاعب يجب أن يفوت.' },
                { n: 7, en: 'Refer to authenticated grammar book (British Council LearnEnglish Grammar) in case of dispute.', ar: 'يجب الرجوع لكتب القواعد المعتبرة (قواعد المجلس الثقافي البريطاني British Council LearnEnglish) في حالة المنازعات.' },
                { n: 8, en: 'The full stop "." allows new sentence to start or old one to finish on the same line.', ar: 'النقطة "." تنهي جملة سابقة وتبدأ جملة جديدة في نفس السطر أو العمود.' },
                { n: 9, en: 'N3, N4, N5, N6 = any name of your choice equivalent to 3, 4, 5 or 6 characters accordingly.', ar: 'N3, N4, N5, N6 = أي اسم من اختيارك يتكون من 3 أو 4 أو 5 أو 6 حروف حسب الترتيب.' },
                { n: 10, en: 'Expand horizontal or vertical at a time. 1 tile can be placed beside existing tiles.', ar: 'كون جملة أفقية أو عمودية واحدة في كل شوط. يمكن وضع بطاقة واحدة بجانب بطاقة موجودة.' },
                { n: 11, en: 'Score = no of characters in a sentence H/V, both if a word is inserted in cross ways.', ar: 'تحتسب النقاط بمجموع حروف الكلمات في كل جملة أفقيا أو عموديا أو إذا صادف تقاطع الاتجاهين.' },
                { n: 12, en: "Stop when it isn't possible to add new sentences and bank is empty.", ar: 'تنتهي اللعبة عندما لا يكون بالإمكان تكوين جمل جديدة وينفد البنك.' },
                { n: 13, en: 'Sum all scores for each player for each sentence formed. The winner is the player having highest sum.', ar: 'في النهاية اجمع نقاط كل لاعب في كل الأشواط لتحديد الفائز صاحب أكبر مجموع.' },
              ].map((rule) => (
                <div
                  key={rule.n}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                    {rule.n}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs sm:text-sm font-medium">{rule.en}</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-['Cairo']">{rule.ar}</p>
                  </div>
                </div>
              ))}

              {/* Complete Tile Set Displayed Right Below the Rules */}
              <div className="pt-4 border-t border-slate-800">
                <TileSetView language={language} />
              </div>
            </div>
          )}

          {activeTab === 'tiles' && (
            <div className="space-y-4">
              <TileSetView language={language} />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? 'ملف PDF متوافق للطباعة والحفظ' : 'Ready for A4 Print & PDF Archival'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>{isAr ? 'تحميل PDF الآن' : 'Download PDF Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
