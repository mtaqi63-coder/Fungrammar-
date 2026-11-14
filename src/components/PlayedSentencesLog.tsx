import React, { useState } from 'react';
import { Player, PlayedSentenceRecord } from '../types/game';
import { BookOpen, Bot, User, ArrowRight, ArrowDown, Sparkles, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';

interface PlayedSentencesLogProps {
  players: Player[];
  language: 'en' | 'ar';
}

interface EnrichedSentenceRecord extends PlayedSentenceRecord {
  playerName: string;
  playerNameAr: string;
  isAi: boolean;
  avatarColor: string;
}

export const PlayedSentencesLog: React.FC<PlayedSentencesLogProps> = ({ players, language }) => {
  const isAr = language === 'ar';
  const [filter, setFilter] = useState<'all' | 'p1' | 'ai'>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Collect and sort all sentences formed chronologically
  const allSentences: EnrichedSentenceRecord[] = [];
  players.forEach((p) => {
    p.sentencesFormed.forEach((s) => {
      allSentences.push({
        ...s,
        playerName: p.name,
        playerNameAr: p.nameAr,
        isAi: p.isAi,
        avatarColor: p.avatarColor,
      });
    });
  });

  // Sort descending by turn so latest sentences appear first
  allSentences.sort((a, b) => b.turn - a.turn);

  const filteredSentences = allSentences.filter((s) => {
    if (filter === 'p1') return !s.isAi;
    if (filter === 'ai') return s.isAi;
    return true;
  });

  return (
    <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-850/90 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isAr ? 'الجمل الملعوبة وقواعد النحو' : 'Played Sentences & Grammar Rules'}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shadow-xs">
                <PlayCircle className="w-3 h-3 text-indigo-400" />
                <span>{isAr ? `${allSentences.length} لعبات` : `${allSentences.length} Plays`}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'عرض القواعد النحوية المعتمدة لكل جملة تم تكوينها'
                : 'Grammatical rules & structural analysis for every played sentence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setFilter('p1')}
              className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                filter === 'p1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>{isAr ? 'أنت' : 'You'}</span>
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                filter === 'ai'
                  ? 'bg-[#78350f] text-amber-100 shadow-xs'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{isAr ? 'الكمبيوتر' : 'Computer'}</span>
            </button>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isCollapsed ? (isAr ? 'توسيع' : 'Expand') : isAr ? 'طي' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 max-h-72 overflow-y-auto space-y-2.5">
          {filteredSentences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
              <Sparkles className="w-6 h-6 text-indigo-400/50 mb-1.5" />
              <p className="text-xs font-semibold text-slate-300">
                {isAr ? 'لم يتم تكوين أي جمل بعد' : 'No sentences played yet'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                {isAr
                  ? 'ضع الكلمات على اللوحة لتشكيل جملة والاطلاع على قاعدتها النحوية هنا.'
                  : 'Place tiles on the board to form a sentence and see its validated grammar rule breakdown.'}
              </p>
            </div>
          ) : (
            filteredSentences.map((rec, index) => {
              const isAi = rec.isAi;
              return (
                <div
                  key={`${rec.playerId || (isAi ? 'ai' : 'p1')}-${rec.turn}-${index}`}
                  className={`p-3 rounded-xl border transition-all ${
                    isAi
                      ? 'bg-[#2a1608]/70 border-[#8c4c1e]/60 hover:border-[#b45309]'
                      : 'bg-blue-950/40 border-blue-600/50 hover:border-blue-500'
                  }`}
                >
                  {/* Top line: Player info & badges */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isAi
                            ? 'bg-[#78350f] text-amber-200 border border-[#92400e]'
                            : 'bg-blue-600 text-white border border-blue-400'
                        }`}
                      >
                        {isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isAi ? 'text-amber-200' : 'text-blue-200'
                        }`}
                      >
                        {isAr ? rec.playerNameAr : rec.playerName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isAr ? `الدور ${rec.turn}` : `Turn ${rec.turn}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rec.direction && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono flex items-center gap-1">
                          {rec.direction === 'horizontal' ? (
                            <>
                              <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{isAr ? 'أفقي' : 'H'}</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="w-2.5 h-2.5 text-cyan-400" />
                              <span>{isAr ? 'رأسي' : 'V'}</span>
                            </>
                          )}
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                        +{rec.score} {isAr ? 'نقاط' : 'pts'}
                      </span>
                    </div>
                  </div>

                  {/* Sentence Text */}
                  <div className="text-sm sm:text-base font-extrabold text-white tracking-wide mb-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                    "{rec.text}"
                  </div>

                  {/* Grammar Rule & Explanation */}
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 shrink-0">
                        {isAr ? 'القاعدة:' : 'Rule:'}
                      </span>
                      <span className="font-semibold text-amber-200">
                        {rec.ruleName || (isAr ? 'بنية نحوية مكتملة (فاعل + فعل + مكمل)' : 'Subject-Verb-Complement Construction')}
                      </span>
                    </div>
                    {rec.ruleExplanation && (
                      <p className="text-[11px] text-slate-300 bg-slate-900/70 p-2 rounded-md border border-slate-800 leading-relaxed font-sans">
                        {rec.ruleExplanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
