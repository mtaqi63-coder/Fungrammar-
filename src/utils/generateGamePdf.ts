import { jsPDF } from 'jspdf';
import { TILE_DEFINITIONS } from '../data/tiles';

export function generateGameDescriptionPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = margin;

  // Helper to add a new page with header/footer
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = margin;
      drawPageDecorations();
    }
  };

  const drawPageDecorations = () => {
    // Subtle top border line
    doc.setDrawColor(37, 99, 235); // Blue
    doc.setLineWidth(0.8);
    doc.line(margin, 10, pageWidth - margin, 10);

    // Subtle bottom footer line
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Fun Grammar (القواعد المرحة) · © 2005 Dr. Mohammed Taqi Alkhonaizi · Bahrain Reg. 1213',
      margin,
      pageHeight - 7
    );
    const pageNum = doc.getNumberOfPages();
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Section heading helper
  const addSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(18);
    doc.setFillColor(241, 245, 249); // slate 100
    doc.roundedRect(margin, currentY, contentWidth, 8, 1.5, 1.5, 'F');

    doc.setFillColor(37, 99, 235); // Blue tag
    doc.rect(margin, currentY, 2.5, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate 900
    doc.text(title, margin + 5, currentY + 5.5);

    if (subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subtitle, pageWidth - margin - 3, currentY + 5.5, { align: 'right' });
    }

    currentY += 11;
  };

  // --- PAGE 1: TITLE & COVER ---
  drawPageDecorations();

  // Top Title Banner
  doc.setFillColor(30, 41, 59); // slate 800
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');

  // Accent blue stripe
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, currentY, 4, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('FUN GRAMMAR', margin + 8, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text('AL-QAWAED AL-MARAHA  ·  OFFICIAL GAME MANUAL', margin + 8, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    'By Dr. Mohammed Taqi Alkhonaizi · Bahrain Ministry of Information Reg. 1213 · Copyright © 2005',
    margin + 8,
    currentY + 26
  );

  currentY += 36;

  // Overview Card
  doc.setFillColor(248, 250, 252); // slate 50
  doc.setDrawColor(226, 232, 240); // slate 200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138); // blue 900
  doc.text('1. GAME CONCEPT & EDUCATIONAL OBJECTIVE', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const overviewText =
    'Fun Grammar is a tabletop sentence-building board game designed to make English grammar dynamic, engaging, and competitive. Players draw 10 word tiles each and strategically place them across a 15x15 grid to form grammatically correct English sentences. Scores are calculated by the total letter count of the formed sentence, with double points awarded for words intersecting horizontally and vertically. Suitable for 2 to 4 players, students, and language enthusiasts.';
  const wrappedOverview = doc.splitTextToSize(overviewText, contentWidth - 8);
  doc.text(wrappedOverview, margin + 4, currentY + 10.5);

  currentY += 28;

  // Section 2: Components Specification
  addSectionHeader('2. GAME COMPONENTS & SPECIFICATIONS', 'Official 2005 Tabletop Edition');

  const components = [
    { name: '15 x 15 Playing Grid', desc: 'Symmetrical 225-cell board with central starting star cell at Row 8, Col H (7,7).' },
    { name: '100 Word & Punctuation Tiles', desc: 'Precision word cards across 8 grammatical categories, with letter point values.' },
    { name: '10-Tile Player Racks', desc: 'Hand racks holding exactly 10 word tiles per active player at all times.' },
    { name: 'The Tile Bank (Bag)', desc: 'Draw pouch containing all remaining facedown word tiles for refills and exchanges.' },
    { name: 'Wildcard Names (N3, N4, N5, N6)', desc: 'Special wildcard tiles representing custom proper names of exactly 3, 4, 5, or 6 letters.' },
    { name: 'Full Stop "." Chaining Tiles', desc: 'Terminates an existing sentence and allows a new sentence to begin on the same row or column.' },
  ];

  components.forEach((item) => {
    checkPageBreak(8);
    doc.setFillColor(241, 245, 249);
    doc.circle(margin + 3, currentY + 2.5, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.name + ':', margin + 7, currentY + 3.5);

    const nameWidth = doc.getTextWidth(item.name + ':');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const descWrapped = doc.splitTextToSize(item.desc, contentWidth - 9 - nameWidth);
    doc.text(descWrapped, margin + 8 + nameWidth, currentY + 3.5);

    currentY += 5.8;
  });

  currentY += 4;

  // Section 3: The 13 Official Rules
  addSectionHeader('3. THE 13 OFFICIAL RULES OF PLAY', 'Dr. Mohammed Taqi Alkhonaizi');

  const officialRules = [
    {
      num: 'Rule 1',
      title: 'Tile Bank Preparation',
      text: 'Make all 100 word tiles face down randomly; this constitutes the Bank. Tiles must be thoroughly mixed before play begins.',
    },
    {
      num: 'Rule 2',
      title: 'Hand Dealing (10 Tiles)',
      text: 'Deal exactly 10 word tiles to each player. If tiles are not well mixed or a player receives an unplayable hand, replace and reshuffle.',
    },
    {
      num: 'Rule 3',
      title: 'First Player & Opening Sentence',
      text: 'Start with the player who can compose the longest grammatically valid sentence (by total letter count). The first sentence must pass through the central star cell (Row 8, Column H).',
    },
    {
      num: 'Rule 4',
      title: 'Strict Reading Order Direction',
      text: 'Sentences must be readable strictly from Left-to-Right for horizontal sentences, or strictly from Up-to-Down for vertical sentences. Backwards or reversed sentences are strictly prohibited.',
    },
    {
      num: 'Rule 5',
      title: 'Mandatory Tile Replenishment',
      text: 'Immediately after playing valid words on the board, draw replacement tiles from the Bank to restore your rack to exactly 10 tiles.',
    },
    {
      num: 'Rule 6',
      title: 'Exchanging Words from Bank',
      text: 'Players may exchange any number of unwanted tiles with random tiles from the Bank. However, performing an exchange bypasses the player’s turn (pass).',
    },
    {
      num: 'Rule 7',
      title: 'Grammar Referee & Dispute Resolution',
      text: 'Refer to an authenticated English grammar book (or the in-game Grammar Referee) in case of dispute. Any grammatically unaccepted formation must be returned to hand.',
    },
    {
      num: 'Rule 8',
      title: 'The Full Stop "." Punctuation Tile',
      text: 'The full stop "." tile terminates a completed sentence and permits a brand new sentence to begin immediately following it on the same line (row or column).',
    },
    {
      num: 'Rule 9',
      title: 'Wildcard Proper Names (N3, N4, N5, N6)',
      text: 'N3, N4, N5, and N6 represent any proper name of the player\'s choice containing exactly 3, 4, 5, or 6 characters respectively (e.g., N3 = "Ali", N4 = "Sara", N5 = "Zahra", N6 = "Fatima"). Wildcard letters contribute their exact character count to the total sentence score.',
    },
    {
      num: 'Rule 10',
      title: 'Expansion & Single-Tile Placement',
      text: 'Expand horizontal or vertical at a time. A player may place as few as a single tile beside an existing board word to create or branch a new sentence (e.g., placing "Is" beside existing "He").',
    },
    {
      num: 'Rule 11',
      title: 'Character-Count Scoring & Cross Intersections',
      text: 'Score equals the total number of characters in the completed sentence. If a placed word simultaneously intersects both horizontal and vertical sentences, its letters are scored for both directions (counted twice).',
    },
    {
      num: 'Rule 12',
      title: 'End of Game Condition',
      text: 'The game concludes when the Tile Bank is completely empty and no player can form any additional valid sentences with their remaining tiles, or when all players consecutively pass.',
    },
    {
      num: 'Rule 13',
      title: 'Final Score Tally & Declaring the Winner',
      text: 'Sum all scores accumulated across all completed turns. The player with the highest overall character total is declared the Winner of Fun Grammar.',
    },
  ];

  officialRules.forEach((rule) => {
    checkPageBreak(13);

    // Rule box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, currentY, contentWidth, 11.5, 1, 1, 'FD');

    // Rule pill
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin + 2, currentY + 1.8, 14, 4.2, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(rule.num, margin + 9, currentY + 4.8, { align: 'center' });

    // Rule title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(rule.title, margin + 18, currentY + 4.8);

    // Rule body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);
    const ruleWrapped = doc.splitTextToSize(rule.text, contentWidth - 6);
    doc.text(ruleWrapped, margin + 3, currentY + 8.8);

    currentY += 13.5;
  });

  currentY += 3;

  // --- PAGE BREAK FOR STRATEGY & EXAMPLES ---
  checkPageBreak(50);
  addSectionHeader('4. PLAY MECHANICS, EXAMPLES & SCORING', 'Authentic Placement Examples');

  // Example 1: Horizontal Sentence
  checkPageBreak(24);
  doc.setFillColor(239, 246, 255); // blue 50
  doc.setDrawColor(191, 219, 254); // blue 200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 64, 175);
  doc.text('Example A: Horizontal Sentence (Left-to-Right)', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'Sequence of placed tiles:  [ She ]  +  [ Is ]  +  [ Good ]',
    margin + 4,
    currentY + 10
  );
  doc.text(
    'Letter calculation: "She" (3 letters) + "Is" (2 letters) + "Good" (4 letters) = 9 Points.',
    margin + 4,
    currentY + 14.5
  );
  doc.text(
    'Reading order: Read strictly from left to right. Placed across row 8 intersecting the center star.',
    margin + 4,
    currentY + 19
  );

  currentY += 25;

  // Example 2: Branching with Single Tile & Vertical Sentence
  checkPageBreak(24);
  doc.setFillColor(240, 253, 244); // green 50
  doc.setDrawColor(187, 247, 208); // green 200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('Example B: Vertical Branching & Single-Tile Placement (Up-to-Down)', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'Existing word on board: [ Is ] (from "She is good")',
    margin + 4,
    currentY + 10
  );
  doc.text(
    'Player 2 places vertical branch tiles: [ He ] above "Is", and [ Here ] below "Is".',
    margin + 4,
    currentY + 14.5
  );
  doc.text(
    'Vertical Sentence: "He is here" -> "He" (2) + "Is" (2) + "Here" (4) = 8 Points. Word "Is" is scored twice!',
    margin + 4,
    currentY + 19
  );

  currentY += 25;

  // Example 3: Full Stop Chaining
  checkPageBreak(24);
  doc.setFillColor(254, 249, 195); // yellow 50
  doc.setDrawColor(253, 224, 71); // yellow 300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(133, 77, 14);
  doc.text('Example C: Full Stop "." Chaining & Wildcard Names', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    'Sequence: [ He ] [ Was ] [ There ] [ . ] [ N4: Sara ] [ Is ] [ Happy ]',
    margin + 4,
    currentY + 10
  );
  doc.text(
    'The full stop "." ends sentence 1 and immediately initiates sentence 2 on the identical row.',
    margin + 4,
    currentY + 14.5
  );
  doc.text(
    'Wildcard N4 is designated as "Sara" (4 letters). Scored as: He(2)+Was(3)+There(5) + Sara(4)+Is(2)+Happy(5) = 21 pts!',
    margin + 4,
    currentY + 19
  );

  currentY += 26;

  // Section 5: Complete Tile Distribution Breakdown
  checkPageBreak(40);
  addSectionHeader('5. COMPLETE 100-TILE INVENTORY & POINT VALUES', '8 Grammatical Categories');

  // Category summary cards
  const categories = [
    { cat: 'Verbs (Action & Auxiliary)', count: 30, color: [22, 101, 52], desc: 'Is(10), Were(3), Was(3), Are(3), Am(1), Does(1), Doing(1), Did(1), Do(1), Had(1), Has(1), Have(1), Can(1), Will(1), Be(1)' },
    { cat: 'Nouns (Substantives & Family)', count: 19, color: [30, 64, 175], desc: 'Some body(3), Name(3), Some thing(3), Thing(3), Friend(1), Sister(1), Brother(1), Father(1), Mother(1), Morning(1), Night(1)' },
    { cat: 'Pronouns (Subject & Object)', count: 14, color: [107, 33, 168], desc: 'You(1), He(1), She(1), It(1), We(1), I(1), Me(1), They(1), Him(1), These(1), That(1), Them(1), This(1), Those(1)' },
    { cat: 'Determiners & Conjunctions', count: 13, color: [180, 83, 9], desc: 'A(3), The(3), And(1), But(1), My(1), His(1), Their(1), Your(1), Her(1)' },
    { cat: 'Adverbs & Prepositions', count: 11, color: [14, 116, 144], desc: 'Not(3), In(1), To(1), For(1), Down(1), Up(1), Out(1), There(1), Here(1)' },
    { cat: 'Adjectives (Descriptive)', count: 6, color: [190, 24, 93], desc: 'Good(1), Bad(1), Small(1), Young(1), Old(1), Big(1)' },
    { cat: 'Wildcard Names (N3 - N6)', count: 4, color: [194, 65, 12], desc: 'N3(1)[3 letters], N4(1)[4 letters], N5(1)[5 letters], N6(1)[6 letters] - Choose any custom proper noun' },
    { cat: 'Punctuation Tiles', count: 3, color: [71, 85, 105], desc: 'Full Stop "." (3 tiles) - Ends current sentence & initiates new sentence on same line (0 pts)' },
  ];

  categories.forEach((item) => {
    checkPageBreak(12);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1, 1, 'FD');

    // Dot color
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.circle(margin + 3.5, currentY + 3.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(`${item.cat} [Total: ${item.count} tiles]`, margin + 7, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    const descWrapped = doc.splitTextToSize(item.desc, contentWidth - 8);
    doc.text(descWrapped, margin + 7, currentY + 7.5);

    currentY += 11.5;
  });

  currentY += 3;

  // Official Endorsement / Legal Certificate Box
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LEGAL REGISTRATION & INTELLECTUAL PROPERTY CERTIFICATE', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    '• Title of Work: Fun Grammar (Arabic: القواعد المرحة)',
    margin + 4,
    currentY + 11
  );
  doc.text(
    '• Creator, Author & Board Designer: Dr. Mohammed Taqi Alkhonaizi',
    margin + 4,
    currentY + 15
  );
  doc.text(
    '• Official Government Registration: Kingdom of Bahrain, Ministry of Information Registration No. 1213',
    margin + 4,
    currentY + 19
  );
  doc.text(
    '• Copyright: © 2005 Dr. Mohammed Taqi Alkhonaizi. First Edition 2005. All rights reserved worldwide.',
    margin + 4,
    currentY + 23
  );

  return doc;
}

export function downloadGameDescriptionPdf() {
  const doc = generateGameDescriptionPdf();
  doc.save('Fun-Grammar-Game-Description.pdf');
}
