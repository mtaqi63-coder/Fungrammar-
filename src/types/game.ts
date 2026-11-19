export type TileCategory =
  | 'verb'
  | 'pronoun'
  | 'noun'
  | 'adjective'
  | 'adverb_prep'
  | 'determiner_conj'
  | 'wh_question'
  | 'wildcard'
  | 'punctuation';

export interface TileData {
  id: string;
  word: string; // e.g. "Is", "Somebody", "N3", "."
  displayWord: string;
  category: TileCategory;
  charCount: number; // For scoring (excluding spaces/dots)
  isWildcard?: boolean; // N3, N4, N5, N6
  wildcardLen?: number; // 3, 4, 5, 6
  customName?: string; // Player-chosen name if wildcard
}

export interface BoardCell {
  row: number;
  col: number;
  tile: TileData | null;
  isCenter?: boolean;
  isTemp?: boolean; // currently placed in pending move
  playerId?: string;
  turnPlayed?: number;
}

export interface PlayedSentenceRecord {
  text: string;
  score: number;
  turn: number;
  playOrder?: number;
  ruleName?: string;
  ruleExplanation?: string;
  direction?: 'horizontal' | 'vertical';
  playerId?: string;
  isDisputed?: boolean;
  disputeType?: 'disputed_ai_move' | 'rejected_player_move';
  disputeReason?: string;
}

export interface Player {
  id: string;
  name: string;
  nameAr: string;
  isAi: boolean;
  score: number;
  rack: TileData[];
  avatarColor: string;
  sentencesFormed: PlayedSentenceRecord[];
}

export interface PlacedTile {
  row: number;
  col: number;
  tile: TileData;
}

export interface SentenceEvaluation {
  text: string;
  isValid: boolean;
  charCount: number;
  tiles: PlacedTile[];
  direction: 'horizontal' | 'vertical';
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
}

export interface MoveValidation {
  isValid: boolean;
  score: number;
  sentences: SentenceEvaluation[];
  errorMessage?: string;
}

export type GameMode = 'vs_ai' | 'pass_and_play' | 'solo_sandbox' | 'daily_puzzle';
export type BotDifficulty = 'easy' | 'medium' | 'hard';
