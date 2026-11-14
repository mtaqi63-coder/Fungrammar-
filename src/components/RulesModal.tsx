import React, { useState } from 'react';
import { X, ExternalLink, Image as ImageIcon, BookCheck, Shield, FileDown, Layers } from 'lucide-react';
import { downloadGameDescriptionPdf } from '../utils/generateGamePdf';
import { TileSetView } from './TileSetView';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, language }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'tiles_set' | 'board_photo' | 'tiles_photo'>('rules');

  if (!isOpen) return null;
  const isAr = language === 'ar';

  const officialRules = [
    {
      id: 1,
      en: 'Make all words face down randomly, this is the bank.',
      ar: 'اجعل كل الكلمات تشاهد الأرض عشوائيا، هذا هو البنك.',
    },
    {
      id: 2,
      en: 'Get 10 words for each player, replace all words if not mixed well.',
      ar: 'وزع 10 كلمات لكل لاعب، أعد التوزيع إذا لم تكن الخلطة مناسبة.',
    },
    {
      id: 3,
      en: 'Start with the player having a Longer sentence.',
      ar: 'يبدأ اللاعب الذي يستطيع تكوين أطول جملة من حيث عدد الحروف.',
    },
    {
      id: 4,
      en: 'Sentence should be readable left to right or up down according to 1st player.',
      ar: 'يجب أن تقرأ الجملة من اليسار إلى اليمين أو من الأعلى للأسفل بالنسبة للاعب الذي ابتدأ اللعب.',
    },
    {
      id: 5,
      en: 'Substitute played words.',
      ar: 'عوض كل الكلمات التي تم اللعب بها بسحب كلمات جديدة من البنك.',
    },
    {
      id: 6,
      en: "Exchanging words from bank is possible but players' turn should be bypassed.",
      ar: 'يمكن استبدال الكلمات من البنك لكن دور اللاعب يجب أن يفوت.',
    },
    {
      id: 7,
      en: 'Refer to authenticated grammar book in case of dispute.',
      ar: 'يجب الرجوع لكتب القواعد المعتبرة في حالة المنازعات.',
    },
    {
      id: 8,
      en: 'The full stop "." allows new sentence to start or old one to finish.',
      ar: 'النقطة "." تنهي جملة سابقة وتبدأ جملة جديدة.',
    },
    {
      id: 9,
      en: 'N3, N4, N5, N6 = any name of your choice equivalent to 3, 4, 5 or 6 characters accordingly.',
      ar: 'N3, N4, N5, N6 = أي اسم من اختيارك يتكون من 3 أو 4 أو 5 أو 6 حروف حسب الترتيب.',
    },
    {
      id: 10,
      en: 'Expand horizontal or vertical at a time.',
      ar: 'كون جملة أفقية أو عمودية واحدة في كل شوط.',
    },
    {
      id: 11,
      en: 'Score = no of characters in a sentence H/V, both if a word is inserted in cross ways.',
      ar: 'تحتسب النقاط بمجموع حروف الكلمات في كل جملة أفقيا أو عموديا أو إذا صادف تقاطع الاتجاهين.',
    },
    {
      id: 12,
      en: "Stop when it isn't possible to add new sentences.",
      ar: 'تنتهي اللعبة عندما لا يكون بالإمكان تكوين جمل جديدة.',
    },
    {
      id: 13,
      en: 'Sum all scores for each player for each sentence formed. The winner is the player having the highest sum.',
      ar: 'في النهاية اجمع نقاط كل لاعب في كل الأشواط لتحديد الفائز صاحب أكبر مجموع.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              FG
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'Fun Grammar · القواعد المرحة' : 'Fun Grammar'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-normal">
                  © 2005
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Author & Design: Dr. Mohammed Taqi Alkhonaizi · Bahrain Ministry of Information Reg. 1213
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadGameDescriptionPdf()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل كتيّب PDF' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookCheck className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'قواعد اللعبة (13 قاعدة)' : 'Official Game Rules (13 Rules)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tiles_set')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'tiles_set'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'مجموعة البطاقات (100 بطاقة)' : 'Complete Tile Set (100 Tiles)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('board_photo')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'board_photo'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'صورة اللوحة الأصلية' : 'Original Board Photo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tiles_photo')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'tiles_photo'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'صورة البطاقات والحوامل' : 'Original Tiles & Racks Photo'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    {isAr ? 'فكرة اللعبة والهدف التعليمي' : 'Game Concept & Educational Mission'}
                  </h4>
                  <p className="leading-relaxed">
                    {isAr
                      ? 'القواعد المرحة هي لعبة طاولة تعليمية تشبه لعبة سكرابل لكنها مبنية على تركيب الجمل الإنجليزية الصحيحة نحوياً باستخدام بطاقات الكلمات المتقاطعة وحساب النقاط بعدد حروف الجمل المتكونة.'
                      : 'Fun Grammar is an educational board game created by Dr. Mohammed Taqi Alkhonaizi. Players interlock word tiles to build grammatically correct English sentences. Scoring is based on the total number of characters in all newly formed horizontal and vertical sentences.'}
                  </p>
                </div>
              </div>

              {/* 13 Rules List */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <BookCheck className="w-4 h-4 text-blue-400" />
                  <span>{isAr ? 'القواعد الرسمية الـ 13 (2005)' : 'The 13 Official Rules (2005)'}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {officialRules.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-mono font-bold text-xs text-blue-300 shrink-0">
                        {r.id}
                      </span>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-100">{r.en}</p>
                        <p className="text-xs text-slate-400 font-['Cairo'] text-right" dir="rtl">
                          {r.ar}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Tile Set Displayed Right Below the Rules */}
              <div className="pt-2">
                <TileSetView language={language} />
              </div>
            </div>
          )}

          {activeTab === 'tiles_set' && (
            <div className="space-y-4">
              <TileSetView language={language} />
            </div>
          )}

          {activeTab === 'board_photo' && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-xs text-slate-400 text-center">
                {isAr
                  ? 'الصورة الأصلية للوحة اللعبة والقواعد المطبوعة باللغتين العربية والإنجليزية مسجلة بوزارة الإعلام بمملكة البحرين.'
                  : 'Original photograph of the official game board with English and Arabic rules printed on either side.'}
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
                <img
                  src="./assets/aistudio/20261022_230101_288b1234.jpg"
                  alt="Original Fun Grammar Board and Rules"
                  className="max-h-[60vh] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {activeTab === 'tiles_photo' && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-xs text-slate-400 text-center">
                {isAr
                  ? 'صورة بطاقات الكلمات الزرقاء الـ 100 مع حوامل الكلمات البيضاء وغلاف اللعبة للأعمار من 8 سنوات فما فوق.'
                  : 'Original photograph showing the 100 blue word tile sheets, 4 white player racks, and package cover.'}
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
                <img
                  src="./assets/aistudio/20261022_230037_2fd1ca63.jpg"
                  alt="Original Fun Grammar Tiles and Racks"
                  className="max-h-[60vh] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
