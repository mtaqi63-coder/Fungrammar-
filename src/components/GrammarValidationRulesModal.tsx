import React, { useState, useMemo } from 'react';
import {
  X,
  BookCheck,
  FileDown,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import {
  GRAMMAR_RULES_META,
  VALIDATION_GRAMMAR_SECTIONS,
} from '../data/validationGrammarRules';
import {
  downloadGrammarValidationRulesPdf,
  downloadGrammarValidationRulesTxt,
} from '../utils/generateGrammarRulesPdf';

interface GrammarValidationRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

export const GrammarValidationRulesModal: React.FC<GrammarValidationRulesModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [viewLang, setViewLang] = useState<'en' | 'ar'>(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedType, setDownloadedType] = useState<string | null>(null);

  React.useEffect(() => {
    setViewLang(language);
  }, [language, isOpen]);

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return VALIDATION_GRAMMAR_SECTIONS;
    return VALIDATION_GRAMMAR_SECTIONS.filter((sec) => {
      const haystack = [
        sec.titleEn,
        sec.titleAr,
        sec.britishCouncilRefEn,
        sec.britishCouncilRefAr,
        sec.summaryEn,
        sec.summaryAr,
        ...sec.rulesEn,
        ...sec.rulesAr,
        ...sec.examples.map((e) => `${e.sentence} ${e.noteEn} ${e.noteAr}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const isAr = viewLang === 'ar';

  const handleDownloadPdf = () => {
    downloadGrammarValidationRulesPdf();
    setDownloadedType('pdf');
    setTimeout(() => setDownloadedType(null), 2200);
  };

  const handleDownloadTxt = () => {
    downloadGrammarValidationRulesTxt(viewLang);
    setDownloadedType('txt');
    setTimeout(() => setDownloadedType(null), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
              <BookCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {isAr ? GRAMMAR_RULES_META.titleAr : GRAMMAR_RULES_META.titleEn}
              </h2>
              <p className="text-xs text-cyan-300 font-medium">
                {isAr ? GRAMMAR_RULES_META.referenceAr : GRAMMAR_RULES_META.referenceEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-300 transition-colors font-['Cairo'] whitespace-nowrap shrink-0"
            >
              {isAr ? 'Read in English' : 'قراءة بالعربية'}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download & Search Toolbar */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث في القواعد (مثلاً: where, sister, there, doing)...'
                  : 'Search rules (e.g. where, sister, there, name)...'
              }
              className="w-full ps-9 pe-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Download Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {downloadedType === 'pdf' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>
                {downloadedType === 'pdf'
                  ? isAr
                    ? 'تم تنزيل PDF!'
                    : 'PDF Saved!'
                  : isAr
                  ? 'تحميل القواعد (PDF)'
                  : 'Download Grammar Rules (PDF)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {downloadedType === 'txt' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>
                {downloadedType === 'txt'
                  ? isAr
                    ? 'تم تنزيل TXT!'
                    : 'TXT Saved!'
                  : isAr
                  ? 'تحميل TXT'
                  : 'Download TXT'}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* Reference Banner */}
          <div className="bg-blue-950/35 border border-blue-700/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <span>{isAr ? GRAMMAR_RULES_META.sourceNoteAr : GRAMMAR_RULES_META.sourceNoteEn}</span>
          </div>

          {filteredSections.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {isAr ? 'لا توجد قواعد مطابقة لبحثك.' : 'No matching grammar rules found.'}
            </div>
          ) : (
            filteredSections.map((section) => (
              <section
                key={section.id}
                className="bg-slate-950/75 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {section.number}. {isAr ? section.titleAr : section.titleEn}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-cyan-300 font-medium mt-0.5">
                      {isAr ? section.britishCouncilRefAr : section.britishCouncilRefEn}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                  {isAr ? section.summaryAr : section.summaryEn}
                </p>

                <ul className="space-y-1.5">
                  {(isAr ? section.rulesAr : section.rulesEn).map((rule, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200 leading-snug"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>

                {/* Valid / Invalid Examples */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {section.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-2.5 border text-xs ${
                        ex.valid
                          ? 'bg-emerald-950/35 border-emerald-700/50 text-emerald-100'
                          : 'bg-rose-950/35 border-rose-700/50 text-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {ex.valid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="font-mono text-[12px]" dir="ltr">
                          "{ex.sentence}"
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {isAr ? ex.noteAr : ex.noteEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
