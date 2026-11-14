import React from 'react';
import { X, Play, CheckCircle2, LayoutGrid, Info } from 'lucide-react';

interface OriginalLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadLayout: () => void;
  language: 'en' | 'ar';
}

export const OriginalLayoutModal: React.FC<OriginalLayoutModalProps> = ({
  isOpen,
  onClose,
  onLoadLayout,
  language,
}) => {
  if (!isOpen) return null;
  const isAr = language === 'ar';

  const authenticSentences = [
    { text: 'Your Name Is Sarah', score: 15, direction: 'Horizontal' },
    { text: 'He Has A Friend . We Are Here', score: 23, direction: 'Horizontal' },
    { text: 'We Were There In The Morning', score: 24, direction: 'Horizontal' },
    { text: 'My Mother Is Young', score: 16, direction: 'Horizontal' },
    { text: 'It Was A Good Night', score: 17, direction: 'Horizontal' },
    { text: 'The Sister Is Not Down', score: 19, direction: 'Horizontal' },
    { text: 'These Are For Them', score: 15, direction: 'Horizontal' },
    { text: 'The Father Is Old', score: 15, direction: 'Horizontal' },
    { text: 'You Were Bad To Him', score: 15, direction: 'Horizontal' },
    { text: 'Some body Is Not Up', score: 16, direction: 'Horizontal' },
    { text: 'Can Do Some thing Is Small', score: 23, direction: 'Horizontal' },
    { text: 'I Am John', score: 7, direction: 'Horizontal' },
    { text: 'Will Be Big', score: 9, direction: 'Horizontal' },
    { text: 'Those Have Some body', score: 17, direction: 'Horizontal' },
    { text: 'Name A Thing .', score: 10, direction: 'Horizontal' },
    { text: 'That Is Down', score: 10, direction: 'Vertical' },
    { text: 'Is His Mother Young', score: 16, direction: 'Vertical' },
    { text: 'Does Some thing', score: 13, direction: 'Vertical' },
    { text: 'N6 . They Did', score: 13, direction: 'Vertical' },
  ];

  const totalScoreSample = authenticSentences.reduce((acc, s) => acc + s.score, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'لوحة اللعبة النموذجية الأصلية (2005)' : "Dr. Taqi's Official 2005 Sample Board"}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'نموذج الجمل المتشابكة المطبوع في اللعبة الأصلية وكيفية حساب نقاطها'
                  : 'The authentic intersecting sentence board from the original game photo'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {isAr
                ? 'في الصورة رقم 1، قام المؤلف بتركيب شبكة نموذجية من الجمل المتشابكة توضح تطبيق القاعدة 11 (احتساب مجموع الحروف) والقاعدة 8 (استخدام النقطة لفصل الجمل) والقاعدة 9 (استبدال N3-N6 بأسماء أشخاص).'
                : 'In Photo 1, the author demonstrates an authentic completed board showing Rule 11 (scoring character sums), Rule 8 (using full stop to start new sentences), and Rule 9 (wildcard names N3-N6). Total sample board score: ~300+ characters!'}
            </p>
          </div>

          {/* List of Sentences */}
          <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
            {authenticSentences.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">"{s.text}"</span>
                  <span className="text-[10px] text-slate-500 font-mono">({s.direction})</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-emerald-300">
                  <span>+{s.score}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{isAr ? 'نقطة' : 'pts'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div className="text-xs text-slate-400 font-mono">
              <span>{isAr ? 'إجمالي النقاط:' : 'Total Formed Score:'} </span>
              <span className="font-bold text-white text-sm">+{totalScoreSample} pts</span>
            </div>

            <button
              onClick={() => {
                onLoadLayout();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isAr ? 'تحميل هذه اللوحة إلى الملعب' : 'Load Layout onto Board'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
