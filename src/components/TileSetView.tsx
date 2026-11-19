import React, { useState, useMemo } from 'react';
import { TILE_DEFINITIONS } from '../data/tiles';
import { TileCategory } from '../types/game';
import { Search, Layers, Sparkles, Filter, Hash, Check } from 'lucide-react';

interface TileSetViewProps {
  language: 'en' | 'ar';
}

const CATEGORY_CONFIG: Record<
  TileCategory | 'all',
  { labelEn: string; labelAr: string; color: string; badgeBg: string; textCol: string }
> = {
  all: {
    labelEn: 'All Tiles',
    labelAr: 'جميع البطاقات',
    color: 'bg-slate-700 border-slate-500',
    badgeBg: 'bg-slate-800 text-slate-200',
    textCol: 'text-slate-300',
  },
  verb: {
    labelEn: 'Verbs & Auxiliaries',
    labelAr: 'الأفعال والمساعدات',
    color: 'bg-purple-950/80 border-purple-500/60',
    badgeBg: 'bg-purple-900/60 text-purple-200 border-purple-600/40',
    textCol: 'text-purple-300',
  },
  noun: {
    labelEn: 'Nouns & Family',
    labelAr: 'الأسماء والعائلة',
    color: 'bg-blue-950/80 border-blue-500/60',
    badgeBg: 'bg-blue-900/60 text-blue-200 border-blue-600/40',
    textCol: 'text-blue-300',
  },
  pronoun: {
    labelEn: 'Pronouns',
    labelAr: 'الضمائر',
    color: 'bg-indigo-950/80 border-indigo-500/60',
    badgeBg: 'bg-indigo-900/60 text-indigo-200 border-indigo-600/40',
    textCol: 'text-indigo-300',
  },
  determiner_conj: {
    labelEn: 'Determiners & Conjunctions',
    labelAr: 'المحددات وحروف العطف',
    color: 'bg-cyan-950/80 border-cyan-500/60',
    badgeBg: 'bg-cyan-900/60 text-cyan-200 border-cyan-600/40',
    textCol: 'text-cyan-300',
  },
  wh_question: {
    labelEn: 'WH-Question Tools',
    labelAr: 'أدوات الاستفهام (WH)',
    color: 'bg-rose-950/80 border-rose-500/60',
    badgeBg: 'bg-rose-900/60 text-rose-200 border-rose-600/40',
    textCol: 'text-rose-300',
  },
  adverb_prep: {
    labelEn: 'Prepositions & Adverbs',
    labelAr: 'حروف الجر والظروف',
    color: 'bg-teal-950/80 border-teal-500/60',
    badgeBg: 'bg-teal-900/60 text-teal-200 border-teal-600/40',
    textCol: 'text-teal-300',
  },
  adjective: {
    labelEn: 'Adjectives',
    labelAr: 'الصفات',
    color: 'bg-emerald-950/80 border-emerald-500/60',
    badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-600/40',
    textCol: 'text-emerald-300',
  },
  wildcard: {
    labelEn: 'Wildcards (N3–N6)',
    labelAr: 'الأسماء الحرة (N3–N6)',
    color: 'bg-amber-950/80 border-amber-500/60',
    badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-600/40',
    textCol: 'text-amber-300',
  },
  punctuation: {
    labelEn: 'Full Stop "."',
    labelAr: 'النقطة "."',
    color: 'bg-slate-800/80 border-slate-600/60',
    badgeBg: 'bg-slate-750 text-slate-300 border-slate-600/40',
    textCol: 'text-slate-300',
  },
};

export const TileSetView: React.FC<TileSetViewProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<TileCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Total statistics
  const totalTilesCount = useMemo(
    () => TILE_DEFINITIONS.reduce((acc, t) => acc + t.count, 0),
    []
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: totalTilesCount };
    for (const t of TILE_DEFINITIONS) {
      counts[t.category] = (counts[t.category] || 0) + t.count;
    }
    return counts;
  }, [totalTilesCount]);

  const filteredTiles = useMemo(() => {
    return TILE_DEFINITIONS.filter((t) => {
      const matchesCategory =
        selectedCategory === 'all' || t.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.word.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredTilesTotalCount = useMemo(
    () => filteredTiles.reduce((acc, t) => acc + t.count, 0),
    [filteredTiles]
  );

  return (
    <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header & Concept */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {isAr ? `مجموعة بطاقات الكلمات الكاملة (${totalTilesCount} بطاقة)` : `Complete Tile Set (${totalTilesCount} Word Tiles)`}
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-200 border border-blue-500/50">
              {totalTilesCount} {isAr ? 'بطاقة' : 'tiles'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'توزيع جميع الكلمات، عدد التكرار، ونقاط الحروف (القاعدة 11) مقسمة حسب الفئات النحوية'
              : `All ${totalTilesCount} tiles by frequency count, letter score (Rule 11), and grammatical category`}
          </p>
        </div>

        {/* Quick Bank Summary Stats */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <span className="text-slate-400 font-sans">{isAr ? 'مدخلات فريدة: ' : 'Unique: '}</span>
            <strong className="text-white">{TILE_DEFINITIONS.length}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <span className="text-slate-400 font-sans">{isAr ? 'مجموع البطاقات: ' : 'Total: '}</span>
            <strong className="text-blue-400">{totalTilesCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث عن أي كلمة (مثال: Is, Were, Fatima, Somebody)...'
                : 'Search any word (e.g. Is, Were, Fatima, Somebody)...'
            }
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Total Shown badge */}
        <div className="text-[11px] text-slate-400 font-medium px-1 shrink-0 flex items-center gap-1">
          <span>{isAr ? 'المعروض:' : 'Showing:'}</span>
          <strong className="text-white font-mono">{filteredTilesTotalCount}</strong>
          <span>{isAr ? 'بطاقة' : 'tiles'}</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {(Object.keys(CATEGORY_CONFIG) as (TileCategory | 'all')[]).map((catKey) => {
          const cfg = CATEGORY_CONFIG[catKey];
          const isSelected = selectedCategory === catKey;
          const count = categoryCounts[catKey] || 0;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-400/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
              }`}
            >
              <span>{isAr ? cfg.labelAr : cfg.labelEn}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[46vh] overflow-y-auto pr-1">
        {filteredTiles.map((tileDef, idx) => {
          const cfg = CATEGORY_CONFIG[tileDef.category];
          const isWildcard = tileDef.isWildcard;
          const isPunctuation = tileDef.category === 'punctuation';

          return (
            <div
              key={`${tileDef.word}-${idx}`}
              className={`relative flex flex-col justify-between p-2.5 rounded-xl border bg-slate-800/70 border-slate-700/80 hover:border-blue-500/60 hover:bg-slate-800 transition-all shadow-sm group`}
            >
              {/* Top row: Multiplier badge & letter score */}
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                {/* Quantity badge */}
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40">
                  ×{tileDef.count}
                </span>

                {/* Score badge (Rule 11) */}
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-600/40">
                  {tileDef.charCount} {isAr ? 'نقطة' : 'pts'}
                </span>
              </div>

              {/* Main Tile Representation */}
              <div className="flex items-center justify-center my-1.5">
                <div
                  className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center relative p-1 shadow-md transition-transform group-hover:scale-105 ${
                    isWildcard
                      ? 'bg-amber-900/80 border-2 border-amber-400 text-amber-100 ring-1 ring-amber-400/40'
                      : isPunctuation
                      ? 'bg-slate-700 border-2 border-slate-500 text-white'
                      : 'bg-blue-700 border-2 border-blue-400 text-white'
                  }`}
                >
                  <span
                    className={`font-bold text-center leading-tight tracking-tight ${
                      tileDef.word.length >= 9
                        ? 'text-[9px] tracking-tighter'
                        : tileDef.word.length > 7
                        ? 'text-[9.5px] tracking-tighter'
                        : tileDef.word.length > 4
                        ? 'text-xs'
                        : 'text-sm'
                    }`}
                  >
                    {tileDef.word}
                  </span>

                  {/* Wildcard length tag */}
                  {isWildcard && (
                    <span className="absolute top-0.5 left-1 text-[8px] font-mono text-amber-200 font-bold">
                      {tileDef.wildcardLen}ch
                    </span>
                  )}

                  {/* Character points in bottom-right corner */}
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold text-blue-200">
                    {tileDef.charCount}
                  </span>
                </div>
              </div>

              {/* Bottom Category tag */}
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span
                  className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold truncate ${cfg.badgeBg}`}
                >
                  {isAr ? cfg.labelAr : cfg.labelEn}
                </span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {tileDef.count * (tileDef.charCount || 0)} pts tot
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Notes on Sheet 1 & Sheet 2 */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{isAr ? 'الورقة 1: 50 بطاقة (الأساسيات والتكرار)' : 'Sheet 1: 50 Core & Frequent Tiles (Is ×10, Were ×3, etc.)'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{isAr ? 'الورقة 2 + أدوات الاستفهام: 59 بطاقة (الضمائر، الصفات، حروف الجر، وWH)' : 'Sheet 2 + WH Tools: 59 Vocabulary Tiles (Pronouns, Adjectives, Prepositions, Where/When/Who/Whom/Whose/Which/What/Why/How)'}</span>
          </span>
        </div>
        <div className="font-mono text-slate-300 font-bold">
          {isAr ? `المجموع الإجمالي: ${totalTilesCount} بطاقة` : `Total Bank: ${totalTilesCount} Tiles`}
        </div>
      </div>
    </div>
  );
};
