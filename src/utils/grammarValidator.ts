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

const SINGULAR_NOUNS = new Set([
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
  'n3',
  'n4',
  'n5',
  'n6',
]);

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

/**
 * Normalizes a word token
 */
function cleanWord(w: string): string {
  return w.trim().toLowerCase();
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
export function parseNounPhrase(tokens: string[], start: number = 0): NounPhraseParse {
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

  // 1. Single word pronouns
  if (w1 === 'i') return { valid: true, length: 1, number: 'i' };
  if (w1 === 'you') return { valid: true, length: 1, number: 'you' };
  if (SUBJECT_PRONOUNS_SINGULAR.has(w1)) return { valid: true, length: 1, number: 'singular' };
  if (SUBJECT_PRONOUNS_PLURAL.has(w1)) return { valid: true, length: 1, number: 'plural' };

  // 2. Compound nouns: "some body", "some thing" (as 1 token or 2 tokens)
  if (w1 === 'some body' || w1 === 'somebody' || w1 === 'some thing' || w1 === 'something') {
    return { valid: true, length: 1, number: 'singular' };
  }
  if (w1 === 'some' && remaining.length >= 2 && (remaining[1] === 'body' || remaining[1] === 'thing')) {
    return { valid: true, length: 2, number: 'singular' };
  }

  // 3. Proper nouns & wildcards (N3-N6, custom names) or standalone family nouns used as proper names (Father, Mother)
  if (['n3', 'n4', 'n5', 'n6', 'father', 'mother'].includes(w1)) {
    return { valid: true, length: 1, number: 'singular' };
  }
  // Any custom wildcard name of 3-6 letters (must NOT be one of the standard game words!)
  if (/^[a-z]{3,6}$/.test(w1) && !ALL_STANDARD_GAME_WORDS.has(w1)) {
    return { valid: true, length: 1, number: 'singular' };
  }

  // 4. Determiner + [optional Adj] + Noun
  if (ARTICLES.has(w1) || POSSESSIVES.has(w1) || DEMONSTRATIVES_SINGULAR.has(w1)) {
    if (remaining.length >= 2) {
      const w2 = remaining[1];
      // [Det] + [Noun] e.g. "a friend", "the sister", "my mother", "his name", "this thing", "that night"
      if (SINGULAR_NOUNS.has(w2)) {
        return { valid: true, length: 2, number: 'singular' };
      }

      // [Det] + [Adj] + [Noun] e.g. "a good night", "the young sister", "my old friend"
      if (remaining.length >= 3) {
        const w3 = remaining[2];
        if (ADJECTIVES.has(w2) && SINGULAR_NOUNS.has(w3)) {
          return { valid: true, length: 3, number: 'singular' };
        }
      }
    }
  }

  // NOTE: "these" / "those" + singular noun (e.g. "these father", "those sister") is an ERROR.
  if (DEMONSTRATIVES_PLURAL.has(w1)) {
    if (remaining.length >= 2 && SINGULAR_NOUNS.has(remaining[1])) {
      return {
        valid: false,
        length: 2,
        number: 'plural',
        reason: `Grammar error: Plural determiner "${w1}" cannot be paired with singular noun "${remaining[1]}"`,
      };
    }
  }

  // 5. Idiomatic Adjective + Noun without determiner: ONLY "good night" or "good morning"
  // (Countable singular nouns like friend, sister, thing require a determiner: "a good friend", "my young sister")
  if (w1 === 'good' && remaining.length >= 2 && (remaining[1] === 'night' || remaining[1] === 'morning')) {
    return { valid: true, length: 2, number: 'singular' };
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
      w !== 'and' &&
      w !== 'but' &&
      w !== 'not'
    ) {
      return true;
    }
    return false;
  }

  // Multi-token phrase: check the head noun (last word)
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

  // 1. "in": In Fun Grammar, "in" is strictly a time preposition ("in the morning", "in that night")
  if (prep === 'in') {
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

  // 2. "to": expresses direction/recipient to a person: "to him", "to me", "to my sister", "to Fatima"
  if (prep === 'to') {
    if (objectTokens.length === 1 && HUMAN_OBJECT_PRONOUNS.has(objectTokens[0])) {
      return { valid: true, length: 2 };
    }

    const np = parseNounPhrase(objectTokens, 0);
    if (np.valid && np.length === objectTokens.length && isHumanEntity(objectTokens)) {
      return { valid: true, length: 1 + np.length };
    }

    return { valid: false, length: 0, reason: `Preposition "to" requires a person or pronoun as object` };
  }

  // 3. "for": can take human beneficiary ("for them", "for my mother", "for Fatima")
  // OR time/purpose ("for the night", "for the morning", "for that thing")
  if (prep === 'for') {
    if (
      objectTokens.length === 1 &&
      (HUMAN_OBJECT_PRONOUNS.has(objectTokens[0]) || NON_HUMAN_OBJECT_PRONOUNS.has(objectTokens[0]))
    ) {
      return { valid: true, length: 2 };
    }

    const np = parseNounPhrase(objectTokens, 0);
    if (np.valid && np.length === objectTokens.length) {
      return { valid: true, length: 1 + np.length };
    }

    return { valid: false, length: 0, reason: `Invalid object phrase for preposition "for"` };
  }

  return { valid: false, length: 0, reason: `Unrecognized preposition "${prep}"` };
}

/**
 * Validates predicate / complement following copula verb (is, am, are, was, were, be)
 */
export function validateCopulaComplement(
  tokens: string[],
  subjectTokens?: string[]
): { isValid: boolean; reason?: string; ruleName?: string; ruleExplanation?: string } {
  if (tokens.length === 0) {
    return { isValid: false, reason: 'Sentence requires a complement (adjective, location, or noun phrase)' };
  }

  let rest = tokens;
  if (tokens[0] === 'not') {
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

  // 1. Single adjective: "good", "bad", "young", "old", "big", "small"
  if (rest.length === 1 && ADJECTIVES.has(rest[0])) {
    return {
      isValid: true,
      ruleName: 'Subject + Copula Verb + Adjective Complement',
      ruleExplanation: `Rule 4: Copula predicate with adjective complement "${tokens.join(' ')}".`,
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

  // 3. Location adverb + Time prepositional phrase:
  // e.g. "there in the morning", "here in the night" (from Rule 12 authentic sample board)
  // Location adverbs CAN NEVER take a noun phrase directly (e.g. CANNOT say "here your thing", "there my father")
  // Nor can they take arbitrary non-time preposition phrases (e.g. CANNOT say "here in your thing")
  if (LOCATION_ADVERBS.has(rest[0]) && rest.length > 1) {
    if (rest[1] === 'in') {
      const timePrep = parsePrepositionalPhrase(rest.slice(1));
      if (timePrep.valid && timePrep.length === rest.length - 1) {
        return {
          isValid: true,
          ruleName: 'Subject + Copula Verb + Location & Time Phrase',
          ruleExplanation: `Rule 4 & 11: Location adverb "${rest[0]}" paired with time prepositional phrase "${rest.slice(1).join(' ')}".`,
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

  // 5. Evaluative Adjective + Prepositional phrase:
  // ONLY "good" or "bad" take prepositional complements ("bad to him", "good for them", "good to his sister")
  // Other descriptive adjectives ("small", "big", "young", "old") CANNOT take prepositions!
  // (Cannot say "small in Fatima", "big to me", "young for them")
  if (ADJECTIVES.has(rest[0]) && rest.length >= 3) {
    const adj = rest[0];
    if (!EVALUATIVE_ADJECTIVES.has(adj)) {
      return {
        isValid: false,
        reason: `Adjective "${adj}" cannot take a prepositional phrase (cannot say "${rest.join(' ')}")`,
      };
    }

    const prep = rest[1];
    if (prep !== 'to' && prep !== 'for') {
      return {
        isValid: false,
        reason: `Adjective "${adj}" can only be paired with "to" or "for", not "${prep}"`,
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

  // 6. Noun Phrase Complement (Predicate Nominative):
  // e.g. "a friend", "the sister", "my mother", "a good night", "some body", "Sara", "Fatima"
  const np = parseNounPhrase(rest, 0);
  if (np.valid && np.length === rest.length) {
    return {
      isValid: true,
      ruleName: 'Subject + Copula Verb + Predicate Noun Phrase',
      ruleExplanation: `Rule 4: Copula predicate with predicate noun phrase "${tokens.join(' ')}".`,
    };
  }

  return { isValid: false, reason: `"${rest.join(' ')}" is not a grammatically valid complement` };
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

  // Parse and validate subject NP
  const subjectNp = parseNounPhrase(subjectTokens, 0);
  if (!subjectNp.valid || subjectNp.length !== subjectTokens.length) {
    return {
      isValid: false,
      reason: subjectNp.reason || `Invalid subject phrase "${subjectTokens.join(' ')}"`,
    };
  }

  const verbToken = words[verbIdx];
  const predicateTokens = words.slice(verbIdx + 1);

  // Check Subject-Verb Agreement
  const agreement = checkSubjectVerbAgreement(subjectNp.number, verbToken);
  if (!agreement.isValid) {
    return { isValid: false, reason: agreement.reason };
  }

  // Copular verbs (is, am, are, was, were, be)
  if (['is', 'am', 'are', 'was', 'were', 'be'].includes(verbToken)) {
    return validateCopulaComplement(predicateTokens, subjectTokens);
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

    // Object can be a noun phrase or pronoun
    if (rest.length === 1 && OBJECT_PRONOUNS.has(rest[0])) {
      return {
        isValid: true,
        ruleName: 'Subject + Verb "Have" + Object Pronoun',
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + transitive verb "${verbToken}" + object pronoun "${rest[0]}".`,
      };
    }
    const np = parseNounPhrase(rest, 0);
    if (np.valid && np.length === rest.length) {
      return {
        isValid: true,
        ruleName: 'Subject + Verb "Have" + Noun Phrase Object',
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + transitive verb "${verbToken}" + noun phrase "${rest.join(' ')}".`,
      };
    }
    return { isValid: false, reason: `Invalid object "${rest.join(' ')}" for verb "${verbToken}"` };
  }

  // Transitive do/does/did/doing
  if (['do', 'does', 'did', 'doing'].includes(verbToken)) {
    if (predicateTokens.length === 0) {
      return { isValid: false, reason: `Incomplete statement: Verb "${verbToken}" requires an object` };
    }
    const rest = predicateTokens;
    if (
      rest.length === 1 &&
      (rest[0] === 'some thing' || rest[0] === 'something' || rest[0] === 'good' || rest[0] === 'that' || rest[0] === 'this')
    ) {
      return {
        isValid: true,
        ruleName: 'Subject + Verb "Do" + Direct Object',
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + action verb "${verbToken}" + object "${rest[0]}".`,
      };
    }
    const np = parseNounPhrase(rest, 0);
    if (np.valid && np.length === rest.length) {
      return {
        isValid: true,
        ruleName: 'Subject + Verb "Do" + Noun Phrase Object',
        ruleExplanation: `Rule 4: Subject "${subjectTokens.join(' ')}" + action verb "${verbToken}" + object "${rest.join(' ')}".`,
      };
    }
    return { isValid: false, reason: `Invalid object for verb "${verbToken}"` };
  }

  // Modal verbs can/will
  if (verbToken === 'can' || verbToken === 'will') {
    if (predicateTokens.length === 0) {
      return { isValid: false, reason: `Modal verb "${verbToken}" requires a base verb (be, have, do)` };
    }

    let rest = predicateTokens;
    if (rest[0] === 'not') {
      rest = rest.slice(1);
      if (rest.length === 0) return { isValid: false, reason: 'Missing verb after "not"' };
    }

    const baseVerb = rest[0];
    if (!['be', 'have', 'do'].includes(baseVerb)) {
      return { isValid: false, reason: `Modal "${verbToken}" must be followed by base verb "be", "have", or "do"` };
    }

    const subPred = rest.slice(1);
    if (baseVerb === 'be') {
      const copResult = validateCopulaComplement(subPred, subjectTokens);
      if (!copResult.isValid) return copResult;
      return {
        isValid: true,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "be" + Complement`,
        ruleExplanation: `Rule 4: Modal predicate with auxiliary "${verbToken} be" and complement "${subPred.join(' ')}".`,
      };
    }
    if (baseVerb === 'have') {
      if (subPred.length === 0) return { isValid: false, reason: 'Missing object for "have"' };
      const np = parseNounPhrase(subPred, 0);
      return {
        isValid: np.valid && np.length === subPred.length,
        reason: np.reason,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "have" + Object`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken} have" and noun object "${subPred.join(' ')}".`,
      };
    }
    if (baseVerb === 'do') {
      if (subPred.length === 0) return { isValid: false, reason: 'Missing object for "do"' };
      const np = parseNounPhrase(subPred, 0);
      return {
        isValid: np.valid && np.length === subPred.length,
        reason: np.reason,
        ruleName: `Modal Auxiliary "${verbToken}" + Base "do" + Object`,
        ruleExplanation: `Rule 4: Modal predicate with "${verbToken} do" and object "${subPred.join(' ')}".`,
      };
    }
  }

  return { isValid: false, reason: `Unrecognized verb structure "${verbToken}"` };
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
  if (!['is', 'are', 'was', 'were', 'does', 'do', 'did', 'can', 'will', 'has', 'have'].includes(first)) {
    return { isValid: false, reason: 'Not an auxiliary question' };
  }

  const rest = words.slice(1);
  if (rest.length === 0) {
    return { isValid: false, reason: 'Incomplete question' };
  }

  // 1. Is / Was: expects Singular Subject + Copula Complement
  if (first === 'is' || first === 'was') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${first}"` };
    }
    if (subjectNp.number !== 'singular' && subjectNp.number !== 'i') {
      return { isValid: false, reason: `"${first}" requires a singular subject` };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const complementTokens = rest.slice(subjectNp.length);
    const copRes = validateCopulaComplement(complementTokens, subjectTokens);
    if (!copRes.isValid) return copRes;
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative (Copula Question)',
      ruleExplanation: `Rule 4: Inverted question with copula "${first}" + subject "${subjectTokens.join(' ')}" + complement "${complementTokens.join(' ')}".`,
    };
  }

  // 2. Are / Were: expects Plural Subject (or "you") + Copula Complement
  if (first === 'are' || first === 'were') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${first}"` };
    }
    if (subjectNp.number !== 'plural' && subjectNp.number !== 'you') {
      return { isValid: false, reason: `"${first}" requires a plural subject or "you"` };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const complementTokens = rest.slice(subjectNp.length);
    const copRes = validateCopulaComplement(complementTokens, subjectTokens);
    if (!copRes.isValid) return copRes;
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative (Copula Question)',
      ruleExplanation: `Rule 4: Inverted question with copula "${first}" + plural/second-person subject "${subjectTokens.join(' ')}" + complement "${complementTokens.join(' ')}".`,
    };
  }

  // 3. Does: expects Singular Subject + Base Verb (have, do, be) + Complement
  if (first === 'does') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid || subjectNp.number !== 'singular') {
      return { isValid: false, reason: subjectNp.reason || '"Does" requires a singular subject' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const afterSubject = rest.slice(subjectNp.length);
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'be'].includes(baseVerb)) {
      return { isValid: false, reason: `Question with "does" requires base verb (have, do, be), not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have') {
      const np = parseNounPhrase(subComplement, 0);
      if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Does" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "have" + object "${subComplement.join(' ')}".`,
      };
    }
    if (baseVerb === 'do') {
      const np = parseNounPhrase(subComplement, 0);
      if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Does" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + verb "do" + object "${subComplement.join(' ')}".`,
      };
    }
    if (baseVerb === 'be') {
      const copRes = validateCopulaComplement(subComplement, subjectTokens);
      if (!copRes.isValid) return copRes;
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Does" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "does" + subject "${subjectTokens.join(' ')}" + "be" + complement "${subComplement.join(' ')}".`,
      };
    }
  }

  // 4. Do: expects Plural Subject / You / I + Base Verb + Complement
  if (first === 'do') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid || (subjectNp.number !== 'plural' && subjectNp.number !== 'you' && subjectNp.number !== 'i')) {
      return { isValid: false, reason: subjectNp.reason || '"Do" requires a plural subject or "you"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const afterSubject = rest.slice(subjectNp.length);
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'be'].includes(baseVerb)) {
      return { isValid: false, reason: `Question with "do" requires base verb (have, do, be), not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'do') {
      const np = parseNounPhrase(subComplement, 0);
      if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Do" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + verb "${baseVerb}".`,
      };
    }
    if (baseVerb === 'be') {
      const copRes = validateCopulaComplement(subComplement, subjectTokens);
      if (!copRes.isValid) return copRes;
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Do" Question)',
        ruleExplanation: `Rule 4: Question with auxiliary "do" + subject "${subjectTokens.join(' ')}" + "be" + complement "${subComplement.join(' ')}".`,
      };
    }
  }

  // 5. Did: expects Subject + Base Verb + Complement
  if (first === 'did') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || 'Invalid subject after "did"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const afterSubject = rest.slice(subjectNp.length);
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'be'].includes(baseVerb)) {
      return { isValid: false, reason: `Question with "did" requires base verb (have, do, be), not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'do') {
      const np = parseNounPhrase(subComplement, 0);
      if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Did" Question)',
        ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + verb "${baseVerb}".`,
      };
    }
    if (baseVerb === 'be') {
      const copRes = validateCopulaComplement(subComplement, subjectTokens);
      if (!copRes.isValid) return copRes;
      return {
        isValid: true,
        ruleName: 'Inverted Interrogative ("Did" Question)',
        ruleExplanation: `Rule 4: Past tense question with "did" + subject "${subjectTokens.join(' ')}" + "be" + complement "${subComplement.join(' ')}".`,
      };
    }
  }

  // 6. Can / Will: expects Subject + Base Verb + Complement
  if (first === 'can' || first === 'will') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid) {
      return { isValid: false, reason: subjectNp.reason || `Invalid subject after "${first}"` };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const afterSubject = rest.slice(subjectNp.length);
    if (afterSubject.length === 0) {
      return { isValid: false, reason: 'Missing verb after subject in modal question' };
    }
    const baseVerb = afterSubject[0];
    if (!['have', 'do', 'be'].includes(baseVerb)) {
      return { isValid: false, reason: `Modal question requires base verb (have, do, be), not "${baseVerb}"` };
    }
    const subComplement = afterSubject.slice(1);
    if (baseVerb === 'have' || baseVerb === 'do') {
      const np = parseNounPhrase(subComplement, 0);
      if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
      return {
        isValid: true,
        ruleName: `Inverted Interrogative ("${first}" Question)`,
        ruleExplanation: `Rule 4: Modal question with "${first}" + subject "${subjectTokens.join(' ')}" + base verb "${baseVerb}".`,
      };
    }
    if (baseVerb === 'be') {
      const copRes = validateCopulaComplement(subComplement, subjectTokens);
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
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid || subjectNp.number !== 'singular') {
      return { isValid: false, reason: subjectNp.reason || '"Has" requires a singular subject' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const subComplement = rest.slice(subjectNp.length);
    const np = parseNounPhrase(subComplement, 0);
    if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative ("Has" Question)',
      ruleExplanation: `Rule 4: Question with "has" + subject "${subjectTokens.join(' ')}" + object "${subComplement.join(' ')}".`,
    };
  }

  if (first === 'have') {
    const subjectNp = parseNounPhrase(rest, 0);
    if (!subjectNp.valid || (subjectNp.number !== 'plural' && subjectNp.number !== 'you')) {
      return { isValid: false, reason: subjectNp.reason || '"Have" requires a plural subject or "you"' };
    }
    const subjectTokens = rest.slice(0, subjectNp.length);
    const subComplement = rest.slice(subjectNp.length);
    const np = parseNounPhrase(subComplement, 0);
    if (!np.valid || np.length !== subComplement.length) return { isValid: false, reason: np.reason };
    return {
      isValid: true,
      ruleName: 'Inverted Interrogative ("Have" Question)',
      ruleExplanation: `Rule 4: Question with "have" + subject "${subjectTokens.join(' ')}" + object "${subComplement.join(' ')}".`,
    };
  }

  return { isValid: false, reason: 'Unrecognized question structure' };
}

/**
 * Validates an Imperative Statement (Command starting with base verb)
 * e.g. "Name a thing", "Be good", "Do some thing", "Have a good night"
 */
function validateImperative(words: string[]): {
  isValid: boolean;
  reason?: string;
  ruleName?: string;
  ruleExplanation?: string;
} {
  const first = words[0];
  const rest = words.slice(1);

  if (first === 'name' && rest.length >= 1) {
    const np = parseNounPhrase(rest, 0);
    if (np.valid && np.length === rest.length) {
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
    const np = parseNounPhrase(rest, 0);
    if (np.valid && np.length === rest.length) {
      return {
        isValid: true,
        ruleName: 'Imperative Command ("Do")',
        ruleExplanation: `Rule 4: Imperative action command: "${words.join(' ')}".`,
      };
    }
  }

  if (first === 'have' && rest.length >= 1) {
    const np = parseNounPhrase(rest, 0);
    if (np.valid && np.length === rest.length) {
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

  // 1. Check conjunction compound: "Clause A [and / but] Clause B"
  const conjIdx = words.findIndex((w) => w === 'and' || w === 'but');
  if (conjIdx > 0 && conjIdx < words.length - 1) {
    const leftPart = words.slice(0, conjIdx);
    const rightPart = words.slice(conjIdx + 1);
    const leftVal = validateSentenceClause(leftPart);
    const rightVal = validateSentenceClause(rightPart);
    if (leftVal.isValid && rightVal.isValid) {
      return {
        isValid: true,
        ruleName: 'Compound Sentence (Conjunction)',
        ruleExplanation: `Rule 4: Two independent clauses connected by conjunction "${words[conjIdx]}".`,
      };
    }
    return {
      isValid: false,
      reason: !leftVal.isValid
        ? `Left clause error: ${leftVal.reason}`
        : `Right clause error: ${rightVal.reason}`,
    };
  }

  // 2. Check for idiomatic greeting (e.g. "Good night", "Good morning")
  const greetingCheck = validateIdiomaticGreeting(words);
  if (greetingCheck.isValid) {
    return greetingCheck;
  }

  // 3. Check for Inverted Auxiliary Question (e.g. "Is father good?", "Are they here?")
  if (['is', 'are', 'was', 'were', 'does', 'do', 'did', 'can', 'will', 'has', 'have'].includes(words[0])) {
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

  // 4. Check for Imperative Command (e.g. "Name a thing", "Be good", "Do some thing")
  if (['name', 'be', 'do', 'have'].includes(words[0])) {
    const impCheck = validateImperative(words);
    if (impCheck.isValid) {
      return impCheck;
    }
  }

  // 5. Standard Declarative Sentence (Subject + Verb + Predicate/Complement)
  const declCheck = validateDeclarativeSentence(words);
  if (declCheck.isValid) {
    return declCheck;
  }

  // If none matched, report clear error
  return {
    isValid: false,
    reason: declCheck.reason || 'Incomplete or incorrect statement (requires complete subject and verb structure)',
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
