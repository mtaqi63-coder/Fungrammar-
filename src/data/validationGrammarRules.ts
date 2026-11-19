export interface GrammarRuleExample {
  valid: boolean;
  sentence: string;
  noteEn: string;
  noteAr: string;
}

export interface ValidationGrammarSection {
  id: string;
  number: number;
  titleEn: string;
  titleAr: string;
  britishCouncilRefEn: string;
  britishCouncilRefAr: string;
  summaryEn: string;
  summaryAr: string;
  rulesEn: string[];
  rulesAr: string[];
  examples: GrammarRuleExample[];
}

export const GRAMMAR_RULES_META = {
  titleEn: 'Fun Grammar — Complete English Sentence Validation Rules',
  titleAr: 'القواعد المرحة — جميع قواعد التحقق من الجمل الإنجليزية',
  referenceEn: 'Aligned with British Council LearnEnglish Grammar & Official Fun Grammar Rules (© 2005)',
  referenceAr: 'متوافقة مع قواعد المجلس الثقافي البريطاني LearnEnglish Grammar وقواعد لعبة القواعد المرحة (© 2005)',
  sourceNoteEn:
    'Every move played in Fun Grammar is checked automatically against this complete rule set, grounded in British Council LearnEnglish Grammar standards and the 13 official game rules by Dr. Mohammed Taqi Alkhonaizi.',
  sourceNoteAr:
    'يتم فحص كل جملة تُلعب في القواعد المرحة تلقائياً وفق هذه القواعد الكاملة المستندة إلى معايير قواعد اللغة الإنجليزية في المجلس الثقافي البريطاني (LearnEnglish Grammar) والقواعد الـ13 الرسمية للدكتور محمد تقي الخنيزي.',
};

export const VALIDATION_GRAMMAR_SECTIONS: ValidationGrammarSection[] = [
  {
    id: 'direction-chaining',
    number: 1,
    titleEn: 'Reading Direction, Full Stop Chaining & Compound Clauses',
    titleAr: 'اتجاه القراءة، الفصل بالنقطة (.)، والجمل المركّبة',
    britishCouncilRefEn: 'British Council LearnEnglish: Sentence Structure & Coordinating Conjunctions (and / but)',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: تركيب الجملة وحروف العطف (and / but)',
    summaryEn:
      'Sentences must run strictly Left-to-Right or Top-to-Bottom, contain at least two words, and may chain or coordinate only matching grammatical moods.',
    summaryAr:
      'يجب أن تُقرأ الجمل من اليسار إلى اليمين أفقياً أو من الأعلى إلى الأسفل عمودياً، وألا تقل عن كلمتين، مع تطابق الصيغة عند الربط بحرفي العطف.',
    rulesEn: [
      'Board reading direction is strictly Left-to-Right (horizontal) or Up-to-Down (vertical); reversed order is rejected.',
      'A full stop "." tile terminates declarative/imperative clauses and starts a new independent clause on the same line, while inverted yes/no and WH-questions always terminate with "?" rather than ".".',
      'Coordinating conjunctions "and" / "but" join two complete, non-identical clauses of the same grammatical mood: declarative + declarative, question + question, or imperative + imperative — retaining all applicable rule tags across chained clauses.',
      'Mood-mixing across conjunctions is strictly rejected (e.g. a question clause cannot be joined to a statement or fragment via "but" or "and").',
      'A clause joined by "but" must not duplicate the exact clause before it or end with an incomplete possessive/determiner fragment.',
    ],
    rulesAr: [
      'اتجاه القراءة على اللوحة حصراً من اليسار إلى اليمين (أفقي) أو من الأعلى إلى الأسفل (عمودي)؛ وتُرفض الجمل المعكوسة.',
      'بطاقة النقطة "." تُنهي الجملة الخبرية أو الأمرية وتسمح ببدء جملة مستقلة جديدة، بينما تنتهي الأسئلة دائماً بعلامة الاستفهام "?" وليس بنقطة.',
      'حرفا الربط "and" و"but" يربطان جملتين كاملتين غير متكررتين وبنفس الصيغة النحوية مع الحفاظ على جميع القواعد المطبقة في الجمل المتصلة.',
      'يُمنع خلط الصيغ عبر حرف العطف (مثل ربط جملة استفهامية بجملة خبرية أو بعبارة ناقصة).',
      'لا يجوز تكرار الجملة نفسها بعد "but" أو ترك نهاية ناقصة تنتهي بمحدد أو ضمير ملكية.',
    ],
    examples: [
      {
        valid: true,
        sentence: 'He was there . Sara is here',
        noteEn: 'Full stop "." cleanly separates two valid sentences on one line.',
        noteAr: 'النقطة "." تفصل بين جملتين صحيحتين على نفس السطر.',
      },
      {
        valid: false,
        sentence: 'Is it up but your name is good',
        noteEn: 'Invalid mood mixing: question clause joined to a declarative clause with "but".',
        noteAr: 'خطأ في خلط الصيغ: ربط سؤال بجملة خبرية عبر "but".',
      },
      {
        valid: false,
        sentence: 'Is it up but your',
        noteEn: 'Incomplete trailing possessive determiner "your" after conjunction.',
        noteAr: 'عبارة ناقصة تنتهي بضمير الملكية "your".',
      },
    ],
  },
  {
    id: 'noun-phrases-determiners',
    number: 2,
    titleEn: 'Noun Phrases, Countable Nouns & Determiner Rules',
    titleAr: 'العبارات الاسمية، الأسماء المفردة المعدودة، والمحددات',
    britishCouncilRefEn: 'British Council LearnEnglish: Determiners, Articles (a / the), Possessives & Demonstratives',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: أدوات التعريف والتنكير والملكية والإشارة',
    summaryEn:
      'Singular countable nouns follow English determiner agreement: number matching, phonetic "a" rules, and strict protection against bare common nouns.',
    summaryAr:
      'تخضع الأسماء المفردة المعدودة لقواعد المحددات الإنجليزية: تطابق العدد، قاعدة صوت أداة التنكير "a"، ومنع ورود الاسم المفرد بلا محدد في غير موضع النداء/القرابة المباشرة.',
    rulesEn: [
      'All singular countable common nouns (sister, brother, father, mother, friend, name, thing, night, morning) ALWAYS require a determiner (a, the, my, his, her, your, their, this, that) in every grammatical position (*Father is bad is rejected; use "Your father is good").',
      'Time nouns ("morning", "night") take articles or demonstratives ("the morning", "that night", "a good night"), NEVER possessive determiners (*his night, *my morning).',
      'Plural demonstratives ("these", "those") cannot modify singular countable nouns (*these father, *those sister).',
      'Article "a" cannot directly precede a vowel-initial adjective ("a old", *a old father — use "an" which is not in the tile set, so pair "old" with "the/my/his/this/that").',
      'Determiners never precede proper wildcard names (N3–N6), personal pronouns, or indefinite pronouns (*my Sara, *a he, *the something).',
    ],
    rulesAr: [
      'جميع الأسماء المفردة المعدودة (sister, brother, father, mother, friend, name, thing, night, morning) تتطلب دائماً محدداً قبلها (a, the, my, his, her, your, their, this, that) في كل المواقع (*Father is bad مرفوضة؛ الصحيح "Your father is good").',
      'أسماء الزمن ("morning", "night") تأخذ أدوات التعريف والتنكير والإشارة ("the morning", "that night", "a good night") ولا تقترن بضمائر الملكية (*his night, *my morning).',
      'أدوات الإشارة للجمع ("these", "those") لا تسبق اسماً مفرداً (*these father غير صحيح).',
      'أداة التنكير "a" لا تسبق صفة تبدأ بحرف علة مثل "old" (*a old father مرفوضة؛ استخدم "the / my / this old father").',
      'المحددات لا تسبق الأسماء العلم (N3–N6) ولا الضمائر الشخصية ولا الضمائر غير المحددة (*my Sara, *the something).',
    ],
    examples: [
      {
        valid: true,
        sentence: 'My sister is young',
        noteEn: 'Valid singular countable noun preceded by possessive determiner "My".',
        noteAr: 'استخدام صحيح للاسم المفرد المسبوق بضمير الملكية "My".',
      },
      {
        valid: true,
        sentence: 'Your father is good',
        noteEn: 'Valid singular countable noun preceded by possessive determiner "Your" with copula "is" and adjective "good".',
        noteAr: 'جملة صحيحة: الفاعل المفرد مسبوق بضمير الملكية "Your" مع فعل الكون "is" والصفة "good".',
      },
      {
        valid: false,
        sentence: 'Father is bad',
        noteEn: 'Bare singular countable noun "Father" without a determiner is invalid (use "My father is bad" or "Your father is good").',
        noteAr: 'الاسم المفرد المعدود "Father" بدون أداة أو محدد غير صحيح (استخدم "My father" أو "Your father").',
      },
      {
        valid: false,
        sentence: 'These father is here',
        noteEn: 'Number mismatch: plural "These" cannot modify singular "father".',
        noteAr: 'تعارض عدد: أداة الجمع "These" لا تأتي قبل المفرد "father".',
      },
    ],
  },
  {
    id: 'adjectives-indefinites',
    number: 3,
    titleEn: 'Adjective Ordering, Indefinite Pronouns & Evaluative Adjectives',
    titleAr: 'ترتيب الصفات، الضمائر غير المحددة، والصفات التقييمية',
    britishCouncilRefEn: 'British Council LearnEnglish: Adjective Order & Indefinite Pronouns (somebody / something)',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: ترتيب الصفات والضمائر غير المحددة',
    summaryEn:
      'Multiple attributive adjectives follow British Council opinion → size → age order, and indefinite pronouns allow post-modifiers only after "something".',
    summaryAr:
      'تتبع الصفات المتتالية ترتيب المجلس الثقافي البريطاني (الرأي ثم الحجم ثم العمر)، ولا تُقبل الصفات بعد الضمير غير المحدد إلا مع "something" في موضع المفعول أو الخبر.',
    rulesEn: [
      'Adjectives follow strict English semantic rank: Opinion (good, bad) -> Size (big, small) -> Age (young, old), with no repeated adjectives.',
      'Indefinite pronouns "somebody" (human) and "something" (non-human) take singular 3rd-person verbs (is, was, does, has).',
      'Indefinite pronouns may act as semantically compatible copula complements ("This is something", "It is something good", "He is somebody"), while mismatched or redundant pairings (*He is something, *Something is something, *They are something) are rejected.',
      '"somebody" CANNOT take a postpositive adjective in any position (*Somebody young is here is rejected as unnatural/unidiomatic in this grammar scope).',
      'Only evaluative adjectives ("good", "bad") may take prepositional complements with "to" or "for" (e.g., "good to him", "bad for you"); physical/age adjectives ("big", "small", "young", "old") cannot.',
    ],
    rulesAr: [
      'ترتيب الصفات الإلزامي: الرأي (good, bad) ← الحجم (big, small) ← العمر (young, old)، مع منع تكرار الصفة.',
      'الضميران غير المحددين "somebody" (للعاقل) و"something" (لغير العاقل) يأخذان فعل المفرد (is, was, does, has).',
      'يصح وقوع الضمائر غير المحددة خبراً لفعل الكون عند التوافق الدلالي والعددي ("This is something"، "It is something good"، "He is somebody")، مع رفض التعارض الدلالي أو التكرار (*He is something، *Something is something).',
      'يُمنع نعت "somebody" بصفة بعده مباشرة (*Somebody young is here مرفوضة).',
      'الصفات التقييمية فقط ("good", "bad") تأخذ شبه جملة بـ "to" أو "for" ("good to him", "bad for you")، بخلاف صفات الحجم والعمر.',
    ],
    examples: [
      {
        valid: true,
        sentence: 'This is something',
        noteEn: 'Valid singular indefinite pronoun complement after neutral demonstrative "This".',
        noteAr: 'خبر صحيح بضمير غير محدد مفرد لغير العاقل بعد اسم الإشارة "This".',
      },
      {
        valid: true,
        sentence: 'It is something good',
        noteEn: 'Postpositive adjective properly qualifies "something" in predicate position.',
        noteAr: 'الصفة تأتي بعد "something" بشكل صحيح في الخبر.',
      },
      {
        valid: false,
        sentence: 'Somebody young is here',
        noteEn: 'Rejected: "somebody" with a postpositive adjective is disallowed.',
        noteAr: 'مرفوضة: لا يُقبل إتباع "somebody" بصفة مباشرة.',
      },
      {
        valid: false,
        sentence: 'Old big father is here',
        noteEn: 'Wrong adjective order: size ("big") must precede age ("old").',
        noteAr: 'خطأ في ترتيب الصفات: صفة الحجم ("big") تسبق العمر ("old").',
      },
    ],
  },
  {
    id: 'pronouns-demonstratives',
    number: 4,
    titleEn: 'Personal Pronoun Case & Bare Demonstrative Restrictions',
    titleAr: 'حالة الضمائر الشخصية (فاعل/مفعول) وقيود أسماء الإشارة',
    britishCouncilRefEn: 'British Council LearnEnglish: Subject vs Object Pronouns & Demonstratives',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: ضمائر الفاعل والمفعول به وأسماء الإشارة',
    summaryEn:
      'English enforces strict subject vs object case distinction and prevents bare demonstratives or "it" from acting as misplaced copula complements.',
    summaryAr:
      'تُلزم القواعد بالتمييز الصارم بين ضمائر الرفع والنصب، وتمنع وقوع أسماء الإشارة المجردة أو "it" في موقع غير صحيح كخبر لفعل الكون.',
    rulesEn: [
      'Subject-only pronouns (I, he, she, we, they) can NEVER appear as transitive objects, prepositional objects, or copula complements (*She is we, *to he).',
      'Object-only pronouns (me, him, them, us) can NEVER appear as grammatical subjects (*Him is good, *Were them here).',
      'Pronoun "her" functions as possessive determiner before a noun ("her friend") or object pronoun ("to her", "name her"), never as a subject.',
      'Bare demonstrative pronouns (this, that, these, those) CANNOT act as copula complements — even with trailing adverbials (*Oliver is this here, *He is that). Put demonstratives in subject position instead ("This is Oliver").',
      'Identifying personal pronouns ("It is you", "Was that you?", "This is me") are allowed only after singular identifying subjects ("it", "this", "that") with NO trailing adverbials (*Were those you? and *He is me are rejected).',
      'Bare "it" cannot be a copula complement for a human subject or with trailing adverbials (*Oliver is it here is rejected).',
    ],
    rulesAr: [
      'ضمائر الفاعل (I, he, she, we, they) لا تأتي أبداً مفعولاً به أو اسماً مجروراً أو خبراً لفعل الكون (*She is we, *to he).',
      'ضمائر المفعول (me, him, them, us) لا تأتي أبداً في موقع الفاعل (*Him is good).',
      'الضمير "her" يعمل كمحدد ملكية قبل الاسم ("her friend") أو ضمير مفعول ("to her")، ولا يأتي فاعلاً.',
      'أسماء الإشارة المجردة (this, that, these, those) لا تأتي خبراً لفعل الكون حتى مع وجود ظرف لاحق (*Oliver is this here مرفوضة؛ الصحيح "This is Oliver").',
      'يُسمح بضمير المفعول الشخصي خبراً فقط للتعريف بعد المفرد المحايد ("It is you", "Was that you?") بدون ظروف لاحقة، وتُرفض (*Were those you?).',
      'لا تقع كلمة "it" خبراً لفاعل عاقل أو متبوعة بظرف مكان (*Oliver is it here مرفوضة).',
    ],
    examples: [
      {
        valid: true,
        sentence: 'Was that you',
        noteEn: 'Valid singular identifying copula question.',
        noteAr: 'سؤال تعريفي صحيح بصيغة المفرد.',
      },
      {
        valid: false,
        sentence: 'Oliver is this here',
        noteEn: 'Rejected: bare demonstrative "this" cannot serve as copula complement.',
        noteAr: 'مرفوضة: اسم الإشارة المجرد "this" لا يقع خبراً لفعل الكون.',
      },
      {
        valid: false,
        sentence: 'Were those you',
        noteEn: 'Rejected: plural "those" cannot take personal pronoun "you" as identifying complement.',
        noteAr: 'مرفوضة: صيغة الجمع "those" لا تطابق التعيين الشخصي بـ "you" هنا.',
      },
    ],
  },
  {
    id: 'sv-agreement',
    number: 5,
    titleEn: 'Subject–Verb Agreement & Number Consistency',
    titleAr: 'تطابق الفعل والفاعل ومطابقة العدد',
    britishCouncilRefEn: 'British Council LearnEnglish: Subject–Verb Agreement & Auxiliary Verbs',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: تطابق الفاعل والفعل والأفعال المساعدة',
    summaryEn:
      'Every finite verb must agree in person and number with its subject head, and plural subjects paired with predicate nouns cannot collapse to a singular role.',
    summaryAr:
      'يجب أن يتطابق الفعل المصرف مع الفاعل في الشخص والعدد، ولا يجوز ربط فاعل جمع بخبر اسمي مفرد غير منطقي.',
    rulesEn: [
      '"am" agrees exclusively with "I"; "is" and "does" / "has" agree strictly with 3rd-person singular subjects (he, she, it, this, that, singular nouns, proper names, indefinite pronouns).',
      '"was" agrees with "I" and 3rd-person singular subjects; "were" agrees with "you" and plural subjects (we, they, these, those, compound subjects).',
      '"are" and "do" / "have" agree with "you" and plural subjects ("do" / "have" also agree with "I").',
      'Past forms ("did", "had") and modal auxiliaries ("can", "will") combine validly with all subjects; modals and "do/does/did" require an uninflected base verb (be, have, do, name).',
      'Subject and predicate noun phrase number must match: a plural subject ("We", "They", "These") cannot take a singular countable noun complement (*They are a friend).',
    ],
    rulesAr: [
      'الفعل "am" يختص بـ "I" فقط؛ و"is / does / has" للمفرد الغائب؛ و"was" لـ "I" والمفرد الغائب؛ و"were" لـ "you" والجمع.',
      'الأفعال "are / do / have" تأتي مع "you" والجمع (كما يأتي "do / have" مع "I").',
      'الأفعال الماضية ("did", "had") والأفعال الناقصة ("can", "will") تقبل جميع الضمائر وتُلزم الفعل الذي يليها بالصيغة المجردة (be, have, do, name).',
      'يجب تطابق العدد بين الفاعل والخبر الاسمي، فلا يُنسب المفرد المعدود للجمع (*They are a friend).',
    ],
    examples: [
      {
        valid: true,
        sentence: 'They were here in the morning',
        noteEn: 'Correct plural subject "They" + plural past copula "were".',
        noteAr: 'تطابق سليم بين فاعل الجمع "They" والفعل "were".',
      },
      {
        valid: false,
        sentence: 'You was good',
        noteEn: '"you" requires plural copula "are" or "were", not "was".',
        noteAr: 'الضمير "you" يأخذ "were" أو "are" وليس "was".',
      },
    ],
  },
  {
    id: 'copula-semantics-progressive',
    number: 6,
    titleEn: 'Copula Complements, Semantic Compatibility & Progressive Aspect',
    titleAr: 'خبر فعل الكون، التوافق الدلالي، وصيغة الاستمرار (Be + Doing)',
    britishCouncilRefEn: 'British Council LearnEnglish: Verb "Be", Present/Past Continuous & Semantic Logic',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: فعل الكون، الزمن المستمر، والمنطق الدلالي',
    summaryEn:
      'Predicate nouns and modifiers must be semantically compatible with the subject (preventing tautologies, gender clashes, and double proper-name equations).',
    summaryAr:
      'يشترط التوافق المنطقي والدلالي بين الفاعل والخبر (مع منع الحشو، وتعارض الجنس العائلي، وإسناد اسم علم لآخر كخبر).',
    rulesEn: [
      'Identical subject and complement are rejected as tautology (*Somebody is somebody).',
      'Two distinct proper names cannot equate as copula subject and complement (*Was George bob, *Oliver is Sara).',
      'Indefinite/pronoun or abstract subjects cannot equate to a bare proper name (*Is somebody bob) or mismatched role nouns.',
      'Gendered family terms must match known pronouns/names (e.g., *He is my sister and *Peter was their mother are rejected; Mary/Sara cannot be father/brother).',
      'A "name" or "thing" subject cannot take spatial direction/location in nonsensical ways (*Your name is here, *That morning is up there).',
      'Progressive aspect requires [be] + "doing" + non-human activity/thing object ("She is doing a thing", "He was doing good"), strictly restricted to human/animate subjects.',
      'Parallel compound complements ("young and good", "old but good") must share compatible complement categories; location phrases joined by "but" require negation.',
    ],
    rulesAr: [
      'يُمنع الحشو وتطابق الفاعل والخبر لفظياً (*Somebody is somebody).',
      'لا يُخبر باسم علم عن اسم علم آخر (*Was George bob مرفوضة)، ولا يُخبر باسم علم عن "somebody" (*Is somebody bob مرفوضة).',
      'يجب توافق الجنس في ألفاظ القرابة مع الضمائر والأسماء (*Peter was their mother و*He is my sister مرفوضتان).',
      'كلمة "name" لا تقع مبتدأً لظرف مكان (*Your name is here مرفوضة).',
      'صيغة الاستمرار (be + doing) تتطلب فاعلاً عاقلاً ومفعولاً غير عاقل يدل على عمل أو شيء ("She is doing a thing").',
      'الخبر المركب مع "and/but" يجب أن يتجانس نحوياً، ويستلزم النفي عند ربط مكانين بـ "but".',
    ],
    examples: [
      {
        valid: true,
        sentence: 'That brother is doing a thing',
        noteEn: 'Valid present continuous with human subject and thing object.',
        noteAr: 'صيغة مضارع مستمر صحيحة بفاعل عاقل ومفعول مناسب.',
      },
      {
        valid: false,
        sentence: 'Was George bob',
        noteEn: 'Rejected: proper name cannot act as copula complement for another proper name.',
        noteAr: 'مرفوضة: لا يقع اسم العلم خبراً لاسم علم آخر.',
      },
      {
        valid: false,
        sentence: 'Peter was their mother',
        noteEn: 'Semantic gender mismatch between masculine "Peter" and female role "mother".',
        noteAr: 'تعارض دلالي في الجنس بين "Peter" و"mother".',
      },
    ],
  },
  {
    id: 'transitive-verbs',
    number: 7,
    titleEn: 'Transitive Verbs ("Have", "Do", "Name") & Object Restrictions',
    titleAr: 'الأفعال المتعدية (Have / Do / Name) وشروط المفعول به',
    britishCouncilRefEn: 'British Council LearnEnglish: Transitive Verbs, Ditransitive "Name" & Selectional Rules',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: الأفعال المتعدية، الفعل "Name"، وقيود المفعول به',
    summaryEn:
      'Main verbs "do", "have", and "name" enforce strict animacy constraints and object structures matching British English usage.',
    summaryAr:
      'تفرض الأفعال الرئيسية (do, have, name) قيوداً دقيقة على نوع الفاعل وتركيبة المفعول به وفق الاستخدام البريطاني السليم.',
    rulesEn: [
      'Only human subjects (people, pronouns, family nouns, N3–N6) may perform actions "do" or "name" (*These name your thing and *Those do name the brother are rejected).',
      'Verb "do/does/did/doing" requires an activity/non-human object ("a thing", "something", "it", "this", "that", "good") — never a person.',
      'Lexical verb "have/has/had" CANNOT be negated directly with "not" (*Something had not these, *He has not a friend); negation requires do-support ("do/does/did not have").',
      'Verb "have/has/had" accepts noun phrase objects (e.g. "a good night", "a sister"), never bare proper names (*We have David, *He has George), overlapping same-person object pronouns (*We had me, *I have us), or trailing "to [person]"; non-human subjects cannot have people or bare demonstratives (*Something had these).',
      'Verb "name" supports naming an object noun phrase ("name a friend", "name his brother") OR ditransitive object-complement naming ("name him George", "name my friend Sara"), NEVER a bare proper name alone (*My sister did name George is rejected).',
      'Verb "name" rejects trailing recipient phrases like "to [person]" (*did name George to this father).',
      'Plural demonstratives ("these", "those") cannot have a human noun object with "do" or "name".',
    ],
    rulesAr: [
      'الفاعلون العقلاء فقط يمكنهم القيام بالفعلين "do" و"name" (*These name your thing و*Those do name the brother مرفوضتان).',
      'الفعل "do/does/did/doing" يأخذ مفعولاً غير عاقل يدل على عمل أو شيء ("a thing", "something", "it", "good") وليس شخصاً.',
      'فعل التملك الرئيسي "have/has/had" لا يُنفى بـ "not" مباشرة (*Something had not these)، بل يتطلب الفعل المساعد ("do/does/did not have").',
      'الفعل "have/has/had" يقبل المفعول الاسمي ("a sister", "a good night", "a thing") ولا يأخذ اسم علم مجرداً (*We have David) أو ضمير مفعول يطابق الفاعل في الشخص (*We had me) أو "to [شخص]"، كما لا يتملك الفاعل غير العاقل أشخاصاً أو أسماء إشارة مجردة.',
      'الفعل "name" يأخذ عبارة اسمية محددة ("name a friend") أو مفعولين للتسمية ("name him George", "name my friend Sara")، ولا يأخذ اسم علم مجرداً وحده (*My sister did name George مرفوضة)، ولا يأخذ "to [شخص]".',
    ],
    examples: [
      {
        valid: true,
        sentence: 'My sister did name her brother George',
        noteEn: 'Valid ditransitive naming structure: [determiner + sister] + did name + [NP] + [ProperName].',
        noteAr: 'تركيب صحيح لفعل التسمية بفاعله المحدد ومفعوله واسم العلم.',
      },
      {
        valid: false,
        sentence: 'Something had not these',
        noteEn: 'Rejected: main verb "had" requires "did not have", and non-human "Something" cannot possess bare demonstrative "these".',
        noteAr: 'مرفوضة: نفي الفعل "had" يستوجب "did not have"، وغير العاقل لا يتملك اسم الإشارة المجرد "these".',
      },
      {
        valid: false,
        sentence: 'Sister did name George to this father',
        noteEn: 'Rejected: bare "Sister", bare proper name object "George", and invalid "to this father".',
        noteAr: 'مرفوضة لثلاثة أخطاء: غياب المحدد، تجرد اسم العلم كمفعول وحيد، وزيادة "to this father".',
      },
      {
        valid: false,
        sentence: 'Those do name the brother',
        noteEn: 'Rejected: non-human demonstrative "Those" cannot perform the human verb "name".',
        noteAr: 'مرفوضة: اسم الإشارة لغير العاقل "Those" لا يقوم بفعل التسمية.',
      },
    ],
  },
  {
    id: 'prepositions-adverbials',
    number: 8,
    titleEn: 'Prepositions (In, To, For) & Place-Before-Time Adverbials',
    titleAr: 'حروف الجر (In / To / For) وترتيب ظروف المكان والزمان',
    britishCouncilRefEn: 'British Council LearnEnglish: Prepositions of Time/Place & Adverbial Order',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: حروف الجر وترتيب الظروف (المكان قبل الزمان)',
    summaryEn:
      'True prepositions require valid object phrases (never subject pronouns), and trailing adverbials follow English Place → Beneficiary → Time ordering without repetition.',
    summaryAr:
      'تستوجب حروف الجر اسماً أو ضمير مفعول صالحاً بعده، وتُرتّب الظروف وفق القاعدة الإنجليزية (المكان قبل الزمان) دون تكرار متضارب.',
    rulesEn: [
      'Preposition "in" takes time periods ("in the morning", "in the night", "in that morning") or containers/things — NEVER people (*in him, *in Mary).',
      'Prepositions "to" and "for" accept valid noun phrases and object pronouns ("to me", "for them", "for a friend"), NEVER subject-only pronouns (*to he, *for I). Bare "to [person]" cannot directly follow copula "be" (*Where is somebody to a sister); pair it with an evaluative adjective ("good to him") or indefinite role noun ("a friend to me").',
      'Adverbs "here", "there", "up", "down", "out" cannot take a direct noun phrase as a preposition (*here the morning); directional adverbs ("up", "down", "out") may precede "here/there" ("out there", "up here").',
      'Adjacent conflicting or duplicate place adverbs are prohibited (*We were here there, *here here, *there here).',
      'Place precedes time/beneficiary ("here in the morning", "there for you"); beneficiary may precede time ("for you in the morning").',
    ],
    rulesAr: [
      'حرف الجر "in" يأتي مع الفترات الزمنية ("in the morning", "in that night") والمكان الإشاري ("in here", "in there")، ولا يأتي مع الأشخاص أو الأشياء (*They were in something).',
      'حرفا الجر "to" و"for" يقبلان العبارات الاسمية وضمائر المفعول ("to me", "for them")، ويمنع معهما ضمائر الرفع (*to he, *for I)، ولا يقع "to [شخص]" خبراً مباشراً لفعل الكون (*Where is somebody to a sister) بل بعد صفة تقييمية ("good to him") أو دور نكرة ("a friend to me").',
      'الظروف (here, there, up, down, out) لا تنصب اسماً بعدها مباشرة، ويجوز دمج الاتجاه بالمكان ("out there", "up here").',
      'يُمنع تتابع ظرفي مكان متضاربين أو مكررين (*We were here there مرفوضة).',
      'يُقدّم ظرف المكان على الزمان والمستفيد ("here in the morning", "there for you").',
    ],
    examples: [
      {
        valid: true,
        sentence: 'We were out there in the morning',
        noteEn: 'Correct compound place adverb ("out there") followed by time phrase ("in the morning").',
        noteAr: 'ترتيب إنجليزي سليم: ظرف المكان المركب متبوعاً بظرف الزمان.',
      },
      {
        valid: false,
        sentence: 'We were here there',
        noteEn: 'Rejected: conflicting duplicate location adverbs cannot appear side by side.',
        noteAr: 'مرفوضة: لا يجوز اجتماع ظرفي المكان "here" و"there" معاً.',
      },
    ],
  },
  {
    id: 'questions-inversion',
    number: 9,
    titleEn: 'Yes/No Questions, WH-Questions, Nominal WH-Clauses & Locative Fronting',
    titleAr: 'أسئلة هل، أدوات الاستفهام، الجمل الاسمية بأداة الاستفهام، وتقديم الظرف',
    britishCouncilRefEn: 'British Council LearnEnglish: Question Forms, WH-Questions, Nominal wh-clauses, There is/are & Fronting',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: صيغ الأسئلة، أدوات الاستفهام، الجمل الاسمية بـ WH، وتقديم Here/There',
    summaryEn:
      'Covers inverted Yes/No questions, all 9 WH-question tools (Where, When, Who, Whom, Whose, Which, What, Why, How), uninverted nominal WH-clauses ("Who he is"), stranded or fronted prepositions, and existential There / Here fronting.',
    summaryAr:
      'تغطي أسئلة الإثبات والنفي المقلوبة، جميع أدوات الاستفهام التسع (Where, When, Who, Whom, Whose, Which, What, Why, How)، الجمل الاسمية بغير قلب ("Who he is")، حروف الجر المعلقة أو المقدمة، وصيغ الوجود والتقديم.',
    rulesEn: [
      'Yes/No questions invert subject and auxiliary and end with "?": [Am/Is/Are/Was/Were] + Subject + Complement; [Do/Does/Did/Can/Will] + Subject + [not] + Base Verb. Main verb "have/has" requires do-support (*Has father them is rejected; use "Does father have them").',
      'Adverbial & degree WH-question tools (Where, When, Why, How) use auxiliary inversion ("Where is he?", "Where were they?", "When did she name it?", "Why are they here?", "How old is she?", "How is he doing?"). "Where + be + Subject" cannot add a redundant/conflicting location adverb (*Where are we up), "When + be + person" requires a complement (*When am I), and "How + Subject + be" cannot take a predicate noun (*How the brother is somebody).',
      '"Who" asks about people and "What" asks about things/names/roles ("What is your name?", "What is a friend?", "Who is my friend?"), rejecting mismatched *What is Sara? or *Who is that thing?.',
      'Nominal WH-clauses (uninverted WH + Subject + Be) are valid only for fixed 3rd-person singular pronoun clauses ("Who he is", "Who she is", "What it is") and degree exclamatives ("How old he is"). Standalone dependent or uninverted fragments ("Where they were", "What that was", "Who you are", "Who somebody was", "Which these have", "Whose name those were", "Who somebody can have", "How John has a sister for something big") are incomplete and rejected.',
      '"Whom" is strictly an object pronoun used with a transitive verb or preposition ("Whom did you name?", "Whom is this for?", "To whom did you do that?", "For whom is this?"), never as a grammatical subject (*Whom is here), bare copula predicate (*Whom he is), or with a second direct object (*Whom will father name something here).',
      '"Whose" acts as a possessive determiner + noun ("Whose friend is here?", "Whose sister are you?", "Whose name did you have?") or standalone possessive pronoun asking about owned non-indefinite items ("Whose is this?", "Whose are these?").',
      '"Which" acts as a selective determiner + noun ("Which thing did you do?", "Which thing is good?", "Which sister is she?") or standalone pronoun ("Which is this?", "Which are these?", "Which did you have?"), never as an incomplete relative fragment (*Which is Oliver, *Which are good) or with indefinite pronouns (*Which was somebody).',
      'British English WH-questions support subject-WH ("Who has a friend?", "What is good?"), continuous ("What is he doing?"), and stranded prepositions ("Who is it for?", "What is that good for?").',
      'Existential & locative fronting supports indefinite/descriptive subjects ("There is a friend here", "Is there a friend?", "Here is my father") and non-inverted personal pronouns ("Here I am", "There they are"), rejecting bare demonstratives (*Is there that), inverted pronouns (*Here is it), and conflicting adverbs (*Here is John there).',
    ],
    rulesAr: [
      'أسئلة "هل" تعكس الفعل المساعد قبل الفاعل وتنتهي بـ "?": [Is/Are/Was/Were] + فاعل + خبر، أو [Do/Does/Did/Can/Will] + فاعل + فعل مجرد، وفعل الملكية "have/has" لا يُقلب مباشرة (*Has my father them مرفوضة؛ الصحيح "Does my father have them").',
      'أدوات الاستفهام الظرفية والكمية (Where, When, Why, How) تعكس الفعل المساعد ("Where is he?", "Where were they?", "When did you do it?", "Why is she here?", "How old is he?", "How is she doing?")، ولا تأخذ "Where" ظرف مكان مكرراً (*Where are we up)، ولا ترد "When am I" دون خبر، ولا تأخذ "How" خبراً اسمياً (*How the brother is somebody).',
      'تختص "Who" بالعاقل و"What" بغير العاقل والأسماء والأدوار ("What is your name?", "What is a friend?")، وتُرفض (*What is Sara?).',
      'تُقبل الجمل الاسمية بغير قلب فقط للأنماط التعريفية المفردة ("Who he is"، "Who she is"، "What it is") والتعجبية ("How old he is")، بينما تُرفض الجمل التابعة الناقصة مثل ("Where they were"، "What that was"، "Who you are"، "Who somebody was"، "Which these have"، "Whose name those were"، "Who somebody can have").',
      'تُستخدم "Whom" حصراً للمفعول به أو المجرور بحرف جر ("Whom did you name?", "Whom is this for?", "To whom did you do that?", "For whom is this?") ولا تقع فاعلاً (*Whom is here) ولا خبراً مجرداً (*Whom he is) ولا تأخذ مفعولاً ثانياً غير عاقل (*Whom will my father name something here).',
      'تعمل "Whose" كمحدد ملكية قبل الاسم ("Whose friend is here?", "Whose sister are you?", "Whose name did you have?") أو كضمير منفصل عن ملكية الأشياء ("Whose is this?", "Whose are these?").',
      'تعمل "Which" كمحدد اختيار قبل الاسم ("Which thing did you do?", "Which thing is good?", "Which sister is she?") أو كضمير منفصل ("Which is this?", "Which did you have?")، وتُرفض الجمل الناقصة مثل (*Which is Oliver، *Which are good) أو الاقتران بـ (*Which was somebody).',
      'تدعم القواعد البريطانية السؤال عن الفاعل ("Who has a friend?")، المستمر ("What is he doing?")، وحرف الجر المؤخر ("Who is it for?").',
      'تقبل صيغ الوجود والتقديم العبارات غير المعرفة ("There is a friend here", "Is there a friend?") والضمائر غير المقلوبة ("Here I am")، وتُرفض معها أسماء الإشارة المجردة (*Is there that) أو الجمع بين مكانين متعارضين (*Here is John there).',
    ],
    examples: [
      {
        valid: true,
        sentence: 'Who he is',
        noteEn: 'Valid uninverted British English nominal WH-clause ("who" + 3rd-person singular + copula).',
        noteAr: 'جملة اسمية صحيحة بأداة الاستفهام بدون قلب ("Who he is").',
      },
      {
        valid: true,
        sentence: 'Where were they',
        noteEn: 'Valid inverted locative WH-question ("Where + be + Subject").',
        noteAr: 'سؤال مكان صحيح بقلب الفعل المساعد ("Where were they").',
      },
      {
        valid: true,
        sentence: 'Whose friend is here',
        noteEn: 'Valid possessive WH-determiner ("Whose + noun") subject question.',
        noteAr: 'سؤال صحيح بأداة الملكية "Whose" متبوعة باسم.',
      },
      {
        valid: true,
        sentence: 'Whom did you name',
        noteEn: 'Valid object-case WH-question using "Whom".',
        noteAr: 'سؤال صحيح بضمير المفعول "Whom" مع فعل متعدٍ.',
      },
      {
        valid: true,
        sentence: 'Which thing did you do',
        noteEn: 'Valid selective WH-determiner ("Which + noun") question.',
        noteAr: 'سؤال اختيار صحيح باستخدام "Which" قبل الاسم.',
      },
      {
        valid: false,
        sentence: 'Where they were',
        noteEn: 'Rejected: incomplete uninverted dependent adverbial clause; requires inversion ("Where were they") to form a complete question.',
        noteAr: 'مرفوضة: جملة ظرفية تابعة ناقصة بدون قلب الفعل؛ يجب قلب الفعل ("Where were they") لتكوين سؤال تام.',
      },
      {
        valid: false,
        sentence: 'Who you are',
        noteEn: 'Rejected: incomplete uninverted 2nd-person clause; invert to "Who are you" for a complete question.',
        noteAr: 'مرفوضة: جملة ناقصة مع المخاطب؛ الصحيح قلب الفعل ("Who are you").',
      },
      {
        valid: false,
        sentence: 'Whom will father name something here',
        noteEn: 'Rejected: "whom" already fills the direct object of "name" and cannot take another object "something".',
        noteAr: 'مرفوضة: "whom" هي المفعول به للفعل "name" ولا تجتمع مع مفعول ثانٍ مثل "something".',
      },
      {
        valid: false,
        sentence: 'How the brother is somebody',
        noteEn: 'Rejected: "How" already fills the state/manner role and cannot combine with predicate "somebody".',
        noteAr: 'مرفوضة: أداة الاستفهام "How" تسأل عن الحال ولا تجتمع مع الخبر "somebody".',
      },
      {
        valid: false,
        sentence: 'Has father them',
        noteEn: 'Rejected: lexical "has" requires do-support in questions (use "Does father have them").',
        noteAr: 'مرفوضة: الفعل الرئيسي "has" لا يُقلب للسؤال مباشرة (الصحيح "Does father have them").',
      },
      {
        valid: false,
        sentence: 'Whom is here',
        noteEn: 'Rejected: "Whom" is an object pronoun and cannot be a subject (use "Who").',
        noteAr: 'مرفوضة: "Whom" ضمير مفعول ولا يقع فاعلاً (الصحيح "Who is here").',
      },
    ],
  },
  {
    id: 'imperatives-greetings',
    number: 10,
    titleEn: 'Imperative Commands & Social Greetings',
    titleAr: 'جمل الأمر الإيجابية والسلبية والتحيات',
    britishCouncilRefEn: 'British Council LearnEnglish: Imperatives & Everyday Greetings',
    britishCouncilRefAr: 'المجلس الثقافي البريطاني: صيغة الأمر والتحيات اليومية',
    summaryEn:
      'Direct commands start with an uninflected base verb (or "Do not + base verb"), and two fixed time greetings are recognized.',
    summaryAr:
      'تبدأ جمل الأمر بالفعل المجرد أو "Do not + فعل مجرد"، كما تُقبل عبارتا التحية الثابتتان.',
    rulesEn: [
      'Affirmative imperatives start with a base verb: "Be + natural human role/state" (positive behavioral "Be good", location, or indefinite/"my" role noun "Be a friend"/"Be my friend" — rejecting *Be bad, *Be this brother, *Be the thing), "Have + NP" (e.g. "Have a good night" — rejecting incomplete *Have somebody in there), "Do + thing/activity", or "Name + object".',
      'Negative imperatives start strictly with "Do not" followed by a valid base-verb command ("Do not be bad", "Do not do that") — NEVER "Be not ..." (*Be not big).',
      'Established social greeting formulas recognized by the validator: "Good morning" and "Good night".',
    ],
    rulesAr: [
      'الأمر المثبت يبدأ بالفعل المجرد: "Be + حالة أو دور طبيعي للمخاطب" ("Be good", "Be my friend"، مع رفض *Be bad و*Be this brother و*Be the thing)، أو "Have + اسم" ("Have a good night"، مع رفض *Have somebody in there)، أو "Do + عمل"، أو "Name + مفعول".',
      'الأمر المنفي يبدأ بـ "Do not" متبوعة بأمر صحيح ("Do not be bad", "Do not do that") ولا يصح "Be not ..." (*Be not big).',
      'التحيات الاجتماعية الثابتة المقبولة: "Good morning" و"Good night".',
    ],
    examples: [
      {
        valid: true,
        sentence: 'Do not be bad',
        noteEn: 'Valid negative imperative command.',
        noteAr: 'جملة نهي/أمر منفي صحيحة.',
      },
      {
        valid: true,
        sentence: 'Good morning',
        noteEn: 'Valid conventional social greeting.',
        noteAr: 'تحية صباحية ثابتة وصحيحة.',
      },
    ],
  },
  {
    id: 'wildcards-scoring',
    number: 11,
    titleEn: 'Wildcard Proper Names (N3–N6) & Score Calculation',
    titleAr: 'بطاقات أسماء العلم المتغيرة (N3–N6) وحساب النقاط',
    britishCouncilRefEn: 'Official Fun Grammar Rules 9 & 11 (Dr. Mohammed Taqi Alkhonaizi, 2005)',
    britishCouncilRefAr: 'القاعدتان الرسميتان 9 و11 من قواعد اللعبة (د. محمد تقي الخنيزي 2005)',
    summaryEn:
      'Wildcard tiles let players assign any human proper name matching the exact letter count (3–6) while disallowing reserved fixed game words.',
    summaryAr:
      'تسمح بطاقات البديل باختيار أي اسم علم بشري بعدد أحرف مطابق تماماً للرقم (3–6) مع منع استخدام كلمات اللعبة القياسية كأسماء.',
    rulesEn: [
      'Wildcard tiles N3, N4, N5, N6 must be assigned an English alphabetic proper name of exact length 3, 4, 5, or 6 letters respectively (e.g., Ali=3, Sara=4, David=5, Oliver=6).',
      'Standard game vocabulary words (such as "is", "you", "name", "good", "where") can NEVER be treated as wildcard proper names.',
      'Score per valid clause equals the exact character count (excluding spaces and "."). Intersected tiles placed across both axes are scored for every valid line they form.',
    ],
    rulesAr: [
      'بطاقات N3 وN4 وN5 وN6 تتطلب تعيين اسم علم إنجليزي بحروف إنجليزية فقط وطوله 3 أو 4 أو 5 أو 6 أحرف بالضبط.',
      'الكلمات القياسية الموجودة في اللوحة (مثل good, is, name, where) لا يمكن اعتبارها أسماء علم بديلة.',
      'تُحسب النقاط بعدد الحروف الكلي لكل جملة صحيحة (باستثناء المسافات والنقطة)، وتُحسب نقاط التقاطع في كلا الاتجاهين.',
    ],
    examples: [
      {
        valid: true,
        sentence: 'Oliver is my friend',
        noteEn: 'N6 set to "Oliver" (6 letters): 6 + 2 + 2 + 6 = 16 points.',
        noteAr: 'بطاقة N6 باسم "Oliver" (6 حروف): المجموع 16 نقطة.',
      },
      {
        valid: false,
        sentence: 'Good is my friend',
        noteEn: 'Standard adjective "Good" cannot act as a proper noun subject.',
        noteAr: 'كلمة "Good" صفة قياسية ولا تعامل كاسم علم.',
      },
    ],
  },
];
