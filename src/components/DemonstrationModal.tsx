import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Layers,
  Award,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface DemonstrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ar';
}

interface DemoStep {
  id: number;
  titleEn: string;
  titleAr: string;
  badgeEn: string;
  badgeAr: string;
  descEn: string;
  descAr: string;
  ruleCitation: string;
  readingOrderNoteEn: string;
  readingOrderNoteAr: string;
  totalFrames: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    titleEn: '10-Word Rack & Scrolling Left/Right',
    titleAr: 'حامل الـ 10 كلمات والتمرير يميناً ويساراً',
    badgeEn: 'Rack Scrolling',
    badgeAr: 'تمرير الحامل',
    descEn:
      'Each player starts with 10 word tiles randomly drawn from the 100-word bank. On mobile and desktop, use the scroll arrows (< and >) or swipe horizontally to view all 10 tiles.',
    descAr:
      'يبدأ كل لاعب بـ 10 كلمات مسحوبة عشوائياً من بنك الـ 100 كلمة. استخدم أزرار الأسهم (< و >) أو اسحب أفقياً لتمرير الحامل ورؤية جميع الكلمات العشر كاملة.',
    ruleCitation: 'Rules 1 & 2',
    readingOrderNoteEn: 'Each tile shows its word and character points in the bottom corner.',
    readingOrderNoteAr: 'كل بطاقة تعرض الكلمة وعدد حروفها في الزاوية لاحتساب النقاط.',
    totalFrames: 4,
  },
  {
    id: 2,
    titleEn: 'Horizontal Sentences (Placement to the Right)',
    titleAr: 'الجمل الأفقية (الوضع نحو اليمين)',
    badgeEn: 'Read Left-to-Right',
    badgeAr: 'القراءة من اليسار إلى اليمين',
    descEn:
      'When placing tiles in a turn, the second tile is placed to the right of the first tile. Once placed to the right, the third and subsequent tiles must continue in that same direction. The sentence strictly reads Left to Right.',
    descAr:
      'عند وضع الكلمات في الدور، توضع الكلمة الثانية إلى يمين الكلمة الأولى. وبمجرد الوضع نحو اليمين، يجب أن تستمر الكلمة الثالثة والكلمات التالية في نفس الاتجاه. وتُقرأ الجملة بدقة من اليسار إلى اليمين.',
    ruleCitation: 'Rules 3, 4 & 11',
    readingOrderNoteEn: 'Strict Reading Order: Always read Left to Right (e.g. "He Has A Friend").',
    readingOrderNoteAr: 'اتجاه القراءة الصارم: دائماً من اليسار إلى اليمين فقط (مثال: "He Has A Friend").',
    totalFrames: 4,
  },
  {
    id: 3,
    titleEn: 'Vertical Sentences (Placement to the Bottom)',
    titleAr: 'الجمل العمودية (الوضع نحو الأسفل)',
    badgeEn: 'Read Up-to-Down',
    badgeAr: 'القراءة من الأعلى إلى الأسفل',
    descEn:
      'When placing tiles vertically, the second tile is placed to the bottom of the first tile. Once placed downwards, the third and subsequent tiles must continue in that same vertical direction. The sentence strictly reads Up to Down.',
    descAr:
      'عند وضع الكلمات رأسياً، توضع الكلمة الثانية إلى أسفل الكلمة الأولى. وبمجرد الوضع نحو الأسفل، يجب أن تستمر الكلمة الثالثة والكلمات التالية في نفس الاتجاه الرأسي. وتُقرأ الجملة بدقة من الأعلى إلى الأسفل.',
    ruleCitation: 'Rules 4, 10 & 11',
    readingOrderNoteEn: 'Strict Reading Order: Always read Up to Down (e.g. "Can He Be Good").',
    readingOrderNoteAr: 'اتجاه القراءة الصارم: دائماً من الأعلى إلى الأسفل فقط (مثال: "Can He Be Good").',
    totalFrames: 4,
  },
  {
    id: 4,
    titleEn: 'Single Tile Placement Beside Existing Tile',
    titleAr: 'وضع بطاقة واحدة بجانب بطاقة موجودة مسبقاً',
    badgeEn: '1-Tile Move',
    badgeAr: 'حركة ببطاقة واحدة',
    descEn:
      'You can place just ONE tile beside any existing tile (top, down, left, or right) to form a new valid sentence of 2+ words (e.g., adding "Morning" beside "Good" to make "Good Morning").',
    descAr:
      'يمكنك وضع بطاقة واحدة فقط بجانب أي بطاقة موجودة مسبقاً على اللوحة (أعلى، أسفل، يسار، أو يمين) لتكوين جملة جديدة من كلمتين أو أكثر (مثل إضافة "Morning" بجانب "Good" لتصبح "Good Morning").',
    ruleCitation: 'Rules 3 & 10',
    readingOrderNoteEn: 'Adding 1 tile creates a new sentence reading Left-to-Right or Up-to-Down.',
    readingOrderNoteAr: 'إضافة بطاقة واحدة تكوّن جملة تُقرأ من اليسار لليمين أو من الأعلى للأسفل.',
    totalFrames: 3,
  },
  {
    id: 5,
    titleEn: 'Full Stop "." Tile Chains Sentences',
    titleAr: 'بطاقة النقطة "." لربط وإنهاء الجمل',
    badgeEn: 'Rule 8 Chain',
    badgeAr: 'القاعدة 8 للربط',
    descEn:
      'The full stop "." tile ends an existing sentence and allows a new sentence to begin immediately on the very same row or column (e.g., "He Has A Friend . We Are Here").',
    descAr:
      'بطاقة النقطة "." تنهي الجملة السابقة وتبدأ جملة جديدة مباشرة على نفس السطر أو العمود (مثل: "He Has A Friend . We Are Here").',
    ruleCitation: 'Rule 8',
    readingOrderNoteEn: 'Sentences on both sides of the full stop "." are evaluated independently.',
    readingOrderNoteAr: 'تُقيّم الجمل على طرفي النقطة بشكل مستقل ويُحتسب مجموع حروفهما.',
    totalFrames: 3,
  },
  {
    id: 6,
    titleEn: 'Wildcards N3, N4, N5, N6 (Names)',
    titleAr: 'بطاقات الأسماء البديلة N3, N4, N5, N6',
    badgeEn: 'Wildcard Names',
    badgeAr: 'الأسماء البديلة',
    descEn:
      'Special name tiles represent any name matching the exact letter count: N3 (Ali, Tom), N4 (John, Mary), N5 (Sarah, David), N6 (Fatima, George). Score equals the letter count!',
    descAr:
      'بطاقات الأسماء تمثل أي اسم يطابق عدد حروفه الرقم المحدد: N3 (3 حروف مثل Ali)، N4 (4 حروف مثل John)، N5 (5 حروف مثل Sarah)، N6 (6 حروف مثل Fatima).',
    ruleCitation: 'Rule 9',
    readingOrderNoteEn: 'Clicking an N3-N6 tile opens the Name assigner dialog.',
    readingOrderNoteAr: 'الضغط على بطاقة N3-N6 يفتح نافذة تحديد الاسم المناسب.',
    totalFrames: 3,
  },
  {
    id: 7,
    titleEn: 'Scoring & Winning (Rules 11, 12 & 13)',
    titleAr: 'احتساب النقاط وإعلان الفائز (القواعد 11 و 12 و 13)',
    badgeEn: 'Victory Rules',
    badgeAr: 'شروط الفوز',
    descEn:
      'Score equals total letters in all words formed. If a word intersects both horizontal and vertical sentences, its letters count TWICE! When no more sentences can be formed, the highest total score wins.',
    descAr:
      'تحتسب النقاط بمجموع حروف كل الكلمات المتكونة. وإذا تقاطعت كلمة أفقياً وعمودياً تُحتسب حروفها مرتين! عند تعذر تكوين جمل جديدة، يفوز صاحب أكبر مجموع نقاط.',
    ruleCitation: 'Rules 6, 11, 12 & 13',
    readingOrderNoteEn: 'You can swap tiles with the bank (Rule 6) and pass turn if stuck.',
    readingOrderNoteAr: 'يمكنك تبديل بطاقاتك مع البنك (القاعدة 6) وتخطي الدور عند عدم توفر جملة.',
    totalFrames: 3,
  },
];

export const DemonstrationModal: React.FC<DemonstrationModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rackScrollOffset, setRackScrollOffset] = useState(0);
  const rackScrollRef = useRef<HTMLDivElement>(null);

  const isAr = language === 'ar';
  const step = DEMO_STEPS[currentStepIndex];

  // Reset or initialize when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentFrame(0);
      setIsPlaying(true);
      setRackScrollOffset(0);
    }
  }, [isOpen, currentStepIndex]);

  // Frame and Step Animation Timer (Runs ONLY when isOpen is true)
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        if (prevFrame + 1 >= step.totalFrames) {
          // Advance to next step smoothly after finishing frames
          setCurrentStepIndex((prevStep) => (prevStep + 1) % DEMO_STEPS.length);
          return 0;
        }
        return prevFrame + 1;
      });
    }, 1800); // 1.8 seconds per animation frame

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, step.totalFrames]);

  // Animated rack scrolling simulation for Step 1
  useEffect(() => {
    if (step.id === 1 && isOpen && isPlaying) {
      const scrollTimer = setInterval(() => {
        setRackScrollOffset((prev) => (prev === 0 ? 160 : prev === 160 ? 320 : 0));
      }, 1500);
      return () => clearInterval(scrollTimer);
    }
  }, [step.id, isOpen, isPlaying]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setCurrentFrame(0);
    setCurrentStepIndex((prev) => (prev + 1) % DEMO_STEPS.length);
  };

  const handlePrevStep = () => {
    setCurrentFrame(0);
    setCurrentStepIndex((prev) => (prev - 1 + DEMO_STEPS.length) % DEMO_STEPS.length);
  };

  const handleSelectStep = (index: number) => {
    setCurrentFrame(0);
    setCurrentStepIndex(index);
  };

  const handleReplay = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Play className="w-4 h-4 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {isAr ? 'عرض توضيحي لطريقة اللعب' : 'How to Play Demonstration'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/70 border border-blue-400/40 text-blue-300 font-mono shrink-0">
                  {step.ruleCitation}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {isAr
                  ? 'تعلم القواعد والاتجاهات الصارمة للقراءة (يسار-يمين، أعلى-أسفل)'
                  : 'Learn rules, strict reading orders (Left-Right, Up-Down) & mechanics'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close demonstration"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs Navigation */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 bg-slate-950/70 border-b border-slate-800 overflow-x-auto text-xs shrink-0 gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSelectStep(idx)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  idx === currentStepIndex
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{s.id}.</span>
                <span>{isAr ? s.badgeAr : s.badgeEn}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">
                {isPlaying ? (isAr ? 'إيقاف' : 'Pause') : isAr ? 'تشغيل' : 'Play'}
              </span>
            </button>
            <button
              onClick={handleReplay}
              title={isAr ? 'إعادة المشهد' : 'Replay Scene'}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Stage Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center gap-3 bg-slate-950/40">
          {/* Step Narrative Header */}
          <div className="w-full text-center space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
              <span>{isAr ? step.titleAr : step.titleEn}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              {isAr ? step.descAr : step.descEn}
            </p>
          </div>

          {/* Strict Reading Order Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-semibold shadow-inner">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {isAr ? step.readingOrderNoteAr : step.readingOrderNoteEn}
            </span>
          </div>

          {/* Interactive Visual Stage Canvas */}
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xl flex flex-col items-center gap-3">
            {/* SCENE 1: Rack Scroll Left / Right */}
            {step.id === 1 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full text-xs text-blue-300 font-semibold px-1">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span>{isAr ? 'حامل اللاعب: 10 كلمات كاملة' : 'Player Rack: 10 Word Tiles'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isAr ? 'مرر لرؤية الكل' : 'Scroll left & right'}
                  </span>
                </div>

                {/* Animated Simulated Rack with Interactive Left / Right buttons */}
                <div className="relative w-full flex items-center gap-1">
                  <button
                    onClick={() => setRackScrollOffset((prev) => Math.max(0, prev - 120))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 shadow-md"
                  >
                    ◀
                  </button>

                  <div
                    ref={rackScrollRef}
                    className="w-full bg-gradient-to-r from-amber-100 via-slate-100 to-amber-100 border-2 border-slate-300 rounded-xl p-2 flex items-center gap-2 overflow-x-auto shadow-inner transition-all scroll-smooth"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {[
                      { word: 'He', pts: 2 },
                      { word: 'Has', pts: 3 },
                      { word: 'A', pts: 1 },
                      { word: 'Friend', pts: 6 },
                      { word: 'We', pts: 2 },
                      { word: 'Are', pts: 3 },
                      { word: 'Here', pts: 4 },
                      { word: 'Good', pts: 4 },
                      { word: 'Morning', pts: 7 },
                      { word: 'N4', pts: 4 },
                    ].map((tile, i) => (
                      <div
                        key={i}
                        className={`shrink-0 w-12 h-12 rounded-lg bg-blue-700 border border-blue-500 text-white font-bold flex flex-col items-center justify-center shadow-md transition-all transform ${
                          i < 4 ? 'ring-2 ring-emerald-400 -translate-y-0.5' : ''
                        }`}
                      >
                        <span className="text-xs">{tile.word}</span>
                        <span className="text-[8px] font-mono text-blue-200">{tile.pts}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setRackScrollOffset((prev) => Math.min(300, prev + 120))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 shadow-md"
                  >
                    ▶
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-full justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {isAr
                      ? 'يمكنك تمرير الحامل يميناً ويساراً في أي وقت باللمس أو الأسهم'
                      : 'You can swipe or use arrows anytime to reveal all 10 rack tiles'}
                  </span>
                </div>
              </div>
            )}

            {/* SCENE 2: Horizontal Sentence Placement (Read Left to Right Only) */}
            {step.id === 2 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <ArrowRight className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span>
                    {isAr
                      ? 'قراءة أفقية: من اليسار إلى اليمين فقط'
                      : 'Strict Reading Direction: Left to Right Only'}
                  </span>
                </div>

                {/* Animated mini-grid */}
                <div className="grid grid-cols-5 gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                  {/* Row simulation */}
                  {[
                    { word: 'He', pts: 2, frameRequired: 0 },
                    { word: 'Has', pts: 3, frameRequired: 1 },
                    { word: 'A', pts: 1, frameRequired: 2 },
                    { word: 'Friend', pts: 6, frameRequired: 3 },
                    { word: '.', pts: 0, frameRequired: 3 },
                  ].map((tile, i) => {
                    const isVisible = currentFrame >= tile.frameRequired;
                    return (
                      <div
                        key={i}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isVisible
                            ? tile.word === '.'
                              ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-lg scale-100'
                              : 'bg-blue-600 border-2 border-emerald-400 text-white shadow-lg scale-100 ring-2 ring-emerald-500/40'
                            : 'bg-slate-900/60 border border-slate-800 text-slate-700 scale-95'
                        }`}
                      >
                        {isVisible && (
                          <>
                            <span className="text-xs sm:text-sm">{tile.word}</span>
                            {tile.word !== '.' && (
                              <span className="text-[9px] font-mono text-blue-200">{tile.pts}</span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  <span>✓ Sentence: "He Has A Friend"</span>
                  <span>Score: 2 + 3 + 1 + 6 = 12 pts</span>
                </div>
              </div>
            )}

            {/* SCENE 3: Vertical Sentence Placement (Read Up to Down Only) */}
            {step.id === 3 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                  <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>
                    {isAr
                      ? 'قراءة عمودية: من الأعلى إلى الأسفل فقط'
                      : 'Strict Reading Direction: Up to Down Only'}
                  </span>
                </div>

                {/* Vertical Column simulation */}
                <div className="flex flex-col items-center gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                  {[
                    { word: 'Can', pts: 3, frameRequired: 0 },
                    { word: 'He', pts: 2, frameRequired: 1 },
                    { word: 'Be', pts: 2, frameRequired: 2 },
                    { word: 'Good', pts: 4, frameRequired: 3 },
                  ].map((tile, i) => {
                    const isVisible = currentFrame >= tile.frameRequired;
                    return (
                      <div
                        key={i}
                        className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isVisible
                            ? 'bg-blue-600 border-2 border-cyan-400 text-white shadow-lg scale-100 ring-2 ring-cyan-500/30'
                            : 'bg-slate-900/60 border border-slate-800 text-slate-700 scale-95'
                        }`}
                      >
                        {isVisible && (
                          <>
                            <span className="text-xs sm:text-sm">{tile.word}</span>
                            <span className="text-[9px] font-mono text-cyan-200">{tile.pts}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                  <span>✓ Vertical: "Can He Be Good"</span>
                  <span>Score: 3 + 2 + 2 + 4 = 11 pts</span>
                </div>
              </div>
            )}

            {/* SCENE 4: Single Tile Placement Beside Existing Tile */}
            {step.id === 4 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {isAr
                      ? 'وضع بطاقة واحدة بجانب كلمة موجودة لتكوين جملة'
                      : 'Place 1 tile beside an existing word'}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                  {/* Pre-existing tile on board (Computer's tile in Brown) */}
                  <div className="w-18 h-14 rounded-lg bg-[#653312] border-2 border-[#8c4c1e] text-[#fff7ed] font-bold flex flex-col items-center justify-center shadow-lg px-1">
                    <span className="text-[9px] text-amber-200/90 font-semibold">{isAr ? 'الكمبيوتر (بني)' : 'Computer (Brown)'}</span>
                    <span className="text-sm font-extrabold text-white">Good</span>
                    <span className="text-[9px] font-mono text-amber-200">4 pts</span>
                  </div>

                  <span className="text-amber-400 font-bold text-lg">+</span>

                  {/* Single tile placed by Player (Blue) */}
                  <div
                    className={`w-18 h-14 rounded-lg bg-blue-600 border-2 border-emerald-400 text-white font-bold flex flex-col items-center justify-center shadow-lg px-1 transition-all duration-300 ${
                      currentFrame >= 1
                        ? 'scale-100 ring-2 ring-emerald-400 animate-in zoom-in'
                        : 'opacity-40 scale-90'
                    }`}
                  >
                    <span className="text-[9px] text-blue-200 font-semibold">{isAr ? 'أنت (أزرق)' : 'You (Blue)'}</span>
                    <span className="text-sm font-extrabold text-white">Morning</span>
                    <span className="text-[9px] font-mono text-blue-200">7 pts</span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  <span>✓ Left-to-Right: "Good Morning"</span>
                  <span>Score: 4 + 7 = 11 pts</span>
                </div>
              </div>
            )}

            {/* SCENE 5: Full Stop '.' */}
            {step.id === 5 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {isAr
                      ? 'القاعدة 8: النقطة تنهي وتبدأ جملة ثانية على نفس السطر'
                      : 'Rule 8: Full stop ends & chains a new sentence'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
                  <div className="px-2 py-1.5 rounded-lg bg-blue-900/60 border border-blue-500/50 text-xs font-semibold text-white whitespace-nowrap">
                    He Has A Friend
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-amber-300 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shrink-0 animate-pulse">
                    .
                  </div>
                  <div className="px-2 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/50 text-xs font-semibold text-white whitespace-nowrap">
                    We Are Here
                  </div>
                </div>

                <div className="text-xs text-slate-300 text-center">
                  {isAr
                    ? 'كل جملة تُقرأ من اليسار إلى اليمين ويُحسب مجموع حروف الجملتين معاً!'
                    : 'Each sentence is read Left to Right; total letters of both sentences are scored!'}
                </div>
              </div>
            )}

            {/* SCENE 6: Wildcards N3-N6 */}
            {step.id === 6 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {isAr
                      ? 'القاعدة 9: اختر أي اسم يطابق عدد الحروف'
                      : 'Rule 9: Choose any name matching character count'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-amber-600 border-2 border-amber-300 text-white font-extrabold flex flex-col items-center justify-center shadow-lg">
                    <span className="text-base font-mono">N4</span>
                    <span className="text-[9px] text-amber-200">4 letters</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                  <div className="w-16 h-16 rounded-xl bg-blue-600 border-2 border-emerald-400 text-white font-bold flex flex-col items-center justify-center shadow-lg">
                    <span className="text-sm">John</span>
                    <span className="text-[9px] font-mono text-emerald-200">4 pts</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 w-full">
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-mono font-bold">N3 (3 chars):</span> Ali, Tom,
                    Dan
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-mono font-bold">N4 (4 chars):</span> John,
                    Mary, Alex
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-mono font-bold">N5 (5 chars):</span> Sarah,
                    David, Peter
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-mono font-bold">N6 (6 chars):</span> Fatima,
                    George, Oliver
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 7: Victory & Scoring */}
            {step.id === 7 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>
                    {isAr
                      ? 'القاعدة 11 لاحتساب الحروف والقاعدة 13 لإعلان الفائز'
                      : 'Rule 11 Score & Rule 13 Victory'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-center space-y-1">
                    <div className="text-xs font-bold text-blue-200">
                      {isAr ? 'تقاطع الكلمات' : 'Crossing Words'}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {isAr ? 'الحروف تُحتسب مرتين في التقاطع' : 'Intersecting letters scored TWICE'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-center space-y-1">
                    <div className="text-xs font-bold text-amber-200">
                      {isAr ? 'إعلان الفائز' : 'Highest Sum Wins'}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {isAr ? 'أكبر مجموع نقاط في كل الجمل' : 'Sum of all characters formed'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 text-center">
                  {isAr
                    ? 'بعد كل حركة، يُعاد ملء حامل اللاعب تلقائياً إلى 10 كلمات حتى ينفد بنك الكلمات!'
                    : 'Your rack automatically refills to 10 words from the 100-tile bank after every move!'}
                </div>
              </div>
            )}

            {/* Visual Frame indicator dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {Array.from({ length: step.totalFrames }).map((_, fIdx) => (
                <div
                  key={fIdx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    fIdx === currentFrame
                      ? 'bg-blue-400 w-4'
                      : fIdx < currentFrame
                      ? 'bg-blue-700'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <button
            onClick={handlePrevStep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isAr ? 'السابق' : 'Previous'}</span>
          </button>

          <div className="text-xs text-slate-400 font-mono">
            {currentStepIndex + 1} / {DEMO_STEPS.length}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <span>{isAr ? 'التالي' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <span>{isAr ? 'ابدأ اللعب الآن' : 'Start Playing Now'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
