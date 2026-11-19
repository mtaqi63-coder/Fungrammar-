import { TileData } from '../types/game';

export interface GrammarResult {
  isValid: boolean;
  score: number;
  reason?: string;
  breakdown?: string;
  formattedText?: string;
  ruleName?: string;
  ruleExplanation?: string;
}

export function isQuestionRuleName(ruleName?: string): boolean {
  return Boolean(ruleName && (ruleName.includes('Question') || ruleName.includes('Interrogative')));
}

function buildTrailingClauseTag(trailingTokens?: string[]): { ruleSuffix: string; descPart: string } {
  if (!trailingTokens || trailingTokens.length === 0) {
    return { ruleSuffix: '', descPart: '' };
  }
  const text = trailingTokens.join(' ');
  if (trailingTokens[0] === 'to') {
    return {
      ruleSuffix: ' + Prepositional Indirect Object',
      descPart: ` + prepositional indirect object "${text}"`,
    };
  }
  if (trailingTokens[0] === 'for') {
    return {
      ruleSuffix: ' + Prepositional Complement',
      descPart: ` + prepositional complement "${text}"`,
    };
  }
  return {
    ruleSuffix: ' + Adverbial Modifier',
    descPart: ` + adverbial modifier "${text}"`,
  };
}

function collectUniqueRuleTags(...names: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    if (!name) continue;
    for (const part of name.split(/\s*[;|]\s*/)) {
      const trimmed = part.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        out.push(trimmed);
      }
    }
  }
  return out;
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
  'where',
  'when',
  'who',
  'whom',
  'whose',
  'which',
  'what',
  'why',
  'how',
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
// British Council LearnEnglish adjective order: opinion (1) -> size (2) -> age (3)
const ADJECTIVE_ORDER_RANK: Record<string, number> = {
  good: 1,
  bad: 1,
  big: 2,
  small: 2,
  young: 3,
  old: 3,
};
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

const WH_QUESTION_WORDS = new Set(['where', 'when', 'who', 'whom', 'whose', 'which', 'what', 'why', 'how']);

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

  // 3. Proper nouns & wildcards (N3-N6, custom names).
  // ALL common singular countable nouns (including "father", "mother", "brother", "sister", "friend", etc.)
  // require a determiner ("my father", "your father", "the mother", "a friend").
  if (['n3', 'n4', 'n5', 'n6'].includes(w1)) {
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
        if (POSSESSIVES.has(w1) && TIME_NOUNS.has(w2)) {
          return {
            valid: false,
            length: 2,
            number: 'singular',
            reason: `Grammar error: Possessive "${w1}" cannot modify time noun "${w2}" (use "the ${w2}", "that ${w2}", or "a good ${w2}")`,
          };
        }
        return { valid: true, length: 2, number: 'singular' };
      }

      // [Det] + [Adj] + [Noun] or [Det] + [Adj1] + [Adj2] + [Noun] (British Council adjective order: opinion -> size -> age)
      if (remaining.length >= 3) {
        const w3 = remaining[2];
        if (ADJECTIVES.has(w2) && COMMON_SINGULAR_NOUNS.has(w3)) {
          if (POSSESSIVES.has(w1) && TIME_NOUNS.has(w3)) {
            return {
              valid: false,
              length: 3,
              number: 'singular',
              reason: `Grammar error: Possessive "${w1}" cannot modify time noun "${w3}" (use "the", "a", or "that")`,
            };
          }
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

        if (
          remaining.length >= 4 &&
          ADJECTIVES.has(w2) &&
          ADJECTIVES.has(w3) &&
          COMMON_SINGULAR_NOUNS.has(remaining[3])
        ) {
          if (POSSESSIVES.has(w1) && TIME_NOUNS.has(remaining[3])) {
            return {
              valid: false,
              length: 4,
              number: 'singular',
              reason: `Grammar error: Possessive "${w1}" cannot modify time noun "${remaining[3]}" (use "the", "a", or "that")`,
            };
          }
          if (w1 === 'a' && /^[aeiou]/.test(w2)) {
            return {
              valid: false,
              length: 4,
              number: 'singular',
              reason: `Grammar error: Article "a" cannot precede vowel-initial adjective "${w2}" (use "the", "my", or another determiner)`,
            };
          }
          const rank1 = ADJECTIVE_ORDER_RANK[w2] ?? 99;
          const rank2 = ADJECTIVE_ORDER_RANK[w3] ?? 99;
          if (rank1 >= rank2) {
            return {
              valid: false,
              length: 4,
              number: 'singular',
              reason: `Adjective order error: "${w2} ${w3}" violates English adjective order (opinion -> size -> age)`,
            };
          }
          return { valid: true, length: 4, number: 'singular' };
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

  if (COMMON_SINGULAR_NOUNS.has(w1)) {
    return {
      valid: false,
      length: 0,
      number: 'singular',
      reason: `Singular countable noun "${w1}" requires a determiner (e.g. "my ${w1}", "the ${w1}", "a ${w1}")`,
    };
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

    const objRes = parseObjectPhrase(objectTokens, true);
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
export function parseObjectPhrase(
  tokens: string[],
  allowBareParent: boolean = false
): { valid: boolean; reason?: string } {
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
    if (w === 'brother' || w === 'sister' || (!allowBareParent && (w === 'father' || w === 'mother'))) {
      return {
        valid: false,
        reason: `Singular countable noun "${w}" requires a determiner (e.g. "a ${w}", "my ${w}")`,
      };
    }
    if (OBJECT_PRONOUNS.has(w)) {
      return { valid: true };
    }
  }

  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === 'and') {
      const leftRes = parseObjectPhrase(tokens.slice(0, i), allowBareParent);
      const rightRes = parseObjectPhrase(tokens.slice(i + 1), allowBareParent);
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
 * Parses optional trailing adverbial modifiers at the end of a clause following British Council place-before-time order:
 * - Deictic location adverbs: "here", "there"
 * - Compound directional/location adverbs: "up here", "up there", "down here", "down there", "out here", "out there"
 * - Prepositional phrases: "in the morning", "for you", "to me"
 * - Location + time/beneficiary PP: "here in the morning", "out in the night", "out there in the night", "here for you in the morning"
 */
function parseTrailingAdverbials(
  tokens: string[],
  options: { allowTo?: boolean } = {}
): { valid: boolean; reason?: string } {
  if (tokens.length === 0) return { valid: true };
  const allowTo = Boolean(options.allowTo);

  if (tokens.length === 1) {
    if (tokens[0] === 'here' || tokens[0] === 'there') {
      return { valid: true };
    }
    return { valid: false, reason: `Unexpected trailing word "${tokens[0]}"` };
  }

  if (tokens[0] === 'here' || tokens[0] === 'there') {
    const afterLoc = tokens.slice(1);
    if ((afterLoc[0] === 'in' || afterLoc[0] === 'for') && parseTrailingAdverbials(afterLoc, options).valid) {
      return { valid: true };
    }
  }

  if (tokens[0] === 'up' || tokens[0] === 'down' || tokens[0] === 'out') {
    if (tokens[1] === 'here' || tokens[1] === 'there') {
      const afterLoc = tokens.slice(2);
      if (afterLoc.length === 0) return { valid: true };
      if ((afterLoc[0] === 'in' || afterLoc[0] === 'for') && parseTrailingAdverbials(afterLoc, options).valid) {
        return { valid: true };
      }
    }
    if (tokens[1] === 'in') {
      const prepCheck = parsePrepositionalPhrase(tokens.slice(1));
      if (prepCheck.valid && prepCheck.length === tokens.length - 1) {
        return { valid: true };
      }
    }
  }

  if (tokens[0] === 'to' && !allowTo) {
    return { valid: false, reason: `Prepositional phrase "${tokens.join(' ')}" cannot follow this verb or noun phrase` };
  }

  // Allow beneficiary/recipient PP followed by time PP (e.g. "for you in the morning")
  for (let split = 2; split <= tokens.length - 2; split++) {
    if (tokens[split] === 'in') {
      const leftPrep = parsePrepositionalPhrase(tokens.slice(0, split));
      const rightPrep = parsePrepositionalPhrase(tokens.slice(split));
      if (
        leftPrep.valid &&
        leftPrep.length === split &&
        (tokens[0] === 'for' || (allowTo && tokens[0] === 'to')) &&
        rightPrep.valid &&
        rightPrep.length === tokens.length - split
      ) {
        return { valid: true };
      }
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

function parseNameObjectWithTrailing(tokens: string[]): {
  valid: boolean;
  objTokens?: string[];
  nameTokens?: string[];
  trailingTokens?: string[];
  reason?: string;
} {
  const direct = parseObjectWithTrailing(tokens);
  if (direct.valid) {
    if (direct.objTokens.length === 1 && isProperNameToken(direct.objTokens[0])) {
      return {
        valid: false,
        reason: `Verb "name" cannot take bare proper name "${direct.objTokens[0]}" alone (use e.g. "name him ${direct.objTokens[0]}" or "name a friend")`,
      };
    }
    return direct;
  }

  // Ditransitive / object-complement naming: "Name [object] [ProperName] [trailing adverbial]"
  for (let nameIdx = 1; nameIdx < tokens.length; nameIdx++) {
    const candidateName = tokens[nameIdx];
    if (!isProperNameToken(candidateName)) continue;
    const objPart = tokens.slice(0, nameIdx);
    if (objPart.length === 1 && isProperNameToken(objPart[0])) continue;
    if (isBareIndefinitePronounPhrase(objPart)) continue;
    const trailPart = tokens.slice(nameIdx + 1);
    const objCheck = parseObjectPhrase(objPart);
    if (objCheck.valid && parseTrailingAdverbials(trailPart).valid) {
      return {
        valid: true,
        objTokens: objPart,
        nameTokens: [candidateName],
        trailingTokens: trailPart,
      };
    }
  }

  return direct;
}

function isPersonalPronounToken(w: string): boolean {
  return ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'].includes(w);
}

function validateDoObjectWithTrailing(tokens: string[]): {
  isValid: boolean;
  objTokens?: string[];
  trailingTokens?: string[];
  reason?: string;
} {
  const direct = validateDoObject(tokens);
  if (direct.isValid) {
    return { isValid: true, objTokens: tokens, trailingTokens: [] };
  }

  for (let split = tokens.length - 1; split >= 1; split--) {
    const objPart = tokens.slice(0, split);
    const trailPart = tokens.slice(split);
    const objCheck = validateDoObject(objPart);
    if (objCheck.isValid) {
      const trailCheck = parseTrailingAdverbials(trailPart, { allowTo: true });
      if (trailCheck.valid) {
        return { isValid: true, objTokens: objPart, trailingTokens: trailPart };
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
    if (['i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them'].includes(last)) {
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
  return getSemanticCategory(subjectTokens) === 'human';
}

function validateDoObject(objTokens: string[]): { isValid: boolean; reason?: string } {
  if (objTokens.length === 0) {
    return {
      isValid: false,
      reason: 'Verb "do" requires a thing or activity as object (e.g. "a thing", "something", "good")',
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
      reason: `Verb "do" takes a thing or activity as object (e.g. "a thing", "something"), not "${objTokens.join(' ')}"`,
    };
  }
  return { isValid: true };
}

function hasReflexivePersonConflict(subjectTokens: string[], objTokens: string[]): string | null {
  if (objTokens.length !== 1) return null;
  const objWord = objTokens[0];
  const subjHasFirstPerson = subjectTokens.some((t) => t === 'i' || t === 'we');
  const subjHasSecondPerson = subjectTokens.some((t) => t === 'you');
  if (subjHasFirstPerson && (objWord === 'me' || objWord === 'us')) {
    return `Reflexive pronoun error: Subject "${subjectTokens.join(' ')}" cannot take same-person pronoun "${objWord}" as object`;
  }
  if (subjHasSecondPerson && objWord === 'you') {
    return `Reflexive pronoun error: Subject "${subjectTokens.join(' ')}" cannot take same-person pronoun "${objWord}" as object`;
  }
  return null;
}

function validateHaveObjectWithTrailing(
  subjectTokens: string[],
  tokens: string[]
): { valid: boolean; objTokens: string[]; trailingTokens: string[]; reason?: string } {
  const objRes = parseObjectWithTrailing(tokens);
  if (!objRes.valid) return objRes;

  const obj = objRes.objTokens;

  const reflexiveError = hasReflexivePersonConflict(subjectTokens, obj);
  if (reflexiveError) {
    return {
      valid: false,
      objTokens: obj,
      trailingTokens: objRes.trailingTokens,
      reason: reflexiveError,
    };
  }

  // Lexical "have" does not take a bare proper name as direct object (*He has George)
  if (obj.length === 1 && isProperNameToken(obj[0])) {
    return {
      valid: false,
      objTokens: obj,
      trailingTokens: objRes.trailingTokens,
      reason: `Semantic mismatch: Verb "have" cannot take proper name "${obj[0]}" as object`,
    };
  }

  // Time nouns ("night", "morning") with "have" require an adjective (e.g. "have a good night", not *Bob had a morning)
  if (getSemanticCategory(obj) === 'time' && !obj.some((t) => ADJECTIVES.has(t))) {
    return {
      valid: false,
      objTokens: obj,
      trailingTokens: objRes.trailingTokens,
      reason: `Semantic mismatch: Verb "have" with time noun "${obj[obj.length - 1]}" requires a descriptive adjective (e.g. "a good ${obj[obj.length - 1]}")`,
    };
  }

  // Prevent tautological indefinite repetition (*Something has something)
  const subjIndef = getIndefiniteBase(subjectTokens);
  const objIndef = getIndefiniteBase(obj);
  if (subjIndef && objIndef && subjIndef === objIndef) {
    return {
      valid: false,
      objTokens: obj,
      trailingTokens: objRes.trailingTokens,
      reason: `Redundant object: "${subjectTokens.join(' ')}" cannot have "${obj.join(' ')}"`,
    };
  }

  // Non-human subjects (something, a thing, the morning, it, this) cannot have
  // bare demonstrative pronoun objects (*Something had these) or human objects (*Something has a sister)
  const subjCat = getSemanticCategory(subjectTokens);
  if (subjCat !== 'human') {
    if (obj.length === 1 && (DEMONSTRATIVES_SINGULAR.has(obj[0]) || DEMONSTRATIVES_PLURAL.has(obj[0]))) {
      return {
        valid: false,
        objTokens: obj,
        trailingTokens: objRes.trailingTokens,
        reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot have bare demonstrative "${obj[0]}" as object`,
      };
    }
    if (getSemanticCategory(obj) === 'human') {
      return {
        valid: false,
        objTokens: obj,
        trailingTokens: objRes.trailingTokens,
        reason: `Semantic mismatch: Non-human subject "${subjectTokens.join(' ')}" cannot have person "${obj.join(' ')}"`,
      };
    }
  }

  return objRes;
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
    if (subjectTokens && subjectTokens.length > 0 && !canSubjectPerformDo(subjectTokens)) {
      return {
        isValid: false,
        reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform progressive action "doing"`,
      };
    }

    const objTokens = rest.slice(1);
    if (objTokens.length === 0) {
      return {
        isValid: false,
        reason: 'Incomplete progressive verb: "doing" requires an object (e.g. "doing a thing", "doing something", "doing good")',
      };
    }

    const progressiveCheck = validateDoObjectWithTrailing(objTokens);
    if (progressiveCheck.isValid) {
      const directObj = progressiveCheck.objTokens ?? objTokens;
      const trailTag = buildTrailingClauseTag(progressiveCheck.trailingTokens);
      return {
        isValid: true,
        ruleName: `Present/Past Progressive ("Be + Doing + Object")${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Progressive verb construction "${tokens[0]}" + direct object "${directObj.join(' ')}"${trailTag.descPart}.`,
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
      const rightNegated = rest[i] === 'and' ? isNegated : false;
      const rightRes = validateCopulaComplement(rightComp, subjectTokens, subjectNumber, rightNegated);
      if (leftRes.isValid && rightRes.isValid) {
        const getCompKind = (toks: string[]): 'adj' | 'loc' | 'prep' | 'np' | 'other' => {
          const core = toks[0] === 'not' ? toks.slice(1) : toks;
          if (core.length === 0) return 'other';
          if (ADJECTIVES.has(core[0])) return 'adj';
          if (LOCATION_ADVERBS.has(core[0])) return 'loc';
          if (TRUE_PREPOSITIONS.has(core[0])) return 'prep';
          return 'np';
        };
        const leftKind = getCompKind(leftComp);
        const rightKind = getCompKind(rightComp);
        const hasContrastNegation = isNegated || hasNotToken || rightComp[0] === 'not';
        // "but" between two location adverbs or two noun phrases requires contrast negation (e.g. "my brother but not my friend", NOT "*my morning but your friend")
        if (leftKind === rightKind && !(rest[i] === 'but' && (leftKind === 'loc' || leftKind === 'np') && !hasContrastNegation)) {
          if (leftKind === 'np' && rightKind === 'np') {
            const leftCore = leftComp[0] === 'not' ? leftComp.slice(1) : leftComp;
            const rightCore = rightComp[0] === 'not' ? rightComp.slice(1) : rightComp;
            const leftCat = getSemanticCategory(leftCore);
            const rightCat = getSemanticCategory(rightCore);
            if (leftCat !== rightCat && leftCat !== 'neutral_pronoun' && rightCat !== 'neutral_pronoun') {
              continue;
            }
          }
          return {
            isValid: true,
            ruleName: 'Compound Copula Complement',
            ruleExplanation: `Rule 4: Coordinated complements joined by "${rest[i]}" ("${tokens.join(' ')}").`,
          };
        }
      }
    }
  }

  // 1. Single adjective: "good", "bad", "young", "old", "big", "small" (+ optional time/location/prepositional modifier)
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
      let lastPrepError: string | undefined;
      for (let split = rest.length; split >= 3; split--) {
        const prepParse = parsePrepositionalPhrase(rest.slice(1, split));
        if (prepParse.valid && prepParse.length === split - 1) {
          const afterPrep = rest.slice(split);
          if (afterPrep.length === 0 || parseTrailingAdverbials(afterPrep).valid) {
            return {
              isValid: true,
              ruleName: 'Evaluative Adjective + Prepositional Complement',
              ruleExplanation: `Rule 4 & 11: Evaluative adjective "${adj}" with prepositional complement "${rest.slice(1).join(' ')}".`,
            };
          }
        } else if (!lastPrepError && prepParse.reason) {
          lastPrepError = prepParse.reason;
        }
      }
      return { isValid: false, reason: lastPrepError || `Invalid complement after "${adj}"` };
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
    if (subjectTokens && subjectTokens.length > 0) {
      const subjCat = getSemanticCategory(subjectTokens);
      if (subjCat === 'name' || (subjCat === 'time' && (rest[0] === 'up' || rest[0] === 'down' || rest[0] === 'out'))) {
        return {
          isValid: false,
          reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot take location/direction adverb "${rest[0]}"`,
        };
      }
    }
    return {
      isValid: true,
      ruleName: 'Subject + Copula Verb + Location Adverb',
      ruleExplanation: `Rule 4: Copula predicate with location adverb "${tokens.join(' ')}".`,
    };
  }

  // 3. Location adverb + modifier (e.g. "there in the morning", "here for you", "out there", "up here in the morning")
  if (LOCATION_ADVERBS.has(rest[0]) && rest.length > 1) {
    if (subjectTokens && subjectTokens.length > 0) {
      const subjCat = getSemanticCategory(subjectTokens);
      if (subjCat === 'name' || (subjCat === 'time' && (rest[0] === 'up' || rest[0] === 'down' || rest[0] === 'out'))) {
        return {
          isValid: false,
          reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot take location modifier "${rest.join(' ')}"`,
        };
      }
    }
    if (
      (rest[0] === 'up' || rest[0] === 'down' || rest[0] === 'out') &&
      (rest[1] === 'here' || rest[1] === 'there')
    ) {
      const afterCompound = rest.slice(2);
      if (afterCompound.length === 0 || parseTrailingAdverbials(afterCompound).valid) {
        return {
          isValid: true,
          ruleName: 'Subject + Copula Verb + Compound Location Adverb',
          ruleExplanation: `Rule 4 & 11: Compound location adverb "${rest.join(' ')}".`,
        };
      }
    }
    if (rest[1] === 'in' || ((rest[0] === 'here' || rest[0] === 'there') && rest[1] === 'for')) {
      const trail = parseTrailingAdverbials(rest.slice(1));
      if (trail.valid) {
        return {
          isValid: true,
          ruleName: 'Subject + Copula Verb + Location & Time/Beneficiary Phrase',
          ruleExplanation: `Rule 4 & 11: Location adverb "${rest[0]}" paired with modifier "${rest.slice(1).join(' ')}".`,
        };
      }
    }
    return {
      isValid: false,
      reason: `Location adverb "${rest[0]}" cannot be followed by "${rest.slice(1).join(' ')}" (cannot say "${rest.join(' ')}")`,
    };
  }

  // 4. Standalone Prepositional phrase:
  // e.g. "for them", "for you", "in the morning", "for Fatima"
  // Note: "to [person]" cannot directly follow copula "be" (*Somebody is to a sister, *He is to me);
  // it requires an evaluative adjective ("good to him") or indefinite role noun ("a friend to me").
  if (TRUE_PREPOSITIONS.has(rest[0])) {
    if (rest[0] === 'to') {
      return {
        isValid: false,
        reason: `Preposition "to" cannot directly follow copula "be" — use an evaluative adjective ("good to ...") or indefinite role ("a friend to ...")`,
      };
    }
    const prepParse = parsePrepositionalPhrase(rest);
    if (prepParse.valid && prepParse.length === rest.length) {
      if (
        rest[0] === 'for' &&
        subjectTokens &&
        subjectTokens.length > 0 &&
        getSemanticCategory(subjectTokens) === 'human' &&
        !isHumanEntity(rest.slice(1))
      ) {
        return {
          isValid: false,
          reason: `Semantic mismatch: Human subject "${subjectTokens.join(' ')}" cannot be paired with "${rest.join(' ')}"`,
        };
      }
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
  const allowTrailingTo = compTokens.length >= 2 && HUMAN_NOUNS.has(compTokens[compTokens.length - 1]);
  const trailingCheck =
    trailingTokens.length === 0
      ? { valid: true }
      : parseTrailingAdverbials(trailingTokens, { allowTo: allowTrailingTo });
  if (np.valid && trailingCheck.valid) {
    // Bare demonstrative pronouns (this, that, these, those) cannot serve as copula complements
    // even when followed by trailing adverbials (e.g. "Oliver is this here", "He is that in the morning").
    if (
      compTokens.length === 1 &&
      (DEMONSTRATIVES_SINGULAR.has(compTokens[0]) || DEMONSTRATIVES_PLURAL.has(compTokens[0]))
    ) {
      const subjStr = subjectTokens ? subjectTokens.join(' ') : 'Subject';
      return {
        isValid: false,
        reason: `Demonstrative pronoun "${compTokens[0]}" cannot be used as a copula complement (cannot say "${subjStr} is ${rest.join(' ')}")`,
      };
    }
    // Bare "it" cannot be used as a predicate nominative for a human subject or with trailing adverbials (e.g. "Oliver is it here")
    if (
      compTokens.length === 1 &&
      compTokens[0] === 'it' &&
      (trailingTokens.length > 0 || (subjectTokens && getSemanticCategory(subjectTokens) === 'human'))
    ) {
      return {
        isValid: false,
        reason: `Pronoun "it" cannot be used as a copula complement in "${rest.join(' ')}"`,
      };
    }
    // Bare personal pronouns (you, me, him, her, us, them) as copula complements are only valid
    // with singular identifying subjects ("It is you", "Was that you?", "This is me"),
    // NOT plural demonstratives ("Were those you?") or human subjects ("He is me", "They are us").
    if (compTokens.length === 1 && HUMAN_OBJECT_PRONOUNS.has(compTokens[0])) {
      const isSingularIdentifyingSubj =
        subjectTokens &&
        subjectTokens.length === 1 &&
        ['it', 'this', 'that'].includes(subjectTokens[0]);
      if (!isSingularIdentifyingSubj || trailingTokens.length > 0) {
        const subjStr = subjectTokens ? subjectTokens.join(' ') : 'Subject';
        return {
          isValid: false,
          reason: `Personal pronoun "${compTokens[0]}" cannot be used as a copula complement for "${subjStr}"`,
        };
      }
    }
    // Singular countable common nouns require a determiner as copula predicate nominative ("a father", not "father")
    if (compTokens.length === 1 && ['father', 'mother', 'brother', 'sister'].includes(compTokens[0])) {
      return {
        isValid: false,
        reason: `Singular countable noun "${compTokens[0]}" requires a determiner (e.g. "a ${compTokens[0]}", "my ${compTokens[0]}")`,
      };
    }
    // Disallow awkward/nonsensical trailing modifiers on human role predicate nouns
    // Relational "to [person]" / "for [person]" and locatives ("here"/"there") only attach to
    // indefinite role nouns ("a friend to me", "a father here", "a father for them"),
    // NOT possessive/definite nouns (*She is her sister to the friend, *their mother there).
    if (trailingTokens.length > 0 && getSemanticCategory(compTokens) === 'human') {
      const firstTrail = trailingTokens[0];
      const isIndefiniteRole = compTokens[0] === 'a';
      const trailValidForHuman =
        isIndefiniteRole &&
        (firstTrail === 'here' ||
          firstTrail === 'there' ||
          firstTrail === 'to' ||
          (firstTrail === 'for' && isHumanEntity(trailingTokens.slice(1))));
      if (!trailValidForHuman) {
        return {
          isValid: false,
          reason: `Semantic mismatch: Human predicate "${compTokens.join(' ')}" cannot take modifier "${trailingTokens.join(' ')}"`,
        };
      }
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
        // Two proper names cannot be equated via copula ("Was George Bob?", "George is Bob")
        const subjIsProperName = subjectTokens.length === 1 && isProperNameToken(subjectTokens[0]);
        const compIsProperName = compTokens.length === 1 && isProperNameToken(compTokens[0]);
        if (subjIsProperName && compIsProperName) {
          return {
            isValid: false,
            reason: `Semantic mismatch: Proper name "${subjectTokens[0]}" cannot be equated with proper name "${compTokens[0]}"`,
          };
        }
        // Indefinite pronouns ("somebody", "some body", "something") cannot be equated with a specific proper name ("Is somebody Bob?")
        if (getIndefiniteBase(subjectTokens) && compIsProperName) {
          return {
            isValid: false,
            reason: `Semantic mismatch: Indefinite pronoun "${subjectTokens.join(' ')}" cannot be equated with proper name "${compTokens[0]}"`,
          };
        }
        // Specific human subjects (proper names, "he", "she", "the brother") cannot be equated with bare indefinite pronouns (*Ali was some body)
        if (subjCat === 'human' && getIndefiniteBase(compTokens)) {
          return {
            isValid: false,
            reason: `Semantic mismatch: Human subject "${subjectTokens.join(' ')}" cannot be equated with indefinite pronoun "${compTokens.join(' ')}"`,
          };
        }
        // Human subjects cannot equate to non-human nouns (night, morning, thing, name),
        // EXCEPT proper names equating to "name" (e.g., "Sarah is a good name", "Ali is my name").
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
        // Gender consistency for "he" / "she" / "father" / "mother" / "brother" / "sister" and proper names
        const subjLast = subjectTokens[subjectTokens.length - 1];
        const compLast = compTokens[compTokens.length - 1];
        const maleWords = new Set([
          'he', 'father', 'brother',
          'bob', 'dan', 'tom', 'ali', 'sam', 'leo',
          'john', 'mark', 'jack', 'zaid',
          'peter', 'james', 'david', 'henry', 'tariq', 'hasan',
          'george', 'robert', 'oliver', 'edward', 'khalid',
        ]);
        const femaleWords = new Set([
          'she', 'mother', 'sister',
          'mia', 'amy',
          'mary', 'sara', 'emma', 'lucy', 'noor',
          'sarah', 'alice', 'emily',
          'fatima', 'sophia', 'hannah',
        ]);
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

    // Per British Council LearnEnglish Grammar, lexical "have/has/had" (possession) cannot take
    // direct "not" negation (*Something had not these, *He has not a friend); it requires do-support.
    if (predicateTokens[0] === 'not') {
      const doSupportSuggestion =
        verbToken === 'has' ? 'does not have' : verbToken === 'had' ? 'did not have' : 'do not have';
      return {
        isValid: false,
        reason: `Main verb "${verbToken}" cannot be negated directly with "not" (use "${doSupportSuggestion}")`,
      };
    }

    // Object can be an object pronoun or valid noun phrase (+ optional trailing adverbial), never a subject-only pronoun like "we"
    const objRes = validateHaveObjectWithTrailing(subjectTokens, predicateTokens);
    if (objRes.valid) {
      const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
      const baseRule =
        objRes.objTokens.length === 1 && OBJECT_PRONOUNS.has(objRes.objTokens[0])
          ? 'Subject + Verb "Have" + Object Pronoun'
          : 'Subject + Verb "Have" + Noun Phrase Object';
      return {
        isValid: true,
        ruleName: `${baseRule}${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + transitive verb "${verbToken}" + direct object "${objRes.objTokens.join(' ')}"${trailTag.descPart}.`,
      };
    }
    return {
      isValid: false,
      reason: objRes.reason || `Invalid object "${predicateTokens.join(' ')}" for verb "${verbToken}"`,
    };
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
        const objRes = validateHaveObjectWithTrailing(subjectTokens, subObj);
        if (!objRes.valid) return { isValid: false, reason: objRes.reason };
        const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
        return {
          isValid: true,
          ruleName: `Do-Support ("${verbToken}${isNegated ? ' not' : ''} have")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + "${verbToken}${isNegated ? ' not' : ''} have" + direct object "${objRes.objTokens.join(' ')}"${trailTag.descPart}.`,
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
        const objRes = parseNameObjectWithTrailing(subObj);
        if (!objRes.valid) return { isValid: false, reason: objRes.reason };
        const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
        const directObjStr = (objRes.objTokens ?? subObj).join(' ');
        const nameCompStr = objRes.nameTokens?.length ? ` + object complement "${objRes.nameTokens.join(' ')}"` : '';
        return {
          isValid: true,
          ruleName: `Do-Support ("${verbToken}${isNegated ? ' not' : ''} name")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + "${verbToken}${isNegated ? ' not' : ''} name" + direct object "${directObjStr}"${nameCompStr}${trailTag.descPart}.`,
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
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObj = (doObjCheck.objTokens ?? subObj).join(' ');
      return {
        isValid: true,
        ruleName: `Do-Support ("${verbToken}${isNegated ? ' not' : ''} do")${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + "${verbToken}${isNegated ? ' not' : ''} do" + direct object "${directObj}"${trailTag.descPart}.`,
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
    const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
    const directObj = (doObjCheck.objTokens ?? predicateTokens).join(' ');
    return {
      isValid: true,
      ruleName: `Subject + Verb "Do" + Direct Object${trailTag.ruleSuffix}`,
      ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + action verb "${verbToken}" + direct object "${directObj}"${trailTag.descPart}.`,
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
      if (subPred[0] === 'not') {
        return {
          isValid: false,
          reason: `Negation "not" must precede "be" (use "${verbToken} not be ...")`,
        };
      }
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
      const objRes = validateHaveObjectWithTrailing(subjectTokens, subPred);
      if (!objRes.valid) return { isValid: false, reason: objRes.reason };
      const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
      return {
        isValid: true,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "have" + Direct Object${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken}${modalNegated ? ' not' : ''} have" + direct object "${objRes.objTokens.join(' ')}"${trailTag.descPart}.`,
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
      const objRes = parseNameObjectWithTrailing(subPred);
      if (!objRes.valid) return { isValid: false, reason: objRes.reason };
      const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
      const directObjStr = (objRes.objTokens ?? subPred).join(' ');
      const nameCompStr = objRes.nameTokens?.length ? ` + object complement "${objRes.nameTokens.join(' ')}"` : '';
      return {
        isValid: true,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "name" + Direct Object${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken}${modalNegated ? ' not' : ''} name" + direct object "${directObjStr}"${nameCompStr}${trailTag.descPart}.`,
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
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObj = (doObjCheck.objTokens ?? subPred).join(' ');
      return {
        isValid: true,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "do" + Direct Object${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken}${modalNegated ? ' not' : ''} do" + direct object "${directObj}"${trailTag.descPart}.`,
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
    // Support present simple finite verb "name" with non-3rd-person-singular subjects (e.g. "I name him Ali", "They name a thing")
    for (let i = 1; i < words.length - 1; i++) {
      if (words[i] === 'name') {
        const subjTokens = words.slice(0, i);
        const subjNp = parseNounPhrase(subjTokens, 0, false);
        if (
          subjNp.valid &&
          subjNp.length === subjTokens.length &&
          (subjNp.number === 'i' || subjNp.number === 'you' || subjNp.number === 'plural')
        ) {
          if (!canSubjectPerformDo(subjTokens)) {
            return {
              isValid: false,
              reason: `Semantic mismatch: "${subjTokens.join(' ')}" cannot perform verb "name"`,
            };
          }
          const nameArgs = words.slice(i + 1);
          const objRes = parseNameObjectWithTrailing(nameArgs);
          if (objRes.valid) {
            const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
            const directObjStr = (objRes.objTokens ?? nameArgs).join(' ');
            const nameCompStr = objRes.nameTokens?.length ? ` + object complement "${objRes.nameTokens.join(' ')}"` : '';
            return {
              isValid: true,
              ruleName: `Subject + Verb "Name" + Direct Object${trailTag.ruleSuffix}`,
              ruleExplanation: `Rule 4: Subject "${subjTokens.join(' ')}" + verb "name" + direct object "${directObjStr}"${nameCompStr}${trailTag.descPart}.`,
            };
          }
          return { isValid: false, reason: objRes.reason || 'Invalid object after "name"' };
        }
      }
    }
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
        const exSubj = subjStart.slice(0, exNp.length);
        const isBareDemOrProper =
          exSubj.length === 1 &&
          (DEMONSTRATIVES_SINGULAR.has(exSubj[0]) || isProperNameToken(exSubj[0]));
        if (isBareDemOrProper) {
          return {
            isValid: false,
            reason: `Existential question "${words.join(' ')}" cannot take "${exSubj[0]}" (use "${first} ${exSubj[0]} there")`,
          };
        }
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

  // 2. Are / Were: expects Plural Subject (or "you") + Copula Complement, or Existential "Are/Were there [not] plural NP [adverbial]"
  if (first === 'are' || first === 'were') {
    if (rest[0] === 'there') {
      const afterThere = rest.slice(1);
      const subjStart = afterThere[0] === 'not' ? afterThere.slice(1) : afterThere;
      if (subjStart.length > 0 && !isPersonalPronounToken(subjStart[0])) {
        const exNp = parseNounPhrase(subjStart, 0, false);
        if (exNp.valid && exNp.number === 'plural') {
          const exSubj = subjStart.slice(0, exNp.length);
          if (exSubj.length === 1 && DEMONSTRATIVES_PLURAL.has(exSubj[0])) {
            return {
              isValid: false,
              reason: `Existential question "${words.join(' ')}" cannot take bare demonstrative "${exSubj[0]}" (use "${first} ${exSubj[0]} there")`,
            };
          }
          if (parseTrailingAdverbials(subjStart.slice(exNp.length)).valid) {
            return {
              isValid: true,
              ruleName: 'Existential Interrogative ("Are/Were there")',
              ruleExplanation: `Rule 4: Existential question "${words.join(' ')}".`,
            };
          }
        }
        for (let andIdx = 1; andIdx < subjStart.length - 1; andIdx++) {
          if (subjStart[andIdx] === 'and') {
            const leftToks = subjStart.slice(0, andIdx);
            const leftNp = parseNounPhrase(leftToks, 0, false);
            if (leftNp.valid && leftNp.length === leftToks.length) {
              const afterAnd = subjStart.slice(andIdx + 1);
              const rightNp = parseNounPhrase(afterAnd, 0, true);
              if (rightNp.valid && parseTrailingAdverbials(afterAnd.slice(rightNp.length)).valid) {
                return {
                  isValid: true,
                  ruleName: 'Existential Interrogative ("Are/Were there" + Compound Subject)',
                  ruleExplanation: `Rule 4: Existential plural question "${words.join(' ')}".`,
                };
              }
            }
          }
        }
      }
      return { isValid: false, reason: `Invalid existential question "${words.join(' ')}"` };
    }

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
      if (baseVerb === 'name') {
        const nameRes = parseNameObjectWithTrailing(subComplement);
        if (!nameRes.valid) return { isValid: false, reason: nameRes.reason };
        const trailTag = buildTrailingClauseTag(nameRes.trailingTokens);
        const directObjStr = (nameRes.objTokens ?? subComplement).join(' ');
        return {
          isValid: true,
          ruleName: `Inverted Interrogative ("Does" Question)${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "name" + direct object "${directObjStr}"${trailTag.descPart}.`,
        };
      }
      const haveRes = validateHaveObjectWithTrailing(subjectTokens, subComplement);
      if (!haveRes.valid) return { isValid: false, reason: haveRes.reason };
      const trailTag = buildTrailingClauseTag(haveRes.trailingTokens);
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("Does" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "have" + direct object "${haveRes.objTokens.join(' ')}"${trailTag.descPart}.`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObjStr = (doObjCheck.objTokens ?? subComplement).join(' ');
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("Does" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "do" + direct object "${directObjStr}"${trailTag.descPart}.`,
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
      if (baseVerb === 'name') {
        const nameRes = parseNameObjectWithTrailing(subComplement);
        if (!nameRes.valid) return { isValid: false, reason: nameRes.reason };
        const trailTag = buildTrailingClauseTag(nameRes.trailingTokens);
        const directObjStr = (nameRes.objTokens ?? subComplement).join(' ');
        return {
          isValid: true,
          ruleName: `Inverted Interrogative ("Do" Question)${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + verb "name" + direct object "${directObjStr}"${trailTag.descPart}.`,
        };
      }
      const haveRes = validateHaveObjectWithTrailing(subjectTokens, subComplement);
      if (!haveRes.valid) return { isValid: false, reason: haveRes.reason };
      const trailTag = buildTrailingClauseTag(haveRes.trailingTokens);
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("Do" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + verb "have" + direct object "${haveRes.objTokens.join(' ')}"${trailTag.descPart}.`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObjStr = (doObjCheck.objTokens ?? subComplement).join(' ');
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("Do" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + verb "do" + direct object "${directObjStr}"${trailTag.descPart}.`,
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
      if (baseVerb === 'name') {
        const nameRes = parseNameObjectWithTrailing(subComplement);
        if (!nameRes.valid) return { isValid: false, reason: nameRes.reason };
        const trailTag = buildTrailingClauseTag(nameRes.trailingTokens);
        const directObjStr = (nameRes.objTokens ?? subComplement).join(' ');
        return {
          isValid: true,
          ruleName: `Inverted Interrogative ("Did" Question)${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + verb "name" + direct object "${directObjStr}"${trailTag.descPart}.`,
        };
      }
      const haveRes = validateHaveObjectWithTrailing(subjectTokens, subComplement);
      if (!haveRes.valid) return { isValid: false, reason: haveRes.reason };
      const trailTag = buildTrailingClauseTag(haveRes.trailingTokens);
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("Did" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + verb "have" + direct object "${haveRes.objTokens.join(' ')}"${trailTag.descPart}.`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObjStr = (doObjCheck.objTokens ?? subComplement).join(' ');
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("Did" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + verb "do" + direct object "${directObjStr}"${trailTag.descPart}.`,
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
        if (exNp.valid) {
          const exSubj = subjTokens.slice(0, exNp.length);
          if (
            exSubj.length === 1 &&
            (DEMONSTRATIVES_SINGULAR.has(exSubj[0]) || DEMONSTRATIVES_PLURAL.has(exSubj[0]) || isProperNameToken(exSubj[0]))
          ) {
            return {
              isValid: false,
              reason: `Existential question "${words.join(' ')}" cannot take "${exSubj[0]}"`,
            };
          }
          if (parseTrailingAdverbials(subjTokens.slice(exNp.length)).valid) {
            return {
              isValid: true,
              ruleName: `Existential Modal Question ("${first} there be")`,
              ruleExplanation: `Rule 4: Existential modal question "${words.join(' ')}".`,
            };
          }
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
      if (baseVerb === 'name') {
        const nameRes = parseNameObjectWithTrailing(subComplement);
        if (!nameRes.valid) return { isValid: false, reason: nameRes.reason };
        const trailTag = buildTrailingClauseTag(nameRes.trailingTokens);
        const directObjStr = (nameRes.objTokens ?? subComplement).join(' ');
        return {
          isValid: true,
          ruleName: `Inverted Interrogative ("${first}" Question)${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + base verb "name" + direct object "${directObjStr}"${trailTag.descPart}.`,
        };
      }
      const haveRes = validateHaveObjectWithTrailing(subjectTokens, subComplement);
      if (!haveRes.valid) return { isValid: false, reason: haveRes.reason };
      const trailTag = buildTrailingClauseTag(haveRes.trailingTokens);
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + base verb "have" + direct object "${haveRes.objTokens.join(' ')}"${trailTag.descPart}.`,
      };
    }
    if (baseVerb === 'do') {
      if (!canSubjectPerformDo(subjectTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjectTokens.join(' ')}" cannot perform verb "do"` };
      }
      const doObjCheck = validateDoObjectWithTrailing(subComplement);
      if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObjStr = (doObjCheck.objTokens ?? subComplement).join(' ');
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + base verb "do" + direct object "${directObjStr}"${trailTag.descPart}.`,
      };
    }
    if (baseVerb === 'be') {
      if (subComplement[0] === 'not') {
        return {
          isValid: false,
          reason: `Negation "not" must precede "be" ("${first} ${subjectTokens.join(' ')} not be ...")`,
        };
      }
      const copRes = validateCopulaComplement(subComplement, subjectTokens, subjectNp.number, modalNegated);
      if (!copRes.isValid) return copRes;
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + "be" + complement "${subComplement.join(' ')}".`,
      };
    }
  }

  // 7. Has / Have: per British Council LearnEnglish Grammar, lexical "have/has" cannot invert directly
  // without do-support (*Has father them, *Have you a friend -> use Does father have them / Do you have...)
  if (first === 'has' || first === 'have') {
    return {
      isValid: false,
      reason: `Main verb "${first}" cannot invert directly to form a question (use "${
        first === 'has' ? 'Does' : 'Do'
      } [subject] have ...")`,
    };
  }

  return { isValid: false, reason: 'Unrecognized question structure' };
}

/**
 * Validates Nominal / Uninverted WH-Clauses (British Council LearnEnglish Grammar: Nominal wh-clauses)
 * Validates uninverted nominal/exclamative WH-clauses (British Council LearnEnglish):
 * e.g. "Who he is", "What it is", "How old he is"
 * Rejects incomplete standalone uninverted adverbial clauses ("Where they were"),
 * 1st/2nd person or plural uninverted "who" clauses ("Who you are"), uninverted "whose/which" clauses
 * ("Whose name those were", "Which these have"), and uninverted transitive object/manner clauses
 * ("Who somebody can have", "How John has a sister for something big").
 */
function validateNominalWhClause(words: string[]): {
  isValid: boolean;
  attemptedSubjectFirst?: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  if (words.length < 3 || !WH_QUESTION_WORDS.has(words[0])) {
    return { isValid: false };
  }

  const wh = words[0];
  const rest = words.slice(1);

  const validateGapClauseWithSubject = (
    effectiveWh: string,
    subjectStartIdx: number
  ): {
    isValid: boolean;
    attemptedSubjectFirst?: boolean;
    reason?: string;
    ruleName?: string;
    ruleExplanation?: string;
  } => {
    const subjectNp = parseNounPhrase(words, subjectStartIdx, false);
    if (!subjectNp.valid) {
      return { isValid: false };
    }

    const subjectTokens = words.slice(subjectStartIdx, subjectStartIdx + subjectNp.length);
    const afterSubj = words.slice(subjectStartIdx + subjectNp.length);
    if (afterSubj.length === 0) {
      return { isValid: false };
    }

    const verbToken = afterSubj[0];
    if (!ALL_VERBS.has(verbToken)) {
      return { isValid: false };
    }

    const agreement = checkSubjectVerbAgreement(subjectNp.number, verbToken);
    if (!agreement.isValid) {
      return { isValid: false, attemptedSubjectFirst: true, reason: agreement.reason };
    }

    const tail = afterSubj.slice(1);
    const subjCat = getSemanticCategory(subjectTokens);
    const isProperSingle = subjectTokens.length === 1 && isProperNameToken(subjectTokens[0]);

    // Standalone uninverted adverbial WH-clauses ("Where they were", "When he was", "Why she is")
    // are incomplete dependent clauses and cannot stand alone as complete sentences.
    if (effectiveWh === 'where' || effectiveWh === 'when' || effectiveWh === 'why') {
      const canInvertVerb = ['is', 'am', 'are', 'was', 'were', 'can', 'will'].includes(verbToken);
      return {
        isValid: false,
        attemptedSubjectFirst: true,
        reason: canInvertVerb
          ? `Incomplete dependent clause: "${words.join(' ')}" cannot stand alone — invert the verb ("${effectiveWh} ${verbToken} ${subjectTokens.join(' ')}") to form a complete question`
          : `Incomplete dependent clause: "${words.join(' ')}" cannot stand alone without a main clause`,
      };
    }

    // 1. Copula verb: is, was (and reject are/am/were with "who/what" uninverted like "Who you are")
    if (['is', 'am', 'are', 'was', 'were'].includes(verbToken)) {
      const tailNoNot = tail[0] === 'not' ? tail.slice(1) : tail;

      if (effectiveWh === 'who') {
        if (tailNoNot.length === 0) {
          if (subjCat === 'object' || subjCat === 'time' || subjCat === 'name') {
            return {
              isValid: false,
              attemptedSubjectFirst: true,
              reason: `Use "What" rather than "Who" for non-person "${subjectTokens.join(' ')}"`,
            };
          }
          // Restrict standalone uninverted "Who + Subject + Be" strictly to 3rd-person singular personal pronouns ("Who he is", "Who she is"),
          // rejecting incomplete dependent clauses ("Who you are", "Who somebody was", "Who Oliver is")
          if (subjectTokens.length !== 1 || (subjectTokens[0] !== 'he' && subjectTokens[0] !== 'she')) {
            return {
              isValid: false,
              attemptedSubjectFirst: true,
              reason: `Incomplete dependent clause: invert the verb ("Who ${verbToken} ${subjectTokens.join(' ')}") to form a complete question`,
            };
          }
          return {
            isValid: true,
            ruleName: 'Nominal WH-Clause ("Who + Subject + Be")',
            ruleExplanation: `Rule 4: British Council nominal WH-clause "${words.join(' ')}".`,
          };
        }
        return {
          isValid: false,
          attemptedSubjectFirst: true,
          reason: `"who" already fills the predicate of "${verbToken}" — extra words "${tail.join(' ')}" are not allowed`,
        };
      }

      if (effectiveWh === 'what') {
        if (tailNoNot.length === 0) {
          if (subjCat === 'human' && isProperSingle) {
            return {
              isValid: false,
              attemptedSubjectFirst: true,
              reason: `Use "Who" rather than "What" when referring to person "${subjectTokens.join(' ')}"`,
            };
          }
          // Restrict standalone uninverted "What + Subject + Be" strictly to neutral pronoun "it" ("What it is"),
          // rejecting incomplete dependent clauses like "What that was" or "What this is"
          if (subjectTokens.length !== 1 || subjectTokens[0] !== 'it') {
            return {
              isValid: false,
              attemptedSubjectFirst: true,
              reason: `Incomplete dependent clause: invert the verb ("What ${verbToken} ${subjectTokens.join(' ')}") to form a complete question`,
            };
          }
          return {
            isValid: true,
            ruleName: 'Nominal WH-Clause ("What + Subject + Be")',
            ruleExplanation: `Rule 4: British Council nominal WH-clause "${words.join(' ')}".`,
          };
        }
        return {
          isValid: false,
          attemptedSubjectFirst: true,
          reason: `"what" already fills the predicate of "${verbToken}" — extra words "${tail.join(' ')}" are not allowed`,
        };
      }

      if (effectiveWh === 'how_adj') {
        if (tailNoNot.length === 0) {
          return {
            isValid: true,
            ruleName: 'Nominal WH-Clause ("How + Adjective + Subject + Be")',
            ruleExplanation: `Rule 4: British Council degree exclamative/nominal clause "${words.join(' ')}".`,
          };
        }
        return {
          isValid: false,
          attemptedSubjectFirst: true,
          reason: `Unexpected words "${tail.join(' ')}" after "${verbToken}" in "${words.join(' ')}"`,
        };
      }

      if (effectiveWh === 'how' && tail.length > 0) {
        return {
          isValid: false,
          attemptedSubjectFirst: true,
          reason: `"how" already fills the state/manner complement of "${verbToken}" — cannot also take "${tail.join(' ')}"`,
        };
      }

      return {
        isValid: false,
        attemptedSubjectFirst: true,
        reason: `Incomplete dependent clause: invert the verb ("${wh} ${verbToken} ${subjectTokens.join(' ')}...") to form a complete question`,
      };
    }

    // 2. Modals, do-support, or lexical main verbs cannot form standalone uninverted WH-clauses
    // (e.g. "*Which these have", "*Who somebody can have", "*How John has a sister for something big")
    if (verbToken === 'can' || verbToken === 'will' || verbToken === 'do' || verbToken === 'does' || verbToken === 'did') {
      return {
        isValid: false,
        attemptedSubjectFirst: true,
        reason: `Incomplete dependent clause: invert "${verbToken}" before "${subjectTokens.join(' ')}" to form a complete question`,
      };
    }

    if (verbToken === 'have' || verbToken === 'has' || verbToken === 'had') {
      if (tail[0] === 'not') {
        const doSupp = verbToken === 'has' ? 'does not have' : verbToken === 'had' ? 'did not have' : 'do not have';
        return {
          isValid: false,
          attemptedSubjectFirst: true,
          reason: `Main verb "${verbToken}" cannot be negated directly with "not" (use "${doSupp}")`,
        };
      }
      return {
        isValid: false,
        attemptedSubjectFirst: true,
        reason: `Incomplete dependent clause: "${words.join(' ')}" cannot stand alone without a main clause or auxiliary inversion`,
      };
    }

    return { isValid: false };
  };

  // Case A: "how + Adjective + Subject + Verb" (e.g. "How old he is", "How good it was")
  if (wh === 'how' && ADJECTIVES.has(rest[0]) && words.length >= 4) {
    const resAdj = validateGapClauseWithSubject('how_adj', 2);
    if (resAdj.isValid || resAdj.attemptedSubjectFirst) return resAdj;
  }

  // Reject uninverted "whose/which + Noun + Subject + Verb" (e.g. "Whose Name Those Were")
  if ((wh === 'whose' || wh === 'which') && !ARTICLES.has(rest[0]) && !POSSESSIVES.has(rest[0])) {
    const repDet = wh === 'whose' ? 'his' : 'the';
    const npCheck = parseNounPhrase([repDet, ...rest], 0, false);
    if (npCheck.valid && npCheck.length >= 2) {
      return {
        isValid: false,
        attemptedSubjectFirst: true,
        reason: `Incomplete dependent clause: invert the verb after "${wh} ${rest.slice(0, npCheck.length - 1).join(' ')}" to form a complete question`,
      };
    }
  }

  // Case C: Standard uninverted nominal clause: WH + Subject + Verb (e.g. "Who he is", "What it is")
  return validateGapClauseWithSubject(wh, 1);
}

/**
 * Validates a WH-Question (starts with where, when, who, whom, whose, which, what, why, how)
 * Also supports fronted "To whom ..." and "For whom ..."
 * e.g. "Where is he?", "Whom did you name?", "Whose friend is here?", "Which thing did you do?"
 */
function validateWhQuestion(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  // Formal British English fronted prepositional WH-question: "To whom ..." / "For whom ..."
  if ((words[0] === 'to' || words[0] === 'for') && words[1] === 'whom') {
    const prep = words[0];
    const afterWhom = words.slice(2);
    if (afterWhom.length < 2) {
      return { isValid: false, reason: `Incomplete question after "${prep} whom"` };
    }
    const auxF = afterWhom[0];
    const afterAuxF = afterWhom.slice(1);
    if (['is', 'am', 'are', 'was', 'were'].includes(auxF)) {
      const subjNp = parseNounPhrase(afterAuxF, 0, false);
      if (subjNp.valid && checkSubjectVerbAgreement(subjNp.number, auxF).isValid) {
        const tail = afterAuxF.slice(subjNp.length);
        const tailNoNot = tail[0] === 'not' ? tail.slice(1) : tail;
        if (tailNoNot.length === 0) {
          return {
            isValid: true,
            ruleName: `Formal Prepositional WH-Question ("${prep} whom")`,
            ruleExplanation: `Rule 4: British Council formal WH-question "${words.join(' ')}".`,
          };
        }
        if (tailNoNot.length === 1 && EVALUATIVE_ADJECTIVES.has(tailNoNot[0]) && prep === 'to') {
          return {
            isValid: true,
            ruleName: `Formal Prepositional WH-Question ("${prep} whom")`,
            ruleExplanation: `Rule 4: Evaluative WH-question "${words.join(' ')}".`,
          };
        }
      }
    }
    if (['do', 'does', 'did', 'can', 'will'].includes(auxF)) {
      const subjNp = parseNounPhrase(afterAuxF, 0, false);
      if (subjNp.valid && checkSubjectVerbAgreement(subjNp.number, auxF).isValid) {
        let afterSubj = afterAuxF.slice(subjNp.length);
        if (afterSubj[0] === 'not') afterSubj = afterSubj.slice(1);
        if (afterSubj.length >= 1 && ['do', 'have', 'name'].includes(afterSubj[0])) {
          const restObj = afterSubj.slice(1);
          if (
            restObj.length === 0 ||
            (afterSubj[0] === 'do' && validateDoObjectWithTrailing(restObj).isValid) ||
            (afterSubj[0] === 'name' && parseNameObjectWithTrailing(restObj).valid) ||
            (afterSubj[0] === 'have' && parseObjectWithTrailing(restObj).valid)
          ) {
            return {
              isValid: true,
              ruleName: `Formal Prepositional WH-Question ("${prep} whom")`,
              ruleExplanation: `Rule 4: British Council formal WH-question "${words.join(' ')}".`,
            };
          }
        }
      }
    }
    return { isValid: false, reason: `Invalid formal WH-question "${words.join(' ')}"` };
  }

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
        const subjCat = getSemanticCategory(subjectTokens);
        if (wh === 'when' && subjCat !== 'time' && subjCat !== 'neutral_pronoun') {
          return {
            isValid: false,
            reason: `Incomplete question "${words.join(' ')}" — "when" with a person or thing requires a complement (e.g. "When am I here?") or action verb`,
          };
        }
        if (wh === 'why') {
          return {
            isValid: false,
            reason: `Incomplete question "${words.join(' ')}" — "why" requires a complement (e.g. "Why am I here?")`,
          };
        }
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")`,
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}" with copula "${aux}" and subject "${subjectTokens.join(' ')}".`,
        };
      }
      if (
        wh === 'how' &&
        complementTokens[0] === 'doing' &&
        canSubjectPerformDo(subjectTokens) &&
        parseTrailingAdverbials(complementTokens.slice(1)).valid
      ) {
        return {
          isValid: true,
          ruleName: 'WH-Question ("How ... doing")',
          ruleExplanation: `Rule 4: Idiomatic WH-question "${words.join(' ')}".`,
        };
      }
      if (wh === 'how') {
        return {
          isValid: false,
          reason: `"how" already asks about the state/manner of "${subjectTokens.join(' ')}" — cannot take additional complement "${complementTokens.join(' ')}"`,
        };
      }
      if (wh === 'where' && complementTokens.some((t) => LOCATION_ADVERBS.has(t))) {
        return {
          isValid: false,
          reason: `"where" already asks about location — cannot combine with location adverb "${complementTokens.join(' ')}"`,
        };
      }
      const copRes = validateCopulaComplement(complementTokens, subjectTokens, subjectNp.number);
      if (!copRes.isValid) return copRes;
      if ((wh === 'where' || wh === 'when') && copRes.ruleName?.includes('Predicate Noun Phrase')) {
        return {
          isValid: false,
          reason: `"${wh}" cannot take predicate noun phrase "${complementTokens.join(' ')}"`,
        };
      }
      if (wh === 'where' && copRes.ruleName?.includes('Adjective')) {
        return {
          isValid: false,
          reason: `"where" asks about location and cannot take adjective complement "${complementTokens.join(' ')}"`,
        };
      }
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
        const subjTokens = afterAux.slice(0, subjectNp.length);
        if (subComp.length === 0) {
          const subjCat = getSemanticCategory(subjTokens);
          if (wh === 'when' && subjCat !== 'time' && subjCat !== 'neutral_pronoun') {
            return {
              isValid: false,
              reason: `Incomplete question "${words.join(' ')}" — "when" requires a complement (e.g. "When will I be here?")`,
            };
          }
          if (wh === 'why') {
            return {
              isValid: false,
              reason: `Incomplete question "${words.join(' ')}" — "why" requires a complement (e.g. "Why will he be here?")`,
            };
          }
          return {
            isValid: true,
            ruleName: `WH-Question ("${wh}")`,
            ruleExplanation: `Rule 4: Modal WH-question "${words.join(' ')}".`,
          };
        }
        if (subComp[0] === 'not') {
          return {
            isValid: false,
            reason: `Negation "not" must precede "be" ("${wh} ${aux} ${subjTokens.join(' ')} not be ...")`,
          };
        }
        if (wh === 'how') {
          return {
            isValid: false,
            reason: `"how" already asks about manner/state — cannot take additional complement "${subComp.join(' ')}"`,
          };
        }
        if (wh === 'where' && subComp.some((t) => LOCATION_ADVERBS.has(t))) {
          return {
            isValid: false,
            reason: `"where" already asks about location — cannot combine with location adverb "${subComp.join(' ')}"`,
          };
        }
        const copRes = validateCopulaComplement(subComp, subjTokens, subjectNp.number, modalNegated);
        if (!copRes.isValid) return copRes;
        if ((wh === 'where' || wh === 'when') && copRes.ruleName?.includes('Predicate Noun Phrase')) {
          return {
            isValid: false,
            reason: `"${wh}" cannot take predicate noun phrase "${subComp.join(' ')}"`,
          };
        }
        if (wh === 'where' && copRes.ruleName?.includes('Adjective')) {
          return {
            isValid: false,
            reason: `"where" asks about location and cannot take adjective complement "${subComp.join(' ')}"`,
          };
        }
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
        const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
        const directObj = (doObjCheck.objTokens ?? subComp).join(' ');
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Modal WH-question "${wh} ${aux} ${subjTokens.join(' ')} ${modalNegated ? 'not ' : ''}do" + direct object "${directObj}"${trailTag.descPart}.`,
        };
      }
      const subjTokens = afterAux.slice(0, subjectNp.length);
      if (baseVerb === 'name' && !canSubjectPerformDo(subjTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjTokens.join(' ')}" cannot perform verb "name"` };
      }
      if (baseVerb === 'name') {
        const nameRes = parseNameObjectWithTrailing(subComp);
        if (!nameRes.valid) return { isValid: false, reason: nameRes.reason || `Invalid object after "name"` };
        const trailTag = buildTrailingClauseTag(nameRes.trailingTokens);
        const directObj = (nameRes.objTokens ?? subComp).join(' ');
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Modal WH-question "${wh} ${aux} ${subjTokens.join(' ')} ${modalNegated ? 'not ' : ''}name" + direct object "${directObj}"${trailTag.descPart}.`,
        };
      }
      const haveRes = validateHaveObjectWithTrailing(subjTokens, subComp);
      if (haveRes.valid) {
        const trailTag = buildTrailingClauseTag(haveRes.trailingTokens);
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: Modal WH-question "${wh} ${aux} ${subjTokens.join(' ')} ${modalNegated ? 'not ' : ''}have" + direct object "${haveRes.objTokens.join(' ')}"${trailTag.descPart}.`,
        };
      }
      return { isValid: false, reason: haveRes.reason || `Invalid object after "${baseVerb}"` };
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
      const doNegated = afterSubject[0] === 'not';
      if (doNegated) afterSubject = afterSubject.slice(1);
      if (afterSubject.length === 0 || !['have', 'do', 'name'].includes(afterSubject[0])) {
        return { isValid: false, reason: `Question with "${wh} ${aux}" requires base verb "have", "do", or "name"` };
      }
      const subComp = afterSubject.slice(1);
      if (subComp.length === 0) {
        return { isValid: false, reason: `Incomplete question: "${afterSubject[0]}" requires an object` };
      }
      const subjTokens = afterAux.slice(0, subjectNp.length);
      if (afterSubject[0] === 'do') {
        if (!canSubjectPerformDo(subjTokens)) {
          return { isValid: false, reason: `Semantic mismatch: "${subjTokens.join(' ')}" cannot perform verb "do"` };
        }
        const doObjCheck = validateDoObjectWithTrailing(subComp);
        if (!doObjCheck.isValid) return { isValid: false, reason: doObjCheck.reason };
        const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
        const directObj = (doObjCheck.objTokens ?? subComp).join(' ');
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: WH-question "${wh} ${aux} ${subjTokens.join(' ')} ${doNegated ? 'not ' : ''}do" + direct object "${directObj}"${trailTag.descPart}.`,
        };
      }
      if (afterSubject[0] === 'name' && !canSubjectPerformDo(subjTokens)) {
        return { isValid: false, reason: `Semantic mismatch: "${subjTokens.join(' ')}" cannot perform verb "name"` };
      }
      if (afterSubject[0] === 'name') {
        const nameRes = parseNameObjectWithTrailing(subComp);
        if (!nameRes.valid) return { isValid: false, reason: nameRes.reason || `Invalid object after "name"` };
        const trailTag = buildTrailingClauseTag(nameRes.trailingTokens);
        const directObj = (nameRes.objTokens ?? subComp).join(' ');
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: WH-question "${wh} ${aux} ${subjTokens.join(' ')} ${doNegated ? 'not ' : ''}name" + direct object "${directObj}"${trailTag.descPart}.`,
        };
      }
      const haveRes = validateHaveObjectWithTrailing(subjTokens, subComp);
      if (haveRes.valid) {
        const trailTag = buildTrailingClauseTag(haveRes.trailingTokens);
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh}")${trailTag.ruleSuffix}`,
          ruleExplanation: `Rule 4: WH-question "${wh} ${aux} ${subjTokens.join(' ')} ${doNegated ? 'not ' : ''}have" + direct object "${haveRes.objTokens.join(' ')}"${trailTag.descPart}.`,
        };
      }
      return { isValid: false, reason: haveRes.reason || `Invalid object after "${afterSubject[0]}"` };
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
      if (subjectNp.valid && checkSubjectVerbAgreement(subjectNp.number, aux).isValid) {
        const subjTokens = afterAux.slice(0, subjectNp.length);
        const tailAfterSubj = afterAux.slice(subjectNp.length);
        if (tailAfterSubj.length === 0) {
          const subjCat = getSemanticCategory(subjTokens);
          if (wh === 'what' && subjCat === 'human' && !ARTICLES.has(subjTokens[0])) {
            return {
              isValid: false,
              reason: `Use "Who" rather than "What" when asking about a person ("${subjTokens.join(' ')}")`,
            };
          }
          if (wh === 'who' && (subjCat === 'object' || subjCat === 'time' || subjCat === 'name')) {
            return {
              isValid: false,
              reason: `Use "What" rather than "Who" when asking about "${subjTokens.join(' ')}"`,
            };
          }
          return {
            isValid: true,
            ruleName: `WH-Question ("${wh}")`,
            ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
          };
        }
        // Present/past continuous object WH-question: "What is he doing [here]?"
        if (
          wh === 'what' &&
          tailAfterSubj[0] === 'doing' &&
          canSubjectPerformDo(subjTokens) &&
          parseTrailingAdverbials(tailAfterSubj.slice(1)).valid
        ) {
          return {
            isValid: true,
            ruleName: 'Continuous WH-Question ("What ... doing")',
            ruleExplanation: `Rule 4: Continuous WH-question "${words.join(' ')}".`,
          };
        }
        // Stranded preposition WH-questions: "Who is it for?", "What is this for?", "Who is she good to?"
        const tailNoNot = tailAfterSubj[0] === 'not' ? tailAfterSubj.slice(1) : tailAfterSubj;
        if (
          tailNoNot.length === 1 &&
          (tailNoNot[0] === 'for' || (tailNoNot[0] === 'to' && wh === 'who'))
        ) {
          return {
            isValid: true,
            ruleName: `Stranded Preposition WH-Question ("${wh} ... ${tailNoNot[0]}")`,
            ruleExplanation: `Rule 4: British Council standard WH-question with final preposition "${words.join(' ')}".`,
          };
        }
        if (
          tailNoNot.length === 2 &&
          EVALUATIVE_ADJECTIVES.has(tailNoNot[0]) &&
          (tailNoNot[1] === 'for' || (tailNoNot[1] === 'to' && wh === 'who'))
        ) {
          return {
            isValid: true,
            ruleName: `Stranded Preposition WH-Question ("${wh} ... ${tailNoNot[0]} ${tailNoNot[1]}")`,
            ruleExplanation: `Rule 4: Evaluative WH-question with final preposition "${words.join(' ')}".`,
          };
        }
      }
      // Or WH as subject: "Who is here?", "What is good?", "Who is my friend?"
      const placeholder = wh === 'who' ? 'somebody' : 'something';
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
          if (afterSubj[0] === 'name' && parseNameObjectWithTrailing(restObj).valid) {
            return {
              isValid: true,
              ruleName: `WH-Question ("${wh}" + Name Object)`,
              ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
            };
          }
          // Stranded "for": "What did you do that for?", "Who did you do it for?"
          if (restObj.length >= 2 && restObj[restObj.length - 1] === 'for') {
            const innerObj = restObj.slice(0, -1);
            const innerOk =
              afterSubj[0] === 'do'
                ? validateDoObjectWithTrailing(innerObj).isValid
                : afterSubj[0] === 'name'
                ? parseNameObjectWithTrailing(innerObj).valid
                : parseObjectWithTrailing(innerObj).valid;
            if (innerOk) {
              return {
                isValid: true,
                ruleName: `Stranded Preposition WH-Question ("${wh} ... for")`,
                ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
              };
            }
          }
        }
      }
    }

    // Subject WH-question with transitive/modal verb: "Who has a friend?", "Who can be here?"
    const placeholder = wh === 'who' ? 'somebody' : 'something';
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

  // 3. Object-only WH-pronoun: whom (cannot be a subject — must have auxiliary + subject or stranded preposition)
  if (wh === 'whom') {
    if (['is', 'am', 'are', 'was', 'were'].includes(aux)) {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (subjectNp.valid && checkSubjectVerbAgreement(subjectNp.number, aux).isValid) {
        const subjTokens = afterAux.slice(0, subjectNp.length);
        const tailAfterSubj = afterAux.slice(subjectNp.length);
        const tailNoNot = tailAfterSubj[0] === 'not' ? tailAfterSubj.slice(1) : tailAfterSubj;
        if (tailNoNot.length === 1 && (tailNoNot[0] === 'for' || tailNoNot[0] === 'to')) {
          return {
            isValid: true,
            ruleName: `WH-Question ("whom ... ${tailNoNot[0]}")`,
            ruleExplanation: `Rule 4: British Council WH-question with object pronoun "whom": "${words.join(' ')}".`,
          };
        }
        if (
          tailNoNot.length === 2 &&
          EVALUATIVE_ADJECTIVES.has(tailNoNot[0]) &&
          (tailNoNot[1] === 'for' || tailNoNot[1] === 'to')
        ) {
          return {
            isValid: true,
            ruleName: `WH-Question ("whom ... ${tailNoNot[0]} ${tailNoNot[1]}")`,
            ruleExplanation: `Rule 4: Evaluative WH-question with "whom": "${words.join(' ')}".`,
          };
        }
        if (
          tailNoNot.length === 0 &&
          ['it', 'this', 'that'].includes(subjTokens[0])
        ) {
          return {
            isValid: false,
            reason: `"whom" is an object pronoun and requires a preposition (e.g. "Whom is this for?") or transitive verb`,
          };
        }
      }
      return {
        isValid: false,
        reason: `"whom" is strictly an object pronoun — use "Who" as subject or pair "whom" with a transitive verb / preposition (e.g. "Whom did you name?", "Whom is it for?")`,
      };
    }

    if (['do', 'does', 'did', 'can', 'will'].includes(aux)) {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (!subjectNp.valid) {
        return { isValid: false, reason: subjectNp.reason || `Invalid subject after "whom ${aux}"` };
      }
      const agreement = checkSubjectVerbAgreement(subjectNp.number, aux);
      if (!agreement.isValid) {
        return { isValid: false, reason: agreement.reason };
      }
      let afterSubj = afterAux.slice(subjectNp.length);
      if (afterSubj[0] === 'not') afterSubj = afterSubj.slice(1);
      if (afterSubj.length >= 1 && ['have', 'do', 'name'].includes(afterSubj[0])) {
        const mainV = afterSubj[0];
        const restObj = afterSubj.slice(1);
        if (mainV === 'name') {
          // "Whom did you name?", "Whom did you name here?", "Whom will she name her friend?"
          // "whom" already fills the direct object of "name" — cannot take another object like "something" or "a thing"
          if (restObj.length === 0 || parseTrailingAdverbials(restObj).valid) {
            return {
              isValid: true,
              ruleName: 'WH-Question ("whom")',
              ruleExplanation: `Rule 4: Object WH-question "${words.join(' ')}".`,
            };
          }
          const roleNp = parseNounPhrase(restObj, 0, false);
          if (roleNp.valid) {
            const roleTokens = restObj.slice(0, roleNp.length);
            const afterRole = restObj.slice(roleNp.length);
            const isHumanRole =
              roleTokens.length >= 2 &&
              HUMAN_NOUNS.has(roleTokens[roleTokens.length - 1]);
            const isProperRole =
              roleTokens.length === 1 && isProperNameToken(roleTokens[0]);
            if (
              (isHumanRole || isProperRole) &&
              (afterRole.length === 0 || parseTrailingAdverbials(afterRole).valid)
            ) {
              return {
                isValid: true,
                ruleName: 'WH-Question ("whom")',
                ruleExplanation: `Rule 4: Ditransitive naming WH-question "${words.join(' ')}".`,
              };
            }
          }
        } else if (mainV === 'have') {
          if (restObj.length === 0 || parseTrailingAdverbials(restObj).valid) {
            return {
              isValid: true,
              ruleName: 'WH-Question ("whom")',
              ruleExplanation: `Rule 4: Object WH-question "${words.join(' ')}".`,
            };
          }
        }
        // Stranded preposition: "Whom did you do it for?", "Whom did you do that to?"
        if (restObj.length >= 2 && (restObj[restObj.length - 1] === 'for' || restObj[restObj.length - 1] === 'to')) {
          const innerObj = restObj.slice(0, -1);
          const innerOk =
            mainV === 'do'
              ? validateDoObjectWithTrailing(innerObj).isValid
              : mainV === 'name'
              ? parseNameObjectWithTrailing(innerObj).valid
              : parseObjectWithTrailing(innerObj).valid;
          if (innerOk) {
            return {
              isValid: true,
              ruleName: `Stranded Preposition WH-Question ("whom ... ${restObj[restObj.length - 1]}")`,
              ruleExplanation: `Rule 4: British Council WH-question with "whom": "${words.join(' ')}".`,
            };
          }
        }
      }
      return {
        isValid: false,
        reason: `Invalid question with "whom" — try e.g. "Whom did you name?" or "Whom did you do it for?"`,
      };
    }

    return {
      isValid: false,
      reason: `"whom" is strictly an object pronoun and must be followed by an auxiliary verb (did, do, does, will, can, is, was)`,
    };
  }

  // 4. Possessive & Selective WH-words: whose, which
  // Supports both determiner form ("Whose friend is here?", "Which thing did you do?")
  // and standalone pronoun form ("Whose is this?", "Which is good?", "Which did you do?").
  if (wh === 'whose' || wh === 'which') {
    const repDet = wh === 'whose' ? 'his' : 'the';
    const npCheck = parseNounPhrase([repDet, ...rest], 0, false);

    // Determiner form: "Whose/Which + [Adj*] + Noun + ..."
    // Must not accidentally treat bare "whose/which" followed directly by verb as a NounPhrase (npCheck.length >= 2 ensures a head noun was consumed).
    if (npCheck.valid && npCheck.length >= 2 && !ARTICLES.has(rest[0]) && !POSSESSIVES.has(rest[0])) {
      const nounLenInRest = npCheck.length - 1;
      const whNounTokens = [repDet, ...rest.slice(0, nounLenInRest)];
      const afterWhNoun = rest.slice(nounLenInRest);

      if (afterWhNoun.length === 0) {
        return { isValid: false, reason: `Incomplete question after "${wh} ${rest.join(' ')}"` };
      }

      const vAux = afterWhNoun[0];
      const afterVAux = afterWhNoun.slice(1);

      // Pattern 4a: Inverted Copula Question -> "Whose friend is he?", "Whose sister are you?", "Which thing is this?"
      if (['is', 'am', 'are', 'was', 'were'].includes(vAux) && afterVAux.length >= 1) {
        const subjNp = parseNounPhrase(afterVAux, 0, false);
        if (subjNp.valid && checkSubjectVerbAgreement(subjNp.number, vAux).isValid) {
          const tail = afterVAux.slice(subjNp.length);
          const subjTokens = afterVAux.slice(0, subjNp.length);
          if (tail.length === 0) {
            // Singular "whose/which + Noun" cannot equate to plural subjects ("these", "those", "they", "we")
            if (subjNp.number === 'plural') {
              return {
                isValid: false,
                reason: `Number mismatch: Singular "${wh} ${whNounTokens.slice(1).join(' ')}" cannot be paired with plural "${subjTokens.join(' ')}"`,
              };
            }
            return {
              isValid: true,
              ruleName: `WH-Question ("${wh} + Noun")`,
              ruleExplanation: `Rule 4: Interrogative determiner WH-question "${words.join(' ')}".`,
            };
          }
          if (
            tail[0] === 'doing' &&
            getSemanticCategory(whNounTokens) === 'object' &&
            canSubjectPerformDo(subjTokens) &&
            parseTrailingAdverbials(tail.slice(1)).valid
          ) {
            return {
              isValid: true,
              ruleName: `Continuous WH-Question ("${wh} ... doing")`,
              ruleExplanation: `Rule 4: Continuous WH-question "${words.join(' ')}".`,
            };
          }
          const tailNoNot = tail[0] === 'not' ? tail.slice(1) : tail;
          if (tailNoNot.length === 1 && (tailNoNot[0] === 'for' || tailNoNot[0] === 'to')) {
            return {
              isValid: true,
              ruleName: `Stranded Preposition WH-Question ("${wh} + Noun ... ${tailNoNot[0]}")`,
              ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
            };
          }
        }
      }

      // Pattern 4b: Auxiliary Object Question -> "Whose name did you have?", "Which thing did you do?"
      if (['do', 'does', 'did', 'can', 'will'].includes(vAux)) {
        const subjNp = parseNounPhrase(afterVAux, 0, false);
        if (subjNp.valid && checkSubjectVerbAgreement(subjNp.number, vAux).isValid) {
          let afterSubj = afterVAux.slice(subjNp.length);
          if (afterSubj[0] === 'not') afterSubj = afterSubj.slice(1);
          if (afterSubj.length >= 1 && ['have', 'do', 'name'].includes(afterSubj[0])) {
            const mainV = afterSubj[0];
            const restObj = afterSubj.slice(1);
            if (mainV === 'do' && getSemanticCategory(whNounTokens) !== 'object') {
              return {
                isValid: false,
                reason: `Verb "do" asks about a thing or activity, not "${wh} ${rest.slice(0, nounLenInRest).join(' ')}"`,
              };
            }
            if (restObj.length === 0 || parseTrailingAdverbials(restObj).valid) {
              return {
                isValid: true,
                ruleName: `WH-Question ("${wh} + Noun")`,
                ruleExplanation: `Rule 4: Object WH-question "${words.join(' ')}".`,
              };
            }
            if (mainV === 'name' && parseNameObjectWithTrailing(restObj).valid) {
              return {
                isValid: true,
                ruleName: `WH-Question ("${wh} + Noun")`,
                ruleExplanation: `Rule 4: Naming WH-question "${words.join(' ')}".`,
              };
            }
            if (restObj.length >= 2 && (restObj[restObj.length - 1] === 'for' || restObj[restObj.length - 1] === 'to')) {
              const innerObj = restObj.slice(0, -1);
              const innerOk =
                mainV === 'do'
                  ? validateDoObjectWithTrailing(innerObj).isValid
                  : mainV === 'name'
                  ? parseNameObjectWithTrailing(innerObj).valid
                  : parseObjectWithTrailing(innerObj).valid;
              if (innerOk) {
                return {
                  isValid: true,
                  ruleName: `Stranded Preposition WH-Question ("${wh} + Noun ... ${restObj[restObj.length - 1]}")`,
                  ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
                };
              }
            }
          }
        }
      }

      // Pattern 4c: Subject WH-Determiner Question -> "Whose friend is here?", "Which sister has a friend?"
      const asSubjDet = validateDeclarativeSentence([repDet, ...rest]);
      if (asSubjDet.isValid) {
        return {
          isValid: true,
          ruleName: `WH-Question ("${wh} + Noun" Subject)`,
          ruleExplanation: `Rule 4: Subject WH-question "${words.join(' ')}".`,
        };
      }
      return { isValid: false, reason: asSubjDet.reason || `Invalid question "${words.join(' ')}"` };
    }

    // Standalone Pronoun Form: "Whose is this?", "Which is this?", "Which did you do?", "Whose are these?"
    if (['is', 'am', 'are', 'was', 'were'].includes(aux)) {
      if (afterAux.length === 1 && ['it', 'this', 'that', 'these', 'those'].includes(afterAux[0])) {
        const num = ['these', 'those'].includes(afterAux[0]) ? 'plural' : 'singular';
        if (checkSubjectVerbAgreement(num, aux).isValid) {
          return {
            isValid: true,
            ruleName: `WH-Question ("${wh}")`,
            ruleExplanation: `Rule 4: Pronoun WH-question "${words.join(' ')}".`,
          };
        }
      }

      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (subjectNp.valid && checkSubjectVerbAgreement(subjectNp.number, aux).isValid) {
        const subjTokens = afterAux.slice(0, subjectNp.length);
        const tailAfterSubj = afterAux.slice(subjectNp.length);
        const subjCat = getSemanticCategory(subjTokens);

        if (tailAfterSubj.length === 0) {
          if (getIndefiniteBase(subjTokens)) {
            return {
              isValid: false,
              reason: `Standalone "${wh}" cannot be paired with indefinite pronoun "${subjTokens.join(' ')}"`,
            };
          }
          if (wh === 'whose' && subjCat === 'human') {
            return {
              isValid: false,
              reason: `Standalone "Whose" asks who owns a thing (e.g. "Whose is this?"), not about "${subjTokens.join(' ')}" — use "Whose friend is..." or "Who is..."`,
            };
          }
          if (wh === 'which' && subjCat === 'human') {
            return {
              isValid: false,
              reason: `Standalone "Which" cannot ask about person "${subjTokens.join(' ')}" — use "Who ${aux} ${subjTokens.join(' ')}?" or "Which [noun] ${aux} ${subjTokens.join(' ')}?"`,
            };
          }
          return {
            isValid: true,
            ruleName: `WH-Question ("${wh}")`,
            ruleExplanation: `Rule 4: Pronoun WH-question "${words.join(' ')}".`,
          };
        }

        const tailNoNot = tailAfterSubj[0] === 'not' ? tailAfterSubj.slice(1) : tailAfterSubj;
        if (wh === 'which' && tailNoNot.length === 1 && (tailNoNot[0] === 'for' || tailNoNot[0] === 'to')) {
          return {
            isValid: true,
            ruleName: `Stranded Preposition WH-Question ("which ... ${tailNoNot[0]}")`,
            ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
          };
        }
      }

      return {
        isValid: false,
        reason:
          wh === 'whose'
            ? `Invalid "Whose" question — use "Whose is this?" or "Whose [noun] is..."`
            : `Incomplete or invalid "Which" fragment — use e.g. "Which is this?" or "Which thing is good?"`,
      };
    }

    if (wh === 'which' && ['do', 'does', 'did', 'can', 'will'].includes(aux)) {
      const subjectNp = parseNounPhrase(afterAux, 0, false);
      if (subjectNp.valid && checkSubjectVerbAgreement(subjectNp.number, aux).isValid) {
        let afterSubj = afterAux.slice(subjectNp.length);
        if (afterSubj[0] === 'not') afterSubj = afterSubj.slice(1);
        if (afterSubj.length >= 1 && ['have', 'do', 'name'].includes(afterSubj[0])) {
          const restObj = afterSubj.slice(1);
          if (restObj.length === 0 || parseTrailingAdverbials(restObj).valid) {
            return {
              isValid: true,
              ruleName: 'WH-Question ("which")',
              ruleExplanation: `Rule 4: Object WH-question "${words.join(' ')}".`,
            };
          }
        }
      }
      const asSubjModal = validateDeclarativeSentence(['something', ...rest]);
      if (asSubjModal.isValid) {
        return {
          isValid: true,
          ruleName: 'WH-Question ("which" Subject)',
          ruleExplanation: `Rule 4: WH-question "${words.join(' ')}".`,
        };
      }
    }

    return {
      isValid: false,
      reason: `Invalid "${wh}" question structure "${words.join(' ')}"`,
    };
  }

  return { isValid: false, reason: 'Unrecognized WH-question structure' };
}

/**
 * Validates an Imperative Statement (Command starting with base verb or "Do not + base verb")
 * e.g. "Name a thing", "Be good", "Do some thing", "Have a good night", "Do not be bad"
 */
function validateImperative(words: string[], isNegatedImperative: boolean = false): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  // Negative imperative: "Do not + be/have/do/name + ..."
  if (words.length >= 3 && words[0] === 'do' && words[1] === 'not') {
    const inner = validateImperative(words.slice(2), true);
    if (inner.isValid) {
      return {
        isValid: true,
        ruleName: inner.ruleName
          ? `Negative Imperative Command ("Do not") — ${inner.ruleName}`
          : 'Negative Imperative Command ("Do not")',
        ruleExplanation: `Rule 4: Negative imperative instruction "${words.join(' ')}".`,
      };
    }
    return { isValid: false, reason: inner.reason || 'Invalid negative imperative command' };
  }

  const first = words[0];
  const rest = words.slice(1);

  if (first === 'name' && rest.length >= 1) {
    const objRes = parseNameObjectWithTrailing(rest);
    if (objRes.valid) {
      const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
      const directObjStr = (objRes.objTokens ?? rest).join(' ');
      const nameCompStr = objRes.nameTokens?.length ? ` + object complement "${objRes.nameTokens.join(' ')}"` : '';
      return {
        isValid: true,
        ruleName: `Imperative Command ("Name")${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Imperative command with verb "name" + direct object "${directObjStr}"${nameCompStr}${trailTag.descPart}.`,
      };
    }
  }

  if (first === 'be' && rest.length >= 1) {
    if (rest[0] === 'not') {
      return {
        isValid: false,
        reason: `Negative imperatives must use "Do not be ..." rather than "Be not ..."`,
      };
    }
    if (rest.length === 1 && isProperNameToken(rest[0])) {
      return {
        isValid: false,
        reason: `Imperative "Be" cannot take proper name "${rest[0]}" as complement`,
      };
    }
    const copRes = validateCopulaComplement(rest, ['you'], 'you', isNegatedImperative);
    if (copRes.isValid) {
      // Disallow ill-formed relational/demonstrative role NPs in commands (e.g. "*Be this brother", "*Be the sister", "*Be your mother")
      if (copRes.ruleName?.includes('Predicate Noun Phrase')) {
        const np = parseNounPhrase(rest, 0);
        const npToks = np.valid ? rest.slice(0, np.length) : rest;
        const firstDet = npToks[0];
        if (!['a', 'my'].includes(firstDet)) {
          return {
            isValid: false,
            reason: `Ill-formed imperative: "Be ${npToks.join(' ')}" cannot use determiner "${firstDet}" in a command (use e.g. "Be a friend" or "Be my friend")`,
          };
        }
      }
      // Disallow non-behavioral/stative adjectives ("big", "small", "young", "old") in all "Be + Adj" imperatives,
      // and disallow negative bare adjective "bad" in positive imperatives (*Be bad; "Do not be bad" remains valid).
      const hasAdj = rest.some((t) => ADJECTIVES.has(t));
      if (
        hasAdj &&
        (rest.some((t) => ['big', 'small', 'young', 'old'].includes(t)) || (!isNegatedImperative && rest[0] === 'bad'))
      ) {
        return {
          isValid: false,
          reason: !isNegatedImperative && rest[0] === 'bad'
            ? `Ill-formed positive imperative: "Be bad" is not a natural command (use "Be good" or "Do not be bad")`
            : `Ill-formed imperative: "Be ${rest.join(' ')}" uses a non-controllable stative adjective`,
        };
      }
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
      const trailTag = buildTrailingClauseTag(doObjCheck.trailingTokens);
      const directObj = (doObjCheck.objTokens ?? rest).join(' ');
      return {
        isValid: true,
        ruleName: `Imperative Command ("Do")${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Imperative action command with verb "do" + direct object "${directObj}"${trailTag.descPart}.`,
      };
    }
  }

  if (first === 'have' && rest.length >= 1) {
    const objRes = validateHaveObjectWithTrailing(['you'], rest);
    if (objRes.valid) {
      // Disallow incomplete/unnatural bare imperatives with human objects + location or indefinite human pronoun (*Have somebody in there)
      if (
        getIndefiniteBase(objRes.objTokens) === 'some body' ||
        (objRes.objTokens.length === 1 && HUMAN_OBJECT_PRONOUNS.has(objRes.objTokens[0])) ||
        (getSemanticCategory(objRes.objTokens) === 'human' && objRes.trailingTokens.length > 0)
      ) {
        return {
          isValid: false,
          reason: `Ill-formed imperative: "Have ${rest.join(' ')}" is incomplete or unnatural as a direct command`,
        };
      }
      const trailTag = buildTrailingClauseTag(objRes.trailingTokens);
      return {
        isValid: true,
        ruleName: `Imperative / Wish ("Have")${trailTag.ruleSuffix}`,
        ruleExplanation: `Rule 4: Imperative expression with verb "have" + direct object "${objRes.objTokens.join(' ')}"${trailTag.descPart}.`,
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

  // Pattern B: "Here is my father", "Here is John", "There is a friend here", "There is not a thing", "There are a brother and a sister"
  // Note: British Council English does NOT invert personal pronouns here ("Here is it" / "There are they" -> use "Here it is" / "There they are").
  // Also fronted "Here" already fills location, so trailing "here"/"there" cannot follow (*Here is John there).
  const secondToken = words[1];
  if (copulas.includes(secondToken)) {
    const subjTokens = words[2] === 'not' ? words.slice(3) : words.slice(2);
    if (subjTokens.length > 0 && !isPersonalPronounToken(subjTokens[0])) {
      const hasConflictingTrail = (trail: string[]): boolean => {
        if (lead === 'here' && trail.some((t) => t === 'here' || t === 'there')) return true;
        if (lead === 'there' && trail[0] === 'there') return true;
        return false;
      };
      const subjNp = parseNounPhrase(subjTokens, 0, true);
      if (subjNp.valid) {
        const exSubj = subjTokens.slice(0, subjNp.length);
        const isBareDemInThere =
          lead === 'there' &&
          exSubj.length === 1 &&
          (DEMONSTRATIVES_SINGULAR.has(exSubj[0]) || DEMONSTRATIVES_PLURAL.has(exSubj[0]));
        const trail = subjTokens.slice(subjNp.length);
        const trailingOk = !isBareDemInThere && !hasConflictingTrail(trail) && parseTrailingAdverbials(trail).valid;
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
      // Compound plural subject in Pattern B: "There are a brother and a sister here"
      for (let andIdx = 1; andIdx < subjTokens.length - 1; andIdx++) {
        if (subjTokens[andIdx] === 'and') {
          const leftToks = subjTokens.slice(0, andIdx);
          const leftNp = parseNounPhrase(leftToks, 0, false);
          if (leftNp.valid && leftNp.length === leftToks.length) {
            const afterAnd = subjTokens.slice(andIdx + 1);
            const rightNp = parseNounPhrase(afterAnd, 0, true);
            const trail = rightNp.valid ? afterAnd.slice(rightNp.length) : [];
            if (rightNp.valid && !hasConflictingTrail(trail) && parseTrailingAdverbials(trail).valid) {
              const agreement = checkSubjectVerbAgreement('plural', secondToken);
              if (!agreement.isValid) {
                return { isValid: false, reason: agreement.reason };
              }
              return {
                isValid: true,
                ruleName: 'Existential / Presentational ("Here/There" + Copula + Compound Subject)',
                ruleExplanation: `Rule 4: Locative inversion with compound subject "${words.join(' ')}".`,
              };
            }
          }
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
      const exSubj = subjNp.valid ? subjTokens.slice(0, subjNp.length) : [];
      const isBareDem =
        exSubj.length === 1 &&
        (DEMONSTRATIVES_SINGULAR.has(exSubj[0]) || DEMONSTRATIVES_PLURAL.has(exSubj[0]));
      if (subjNp.valid && !isBareDem && parseTrailingAdverbials(subjTokens.slice(subjNp.length)).valid) {
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
        const getClauseMood = (ruleName?: string): 'question' | 'imperative' | 'declarative' => {
          if (!ruleName) return 'declarative';
          if (isQuestionRuleName(ruleName)) return 'question';
          if (ruleName.includes('Imperative')) return 'imperative';
          return 'declarative';
        };
        const leftMood = getClauseMood(leftVal.ruleName);
        const rightMood = getClauseMood(rightVal.ruleName);
        if (leftMood === rightMood) {
          const stripPrefix = (rn?: string): string | undefined =>
            rn?.replace(/^Compound (?:Sentence|Question|Imperative) \(Conjunction\):\s*/, '');
          const combinedTags = collectUniqueRuleTags(
            stripPrefix(leftVal.ruleName),
            stripPrefix(rightVal.ruleName)
          );
          const moodPrefix =
            leftMood === 'question'
              ? 'Compound Question (Conjunction)'
              : leftMood === 'imperative'
              ? 'Compound Imperative (Conjunction)'
              : 'Compound Sentence (Conjunction)';
          const combinedDetails = [leftVal.ruleExplanation, rightVal.ruleExplanation]
            .filter(Boolean)
            .join(' ');
          return {
            isValid: true,
            ruleName: combinedTags.length > 0 ? `${moodPrefix}: ${combinedTags.join(' + ')}` : moodPrefix,
            ruleExplanation: `Rule 4: Two independent clauses connected by conjunction "${words[i]}".${
              combinedDetails ? ` ${combinedDetails}` : ''
            }`,
          };
        }
        if (!firstClauseError) {
          firstClauseError = `Cannot join a ${leftMood} and a ${rightMood} with "${words[i]}"`;
        }
      } else if (!firstClauseError) {
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
            const predTags = collectUniqueRuleTags(predRes.ruleName);
            return {
              isValid: true,
              ruleName:
                predTags.length > 0
                  ? `Compound Subject + Plural Agreement: ${predTags.join(' + ')}`
                  : 'Compound Subject + Plural Agreement',
              ruleExplanation: `Rule 4: Compound subject "${leftNpTokens.join(' ')} and ${rightNpTokens.join(' ')}" takes plural agreement.${
                predRes.ruleExplanation ? ` ${predRes.ruleExplanation}` : ''
              }`,
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
            const predTags = collectUniqueRuleTags(leftSent.ruleName, rightSent.ruleName);
            const predDetails = [leftSent.ruleExplanation, rightSent.ruleExplanation]
              .filter(Boolean)
              .join(' ');
            return {
              isValid: true,
              ruleName:
                predTags.length > 0
                  ? `Compound Predicate (Shared Subject): ${predTags.join(' + ')}`
                  : 'Compound Predicate (Shared Subject)',
              ruleExplanation: `Rule 4: Shared subject "${subjTokens.join(' ')}" with coordinated predicates joined by "${words[i]}".${
                predDetails ? ` ${predDetails}` : ''
              }`,
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
    // If no declarative reading applies either (e.g. starts with "be" or an ill-formed "have" imperative), preserve specific imperative error
    if (words[0] === 'be' || (words[0] === 'have' && impCheck.reason?.includes('Ill-formed imperative'))) {
      firstClauseError = impCheck.reason;
    }
  }

  // 4. Check for WH-Question (e.g. "Where am I?", "Whom did you name?", "Whose friend is here?", "Which is this?", "To whom is this?")
  // or Nominal WH-Clause (e.g. "Who he is", "What it is", "How old he is")
  if (WH_QUESTION_WORDS.has(words[0]) || ((words[0] === 'to' || words[0] === 'for') && words[1] === 'whom')) {
    const whCheck = validateWhQuestion(words);
    if (whCheck.isValid) {
      return whCheck;
    }
    const nominalCheck = validateNominalWhClause(words);
    if (nominalCheck.isValid) {
      return nominalCheck;
    }
    return {
      isValid: false,
      reason:
        (nominalCheck.attemptedSubjectFirst && nominalCheck.reason) ||
        whCheck.reason ||
        'Incorrect WH-question or nominal WH-clause structure',
    };
  }

  // 5. Check for Inverted Auxiliary Question (e.g. "Is father good?", "Am I good?", "Are they here?")
  if (['is', 'am', 'are', 'was', 'were', 'does', 'do', 'did', 'can', 'will', 'has', 'have'].includes(words[0])) {
    const questionCheck = validateInvertedQuestion(words);
    if (questionCheck.isValid) {
      return questionCheck;
    }
    // Return the specific question error reason (or ill-formed imperative reason) so the player knows why it was rejected
    return {
      isValid: false,
      reason: firstClauseError || questionCheck.reason || 'Incorrect question structure or missing complement',
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
  formattedText?: string;
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
  const clauses: { tokens: string[]; hasTrailingDot: boolean }[] = [];
  let currentClause: string[] = [];

  for (const t of tiles) {
    if (t.word === '.') {
      if (currentClause.length > 0) {
        clauses.push({ tokens: currentClause, hasTrailingDot: true });
        currentClause = [];
      }
    } else {
      const token = t.isWildcard && t.customName ? t.customName : t.word;
      currentClause.push(token);
    }
  }
  if (currentClause.length > 0) {
    clauses.push({ tokens: currentClause, hasTrailingDot: false });
  }

  if (clauses.length === 0) {
    return { isValid: false, score: 0, reason: 'Incomplete statement: Only punctuation placed' };
  }

  const clauseRules: string[] = [];
  const clauseExplanations: string[] = [];
  const formattedClauses: string[] = [];

  // Every clause must be grammatically valid and complete
  for (let i = 0; i < clauses.length; i++) {
    const { tokens: clauseTokens, hasTrailingDot } = clauses[i];
    const res = validateSentenceClause(clauseTokens);
    if (!res.isValid) {
      const sentenceText = clauseTokens.join(' ');
      return {
        isValid: false,
        score: 0,
        reason: `Clause "${sentenceText}": ${res.reason || 'Not a valid grammar structure'}`,
      };
    }
    const isQuestion = isQuestionRuleName(res.ruleName);
    if (isQuestion && hasTrailingDot) {
      const sentenceText = clauseTokens.join(' ');
      return {
        isValid: false,
        score: 0,
        reason: `Punctuation error: Question "${sentenceText}" cannot end with "." — inverted yes/no and WH-questions must end with "?"`,
      };
    }
    const joinedClause = clauseTokens.join(' ');
    if (isQuestion) {
      formattedClauses.push(joinedClause.endsWith('?') ? joinedClause : `${joinedClause}?`);
    } else if (hasTrailingDot) {
      formattedClauses.push(`${joinedClause} .`);
    } else {
      formattedClauses.push(joinedClause);
    }
    if (res.ruleName) clauseRules.push(res.ruleName);
    if (res.ruleExplanation) clauseExplanations.push(res.ruleExplanation);
  }

  return {
    isValid: true,
    score: totalScore,
    formattedText: formattedClauses.join(' '),
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
