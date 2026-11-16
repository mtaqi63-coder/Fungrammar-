import { TileData } from '../types/game';

export interface GrammarResult {
  isValid: boolean;
  score: number;
  reason?: string;
  breakdown?: string;
}

// Grammatical token categories
const SUBJECT_PRONOUNS_SINGULAR = new Set(['he', 'she', 'it', 'this', 'that']);
const SUBJECT_PRONOUNS_PLURAL = new Set(['we', 'they', 'these', 'those']);
const OBJECT_PRONOUNS = new Set(['me', 'him', 'them', 'her', 'us', 'you', 'it', 'this', 'that', 'these', 'those']);

const HUMAN_OBJECT_PRONOUNS = new Set(['me', 'him', 'them', 'her', 'us', 'you']);
const NON_HUMAN_OBJECT_PRONOUNS = new Set(['it', 'this', 'that', 'these', 'those']);

// Pronouns that are STRICTLY objects and can NEVER be used as subjects in English
export const OBJECT_ONLY_PRONOUNS = new Set(['me', 'him', 'them', 'us']);

// Pronouns that are STRICTLY subjects and can NEVER be used as direct/prepositional objects in English
export const SUBJECT_ONLY_PRONOUNS = new Set(['i', 'he', 'she', 'we', 'they']);

// Complete set of all 50 fixed standard words in the Fun Grammar 100-tile bank.
// Any word in this set is a fixed grammatical tile and can NEVER be treated as a wildcard proper name!
export const ALL_STANDARD_GAME_WORDS = new Set([
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'does',
  'do',
  'did',
  'doing',
  'has',
  'have',
  'had',
  'can',
  'will',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'them',
  'us',
  'my',
  'his',
  'their',
  'your',
  'her',
  'this',
  'that',
  'these',
  'those',
  'good',
  'bad',
  'small',
  'young',
  'old',
  'big',
  'sister',
  'brother',
  'father',
  'mother',
  'friend',
  'name',
  'thing',
  'night',
  'morning',
  'some body',
  'somebody',
  'some thing',
  'something',
  'some',
  'body',
  'in',
  'to',
  'for',
  'down',
  'up',
  'out',
  'there',
  'here',
  'not',
  '.',
  'a',
  'the',
  'and',
  'but',
]);

const HUMAN_NOUNS = new Set([
  'sister',
  'brother',
  'father',
  'mother',
  'friend',
  'some body',
  'somebody',
  'n3',
  'n4',
  'n5',
  'n6',
]);

const NON_HUMAN_NOUNS = new Set([
  'thing',
  'some thing',
  'something',
  'night',
  'morning',
  'name',
]);

// Common countable singular nouns that can take determiners (a, the, my, his, etc.)
// Indefinite pronouns (some body, some thing) and proper names (N3-N6) are NOT common nouns and NEVER take determiners!
const COMMON_SINGULAR_NOUNS = new Set([
  'sister',
  'brother',
  'father',
  'mother',
  'friend',
  'name',
  'thing',
  'night',
  'morning',
]);

const INDEFINITE_PRONOUNS = new Set([
  'some body',
  'somebody',
  'some thing',
  'something',
]);

const PROPER_WILDCARD_TOKENS = new Set(['n3', 'n4', 'n5', 'n6']);

const SINGULAR_NOUNS = COMMON_SINGULAR_NOUNS;

const POSSESSIVES = new Set(['my', 'his', 'their', 'your', 'her']);
const ARTICLES = new Set(['a', 'the']);
const DEMONSTRATIVES_SINGULAR = new Set(['this', 'that']);
const DEMONSTRATIVES_PLURAL = new Set(['these', 'those']);

const ADJECTIVES = new Set(['good', 'bad', 'small', 'young', 'old', 'big']);
// Only evaluative adjectives in Fun Grammar can take a prepositional phrase ("good/bad to him", "good/bad for you")
const EVALUATIVE_ADJECTIVES = new Set(['good', 'bad']);

// True prepositions taking an object in Fun Grammar
const TRUE_PREPOSITIONS = new Set(['in', 'to', 'for']);

// Directional and location adverbs in Fun Grammar (these NEVER take a direct noun phrase!)
const LOCATION_ADVERBS = new Set(['here', 'there', 'down', 'up', 'out']);

const ALL_VERBS = new Set([
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'does',
  'do',
  'did',
  'doing',
  'has',
  'have',
  'had',
  'can',
  'will',
]);

const WH_QUESTION_WORDS = new Set(['where', 'when', 'who', 'what', 'why', 'how']);

/**
 * Normalizes a word token
 */
function cleanWord(w: string): string {
  return w.trim().toLowerCase().replace(/[?!]+$/g, '');
}

/**
 * Computes character score for a tile according to Fun Grammar rules
 */
export function getTileCharScore(tile: TileData): number {
  if (tile.word === '.') return 0;
  if (tile.isWildcard) {
    if (tile.customName) return tile.customName.replace(/\s+/g, '').length;
    return tile.wildcardLen || 4;
  }
  return tile.word.replace(/\s+/g, '').length;
}

export type GrammaticalNumber = 'singular' | 'plural' | 'i' | 'you';

export interface NounPhraseParse {
  valid: boolean;
  length: number;
  number: GrammaticalNumber;
  reason?: string;
}

/**
 * Parses a noun phrase starting at index in the tokens list.
 * Disallows invalid pairings like "these father" or "those sister" (plural determiner + singular noun).
 */
export function parseNounPhrase(
  tokens: string[],
  start: number = 0,
  allowPostpositiveAdj: boolean = true
): NounPhraseParse {
  if (start >= tokens.length) {
    return { valid: false, length: 0, number: 'singular', reason: 'Missing noun phrase' };
  }

  const remaining = tokens.slice(start);
  const w1 = remaining[0];

  // 0. Disallow object-only pronouns as subject (cannot say "Him is good", "Is him the something")
  if (OBJECT_ONLY_PRONOUNS.has(w1)) {
    return {
      valid: false,
      length: 1,
      number: 'singular',
      reason: `"${w1}" is an object pronoun and cannot be used as a subject (use "he", "they", "I", or "we")`,
    };
  }

  // 1. Personal pronouns (strictly single-word subjects)
  if (w1 === 'i') return { valid: true, length: 1, number: 'i' };
  if (w1 === 'you') return { valid: true, length: 1, number: 'you' };
  if (w1 === 'he' || w1 === 'she' || w1 === 'it') return { valid: true, length: 1, number: 'singular' };
  if (w1 === 'we' || w1 === 'they') return { valid: true, length: 1, number: 'plural' };

  // 2. Indefinite pronouns: "some body", "some thing" (+ optional postpositive adjective ONLY on "some thing": "some thing big")
  // Note: "some body" / "somebody" + postpositive adjective (e.g. "somebody young") is disallowed.
  if (w1 === 'some body' || w1 === 'somebody' || w1 === 'some thing' || w1 === 'something') {
    if (allowPostpositiveAdj && (w1 === 'some thing' || w1 === 'something') && remaining.length >= 2 && ADJECTIVES.has(remaining[1])) {
      return { valid: true, length: 2, number: 'singular' };
    }
    return { valid: true, length: 1, number: 'singular' };
  }
  if (w1 === 'some' && remaining.length >= 2 && (remaining[1] === 'body' || remaining[1] === 'thing')) {
    if (allowPostpositiveAdj && remaining[1] === 'thing' && remaining.length >= 3 && ADJECTIVES.has(remaining[2])) {
      return { valid: true, length: 3, number: 'singular' };
    }
    return { valid: true, length: 2, number: 'singular' };
  }

  // 3. Proper nouns & wildcards (N3-N6, custom names) or standalone family nouns used as kinship titles (Father, Mother, Brother, Sister)
  if (['n3', 'n4', 'n5', 'n6', 'father', 'mother', 'brother', 'sister'].includes(w1)) {
    return { valid: true, length: 1, number: 'singular' };
  }
  // Any custom wildcard name of 3-6 letters (must NOT be a standard game word or WH-question word!)
  if (/^[a-z]{3,6}$/.test(w1) && !ALL_STANDARD_GAME_WORDS.has(w1) && !WH_QUESTION_WORDS.has(w1)) {
    return { valid: true, length: 1, number: 'singular' };
  }

  // 4. Determiner + [optional Adj] + Common Singular Noun
  // Includes articles (a, the), possessives (my, his, their, your, her), and singular demonstratives (this, that)
  if (ARTICLES.has(w1) || POSSESSIVES.has(w1) || DEMONSTRATIVES_SINGULAR.has(w1)) {
    if (remaining.length >= 2) {
      const w2 = remaining[1];

      // Explicitly reject determiner + indefinite pronoun (e.g. "their some body", "my somebody", "a some thing")
      if (
        INDEFINITE_PRONOUNS.has(w2) ||
        (w2 === 'some' && remaining.length >= 3 && (remaining[2] === 'body' || remaining[2] === 'thing'))
      ) {
        return {
          valid: false,
          length: 2,
          number: 'singular',
          reason: `Grammar error: Determiner "${w1}" cannot be used before indefinite pronoun "${w2}"`,
        };
      }

      // Explicitly reject determiner + proper name (e.g. "their Ali", "the Sarah", "my N5")
      if (
        PROPER_WILDCARD_TOKENS.has(w2) ||
        (/^[a-z]{3,6}$/.test(w2) && !ALL_STANDARD_GAME_WORDS.has(w2) && !WH_QUESTION_WORDS.has(w2))
      ) {
        return {
          valid: false,
          length: 2,
          number: 'singular',
          reason: `Grammar error: Determiner "${w1}" cannot precede proper name "${w2}"`,
        };
      }

      // [Det] + [Noun] e.g. "a friend", "the sister", "my mother", "his name", "that brother", "this thing", "that night"
      if (COMMON_SINGULAR_NOUNS.has(w2)) {
        return { valid: true, length: 2, number: 'singular' };
      }

      // [Det] + [Adj] + [Noun] e.g. "a good night", "the young sister", "my old friend", "that young brother"
      if (remaining.length >= 3) {
        const w3 = remaining[2];
        if (ADJECTIVES.has(w2) && COMMON_SINGULAR_NOUNS.has(w3)) {
          // English article agreement: "a" cannot precede vowel-initial words such as "old"
          if (w1 === 'a' && /^[aeiou]/.test(w2)) {
            return {
              valid: false,
              length: 3,
              number: 'singular',
              reason: `Grammar error: Article "a" cannot precede vowel-initial adjective "${w2}" (use "the", "my", or another determiner)`,
            };
          }
          return { valid: true, length: 3, number: 'singular' };
        }
      }
    }

    // Standalone singular demonstrative pronoun ("That is good", "This is my sister")
    if (DEMONSTRATIVES_SINGULAR.has(w1)) {
      return { valid: true, length: 1, number: 'singular' };
    }
  }

  // NOTE: "these" / "those" + singular noun (e.g. "these father", "those sister") is an ERROR.
  if (DEMONSTRATIVES_PLURAL.has(w1)) {
    if (remaining.length >= 2 && (COMMON_SINGULAR_NOUNS.has(remaining[1]) || INDEFINITE_PRONOUNS.has(remaining[1]))) {
      return {
        valid: false,
        length: 2,
        number: 'plural',
        reason: `Grammar error: Plural determiner "${w1}" cannot be paired with "${remaining[1]}"`,
      };
    }
    return { valid: true, length: 1, number: 'plural' };
  }

  return { valid: false, length: 0, number: 'singular', reason: `"${w1}" is not a valid noun phrase` };
}

/**
 * Checks Subject-Verb Agreement
 */
export function checkSubjectVerbAgreement(
  num: GrammaticalNumber,
  verb: string
): { isValid: boolean; reason?: string } {
  if (num === 'i') {
    if (['am', 'was', 'do', 'did', 'have', 'had', 'can', 'will'].includes(verb)) {
      return { isValid: true };
    }
    return { isValid: false, reason: `"I" cannot be used with verb "${verb}" (use "am" or "was")` };
  }

  if (num === 'you') {
    if (['are', 'were', 'do', 'did', 'have', 'had', 'can', 'will'].includes(verb)) {
      return { isValid: true };
    }
    return { isValid: false, reason: `"You" cannot be used with verb "${verb}" (use "are" or "were")` };
  }

  if (num === 'singular') {
    if (['is', 'was', 'does', 'did', 'has', 'had', 'can', 'will'].includes(verb)) {
      return { isValid: true };
    }
    return { isValid: false, reason: `Singular subject cannot be used with plural verb "${verb}" (use "is" or "was")` };
  }

  if (num === 'plural') {
    if (['are', 'were', 'do', 'did', 'have', 'had', 'can', 'will'].includes(verb)) {
      return { isValid: true };
    }
    return { isValid: false, reason: `Plural subject cannot be used with singular verb "${verb}" (use "are" or "were")` };
  }

  return { isValid: true };
}

const TIME_NOUNS = new Set(['morning', 'night']);

/**
 * Checks whether a given noun phrase or pronoun refers to a human entity (person/name)
 */
export function isHumanEntity(tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  if (tokens.length === 1) {
    const w = tokens[0];
    if (HUMAN_OBJECT_PRONOUNS.has(w)) return true;
    if (NON_HUMAN_OBJECT_PRONOUNS.has(w)) return false;
    if (HUMAN_NOUNS.has(w)) return true;
    if (NON_HUMAN_NOUNS.has(w)) return false;
    // Proper wildcard names (e.g. Fatima, Sara, Ali, John)
    if (
      /^[a-z]{3,6}$/.test(w) &&
      !ALL_VERBS.has(w) &&
      !TRUE_PREPOSITIONS.has(w) &&
      !LOCATION_ADVERBS.has(w) &&
      !ADJECTIVES.has(w) &&
      !POSSESSIVES.has(w) &&
      !ARTICLES.has(w) &&
      !WH_QUESTION_WORDS.has(w) &&
      w !== 'and' &&
      w !== 'but' &&
      w !== 'not'
    ) {
      return true;
    }
    return false;
  }

  // Multi-token phrase: indefinite pronoun phrase check
  if (tokens[0] === 'some body' || tokens[0] === 'somebody' || (tokens[0] === 'some' && tokens[1] === 'body')) {
    return true;
  }
  if (tokens[0] === 'some thing' || tokens[0] === 'something' || (tokens[0] === 'some' && tokens[1] === 'thing')) {
    return false;
  }

  // Otherwise check the head noun (last word)
  const head = tokens[tokens.length - 1];
  if (HUMAN_NOUNS.has(head)) return true;
  if (NON_HUMAN_NOUNS.has(head)) return false;

  return false;
}

/**
 * Parses and validates prepositional phrases for Fun Grammar ("to", "for", "in")
 */
export function parsePrepositionalPhrase(tokens: string[]): {
  valid: boolean;
  length: number;
  reason?: string;
} {
  if (tokens.length < 2) {
    return { valid: false, length: 0, reason: 'Incomplete prepositional phrase' };
  }

  const prep = tokens[0];
  if (!TRUE_PREPOSITIONS.has(prep)) {
    return { valid: false, length: 0, reason: `"${prep}" is not a valid preposition` };
  }

  const objectTokens = tokens.slice(1);

  // 1. "in": time prepositions ("in the morning", "in that night") or deictic location ("in here", "in there")
  if (prep === 'in') {
    if (objectTokens.length === 1 && (objectTokens[0] === 'here' || objectTokens[0] === 'there')) {
      return { valid: true, length: 2 };
    }

    const head = objectTokens[objectTokens.length - 1];
    if (!TIME_NOUNS.has(head)) {
      return {
        valid: false,
        length: 0,
        reason: `Preposition "in" must be used with a time phrase (e.g. "in the morning", "in the night"), not "${objectTokens.join(' ')}"`,
      };
    }

    const np = parseNounPhrase(objectTokens, 0);
    if (np.valid && np.length === objectTokens.length) {
      return { valid: true, length: 1 + np.length };
    }

    return { valid: false, length: 0, reason: `Invalid time phrase after "in"` };
  }

  // 2. "to": expresses direction/recipient to a person: "to him", "to me", "to my sister", "to Fatima", "to you and me"
  if (prep === 'to') {
    if (objectTokens.length === 1) {
      if (SUBJECT_ONLY_PRONOUNS.has(objectTokens[0])) {
        const suggestionMap: Record<string, string> = { i: 'me', he: 'him', she: 'her', we: 'us', they: 'them' };
        return {
          valid: false,
          length: 0,
          reason: `"${objectTokens[0]}" is a subject pronoun and cannot follow "to" (use "${suggestionMap[objectTokens[0]]}")`,
        };
      }
      if (HUMAN_OBJECT_PRONOUNS.has(objectTokens[0])) {
        return { valid: true, length: 2 };
      }
    }

    const andIdx = objectTokens.indexOf('and');
    if (andIdx > 0 && andIdx < objectTokens.length - 1) {
      const leftPrep = parsePrepositionalPhrase(['to', ...objectTokens.slice(0, andIdx)]);
      const rightPrep = parsePrepositionalPhrase(['to', ...objectTokens.slice(andIdx + 1)]);
      if (leftPrep.valid && rightPrep.valid) {
        return { valid: true, length: 1 + objectTokens.length };
      }
    }

    const np = parseNounPhrase(objectTokens, 0);
    if (np.valid && np.length === objectTokens.length && isHumanEntity(objectTokens)) {
      return { valid: true, length: 1 + np.length };
    }

    return { valid: false, length: 0, reason: `Preposition "to" requires a person or pronoun as object` };
  }

  // 3. "for": can take human beneficiary ("for them", "for my mother", "for Fatima", "for you and me")
  // OR time/purpose ("for the night", "for the morning", "for that thing") — NEVER a "name" phrase ("for her name")
  if (prep === 'for') {
    const andIdx = objectTokens.indexOf('and');
    if (andIdx > 0 && andIdx < objectTokens.length - 1) {
      const leftPrep = parsePrepositionalPhrase(['for', ...objectTokens.slice(0, andIdx)]);
      const rightPrep = parsePrepositionalPhrase(['for', ...objectTokens.slice(andIdx + 1)]);
      if (leftPrep.valid && rightPrep.valid) {
        return { valid: true, length: 1 + objectTokens.length };
      }
    }

    const objRes = parseObjectPhrase(objectTokens);
    if (objRes.valid) {
      if (getSemanticCategory(objectTokens) === 'name') {
        return {
          valid: false,
          length: 0,
          reason: `Semantic mismatch: Preposition "for" cannot take name phrase "${objectTokens.join(' ')}"`,
        };
      }
      return { valid: true, length: 1 + objectTokens.length };
    }

    return { valid: false, length: 0, reason: objRes.reason || `Invalid object phrase for preposition "for"` };
  }

  return { valid: false, length: 0, reason: `Unrecognized preposition "${prep}"` };
}

/**
 * Parses an object noun phrase (for transitive verbs like "have", "name", or prepositions like "for").
 * Accepts object pronouns (me, him, her, us, them, you, it, this, that, these, those), valid NPs,
 * and coordinated object phrases ("you and me", "a brother and a sister"),
 * while strictly rejecting subject-only pronouns (I, he, she, we, they).
 */
export function parseObjectPhrase(tokens: string[]): { valid: boolean; reason?: string } {
  if (tokens.length === 0) {
    return { valid: false, reason: 'Missing object noun phrase' };
  }

  if (tokens.length === 1) {
    const w = tokens[0];
    if (SUBJECT_ONLY_PRONOUNS.has(w)) {
      const suggestionMap: Record<string, string> = {
        i: 'me',
        he: 'him',
        she: 'her',
        we: 'us',
        they: 'them',
      };
      return {
        valid: false,
        reason: `"${w}" is a subject pronoun and cannot be used as an object (use "${suggestionMap[w]}")`,
      };
    }
    if (OBJECT_PRONOUNS.has(w)) {
      return { valid: true };
    }
  }

  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === 'and') {
      const leftRes = parseObjectPhrase(tokens.slice(0, i));
      const rightRes = parseObjectPhrase(tokens.slice(i + 1));
      if (leftRes.valid && rightRes.valid) {
        return { valid: true };
      }
    }
  }

  const np = parseNounPhrase(tokens, 0);
  if (!np.valid || np.length !== tokens.length) {
    return { valid: false, reason: np.reason || `Invalid object "${tokens.join(' ')}"` };
  }

  return { valid: true };
}

/**
 * Parses optional trailing adverbial modifiers at the end of a clause:
 * - Deictic location adverbs: "here", "there"
 * - Prepositional phrases: "in the morning", "for you", "to me"
 * - Location adverb + "in" + time PP: "here in the morning", "out in the night"
 * - Combinations like "here for you"
 */
function parseTrailingAdverbials(tokens: string[]): { valid: boolean; reason?: string } {
  if (tokens.length === 0) return { valid: true };

  if (tokens.length === 1) {
    if (tokens[0] === 'here' || tokens[0] === 'there') {
      return { valid: true };
    }
    return { valid: false, reason: `Unexpected trailing word "${tokens[0]}"` };
  }

  if (tokens[0] === 'here' || tokens[0] === 'there') {
    const restCheck = parseTrailingAdverbials(tokens.slice(1));
    if (restCheck.valid) return { valid: true };
  }

  if ((tokens[0] === 'up' || tokens[0] === 'down' || tokens[0] === 'out') && tokens[1] === 'in') {
    const prepCheck = parsePrepositionalPhrase(tokens.slice(1));
    if (prepCheck.valid && prepCheck.length === tokens.length - 1) {
      return { valid: true };
    }
  }

  const prepCheck = parsePrepositionalPhrase(tokens);
  if (prepCheck.valid && prepCheck.length === tokens.length) {
    return { valid: true };
  }

  return { valid: false, reason: prepCheck.reason || `Invalid modifier "${tokens.join(' ')}"` };
}

function parseObjectWithTrailing(
  tokens: string[],
  allowCompoundObj: boolean = true
): { valid: boolean; objTokens: string[]; trailingTokens: string[]; reason?: string } {
  const direct = parseObjectPhrase(tokens);
  if (direct.valid) {
    return { valid: true, objTokens: tokens, trailingTokens: [] };
  }

  for (let split = tokens.length - 1; split >= 1; split--) {
    const objPart = tokens.slice(0, split);
    const trailPart = tokens.slice(split);
    if (!allowCompoundObj && objPart.includes('and')) continue;
    const objCheck = parseObjectPhrase(objPart);
    if (objCheck.valid) {
      const trailCheck = parseTrailingAdverbials(trailPart);
      if (trailCheck.valid) {
        return { valid: true, objTokens: objPart, trailingTokens: trailPart };
      }
    }
  }

  return { valid: false, objTokens: tokens, trailingTokens: [], reason: direct.reason };
}

function validateDoObjectWithTrailing(tokens: string[]): { isValid: boolean; reason?: string } {
  const direct = validateDoObject(tokens);
  if (direct.isValid) return direct;

  for (let split = tokens.length - 1; split >= 1; split--) {
    const objPart = tokens.slice(0, split);
    const trailPart = tokens.slice(split);
    const objCheck = validateDoObject(objPart);
    if (objCheck.isValid) {
      const trailCheck = parseTrailingAdverbials(trailPart);
      if (trailCheck.valid) {
        return { isValid: true };
      }
    }
  }

  return direct;
}

function isBareIndefinitePronounPhrase(tokens: string[]): boolean {
  if (tokens.length === 1 && INDEFINITE_PRONOUNS.has(tokens[0])) return true;
  if (tokens.length === 2 && tokens[0] === 'some' && (tokens[1] === 'body' || tokens[1] === 'thing')) return true;
  return false;
}

function getIndefiniteBase(tokens: string[]): 'some body' | 'some thing' | null {
  if (tokens.length === 0) return null;
  if (tokens[0] === 'some body' || tokens[0] === 'somebody') return 'some body';
  if (tokens[0] === 'some thing' || tokens[0] === 'something') return 'some thing';
  if (tokens.length >= 2 && tokens[0] === 'some' && tokens[1] === 'body') return 'some body';
  if (tokens.length >= 2 && tokens[0] === 'some' && tokens[1] === 'thing') return 'some thing';
  return null;
}

function isProperNameToken(w: string): boolean {
  return (
    PROPER_WILDCARD_TOKENS.has(w) ||
    (/^[a-z]{3,6}$/.test(w) && !ALL_STANDARD_GAME_WORDS.has(w) && !WH_QUESTION_WORDS.has(w))
  );
}

function getSemanticCategory(tokens: string[]): 'human' | 'time' | 'name' | 'object' | 'neutral_pronoun' {
  if (tokens.length === 0) return 'object';
  const indef = getIndefiniteBase(tokens);
  if (indef === 'some body') return 'human';
  if (indef === 'some thing') return 'object';

  const last = tokens[tokens.length - 1];
  if (tokens.length === 1) {
    if (['i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'us', 'them'].includes(last)) {
      return 'human';
    }
    if (['it', 'this', 'that', 'these', 'those'].includes(last)) {
      return 'neutral_pronoun';
    }
  }
  if (TIME_NOUNS.has(last)) return 'time';
  if (last === 'name') return 'name';
  if (HUMAN_NOUNS.has(last) || isProperNameToken(last)) return 'human';
  return 'object';
}

function canSubjectPerformDo(subjectTokens: string[]): boolean {
  const subjCat = getSemanticCategory(subjectTokens);
  return subjCat !== 'time' && subjCat !== 'name' && subjCat !== 'object';
}

function validateDoObject(objTokens: string[]): { isValid: boolean; reason?: string } {
  if (objTokens.length === 0) {
    return {
      isValid: false,
      reason: 'Verb "do" requires a thing or activity as object (e.g. "a thing", "some thing", "good")',
    };
  }
  if (objTokens.length === 1 && ['good', 'it', 'this', 'that'].includes(objTokens[0])) {
    return { isValid: true };
  }
  const np = parseNounPhrase(objTokens, 0);
  if (!np.valid || np.length !== objTokens.length) {
    return { isValid: false, reason: np.reason || `Invalid object "${objTokens.join(' ')}" for verb "do"` };
  }
  const objCat = getSemanticCategory(objTokens);
  if (objCat !== 'object') {
    return {
      isValid: false,
      reason: `Verb "do" takes a thing or activity as object (e.g. "a thing", "some thing"), not "${objTokens.join(' ')}"`,
    };
  }
  return { isValid: true };
}

/**
 * Validates predicate / complement following copula verb (is, am, are, was, were, be)
 */
export function validateCopulaComplement(
  tokens: string[],
  subjectTokens?: string[],
  subjectNumber?: GrammaticalNumber,
  isNegatedContext: boolean = false
): { isValid: boolean; reason?: string; ruleName?: string; ruleExplanation?: string } {
  if (tokens.length === 0) {
    return { isValid: false, reason: 'Sentence requires a complement (adjective, location, or noun phrase)' };
  }

  const hasNotToken = tokens[0] === 'not';
  const isNegated = isNegatedContext || hasNotToken;
  let rest = tokens;
  if (hasNotToken) {
    rest = tokens.slice(1);
    if (rest.length === 0) {
      return { isValid: false, reason: 'Missing complement after "not"' };
    }
  }

  // Bare demonstrative pronouns (this, that, these, those) cannot be used as copula complements
  // (e.g. cannot say "Fatima is that", "Some thing is those", "He is this"; use demonstratives as subjects: "That is Fatima", "Those are good")
  if (
    rest.length === 1 &&
    (DEMONSTRATIVES_SINGULAR.has(rest[0]) || DEMONSTRATIVES_PLURAL.has(rest[0]))
  ) {
    const subjStr = subjectTokens ? subjectTokens.join(' ') : 'Subject';
    return {
      isValid: false,
      reason: `Demonstrative pronoun "${rest[0]}" cannot be used as a copula complement (e.g. cannot say "${subjStr} is ${rest[0]}", use "${rest[0]} is...")`,
    };
  }

  // Subject pronouns (he, she, we, they, I) CANNOT be copula complements (cannot say "She is we", "Is she we", "He is she")
  if (rest.length === 1 && ['he', 'she', 'we', 'they', 'i'].includes(rest[0])) {
    return {
      isValid: false,
      reason: `Subject pronoun "${rest[0]}" cannot be used as a copula complement (cannot say "... is ${rest[0]}")`,
    };
  }

  // Cannot have identical subject and complement (e.g. "somebody is somebody", "thing is thing")
  if (
    subjectTokens &&
    subjectTokens.length === rest.length &&
    subjectTokens.every((st, idx) => st.toLowerCase() === rest[idx].toLowerCase())
  ) {
    return {
      isValid: false,
      reason: `Tautology error: Complement cannot be identical to the subject (cannot say "${subjectTokens.join(' ')} is ${rest.join(' ')}")`,
    };
  }

  // 0b. Present continuous / progressive: "[be] + doing + [thing / something / it / this / that / good]"
  // e.g. "That brother is doing a thing", "She is doing some thing good", "Is he doing it?"
  if (rest[0] === 'doing') {
    if (subjectTokens && subjectTokens.length > 0) {
      const subjCat = getSemanticCategory(subjectTokens);
      if (subjCat === 'time' || subjCat === 'name') {
        return {
          isValid: false,
          reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform progressive action "doing"`,
        };
      }
    }

    const objTokens = rest.slice(1);
    if (objTokens.length === 0) {
      return {
        isValid: false,
        reason: 'Incomplete progressive verb: "doing" requires an object (e.g. "doing a thing", "doing some thing", "doing good")',
      };
    }

    const progressiveCheck = validateDoObjectWithTrailing(objTokens);
    if (progressiveCheck.isValid) {
      return {
        isValid: true,
        ruleName: 'Present/Past Progressive ("Be + Doing + Object")',
        ruleExplanation: `Rule 4: Progressive verb construction "${tokens.join(' ')}".`,
      };
    }

    return {
      isValid: false,
      reason: progressiveCheck.reason || `Invalid object "${objTokens.join(' ')}" after "doing"`,
    };
  }

  // 0c. Compound copula complements joined by "and" / "but" (e.g. "young and good", "old but good", "my brother but not my friend")
  for (let i = 1; i < rest.length - 1; i++) {
    if (rest[i] === 'and' || rest[i] === 'but') {
      const leftComp = rest.slice(0, i);
      const rightComp = rest.slice(i + 1);
      if (leftComp.join(' ') === rightComp.join(' ')) {
        return {
          isValid: false,
          reason: `Redundant complement: cannot repeat "${leftComp.join(' ')}" with "${rest[i]}"`,
        };
      }
      const leftRes = validateCopulaComplement(leftComp, subjectTokens, subjectNumber, isNegated);
      const rightRes = validateCopulaComplement(rightComp, subjectTokens, subjectNumber, isNegated);
      if (leftRes.isValid && rightRes.isValid) {
        return {
          isValid: true,
          ruleName: 'Compound Copula Complement',
          ruleExplanation: `Rule 4: Coordinated complements joined by "${rest[i]}" ("${tokens.join(' ')}").`,
        };
      }
    }
  }

  // 1. Single adjective: "good", "bad", "young", "old", "big", "small" (+ optional time/location modifier, e.g. "good in the morning")
  if (ADJECTIVES.has(rest[0])) {
    if (rest.length === 1) {
      return {
        isValid: true,
        ruleName: 'Subject + Copula Verb + Adjective Complement',
        ruleExplanation: `Rule 4: Copula predicate with adjective complement "${tokens.join(' ')}".`,
      };
    }
    const adj = rest[0];
    if (rest[1] === 'to' || rest[1] === 'for') {
      if (!EVALUATIVE_ADJECTIVES.has(adj)) {
        return {
          isValid: false,
          reason: `Adjective "${adj}" cannot take a prepositional phrase (cannot say "${rest.join(' ')}")`,
        };
      }
      const prepParse = parsePrepositionalPhrase(rest.slice(1));
      if (prepParse.valid && prepParse.length === rest.length - 1) {
        return {
          isValid: true,
          ruleName: 'Evaluative Adjective + Prepositional Complement',
          ruleExplanation: `Rule 4 & 11: Evaluative adjective "${adj}" with prepositional complement "${rest.slice(1).join(' ')}".`,
        };
      }
      return { isValid: false, reason: prepParse.reason || `Invalid complement after "${adj}"` };
    }
    if (rest[1] === 'in' || rest[1] === 'here' || rest[1] === 'there') {
      const trail = parseTrailingAdverbials(rest.slice(1));
      if (trail.valid) {
        return {
          isValid: true,
          ruleName: 'Adjective Complement + Modifier',
          ruleExplanation: `Rule 4 & 11: Adjective "${adj}" with modifier "${rest.slice(1).join(' ')}".`,
        };
      }
      return { isValid: false, reason: trail.reason || `Invalid modifier "${rest.slice(1).join(' ')}" after "${adj}"` };
    }
    return {
      isValid: false,
      reason: `Adjective "${adj}" cannot be followed by "${rest.slice(1).join(' ')}"`,
    };
  }

  // 2. Single location adverb: "here", "there", "down", "up", "out"
  if (rest.length === 1 && LOCATION_ADVERBS.has(rest[0])) {
    return {
      isValid: true,
      ruleName: 'Subject + Copula Verb + Location Adverb',
      ruleExplanation: `Rule 4: Copula predicate with location adverb "${tokens.join(' ')}".`,
    };
  }

  // 3. Location adverb + adverbial modifier (e.g. "there in the morning", "here for you", "out in the night")
  if (LOCATION_ADVERBS.has(rest[0]) && rest.length > 1) {
    if (
      rest[1] === 'in' ||
      ((rest[0] === 'here' || rest[0] === 'there') && (rest[1] === 'for' || rest[1] === 'to'))
    ) {
      const timePrep = parsePrepositionalPhrase(rest.slice(1));
      if (timePrep.valid && timePrep.length === rest.length - 1) {
        return {
          isValid: true,
          ruleName: 'Subject + Copula Verb + Location & Time/Beneficiary Phrase',
          ruleExplanation: `Rule 4 & 11: Location adverb "${rest[0]}" paired with prepositional phrase "${rest.slice(1).join(' ')}".`,
        };
      }
    }
    return {
      isValid: false,
      reason: `Location adverb "${rest[0]}" cannot be followed by "${rest.slice(1).join(' ')}" (cannot say "${rest.join(' ')}")`,
    };
  }

  // 4. Standalone Prepositional phrase:
  // e.g. "for them", "for you", "to him", "in the morning", "for Fatima"
  if (TRUE_PREPOSITIONS.has(rest[0])) {
    const prepParse = parsePrepositionalPhrase(rest);
    if (prepParse.valid && prepParse.length === rest.length) {
      return {
        isValid: true,
        ruleName: 'Subject + Copula Verb + Prepositional Complement',
        ruleExplanation: `Rule 4 & 11: Copula predicate with prepositional phrase "${tokens.join(' ')}".`,
      };
    }
    return { isValid: false, reason: prepParse.reason || `Invalid prepositional phrase "${rest.join(' ')}"` };
  }

  // 5. Noun Phrase Complement (Predicate Nominative) + optional trailing adverbial:
  // e.g. "a friend", "the sister", "my mother", "a good night", "Sara", "a friend to me", "a father here"
  const np = parseNounPhrase(rest, 0);
  const compTokens = np.valid ? rest.slice(0, np.length) : [];
  const trailingTokens = np.valid ? rest.slice(np.length) : [];
  const trailingCheck = trailingTokens.length === 0 ? { valid: true } : parseTrailingAdverbials(trailingTokens);
  if (np.valid && trailingCheck.valid) {
    // Disallow awkward/nonsensical trailing modifiers on human role predicate nouns
    // (e.g. allow "a friend to me", "a father here", "a father for them",
    // but reject "a friend for her name", "a friend for a thing", "a friend in the morning")
    if (trailingTokens.length > 0 && getSemanticCategory(compTokens) === 'human') {
      const firstTrail = trailingTokens[0];
      const trailValidForHuman =
        firstTrail === 'here' ||
        firstTrail === 'there' ||
        firstTrail === 'to' ||
        (firstTrail === 'for' && isHumanEntity(trailingTokens.slice(1)));
      if (!trailValidForHuman) {
        return {
          isValid: false,
          reason: `Semantic mismatch: Human predicate "${compTokens.join(' ')}" cannot take modifier "${trailingTokens.join(' ')}"`,
        };
      }
    }
    // Disallow bare indefinite pronouns ("some body", "some thing") as copula predicate nominatives,
    // while allowing qualified forms like "some thing big" (e.g. "It is some thing big") when semantically compatible.
    if (isBareIndefinitePronounPhrase(compTokens)) {
      return {
        isValid: false,
        reason: `Indefinite pronoun "${compTokens.join(' ')}" cannot be used as a copula complement`,
      };
    }

    if (subjectTokens) {
      const subjIndef = getIndefiniteBase(subjectTokens);
      const compIndef = getIndefiniteBase(compTokens);
      if (subjIndef && compIndef && subjIndef === compIndef) {
        return {
          isValid: false,
          reason: `Redundant complement: "${subjectTokens.join(' ')}" cannot repeat "${compTokens.join(' ')}"`,
        };
      }
    }

    // Plural subjects ("we", "they", "these", "those") cannot take singular predicate nouns
    // (All common nouns in Fun Grammar are singular)
    if (subjectNumber === 'plural' && np.number === 'singular') {
      return {
        isValid: false,
        reason: `Number agreement error: Plural subject cannot take singular noun phrase "${compTokens.join(' ')}"`,
      };
    }

    // Semantic compatibility between subject and predicate nominative
    // In affirmative statements, mismatched categories/genders are invalid (e.g. "Brother is a mother");
    // under negation ("Brother is not a mother"), denying a mismatched identity is both grammatical and true.
    if (subjectTokens && subjectTokens.length > 0) {
      const subjCat = getSemanticCategory(subjectTokens);
      const compCat = getSemanticCategory(compTokens);

      if (!isNegated) {
        // Human subjects cannot equate to non-human nouns (night, morning, thing, name),
        // EXCEPT proper names equating to "name" (e.g., "Sarah is a good name", "Ali is my name").
        const subjIsProperName = subjectTokens.length === 1 && isProperNameToken(subjectTokens[0]);
        if (
          subjCat === 'human' &&
          (compCat === 'time' || compCat === 'object' || (compCat === 'name' && !subjIsProperName))
        ) {
          return {
            isValid: false,
            reason: `Semantic mismatch: Human subject "${subjectTokens.join(' ')}" cannot be "${compTokens.join(' ')}"`,
          };
        }
        // Time subjects cannot equate to human or object nouns
        if (subjCat === 'time' && (compCat === 'human' || compCat === 'object' || compCat === 'name')) {
          return {
            isValid: false,
            reason: `Semantic mismatch: Time phrase "${subjectTokens.join(' ')}" cannot be "${compTokens.join(' ')}"`,
          };
        }
        // Object subjects ("thing", "some thing") cannot equate to human or time nouns
        if (subjCat === 'object' && (compCat === 'human' || compCat === 'time' || compCat === 'name')) {
          return {
            isValid: false,
            reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot be "${compTokens.join(' ')}"`,
          };
        }
        // Name subject ("your name") expects a proper name or "good/bad" (already handled above), NOT "sister" or "night"
        if (subjCat === 'name' && compCat !== 'name' && !isProperNameToken(compTokens[compTokens.length - 1])) {
          return {
            isValid: false,
            reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot be "${compTokens.join(' ')}"`,
          };
        }
        // Gender consistency for "he" / "she" / "father" / "mother" / "brother" / "sister"
        const subjLast = subjectTokens[subjectTokens.length - 1];
        const compLast = compTokens[compTokens.length - 1];
        const maleWords = new Set(['he', 'father', 'brother']);
        const femaleWords = new Set(['she', 'mother', 'sister']);
        if (
          (maleWords.has(subjLast) && femaleWords.has(compLast)) ||
          (femaleWords.has(subjLast) && maleWords.has(compLast))
        ) {
          return {
            isValid: false,
            reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot be "${compTokens.join(' ')}"`,
          };
        }
      }

      const subjLast = subjectTokens[subjectTokens.length - 1];
      const compLast = compTokens[compTokens.length - 1];
      // Prevent redundant bare head noun pairing like "a thing is the thing" or "that night is a night"
      if (subjLast === compLast && ['thing', 'night', 'morning', 'name'].includes(subjLast)) {
        return {
          isValid: false,
          reason: `Redundant complement: "${subjectTokens.join(' ')}" cannot repeat "${compTokens.join(' ')}"`,
        };
      }
    }

    return {
      isValid: true,
      ruleName: 'Subject + Copula Verb + Predicate Noun Phrase',
      ruleExplanation: `Rule 4: Copula predicate with predicate noun phrase "${tokens.join(' ')}".`,
    };
  }

  return { isValid: false, reason: np.reason || `"${rest.join(' ')}" is not a grammatically valid complement` };
}

function validateDeclarativePredicate(
  subjectTokens: string[],
  subjectNumber: GrammaticalNumber,
  verbToken: string,
  predicateTokens: string[]
): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  // Check Subject-Verb Agreement
  const agreement = checkSubjectVerbAgreement(subjectNumber, verbToken);
  if (!agreement.isValid) {
    return { isValid: false, reason: agreement.reason };
  }

  // Copular verbs (is, am, are, was, were, be)
  if (['is', 'am', 'are', 'was', 'were', 'be'].includes(verbToken)) {
    return validateCopulaComplement(predicateTokens, subjectTokens, subjectNumber);
  }

  // Transitive have/has/had
  if (['have', 'has', 'had'].includes(verbToken)) {
    if (predicateTokens.length === 0) {
      return { isValid: false, reason: `Incomplete statement: Verb "${verbToken}" requires an object` };
    }

    let rest = predicateTokens;
    if (rest[0] === 'not') {
      rest = rest.slice(1);
      if (rest.length === 0) return { isValid: false, reason: 'Missing object after "not"' };
    }

    // Object can be an object pronoun or valid noun phrase (+ optional trailing adverbial), never a subject-only pronoun like "we"
    const objRes = parseObjectWithTrailing(rest);
    if (objRes.valid) {
      return {
        isValid: true,
        ruleName:
          objRes.objTokens.length === 1 && OBJECT_PRONOUNS.has(objRes.objTokens[0])
            ? 'Subject + Verb "Have" + Object Pronoun'
            : 'Subject + Verb "Have" + Noun Phrase Object',
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + transitive verb "${verbToken}" + object "${rest.join(' ')}".`,
      };
    }
    return { isValid: false, reason: objRes.reason || `Invalid object "${rest.join(' ')}" for verb "${verbToken}"` };
  }

  // Do-support auxiliary ("does not have", "did not do", "does have") or main verb "do/does/did"
  if (['do', 'does', 'did'].includes(verbToken)) {
    if (predicateTokens.length === 0) {
      return { isValid: false, reason: `Incomplete statement: Verb "${verbToken}" requires a verb or object` };
    }

    const isNegated = predicateTokens[0] === 'not';
    const afterNot = isNegated ? predicateTokens.slice(1) : predicateTokens;

    if (isNegated && afterNot.length === 0) {
      return { isValid: false, reason: `Incomplete negation: "${verbToken} not" requires a base verb (have, do, name)` };
    }

    if (isNegated || ['have', 'do', 'name'].includes(afterNot[0])) {
      const baseVerb = afterNot[0];
      if (baseVerb === 'be') {
        return {
          isValid: false,
          reason: `Cannot pair "${verbToken}${isNegated ? ' not' : ''}" with "be" (use a form of "is/am/are/was/were")`,
        };
      }
      if (!['have', 'do', 'name'].includes(baseVerb)) {
        return {
          isValid: false,
          reason: `"${verbToken} not" must be followed by base verb "have", "do", or "name"`,
        };
      }
      const subObj = afterNot.slice(1);
      if (baseVerb === 'have') {
        if (subObj.length === 0) return { isValid: false, reason: 'Missing object after "have"' };
        const objRes = parseObjectWithTrailing(subObj);
        if (!objRes.valid) return { isValid: false, reason: objRes.reason };
        return {
          isValid: true,
          ruleName: `Do-Support ("${verbToken}${isNegated ? ' not' : ''} have")`,
          ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + "${verbToken}${isNegated ? ' not' : ''} have" + object "${subObj.join(' ')}".`,
        };
      }
      if (baseVerb === 'name') {
        if (!canSubjectPerformDo(subjectTokens)) {
          return {
            isValid: false,
            reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "name"`,
          };
        }
        if (subObj.length === 0) return { isValid: false, reason: 'Missing object after "name"' };
        const objRes = parseObjectWithTrailing(subObj);
        if (!objRes.valid) return { isValid: false, reason: objRes.reason };
        return {
          isValid: true,
          ruleName: `Do-Support ("${verbToken}${isNegated ? ' not' : ''} name")`,
          ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + "${verbToken}${isNegated ? ' not' : ''} name" + object "${subObj.join(' ')}".`,
        };
      }
      // baseVerb === 'do'
      if (!canSubjectPerformDo(subjectTokens)) {
        return {
          isValid: false,
          reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform action verb "do"`,
        };
      }
      const doObjCheck = validateDoObjectWithTrailing(subObj);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      return {
        isValid: true,
        ruleName: `Do-Support ("${verbToken}${isNegated ? ' not' : ''} do")`,
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + "${verbToken}${isNegated ? ' not' : ''} do" + object "${subObj.join(' ')}".`,
      };
    }

    // Main transitive verb do/does/did
    if (!canSubjectPerformDo(subjectTokens)) {
      return {
        isValid: false,
        reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform action verb "${verbToken}"`,
      };
    }
    const doObjCheck = validateDoObjectWithTrailing(predicateTokens);
    if (!doObjCheck.isValid) {
      return { isValid: false, reason: doObjCheck.reason };
    }
    return {
      isValid: true,
      ruleName: 'Subject + Verb "Do" + Direct Object',
      ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + action verb "${verbToken}" + object "${predicateTokens.join(' ')}".`,
    };
  }

  // Modal verbs can/will
  if (verbToken === 'can' || verbToken === 'will') {
    if (predicateTokens.length === 0) {
      return { isValid: false, reason: `Modal verb "${verbToken}" requires a base verb (be, have, do, name)` };
    }

    let rest = predicateTokens;
    const modalNegated = rest[0] === 'not';
    if (modalNegated) {
      rest = rest.slice(1);
      if (rest.length === 0) return { isValid: false, reason: 'Missing verb after "not"' };
    }

    const baseVerb = rest[0];
    if (!['be', 'have', 'do', 'name'].includes(baseVerb)) {
      return { isValid: false, reason: `Modal "${verbToken}" must be followed by base verb "be", "have", "do", or "name"` };
    }

    const subPred = rest.slice(1);
    if (baseVerb === 'be') {
      const copResult = validateCopulaComplement(subPred, subjectTokens, subjectNumber, modalNegated);
      if (!copResult.isValid) return copResult;
      return {
        isValid: true,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "be" + Complement`,
        ruleExplanation: `Rule 4: Modal predicate with auxiliary "${verbToken}${modalNegated ? ' not' : ''} be" and complement "${subPred.join(' ')}".`,
      };
    }
    if (baseVerb === 'have') {
      if (subPred.length === 0) return { isValid: false, reason: 'Missing object for "have"' };
      const objRes = parseObjectWithTrailing(subPred);
      return {
        isValid: objRes.valid,
        reason: objRes.reason,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "have" + Object`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken} have" and object "${subPred.join(' ')}".`,
      };
    }
    if (baseVerb === 'name') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return {
          isValid: false,
          reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "name"`,
        };
      }
      if (subPred.length === 0) return { isValid: false, reason: 'Missing object for "name"' };
      const objRes = parseObjectWithTrailing(subPred);
      return {
        isValid: objRes.valid,
        reason: objRes.reason,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "name" + Object`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken} name" and object "${subPred.join(' ')}".`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return {
          isValid: false,
          reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform action verb "do"`,
        };
      }
      const doObjCheck = validateDoObjectWithTrailing(subPred);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      return {
        isValid: true,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "do" + Object`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken} do" and object "${subPred.join(' ')}".`,
      };
    }
  }

  return { isValid: false, reason: `Unrecognized verb structure "${verbToken}"` };
}

/**
 * Validates a Declarative Statement (Subject + Verb + [Complement/Object])
 */
function validateDeclarativeSentence(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  // Find verb position
  let verbIdx = -1;
  for (let i = 0; i < words.length; i++) {
    if (ALL_VERBS.has(words[i])) {
      verbIdx = i;
      break;
    }
  }

  if (verbIdx === -1) {
    return { isValid: false, reason: 'Incomplete statement: Missing verb or predicate' };
  }

  // Must have a subject before verb
  const subjectTokens = words.slice(0, verbIdx);
  if (subjectTokens.length === 0) {
    return { isValid: false, reason: 'Incomplete statement: Missing subject before verb' };
  }

  // Parse and validate subject NP (disallow postpositive adjectives in subject position)
  const subjectNp = parseNounPhrase(subjectTokens, 0, false);
  if (!subjectNp.valid || subjectNp.length !== subjectTokens.length) {
    if (
      subjectNp.valid &&
      subjectNp.length < subjectTokens.length &&
      getIndefiniteBase(subjectTokens) &&
      ADJECTIVES.has(subjectTokens[subjectNp.length])
    ) {
      return {
        isValid: false,
        reason: `Indefinite pronoun "${subjectTokens.slice(0, subjectNp.length).join(' ')}" cannot be modified by "${subjectTokens.slice(subjectNp.length).join(' ')}"`,
      };
    }
    return {
      isValid: false,
      reason: subjectNp.reason || `Invalid subject phrase "${subjectTokens.join(' ')}"`,
    };
  }

  return validateDeclarativePredicate(
    subjectTokens,
    subjectNp.number,
    words[verbIdx],
    words.slice(verbIdx + 1)
  );
}

/**
 * Validates an Inverted Question (starts with auxiliary/copula)
 * e.g. "Is father good?", "Are they here?", "Was it a good night?", "Does he have a friend?"
 */
function validateInvertedQuestion(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  const first = words[0];
  if (!['is', 'am', 'are', 'was', 'were', 'does', 'do', 'did', 'can', 'will', 'has', 'have'].includes(first)) {
    return { isValid: false, reason: 'Not an auxiliary question' };
  }

  const rest = words.slice(1);
  if (rest.length === 0) {
    return { isValid: false, reason: 'Incomplete question' };
  }

  // 0. Am: expects "I" + Copula Complement (e.g. "Am I good?", "Am I here?")
  if (first === 'am') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid || subjectNp.number !== 'i') {
      return { isValid: false, reason: subjectNp.reason || '"Am" requires subject "I"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const complementTokens = rest.slice(subjectNp.length);
    const copRes = validateCopulaComplement(complementTokens, subjectTokens, subjectNp.number);
    if (!copRes.isValid) return copRes;
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative (Copula Question)',
      ruleExplanation: `Rule 4: Inverted question with copula "am" + subject "I" + complement "${complementTokens.join(' ')}".`,
    };
  }

  // 1. Is / Was: expects Singular Subject + Copula Complement (or Existential "Is/Was there [not] NP [adverbial]")
  if (first === 'is' || first === 'was') {
    if (rest[0] === 'there') {
      const afterThere = rest.slice(1);
      const subjStart = afterThere[0] === 'not' ? afterThere.slice(1) : afterThere;
      const exNp = parseNounPhrase(subjStart, 0, true);
      if (exNp.valid && exNp.number === 'singular') {
        const trailOk = parseTrailingAdverbials(subjStart.slice(exNp.length)).valid;
        if (trailOk) {
          return {
            isValid: true,
            ruleName: 'Existential Interrogative ("Is/Was there")',
            ruleExplanation: `Rule 4: Existential question "${words.join(' ')}".`,
          };
        }
      }
      return { isValid: false, reason: exNp.reason || `Invalid existential question "${words.join(' ')}"` };
    }

    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${first}"` };
    }
    if (subjectNp.number !== 'singular' && subjectNp.number !== 'i') {
      return { isValid: false, reason: `"${first}" requires a singular subject` };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const complementTokens = rest.slice(subjectNp.length);
    const copRes = validateCopulaComplement(complementTokens, subjectTokens, subjectNp.number);
    if (!copRes.isValid) return copRes;
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative (Copula Question)',
      ruleExplanation: `Rule 4: Inverted question with copula "${first}" + subject "${subjectTokens.join(' ')}" + complement "${complementTokens.join(' ')}".`,
    };
  }

  // 2. Are / Were: expects Plural Subject (or "you") + Copula Complement
  if (first === 'are' || first === 'were') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${first}"` };
    }
    if (subjectNp.number !== 'plural' && subjectNp.number !== 'you') {
      return { isValid: false, reason: `"${first}" requires a plural subject or "you"` };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const complementTokens = rest.slice(subjectNp.length);
    const copRes = validateCopulaComplement(complementTokens, subjectTokens, subjectNp.number);
    if (!copRes.isValid) return copRes;
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative (Copula Question)',
      ruleExplanation: `Rule 4: Inverted question with copula "${first}" + plural/second-person subject "${subjectTokens.join(' ')}" + complement "${complementTokens.join(' ')}".`,
    };
  }

  // 3. Does: expects Singular Subject + [not] + Base Verb (have, do, name) + Complement
  if (first === 'does') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid || subjectNp.number !== 'singular') {
      return { isValid: false, reason: subjectNp.reason || '"Does" requires a singular subject' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    let afterSubject = rest.slice(subjectNp.length);
    if (afterSubject[0] === 'not') {
      afterSubject = afterSubject.slice(1);
    }
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'name'].includes(baseVerb)) {
      return { isValid: false, reason: `Question with "does" requires base verb "have", "do", or "name", not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'name') {
      if (baseVerb === 'name' && !canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "name"` };
      }
      const objRes = parseObjectWithTrailing(subComplement);
      if (!objRes.valid) return { isValid: false, reason: objRes.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Does" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "${baseVerb}" + object "${subComplement.join(' ')}".`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Does" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "do" + object "${subComplement.join(' ')}".`,
      };
    }
  }

  // 4. Do: expects Plural Subject / You / I + [not] + Base Verb + Complement
  if (first === 'do') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid || (subjectNp.number !== 'plural' && subjectNp.number !== 'you' && subjectNp.number !== 'i')) {
      return { isValid: false, reason: subjectNp.reason || '"Do" requires a plural subject or "you"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    let afterSubject = rest.slice(subjectNp.length);
    if (afterSubject[0] === 'not') {
      afterSubject = afterSubject.slice(1);
    }
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'name'].includes(baseVerb)) {
      return { isValid: false, reason: `Question with "do" requires base verb "have", "do", or "name", not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'name') {
      if (baseVerb === 'name' && !canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "name"` };
      }
      const objRes = parseObjectWithTrailing(subComplement);
      if (!objRes.valid) return { isValid: false, reason: objRes.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Do" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + verb "${baseVerb}".`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Do" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + verb "do".`,
      };
    }
  }

  // 5. Did: expects Subject + [not] + Base Verb + Complement
  if (first === 'did') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || 'Invalid subject after "did"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    let afterSubject = rest.slice(subjectNp.length);
    if (afterSubject[0] === 'not') {
      afterSubject = afterSubject.slice(1);
    }
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'name'].includes(baseVerb)) {
      return { isValid: false, reason: `Question with "did" requires base verb "have", "do", or "name", not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'name') {
      if (baseVerb === 'name' && !canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "name"` };
      }
      const objRes = parseObjectWithTrailing(subComplement);
      if (!objRes.valid) return { isValid: false, reason: objRes.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Did" Question)',
        ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + verb "${baseVerb}".`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Did" Question)',
        ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + verb "do".`,
      };
    }
  }

  // 6. Can / Will: expects Subject + [not] + Base Verb + Complement (or Existential "Can/Will there [not] be NP")
  if (first === 'can' || first === 'will') {
    if (rest[0] === 'there') {
      let afterThere = rest.slice(1);
      if (afterThere[0] === 'not') afterThere = afterThere.slice(1);
      if (afterThere[0] === 'be') {
        const subjTokens = afterThere.slice(1);
        const exNp = parseNounPhrase(subjTokens, 0, true);
        if (exNp.valid && parseTrailingAdverbials(subjTokens.slice(exNp.length)).valid) {
          return {
            isValid: true,
            ruleName: `Existential Modal Question ("${first} there be")`,
            ruleExplanation: `Rule 4: Existential modal question "${words.join(' ')}".`,
          };
        }
        return { isValid: false, reason: exNp.reason || `Invalid existential question "${words.join(' ')}"` };
      }
    }

    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${first}"` };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    let afterSubject = rest.slice(subjectNp.length);
    const modalNegated = afterSubject[0] === 'not';
    if (modalNegated) {
      afterSubject = afterSubject.slice(1);
    }
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in modal question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'be', 'name'].includes(baseVerb)) {
      return { isValid: false, reason: `Modal question requires base verb (have, do, be, name), not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'name') {
      if (baseVerb === 'name' && !canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "name"` };
      }
      const objRes = parseObjectWithTrailing(subComplement);
      if (!objRes.valid) return { isValid: false, reason: objRes.reason };
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + base verb "${baseVerb}".`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + base verb "do".`,
      };
    }
    if (baseVerb === 'be') {
      const copRes = validateCopulaComplement(subComplement, subjectTokens, subjectNp.number, modalNegated);
      if (!copRes.isValid) return copRes;
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + "be" + complement "${subComplement.join(' ')}".`,
      };
    }
  }

  // 7. Has / Have: expects Subject + Object NP
  if (first === 'has') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid || subjectNp.number !== 'singular') {
      return { isValid: false, reason: subjectNp.reason || '"Has" requires a singular subject' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const subComplement = rest.slice(subjectNp.length);
    const objRes = parseObjectWithTrailing(subComplement);
    if (!objRes.valid) return { isValid: false, reason: objRes.reason };
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative ("Has" Question)',
      ruleExplanation: `Rule 4: Question with "has" + subject "${subjectTokens.join(' ')}" + object "${subComplement.join(' ')}".`,
    };
  }

  if (first === 'have') {
    const subjectNp = parseNounPhrase(rest, 0, false);
    if (!subjectNp.valid || (subjectNp.number !== 'plural' && subjectNp.number !== 'you')) {
      return { isValid: false, reason: subjectNp.reason || '"Have" requires a plural subject or "you"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const subComplement = rest.slice(subjectNp.length);
    const objRes = parseObjectWithTrailing(subComplement);
    if (!objRes.valid) return { isValid: false, reason: objRes.reason };
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative ("Have" Question)',
      ruleExplanation: `Rule 4: Question with "have" + subject "${subjectTokens.join(' ')}" + object "${subComplement.join(' ')}".`,
    };
  }

  return { isValid: false, reason: 'Unrecognized question structure' };
}

/**
 * Validates a WH-Question (starts with where, when, who, what, why, how)
 * e.g. "Where am I?", "Where is he?", "How old is he?", "What is that?", "Who am I?"
 */
function validateWhQuestion(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  const wh = words[0];
  const rest = words.slice(1);
  if (rest.length < 2) {
    return { isValid: false, reason: `Incomplete question after "${wh}"` };
  }

  // Special case: "How + Adjective + Copula + Subject" (e.g. "How old is he?", "How big is the thing?", "How good are you?")
  if (wh === 'how' && ADJECTIVES.has(rest[0]) && rest.length >= 3 && ['is', 'am', 'are', 'was', 'were'].includes(rest[1])) {
    const copula = rest[1];
    const afterCop = rest.slice(2);
    const subjectNp = parseNounPhrase(afterCop, 0, false);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "how ${rest[0]} ${copula}"` };
    }
    const agreement = checkSubjectVerbAgreement(subjectNp.number, copula);
    if (!agreement.isValid) {
      return { isValid: false, reason: agreement.reason };
    }
    const remainder = afterCop.slice(subjectNp.length);
    if (remainder.length === 0 || parseTrailingAdverbials(remainder).valid) {
      return {
        isValid: true,
        ruleName: 'WH-Question ("How + Adjective")',
        ruleExplanation: `Rule 4: Degree WH-question "${words.join(' ')}".`,
      };
    }
    return { isValid: false, reason: `Unexpected words "${remainder.join(' ')}" in question` };
  }

  const aux = rest[0];
  const afterAux = rest.slice(1);

  // 1. Adverbial WH-questions: where, when, why, how + auxiliary + subject + ...
  if (wh === 'where' || wh === 'when' || wh === 'why' || wh === 'how') {
    if (['is', 'am', 'are', 'was', 'were'].includes(aux)) {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (!subjectNp.valid) {
        return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${wh} ${aux}"` };
      }
      const agreement = checkSubjectVerbAgreement(subjectNp.number, aux);
      if (!agreement.isValid) {
        return { isValid: false, reason: agreement.reason };
      }
      const subjectTokens = afterAux.slice(0, subjectNp.length);
      const complementTokens = afterAux.slice(subjectNp.length);
      if (complementTokens.length === 0) {
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}" with copula "${aux}" and subject "${subjectTokens.join(' ')}".`,
        };
      }
      const copRes = validateCopulaComplement(complementTokens, subjectTokens, subjectNp.number);
      if (!copRes.isValid) return copRes;
      return {
        isValid: true,
        ruleName: `WH-Question ("${wh}")`,
        ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
      };
    }

    if (aux === 'can' || aux === 'will') {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (!subjectNp.valid) {
        return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${wh} ${aux}"` };
      }
      let afterSubject = afterAux.slice(subjectNp.length);
      const modalNegated = afterSubject[0] === 'not';
      if (modalNegated) afterSubject = afterSubject.slice(1);
      if (afterSubject.length === 0 || !['be', 'have', 'do', 'name'].includes(afterSubject[0])) {
        return { isValid: false, reason: `Question with "${wh} ${aux}" requires base verb (be, have, do, name)` };
      }
      const baseVerb = afterSubject[0];
      const subComp = afterSubject.slice(1);
      if (baseVerb === 'be') {
        if (subComp.length === 0) {
          return {
            isValid: true,
            ruleName: `WH-Question ("${wh}")`,
            ruleExplanation: `Rule 4: Modal WH-question "${words.join(' ')}".`,
          };
        }
        const copRes = validateCopulaComplement(subComp, afterAux.slice(0, subjectNp.length), subjectNp.number, modalNegated);
        if (!copRes.isValid) return copRes;
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: Modal WH-question "${words.join(' ')}".`,
        };
      }
      if (baseVerb === 'do') {
        const subjTokens = afterAux.slice(0, subjectNp.length);
        if (!canSubjectPerformDo(subjTokens)) {
          return { isValid: false, reason: `Semantic mismatch: "${subjTokens.join(' ')}" cannot perform verb "do"` };
        }
        const doObjCheck = validateDoObjectWithTrailing(subComp);
        if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: Modal WH-question "${words.join(' ')}".`,
        };
      }
      if (baseVerb === 'name' && !canSubjectPerformDo(afterAux.slice(0, subjectNp.length))) {
        return { isValid: false, reason: `Semantic mismatch: "${afterAux.slice(0, subjectNp.length).join(' ')}" cannot perform verb "name"` };
      }
      const objRes = parseObjectWithTrailing(subComp);
      if (objRes.valid) {
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: Modal WH-question "${words.join(' ')}".`,
        };
      }
      return { isValid: false, reason: objRes.reason || `Invalid object after "${baseVerb}"` };
    }

    if (aux === 'do' || aux === 'does' || aux === 'did') {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (!subjectNp.valid) {
        return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${wh} ${aux}"` };
      }
      const agreement = checkSubjectVerbAgreement(subjectNp.number, aux);
      if (!agreement.isValid) {
        return { isValid: false, reason: agreement.reason };
      }
      let afterSubject = afterAux.slice(subjectNp.length);
      if (afterSubject[0] === 'not') afterSubject = afterSubject.slice(1);
      if (afterSubject.length === 0 || !['have', 'do', 'name'].includes(afterSubject[0])) {
        return { isValid: false, reason: `Question with "${wh} ${aux}" requires base verb "have", "do", or "name"` };
      }
      const subComp = afterSubject.slice(1);
      if (subComp.length === 0) {
        return { isValid: false, reason: `Incomplete question: "${afterSubject[0]}" requires an object` };
      }
      if (afterSubject[0] === 'do') {
        const subjTokens = afterAux.slice(0, subjectNp.length);
        if (!canSubjectPerformDo(subjTokens)) {
          return { isValid: false, reason: `Semantic mismatch: "${subjTokens.join(' ')}" cannot perform verb "do"` };
        }
        const doObjCheck = validateDoObjectWithTrailing(subComp);
        if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
        };
      }
      if (afterSubject[0] === 'name' && !canSubjectPerformDo(afterAux.slice(0, subjectNp.length))) {
        return { isValid: false, reason: `Semantic mismatch: "${afterAux.slice(0, subjectNp.length).join(' ')}" cannot perform verb "name"` };
      }
      const objRes = parseObjectWithTrailing(subComp);
      if (objRes.valid) {
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
        };
      }
      return { isValid: false, reason: objRes.reason || `Invalid object after "${afterSubject[0]}"` };
    }

    return {
      isValid: false,
      reason: `WH-question "${wh}" must be followed by an auxiliary verb (am, is, are, was, were, do, does, did, can, will)`,
    };
  }

  // 2. Nominal WH-questions: who, what
  if (wh === 'who' || wh === 'what') {
    // e.g. "Who am I", "Who is he", "What is that", "What is your name"
    if (['is', 'am', 'are', 'was', 'were'].includes(aux)) {
      if (afterAux.length === 1 && ['it', 'this', 'that', 'these', 'those'].includes(afterAux[0]) && (aux === 'is' || aux === 'was' || aux === 'are' || aux === 'were')) {
        const num = ['these', 'those'].includes(afterAux[0]) ? 'plural' : 'singular';
        if (checkSubjectVerbAgreement(num, aux).isValid) {
          return {
            isValid: true,
            ruleName: `WH-Question ("${wh}")`,
            ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
          };
        }
      }
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (subjectNp.valid && subjectNp.length === afterAux.length && checkSubjectVerbAgreement(subjectNp.number, aux).isValid) {
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
        };
      }
      // Or WH as subject: "Who is here?", "What is good?", "Who is my friend?"
      const placeholder = wh === 'who' ? 'some body' : 'some thing';
      const asSubj = validateDeclarativeSentence([placeholder, ...rest]);
      if (asSubj.isValid) {
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}" Subject)`,
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
        };
      }
      return { isValid: false, reason: asSubj.reason || `Invalid question "${words.join(' ')}"` };
    }

    // Object WH-question with do/does/did/can/will: "What does he have", "What did you do", "Who will you name", "What did you name it"
    if (['do', 'does', 'did', 'can', 'will'].includes(aux)) {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (subjectNp.valid && checkSubjectVerbAgreement(subjectNp.number, aux).isValid) {
        let afterSubj = afterAux.slice(subjectNp.length);
        if (afterSubj[0] === 'not') afterSubj = afterSubj.slice(1);
        if (afterSubj.length >= 1 && ['have', 'do', 'name'].includes(afterSubj[0])) {
          const restObj = afterSubj.slice(1);
          if (restObj.length === 0 || parseTrailingAdverbials(restObj).valid) {
            return {
              isValid: true,
              ruleName: `WH-Question ("${wh}")`,
              ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
            };
          }
          if (afterSubj[0] === 'name' && parseObjectWithTrailing(restObj).valid) {
            return {
              isValid: true,
              ruleName: `WH-Question ("${wh}" + Name Object)`,
              ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
            };
          }
        }
      }
    }

    // Subject WH-question with transitive/modal verb: "Who has a friend?", "Who can be here?"
    const placeholder = wh === 'who' ? 'some body' : 'some thing';
    const asSubj = validateDeclarativeSentence([placeholder, ...rest]);
    if (asSubj.isValid) {
      return {
        isValid: true,
        ruleName: `WH-Question ("${wh}" Subject)`,
        ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
      };
    }
    return { isValid: false, reason: asSubj.reason || `Invalid question "${words.join(' ')}"` };
  }

  return { isValid: false, reason: 'Unrecognized WH-question structure' };
}

/**
 * Validates an Imperative Statement (Command starting with base verb or "Do not + base verb")
 * e.g. "Name a thing", "Be good", "Do some thing", "Have a good night", "Do not be bad"
 */
function validateImperative(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  // Negative imperative: "Do not + be/have/do/name + ..."
  if (words.length >= 3 && words[0] === 'do' && words[1] === 'not') {
    const inner = validateImperative(words.slice(2));
    if (inner.isValid) {
      return {
        isValid: true,
        ruleName: 'Negative Imperative Command ("Do not")',
        ruleExplanation: `Rule 4: Negative imperative instruction "${words.join(' ')}".`,
      };
    }
    return { isValid: false, reason: inner.reason || 'Invalid negative imperative command' };
  }

  const first = words[0];
  const rest = words.slice(1);

  if (first === 'name' && rest.length >= 1) {
    const objRes = parseObjectWithTrailing(rest);
    if (objRes.valid) {
      return {
        isValid: true,
        ruleName: 'Imperative Command ("Name")',
        ruleExplanation: `Rule 4: Imperative sentence ordering to name an entity: "${words.join(' ')}".`,
      };
    }
  }

  if (first === 'be' && rest.length >= 1) {
    const copRes = validateCopulaComplement(rest);
    if (copRes.isValid) {
      return {
        isValid: true,
        ruleName: 'Imperative Command ("Be")',
        ruleExplanation: `Rule 4: Imperative statement instructing a state: "${words.join(' ')}".`,
      };
    }
  }

  if (first === 'do' && rest.length >= 1) {
    const doObjCheck = validateDoObjectWithTrailing(rest);
    if (doObjCheck.isValid) {
      return {
        isValid: true,
        ruleName: 'Imperative Command ("Do")',
        ruleExplanation: `Rule 4: Imperative action command: "${words.join(' ')}".`,
      };
    }
  }

  if (first === 'have' && rest.length >= 1) {
    const objRes = parseObjectWithTrailing(rest);
    if (objRes.valid) {
      return {
        isValid: true,
        ruleName: 'Imperative / Wish ("Have")',
        ruleExplanation: `Rule 4: Imperative expression: "${words.join(' ')}".`,
      };
    }
  }

  return { isValid: false, reason: 'Not a valid imperative command' };
}

/**
 * Validates established idiomatic social greetings
 */
function validateIdiomaticGreeting(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  if (words.length === 2 && words[0] === 'good' && (words[1] === 'night' || words[1] === 'morning')) {
    return {
      isValid: true,
      ruleName: 'Social Formula / Greeting',
      ruleExplanation: `Rule 4: Fixed conventional greeting phrase "${words.join(' ')}".`,
    };
  }
  return { isValid: false, reason: 'Not a valid idiomatic phrase' };
}

/**
 * Validates fronted locative / presentational clauses starting with "Here" or "There":
 * - "Here I am", "Here he is", "There you are", "There it was"
 * - "Here is Father", "There is a friend here", "There is not a thing"
 * - "There will be a good night", "There can be a friend here"
 */
function validateLocativeFronting(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  const lead = words[0];
  if (lead !== 'here' && lead !== 'there') {
    return { isValid: false, reason: 'Not a locative fronting clause' };
  }
  if (words.length < 3) {
    return { isValid: false, reason: `Incomplete sentence after "${lead}"` };
  }

  const copulas = ['is', 'am', 'are', 'was', 'were'];

  // Pattern A: "Here I am", "Here he is", "There you are", "There it was"
  const lastToken = words[words.length - 1];
  if (copulas.includes(lastToken)) {
    const subjTokens = words.slice(1, words.length - 1);
    const subjNp = parseNounPhrase(subjTokens, 0, false);
    if (subjNp.valid && subjNp.length === subjTokens.length) {
      const agreement = checkSubjectVerbAgreement(subjNp.number, lastToken);
      if (!agreement.isValid) {
        return { isValid: false, reason: agreement.reason };
      }
      return {
        isValid: true,
        ruleName: 'Fronted Locative ("Here/There" + Subject + Copula)',
        ruleExplanation: `Rule 4: Presentational/locative fronting "${words.join(' ')}".`,
      };
    }
  }

  // Pattern B: "Here is Father", "There is a friend here", "There is not a thing"
  const secondToken = words[1];
  if (copulas.includes(secondToken)) {
    const subjTokens = words[2] === 'not' ? words.slice(3) : words.slice(2);
    if (subjTokens.length > 0) {
      const subjNp = parseNounPhrase(subjTokens, 0);
      if (subjNp.valid) {
        const trailingOk = parseTrailingAdverbials(subjTokens.slice(subjNp.length)).valid;
        if (trailingOk) {
          const agreement = checkSubjectVerbAgreement(subjNp.number, secondToken);
          if (!agreement.isValid) {
            return { isValid: false, reason: agreement.reason };
          }
          return {
            isValid: true,
            ruleName: 'Existential / Presentational ("Here/There" + Copula + Subject)',
            ruleExplanation: `Rule 4: Locative inversion "${words.join(' ')}".`,
          };
        }
      }
    }
  }

  // Pattern C: Existential Modal "There will/can [not] be NP [adverbial]"
  if (lead === 'there' && (secondToken === 'will' || secondToken === 'can')) {
    let rest = words.slice(2);
    if (rest[0] === 'not') rest = rest.slice(1);
    if (rest[0] === 'be' && rest.length >= 2) {
      const subjTokens = rest.slice(1);
      const subjNp = parseNounPhrase(subjTokens, 0);
      if (subjNp.valid && parseTrailingAdverbials(subjTokens.slice(subjNp.length)).valid) {
        return {
          isValid: true,
          ruleName: `Existential Modal ("There ${secondToken} be")`,
          ruleExplanation: `Rule 4: Existential modal construction "${words.join(' ')}".`,
        };
      }
    }
  }

  return {
    isValid: false,
    reason: `"${lead}" must be followed by a subject and copula (e.g. "Here I am", "There is a friend")`,
  };
}

/**
 * Validates whether a token stream forms a grammatically sound Fun Grammar sentence.
 * Strictly rejects incomplete fragments (e.g. "A friend", "These father", "In the morning")
 * and incorrect statements (e.g. "Is night these father").
 */
export function validateSentenceClause(tokens: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  if (tokens.length === 0) return { isValid: false, reason: 'Incomplete: Empty sentence' };
  if (tokens.length === 1) return { isValid: false, reason: 'Incomplete: Sentences must have at least 2 words' };

  const words = tokens.map(cleanWord);

  // 1. Check conjunction coordination:
  // 1a. Independent clauses joined by "and" / "but" (trying all conjunction indices)
  let firstClauseError: string | undefined;
  for (let i = 1; i < words.length - 1; i++) {
    if (words[i] === 'and' || words[i] === 'but') {
      const leftPart = words.slice(0, i);
      const rightPart = words.slice(i + 1);
      const leftVal = validateSentenceClause(leftPart);
      const rightVal = validateSentenceClause(rightPart);
      if (leftVal.isValid && rightVal.isValid) {
        return {
          isValid: true,
          ruleName: 'Compound Sentence (Conjunction)',
          ruleExplanation: `Rule 4: Two independent clauses connected by conjunction "${words[i]}".`,
        };
      }
      if (!firstClauseError) {
        firstClauseError = !leftVal.isValid
          ? `Left clause error: ${leftVal.reason}`
          : `Right clause error: ${rightVal.reason}`;
      }
    }
  }

  // 1b. Compound Subject joined by "and" (e.g. "Father and mother are here", "Ali and I have a friend")
  for (let i = 1; i < words.length - 1; i++) {
    if (words[i] === 'and') {
      let verbAfterIdx = -1;
      for (let v = i + 1; v < words.length; v++) {
        if (ALL_VERBS.has(words[v])) {
          verbAfterIdx = v;
          break;
        }
      }
      if (verbAfterIdx > i + 1) {
        const leftNpTokens = words.slice(0, i);
        const rightNpTokens = words.slice(i + 1, verbAfterIdx);
        const leftNp = parseNounPhrase(leftNpTokens, 0, false);
        const rightNp = parseNounPhrase(rightNpTokens, 0, false);
        if (
          leftNp.valid &&
          leftNp.length === leftNpTokens.length &&
          rightNp.valid &&
          rightNp.length === rightNpTokens.length
        ) {
          const predRes = validateDeclarativePredicate(
            [...leftNpTokens, 'and', ...rightNpTokens],
            'plural',
            words[verbAfterIdx],
            words.slice(verbAfterIdx + 1)
          );
          if (predRes.isValid) {
            return {
              isValid: true,
              ruleName: 'Compound Subject + Plural Agreement',
              ruleExplanation: `Rule 4: Compound subject "${leftNpTokens.join(' ')} and ${rightNpTokens.join(' ')}" takes plural agreement.`,
            };
          }
          // Preserve specific verb agreement error (e.g. "Father and mother is here")
          firstClauseError = predRes.reason;
        }
      }
    }
  }

  // 1c. Coordinated Verb Predicates sharing the same subject (e.g. "He is good and has a friend")
  let firstVerbIdx = -1;
  for (let i = 0; i < words.length; i++) {
    if (ALL_VERBS.has(words[i])) {
      firstVerbIdx = i;
      break;
    }
  }
  if (firstVerbIdx > 0) {
    const subjTokens = words.slice(0, firstVerbIdx);
    const subjNp = parseNounPhrase(subjTokens, 0, false);
    if (subjNp.valid && subjNp.length === subjTokens.length) {
      for (let i = firstVerbIdx + 1; i < words.length - 1; i++) {
        if ((words[i] === 'and' || words[i] === 'but') && ALL_VERBS.has(words[i + 1])) {
          const leftSent = validateDeclarativeSentence(words.slice(0, i));
          const rightSent = validateDeclarativeSentence([...subjTokens, ...words.slice(i + 1)]);
          if (leftSent.isValid && rightSent.isValid) {
            return {
              isValid: true,
              ruleName: 'Compound Predicate (Shared Subject)',
              ruleExplanation: `Rule 4: Shared subject "${subjTokens.join(' ')}" with coordinated predicates joined by "${words[i]}".`,
            };
          }
        }
      }
    }
  }

  // 2. Check for idiomatic greeting (e.g. "Good night", "Good morning")
  const greetingCheck = validateIdiomaticGreeting(words);
  if (greetingCheck.isValid) {
    return greetingCheck;
  }

  // 3. Check for Imperative Command (e.g. "Name a thing", "Be good", "Do some thing", "Have a good night", "Do not be bad")
  if (['name', 'be', 'do', 'have'].includes(words[0])) {
    const impCheck = validateImperative(words);
    if (impCheck.isValid) {
      return impCheck;
    }
  }

  // 4. Check for WH-Question (e.g. "Where am I?", "Where is he?", "What is that?", "Who are you?", "How old is he?")
  if (WH_QUESTION_WORDS.has(words[0])) {
    const whCheck = validateWhQuestion(words);
    if (whCheck.isValid) {
      return whCheck;
    }
    return {
      isValid: false,
      reason: whCheck.reason || 'Incorrect WH-question structure',
    };
  }

  // 5. Check for Inverted Auxiliary Question (e.g. "Is father good?", "Am I good?", "Are they here?")
  if (['is', 'am', 'are', 'was', 'were', 'does', 'do', 'did', 'can', 'will', 'has', 'have'].includes(words[0])) {
    const questionCheck = validateInvertedQuestion(words);
    if (questionCheck.isValid) {
      return questionCheck;
    }
    // Return the specific question error reason so the player knows why it was rejected
    return {
      isValid: false,
      reason: questionCheck.reason || 'Incorrect question structure or missing complement',
    };
  }

  // 5b. Check for Fronted Locative / Presentational ("Here I am", "There is a friend", "There will be a good night")
  if (words[0] === 'here' || words[0] === 'there') {
    const locCheck = validateLocativeFronting(words);
    if (locCheck.isValid) {
      return locCheck;
    }
    return {
      isValid: false,
      reason: locCheck.reason || 'Invalid locative sentence structure',
    };
  }

  // 6. Standard Declarative Sentence (Subject + Verb + Predicate/Complement)
  const declCheck = validateDeclarativeSentence(words);
  if (declCheck.isValid) {
    return declCheck;
  }

  // If none matched, report clear error
  return {
    isValid: false,
    reason: firstClauseError || declCheck.reason || 'Incomplete or incorrect statement (requires complete subject and verb structure)',
  };
}

/**
 * Validates a full sequence of tiles that may contain full stops '.' (Rule 8)
 */
export function validateFullSequence(tiles: TileData[]): GrammarResult & {
  ruleName?: string;
  ruleExplanation?: string;
} {
  if (tiles.length === 0) return { isValid: false, score: 0, reason: 'Empty tile sequence' };

  // Disallow consecutive dots ("." immediately following ".") or multi-dot tokens ("..")
  for (let i = 0; i < tiles.length; i++) {
    const currWord = tiles[i].word.trim();
    if (/\.{2,}/.test(currWord)) {
      return {
        isValid: false,
        score: 0,
        reason: 'Invalid punctuation: A full stop "." cannot immediately follow another "."',
      };
    }
    if (i > 0 && currWord === '.' && tiles[i - 1].word.trim() === '.') {
      return {
        isValid: false,
        score: 0,
        reason: 'Invalid punctuation: A full stop "." cannot immediately follow another "."',
      };
    }
  }

  // Calculate total score characters
  let totalScore = 0;
  for (const t of tiles) {
    totalScore += getTileCharScore(t);
  }

  // Split sequence by full stop '.' (Rule 8: "The full stop '.' allows new sentence to start or old one to finish.")
  const clauses: string[][] = [];
  let currentClause: string[] = [];

  for (const t of tiles) {
    if (t.word === '.') {
      if (currentClause.length > 0) {
        clauses.push(currentClause);
        currentClause = [];
      }
    } else {
      const token = t.isWildcard && t.customName ? t.customName : t.word;
      currentClause.push(token);
    }
  }
  if (currentClause.length > 0) {
    clauses.push(currentClause);
  }

  if (clauses.length === 0) {
    return { isValid: false, score: 0, reason: 'Incomplete statement: Only punctuation placed' };
  }

  const clauseRules: string[] = [];
  const clauseExplanations: string[] = [];

  // Every clause must be grammatically valid and complete
  for (let i = 0; i < clauses.length; i++) {
    const clauseTokens = clauses[i];
    const res = validateSentenceClause(clauseTokens);
    if (!res.isValid) {
      const sentenceText = clauseTokens.join(' ');
      return {
        isValid: false,
        score: 0,
        reason: `Clause "${sentenceText}": ${res.reason || 'Not a valid grammar structure'}`,
      };
    }
    if (res.ruleName) clauseRules.push(res.ruleName);
    if (res.ruleExplanation) clauseExplanations.push(res.ruleExplanation);
  }

  return {
    isValid: true,
    score: totalScore,
    breakdown: `Valid sentence with ${totalScore} characters.`,
    ruleName: clauseRules.join('; ') || 'Subject-Verb-Complement Construction',
    ruleExplanation: clauseExplanations.join(' ') || `Rule 4 & 11: Valid grammatical sentence sequence worth ${totalScore} points.`,
  };
}

/**
 * Fun Grammar Rule 4: Sentences are strictly read left-to-right (horizontal) or top-to-down (vertical) only.
 */
export function validateFullSequenceStrict(tiles: TileData[]): { result: GrammarResult; orderedTiles: TileData[] } {
  const result = validateFullSequence(tiles);
  return { result, orderedTiles: tiles };
}
