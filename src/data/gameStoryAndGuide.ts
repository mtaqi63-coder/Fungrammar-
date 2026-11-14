export interface StoryChapter {
  id: number;
  titleAr: string;
  titleEn: string;
  eraAr: string;
  eraEn: string;
  bodyAr: string;
  bodyEn: string;
}

export interface GuideSection {
  id: number;
  titleAr: string;
  titleEn: string;
  pointsAr: string[];
  pointsEn: string[];
  exampleAr?: string;
  exampleEn?: string;
}

export const GAME_STORY_META = {
  titleEn: 'Fun Grammar',
  titleAr: 'القواعد المرحة',
  subtitleAr: 'قصة اللعبة، نشأتها، والشرح الكامل لقواعد وطريقة اللعب',
  subtitleEn: 'The Story Behind the Game, Its Origin & Complete How-to-Play Guide',
  authorAr: 'ابتكار وتأليف: د. محمد تقي الخنيزي',
  authorEn: 'Created & Designed by Dr. Mohammed Taqi Alkhonaizi',
  registrationAr: 'مملكة البحرين · رقم الإيداع بوزارة الإعلام: 1213 · © 2005',
  registrationEn: 'Kingdom of Bahrain · Ministry of Information Reg. No. 1213 · © 2005',
};

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    titleAr: 'الفصل الأول: شرارة الفكرة (البحرين 2005)',
    titleEn: 'Chapter 1: The Spark of an Idea (Bahrain, 2005)',
    eraAr: '2005 · البداية التعليمية',
    eraEn: '2005 · Educational Origin',
    bodyAr:
      'ولدت فكرة لعبة "القواعد المرحة" (Fun Grammar) في مملكة البحرين عام 2005 على يد الدكتور محمد تقي الخنيزي، وسُجِّلت رسمياً لدى وزارة الإعلام بمملكة البحرين برقم إيداع 1213. جاءت الفكرة استجابةً لتحدٍّ تعليمي شائع يواجهه كثير من الطلاب ومتعلمي اللغة الإنجليزية: حفظ الكلمات منفردةً أمرٌ ممكن، لكن تحويلها إلى جمل إنجليزية صحيحة نحوياً أثناء الحوار أو الكتابة غالباً ما يبدو جافاً وصعباً في الأساليب التقليدية.',
    bodyEn:
      'Fun Grammar was conceived in the Kingdom of Bahrain in 2005 by Dr. Mohammed Taqi Alkhonaizi and officially registered with the Bahrain Ministry of Information (Registration No. 1213). The idea grew out of a familiar classroom observation: while learners often memorize individual English vocabulary words, combining them into grammatically sound sentences can feel dry and intimidating through textbook drills alone.',
  },
  {
    id: 2,
    titleAr: 'الفصل الثاني: من الحروف المفردة إلى الجمل المتقاطعة',
    titleEn: 'Chapter 2: From Single Letters to Interlocking Sentences',
    eraAr: 'التصميم اللوحي المبتكر',
    eraEn: 'Innovative Board Design',
    bodyAr:
      'استلهم المؤلف روح ألعاب الطاولة الكلاسيكية المحبوبة مثل لعبة "سكرابل" (Scrabble)، لكنه أحدث نقلة نوعية في فكرتها: فبدلاً من ترتيب الحروف لتكوين كلمات منفردة، يتنافس اللاعبون باستخدام بطاقات كلمات إنجليزية مختارة بعناية (100 بطاقة تغطي الضمائر، الأفعال المساعدة والأساسية، الأسماء، الصفات، حروف الجر، وأدوات التعريف والربط) لبناء جمل إنجليزية كاملة ومتقاطعة على لوحة ذات مربعات منظمة، بحيث يقرأ اللاعبون الجمل أفقياً ورأسياً ويكسبون نقاطاً بعدد حروف كل جملة صحيحة.',
    bodyEn:
      'Inspired by the social thrill of classic crossword board games like Scrabble, Dr. Alkhonaizi introduced a creative leap: instead of assembling single letters into isolated words, players play whole English word tiles—100 carefully curated cards spanning pronouns, auxiliary and action verbs, nouns, adjectives, prepositions, and articles—to construct interlocking, grammatically valid English sentences horizontally and vertically across the board.',
  },
  {
    id: 3,
    titleAr: 'الفصل الثالث: من الطاولة الواقعية إلى المنصة الرقمية العالمية',
    titleEn: 'Chapter 3: From Physical Tabletop to Global Digital Play',
    eraAr: 'النسخة التفاعلية الحديثة',
    eraEn: 'Modern Interactive Edition',
    bodyAr:
      'بدأت اللعبة بصندوق لوحي واقعي يضم لوحة 15×15 مربعاً وحوامل كلمات زرقاء وبنية وبطاقات بلاستيكية متينة للطلاب والعائلات والمدارس. واليوم، تواصل اللعبة رسالتها في نسخة رقمية تفاعلية متكاملة تتيح اللعب ضد الكمبيوتر الذكي أو في وضع اللاعبين، مع لوحة تتوسع تلقائياً من 5×5 حتى 20×20، ومؤقت دور 60 ثانية، وميزة تبديل الكلمات، وحكم القواعد الفوري، لتصبح وسيلة ممتعة لتعلّم اللغة الإنجليزية والتنافس فيها في كل أنحاء العالم.',
    bodyEn:
      'What began as a physical tabletop edition with a 15×15 board, colorful racks, and 100 tangible word tiles for classrooms and families has now evolved into this interactive digital edition. Featuring an intelligent Computer opponent, 2-player Pass & Play, an auto-expanding grid (5×5 up to 20×20), a 60-second turn timer, tile exchange, and instant grammar validation, Fun Grammar brings playful English mastery to learners and players worldwide.',
  },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 1,
    titleAr: '1. مكونات اللعبة وبداية الدور',
    titleEn: '1. Game Components & Setup',
    pointsAr: [
      'يبدأ كل لاعب بسحب 10 بطاقات كلمات عشوائياً من بنك الكلمات الذي يحتوي على 100 بطاقة متنوعة.',
      'تحتوي اللوحة على نجمة ذهبية في المنتصف (مركز البداية) وتتوسع تلقائياً أثناء اللعب من 5×5 حتى 20×20 مربعاً.',
      'تحمل كل بطاقة كلمةً إنجليزيةً ورقماً صغيراً في الزاوية السفلية يمثل عدد حروفها (نقاطها الأساسية).',
    ],
    pointsEn: [
      'Each player draws 10 word tiles at random from the 100-tile English grammar bank.',
      'Play begins at the golden center star cell; the board expands dynamically from 5×5 up to 20×20 as sentences grow.',
      'Every tile displays its English word and a corner number showing its exact character count (point value).',
    ],
  },
  {
    id: 2,
    titleAr: '2. اتجاه وضع البطاقات وقراءة الجمل',
    titleEn: '2. Placement Direction & Reading Order',
    pointsAr: [
      'أفقياً: توضع الكلمة الثانية إلى يمين الكلمة الأولى، وتستمر الكلمات التالية في نفس الصف، وتُقرأ الجملة دائماً من اليسار إلى اليمين.',
      'رأسياً: توضع الكلمة الثانية أسفل الكلمة الأولى، وتستمر الكلمات التالية في نفس العمود، وتُقرأ الجملة دائماً من الأعلى إلى الأسفل.',
      'في كل دور بعد الحركة الأولى، يجب أن تتصل الجملة الجديدة ببطاقة موجودة مسبقاً على اللوحة أو تتقاطع معها (كما يمكن وضع بطاقة واحدة فقط بجانب كلمة موجودة لتكوين جملة جديدة).',
    ],
    pointsEn: [
      'Horizontal moves: place tiles left-to-right on the same row; sentences are always read strictly Left-to-Right.',
      'Vertical moves: place tiles top-to-bottom on the same column; sentences are always read strictly Up-to-Down.',
      'After the opening move, every new play must connect to or intersect an existing tile on the board—even a single tile placed beside an existing word can form a valid new sentence!',
    ],
    exampleAr: 'مثال: وضع [He] ثم [Is] ثم [Good] أفقياً = "He Is Good" (2 + 2 + 4 = 8 نقاط).',
    exampleEn: 'Example: Placing [He] [Is] [Good] horizontally = "He Is Good" (2 + 2 + 4 = 8 points).',
  },
  {
    id: 3,
    titleAr: '3. البطاقات الخاصة (N3–N6 والنقطة ".")',
    titleEn: '3. Special Tiles: Wildcards (N3–N6) & Full Stop (.)',
    pointsAr: [
      'بطاقات الأسماء الحرة (N3, N4, N5, N6): تتيح لك كتابة أي اسم علم إنجليزي بعدد حروف يطابق الرقم (مثلاً N3 = اسم من 3 حروف مثل Ali، وN5 = اسم من 5 حروف مثل Ahmed).',
      'بطاقة النقطة (.): تُوضع في نهاية جملة مكتملة لإغلاقها وبدء جملة جديدة مستقلة في نفس الصف أو العمود.',
    ],
    pointsEn: [
      'Wildcard Name Tiles (N3, N4, N5, N6): Assign any custom proper noun matching the exact letter count (e.g., N3 = 3 letters like "Ali", N5 = 5 letters like "Ahmed").',
      'Full Stop Tile (.): Terminates a completed sentence on the grid so a brand-new sentence can begin right after it in the same row or column.',
    ],
  },
  {
    id: 4,
    titleAr: '4. التبديل (Exchange)، المؤقت، واحتساب النقاط',
    titleEn: '4. Tile Exchange, Turn Timer & Scoring',
    pointsAr: [
      'تبديل الكلمات (Rule 6): إذا أردت تغيير كلمة في حاملك، اضغط عليها لاختيارها ثم اضغط على زر "تبديل / Exchange" لتستبدل بكلمة جديدة من البنك ويمر الدور.',
      'مؤقت الدور: لكل لاعب مهلة 60 ثانية في كل دور للحفاظ على حماس وسرعة المباراة.',
      'احتساب النقاط: تحصل على نقطة واحدة مقابل كل حرف في الجملة الصحيحة التي تكوّنها. وإذا تقاطعت حركة واحدة لتكوين جملتين (أفقية ورأسية معاً)، تُجمع نقاط الجملتين معاً!',
      'نهاية اللعبة والفوز: تستمر الجولات حتى ينفد البنك وحامل أحد اللاعبين أو يتوقف اللعب، ويفوز صاحب أعلى مجموع نقاط.',
    ],
    pointsEn: [
      'Exchange (Rule 6): Pick an unwanted tile from your rack and press "Exchange" to swap it for a fresh tile from the bank (your turn passes to the opponent).',
      '60-Second Turn Timer: Each human turn has a 1-minute countdown to keep matches lively and fair.',
      'Character-Count Scoring: You earn 1 point per letter in every newly formed valid sentence. Intersecting horizontally and vertically in one move awards points for BOTH sentences!',
      'Winning the Match: Play continues until the bank is empty and a player clears their rack (or both players pass). The highest total score wins!',
    ],
  },
];
