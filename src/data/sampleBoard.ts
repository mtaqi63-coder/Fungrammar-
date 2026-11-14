import { BoardCell, TileData } from '../types/game';

export interface SampleBoardPlacement {
  row: number;
  col: number;
  word: string;
  customName?: string;
}

// Reconstructed sentence grid directly from the author's official board image
export const AUTHENTIC_2005_BOARD_PLACEMENTS: SampleBoardPlacement[] = [
  // Top left cluster
  { row: 1, col: 0, word: 'Some body' },
  { row: 1, col: 1, word: 'Had' },
  { row: 1, col: 3, word: 'Some body' },

  // Vertical does something
  { row: 2, col: 1, word: 'Does' },
  { row: 2, col: 2, word: 'Some thing' },
  { row: 2, col: 3, word: 'Those' },
  { row: 2, col: 4, word: 'Have' },
  { row: 2, col: 5, word: 'Some body' },

  { row: 3, col: 1, word: 'N6', customName: 'Fatima' },
  { row: 3, col: 4, word: 'Were' },

  // Horizontal sentence: Your Name Is N5
  { row: 4, col: 0, word: 'Your' },
  { row: 4, col: 1, word: 'Name' },
  { row: 4, col: 2, word: 'Is' },
  { row: 4, col: 3, word: 'N5', customName: 'Sarah' },
  { row: 4, col: 4, word: 'Were' },
  { row: 4, col: 5, word: 'Bad' },
  { row: 4, col: 6, word: 'To' },
  { row: 4, col: 7, word: 'Him' },

  // Vertical down from Name
  { row: 5, col: 1, word: 'Is' },
  { row: 5, col: 3, word: 'Is' },
  { row: 5, col: 4, word: 'You' },

  // Row 6
  { row: 6, col: 1, word: 'N3', customName: 'Ali' },
  { row: 6, col: 3, word: 'His' },
  { row: 6, col: 4, word: 'Are' },

  // Horizontal: My Mother Is Young
  { row: 7, col: 0, word: 'My' },
  { row: 7, col: 1, word: 'Mother' },
  { row: 7, col: 2, word: 'Is' },
  { row: 7, col: 3, word: 'Young' },
  { row: 7, col: 5, word: 'I' },
  { row: 7, col: 6, word: 'Am' },
  { row: 7, col: 7, word: 'N4', customName: 'John' },

  // Name A Thing .
  { row: 8, col: 0, word: 'Name' },
  { row: 8, col: 1, word: 'A' },
  { row: 8, col: 2, word: 'Thing' },
  { row: 8, col: 3, word: '.' },
  { row: 8, col: 4, word: 'Some body' },
  { row: 8, col: 5, word: 'Is' },
  { row: 8, col: 6, word: 'Not' },
  { row: 8, col: 7, word: 'Up' },

  // It Was A Good Night
  { row: 9, col: 0, word: 'It' },
  { row: 9, col: 1, word: 'Was' },
  { row: 9, col: 2, word: 'A' },
  { row: 9, col: 3, word: 'Good' },
  { row: 9, col: 4, word: 'Night' },

  // Sister is down / not down
  { row: 10, col: 1, word: 'The' },
  { row: 10, col: 2, word: 'Sister' },
  { row: 10, col: 3, word: 'Is' },
  { row: 10, col: 4, word: 'Not' },
  { row: 10, col: 5, word: 'Down' },
  { row: 10, col: 6, word: 'That' },
  { row: 10, col: 7, word: 'Is' },

  // He Has A Friend . We Are Here
  { row: 11, col: 0, word: 'He' },
  { row: 11, col: 1, word: 'Has' },
  { row: 11, col: 2, word: 'A' },
  { row: 11, col: 3, word: 'Friend' },
  { row: 11, col: 4, word: '.' },
  { row: 11, col: 5, word: 'We' },
  { row: 11, col: 6, word: 'Are' },
  { row: 11, col: 7, word: 'Here' },

  // These Are For Them
  { row: 11, col: 8, word: 'These' },
  { row: 11, col: 9, word: 'Are' },
  { row: 11, col: 10, word: 'For' },
  { row: 11, col: 11, word: 'Them' },

  // We Were There In The Morning
  { row: 12, col: 5, word: 'Were' },
  { row: 12, col: 6, word: 'There' },
  { row: 12, col: 7, word: 'In' },
  { row: 12, col: 8, word: 'The' },
  { row: 12, col: 9, word: 'Morning' },

  // The Father Is Old
  { row: 13, col: 7, word: 'The' },
  { row: 13, col: 8, word: 'Father' },
  { row: 13, col: 9, word: 'Is' },
  { row: 13, col: 10, word: 'Old' },

  // Will Be Big
  { row: 13, col: 4, word: 'Will' },
  { row: 13, col: 5, word: 'Be' },
  { row: 13, col: 6, word: 'Big' },

  // Can Do Some thing Is Small
  { row: 14, col: 0, word: 'Can' },
  { row: 14, col: 1, word: 'Do' },
  { row: 14, col: 2, word: 'Some thing' },
  { row: 14, col: 3, word: 'Is' },
  { row: 14, col: 4, word: 'Small' },
];
