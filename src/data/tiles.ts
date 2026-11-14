import { TileData, TileCategory } from '../types/game';

interface TileDefinition {
  word: string;
  category: TileCategory;
  count: number;
  charCount?: number;
  isWildcard?: boolean;
  wildcardLen?: number;
}

export const TILE_DEFINITIONS: TileDefinition[] = [
  // Sheet 1 (50 tiles)
  { word: 'Is', category: 'verb', count: 10, charCount: 2 },
  { word: 'Some body', category: 'noun', count: 3, charCount: 8 },
  { word: 'Name', category: 'noun', count: 3, charCount: 4 },
  { word: 'N3', category: 'wildcard', count: 1, charCount: 3, isWildcard: true, wildcardLen: 3 },
  { word: 'N4', category: 'wildcard', count: 1, charCount: 4, isWildcard: true, wildcardLen: 4 },
  { word: 'N5', category: 'wildcard', count: 1, charCount: 5, isWildcard: true, wildcardLen: 5 },
  { word: 'N6', category: 'wildcard', count: 1, charCount: 6, isWildcard: true, wildcardLen: 6 },
  { word: 'Some thing', category: 'noun', count: 3, charCount: 9 },
  { word: 'Thing', category: 'noun', count: 3, charCount: 5 },
  { word: 'A', category: 'determiner_conj', count: 3, charCount: 1 },
  { word: 'And', category: 'determiner_conj', count: 1, charCount: 3 },
  { word: 'The', category: 'determiner_conj', count: 3, charCount: 3 },
  { word: 'Not', category: 'adverb_prep', count: 3, charCount: 3 },
  { word: '.', category: 'punctuation', count: 3, charCount: 0 },
  { word: 'Friend', category: 'noun', count: 1, charCount: 6 },
  { word: 'Were', category: 'verb', count: 3, charCount: 4 },
  { word: 'Was', category: 'verb', count: 3, charCount: 3 },
  { word: 'Are', category: 'verb', count: 3, charCount: 3 },
  { word: 'But', category: 'determiner_conj', count: 1, charCount: 3 },

  // Sheet 2 (50 tiles)
  // Pronouns
  { word: 'You', category: 'pronoun', count: 1, charCount: 3 },
  { word: 'He', category: 'pronoun', count: 1, charCount: 2 },
  { word: 'She', category: 'pronoun', count: 1, charCount: 3 },
  { word: 'It', category: 'pronoun', count: 1, charCount: 2 },
  { word: 'We', category: 'pronoun', count: 1, charCount: 2 },
  { word: 'I', category: 'pronoun', count: 1, charCount: 1 },
  { word: 'Me', category: 'pronoun', count: 1, charCount: 2 },
  { word: 'They', category: 'pronoun', count: 1, charCount: 4 },
  { word: 'Am', category: 'verb', count: 1, charCount: 2 },
  { word: 'Him', category: 'pronoun', count: 1, charCount: 3 },

  // Possessives & Demonstratives
  { word: 'My', category: 'determiner_conj', count: 1, charCount: 2 },
  { word: 'His', category: 'determiner_conj', count: 1, charCount: 3 },
  { word: 'Their', category: 'determiner_conj', count: 1, charCount: 5 },
  { word: 'Your', category: 'determiner_conj', count: 1, charCount: 4 },
  { word: 'Her', category: 'determiner_conj', count: 1, charCount: 3 },
  { word: 'These', category: 'pronoun', count: 1, charCount: 5 },
  { word: 'That', category: 'pronoun', count: 1, charCount: 4 },
  { word: 'Them', category: 'pronoun', count: 1, charCount: 4 },
  { word: 'This', category: 'pronoun', count: 1, charCount: 4 },
  { word: 'Those', category: 'pronoun', count: 1, charCount: 5 },

  // Verbs & Auxiliaries
  { word: 'Does', category: 'verb', count: 1, charCount: 4 },
  { word: 'Doing', category: 'verb', count: 1, charCount: 5 },
  { word: 'Did', category: 'verb', count: 1, charCount: 3 },
  { word: 'Do', category: 'verb', count: 1, charCount: 2 },
  { word: 'Had', category: 'verb', count: 1, charCount: 3 },
  { word: 'Has', category: 'verb', count: 1, charCount: 3 },
  { word: 'Have', category: 'verb', count: 1, charCount: 4 },
  { word: 'Can', category: 'verb', count: 1, charCount: 3 },
  { word: 'Will', category: 'verb', count: 1, charCount: 4 },
  { word: 'Be', category: 'verb', count: 1, charCount: 2 },

  // Adjectives & Family Nouns
  { word: 'Good', category: 'adjective', count: 1, charCount: 4 },
  { word: 'Bad', category: 'adjective', count: 1, charCount: 3 },
  { word: 'Small', category: 'adjective', count: 1, charCount: 5 },
  { word: 'Young', category: 'adjective', count: 1, charCount: 5 },
  { word: 'Old', category: 'adjective', count: 1, charCount: 3 },
  { word: 'Big', category: 'adjective', count: 1, charCount: 3 },
  { word: 'Sister', category: 'noun', count: 1, charCount: 6 },
  { word: 'Brother', category: 'noun', count: 1, charCount: 7 },
  { word: 'Father', category: 'noun', count: 1, charCount: 6 },
  { word: 'Mother', category: 'noun', count: 1, charCount: 6 },

  // Prepositions & Time/Place
  { word: 'Morning', category: 'noun', count: 1, charCount: 7 },
  { word: 'Night', category: 'noun', count: 1, charCount: 5 },
  { word: 'Down', category: 'adverb_prep', count: 1, charCount: 4 },
  { word: 'Up', category: 'adverb_prep', count: 1, charCount: 2 },
  { word: 'Out', category: 'adverb_prep', count: 1, charCount: 3 },
  { word: 'There', category: 'adverb_prep', count: 1, charCount: 5 },
  { word: 'Here', category: 'adverb_prep', count: 1, charCount: 4 },
  { word: 'In', category: 'adverb_prep', count: 1, charCount: 2 },
  { word: 'To', category: 'adverb_prep', count: 1, charCount: 2 },
  { word: 'For', category: 'adverb_prep', count: 1, charCount: 3 },
];

/**
 * Generate full 100-tile bank with unique IDs
 */
export function createNewTileBank(): TileData[] {
  const bank: TileData[] = [];
  let seq = 1;

  for (const def of TILE_DEFINITIONS) {
    for (let i = 0; i < def.count; i++) {
      bank.push({
        id: `tile_${seq++}_${def.word.replace(/\s+/g, '_')}`,
        word: def.word,
        displayWord: def.word,
        category: def.category,
        charCount: def.charCount ?? def.word.replace(/\s+/g, '').length,
        isWildcard: def.isWildcard,
        wildcardLen: def.wildcardLen,
      });
    }
  }

  // Shuffle the bank (Fisher-Yates)
  return shuffleTiles(bank);
}

export function shuffleTiles<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const WILDCARD_SUGGESTIONS: Record<number, string[]> = {
  3: ['Bob', 'Dan', 'Tom', 'Ali', 'Sam', 'Leo', 'Mia', 'Amy'],
  4: ['John', 'Mary', 'Alex', 'Sara', 'Mark', 'Emma', 'Jack', 'Lucy', 'Zaid', 'Noor'],
  5: ['Peter', 'James', 'Sarah', 'David', 'Henry', 'Alice', 'Emily', 'Tariq', 'Hasan'],
  6: ['George', 'Robert', 'Oliver', 'Fatima', 'Edward', 'Sophia', 'Hannah', 'Khalid'],
};
