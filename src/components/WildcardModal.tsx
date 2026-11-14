import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { TileData } from '../types/game';
import { WILDCARD_SUGGESTIONS } from '../data/tiles';

interface WildcardModalProps {
  tile: TileData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmName: (tileId: string, name: string) => void;
  language: 'en' | 'ar';
}

export const WildcardModal: React.FC<WildcardModalProps> = ({
  tile,
  isOpen,
  onClose,
  onConfirmName,
  language,
}) => {
  if (!isOpen || !tile) return null;
  const isAr = language === 'ar';

  const len = tile.wildcardLen || 4;
  const [nameInput, setNameInput] = useState(tile.customName || '');
  const suggestions = WILDCARD_SUGGESTIONS[len] || [];

  const isValidLength = nameInput.trim().length === len;

  const handleSave = () => {
    if (isValidLength) {
      onConfirmName(tile.id, nameInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold font-mono">
              {tile.word}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? `تسمية بطاقة ${tile.word} (القاعدة 9)` : `Name ${tile.word} Tile (Rule 9)`}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? `اختر أي اسم يتكون من ${len} حروف بدقة`
                  : `Choose any name exactly ${len} characters long`}
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
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? `الاسم المختار (${len} حروف):` : `Chosen Name (${len} characters):`}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={len}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                placeholder={`e.g. ${suggestions[0] || 'Name'}`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 uppercase tracking-wider"
              />
              <button
                onClick={handleSave}
                disabled={!isValidLength}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تأكيد' : 'Apply'}</span>
              </button>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>{isAr ? 'الحروف المتبقية:' : 'Characters:'}</span>
              <span className={`font-mono font-bold ${isValidLength ? 'text-emerald-400' : 'text-amber-400'}`}>
                {nameInput.length} / {len}
              </span>
            </div>
          </div>

          {/* Preset Suggestions */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              {isAr ? 'اقتراحات شائعة:' : 'Quick Suggestions:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => setNameInput(sug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    nameInput.toLowerCase() === sug.toLowerCase()
                      ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
