import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BoardCell, GameMode, PlacedTile, Player, TileData } from './types/game';
import { createNewTileBank, shuffleTiles, TOTAL_BANK_TILES } from './data/tiles';
import { AUTHENTIC_2005_BOARD_PLACEMENTS } from './data/sampleBoard';
import {
  createEmptyBoard,
  validateMove,
  validatePlacementDirection,
  ensureBoardMargin,
  EDGE_MARGIN_TILES,
} from './utils/boardLogic';
import { copyBoardSnapshot } from './utils/boardSnapshot';
import { downloadSentenceGrammarHistoryPdf } from './utils/generateSentenceHistoryPdf';
import { sound } from './utils/audio';
import { findBestBotMove } from './utils/aiBot';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';
import { Rack } from './components/Rack';
import { TurnActions } from './components/TurnActions';
import { RulesModal } from './components/RulesModal';
import { RefereeModal } from './components/RefereeModal';
import { OriginalLayoutModal } from './components/OriginalLayoutModal';
import { WildcardModal } from './components/WildcardModal';
import { DemonstrationModal } from './components/DemonstrationModal';
import { GameManualPdfModal } from './components/GameManualPdfModal';
import { MediaKitModal } from './components/MediaKitModal';
import { StoryAndGuideModal } from './components/StoryAndGuideModal';
import { GrammarValidationRulesModal } from './components/GrammarValidationRulesModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PlayedSentencesLog } from './components/PlayedSentencesLog';
import { Trophy, RefreshCw, Clock, ArrowRightLeft, Sparkles, Copy, Check } from 'lucide-react';
import { useWorldwideVisits } from './utils/visitorCounter';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');

  // Sync browser tab title with selected language
  useEffect(() => {
    document.title = language === 'ar' ? 'Fun Grammar - القواعد المرحة' : 'Fun Grammar';
  }, [language]);

  // Worldwide Page Visits Counter (tracked globally across sessions/players)
  const worldwideVisits = useWorldwideVisits();

  // Welcome Screen & Slow Bank-to-Rack Tile Dealing Animation
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDealing, setIsDealing] = useState(false);
  const [pendingDealTotal, setPendingDealTotal] = useState(10);
  const [newlyArrivedTileId, setNewlyArrivedTileId] = useState<string | null>(null);
  const [flyingTile, setFlyingTile] = useState<{
    tile: TileData;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    landed: boolean;
  } | null>(null);
  const bankRef = useRef<HTMLDivElement | null>(null);
  const rackContainerRef = useRef<HTMLDivElement | null>(null);
  const dealSessionRef = useRef(0);
  const pendingDealTilesRef = useRef<TileData[]>([]);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isRefereeOpen, setIsRefereeOpen] = useState(false);
  const [isSampleBoardOpen, setIsSampleBoardOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isManualPdfOpen, setIsManualPdfOpen] = useState(false);
  const [isMediaKitOpen, setIsMediaKitOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isGrammarRulesOpen, setIsGrammarRulesOpen] = useState(false);
  const [wildcardTile, setWildcardTile] = useState<TileData | null>(null);

  // Board Expansion (Grid expands up to 20x20)
  const [isAutoExpandMode, setIsAutoExpandMode] = useState(true);
  const [boardCopied, setBoardCopied] = useState(false);
  const boardCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [disputeFeedback, setDisputeFeedback] = useState(false);
  const disputeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [disputedRejectedKeys, setDisputedRejectedKeys] = useState<string[]>([]);

  // 1-Minute Player Turn Timer & Race-condition Guard
  const [turnTimeLeft, setTurnTimeLeft] = useState(60);
  const [timeAlert, setTimeAlert] = useState<string | null>(null);
  const [exchangeAlert, setExchangeAlert] = useState<string | null>(null);
  const exchangeAlertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTimingOutRef = useRef(false);

  // Board
  const [board, setBoard] = useState<BoardCell[][]>(createEmptyBoard);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Bank & Players
  const [bank, setBank] = useState<TileData[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  // In-turn state
  const [tempPlacements, setTempPlacements] = useState<PlacedTile[]>([]);
  const [selectedRackTile, setSelectedRackTile] = useState<TileData | null>(null);
  const [isExchangeMode, setIsExchangeMode] = useState(false);
  const [selectedForExchange, setSelectedForExchange] = useState<string[]>([]);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastTurnSentence, setLastTurnSentence] = useState<string | null>(null);
  const [aiHighlightMove, setAiHighlightMove] = useState<{
    moveId: number;
    sentenceCoords: { row: number; col: number }[];
    placedCoords: { row: number; col: number }[];
    sentenceText: string;
  } | null>(null);

  useEffect(() => {
    if (!aiHighlightMove) return;
    const timer = setTimeout(() => {
      setAiHighlightMove(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [aiHighlightMove]);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Toggle language
  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const runSlowDealAnimation = useCallback(async (tilesToDeal: TileData[], sessionId: number) => {
    setIsDealing(true);
    setPendingDealTotal(tilesToDeal.length);
    pendingDealTilesRef.current = tilesToDeal;

    // Wait briefly so ScoreBoard & Rack DOM elements finish mounting
    await sleep(320);
    if (dealSessionRef.current !== sessionId) return;

    for (let i = 0; i < tilesToDeal.length; i++) {
      if (dealSessionRef.current !== sessionId) return;
      const tile = tilesToDeal[i];

      const bankRect = bankRef.current?.getBoundingClientRect();
      const rackRect = rackContainerRef.current?.getBoundingClientRect();

      const fromX = bankRect ? bankRect.left + bankRect.width / 2 - 28 : window.innerWidth * 0.7;
      const fromY = bankRect ? bankRect.top + bankRect.height / 2 - 28 : 96;

      let toX = window.innerWidth / 2 - 28;
      let toY = window.innerHeight - 180;
      if (rackRect) {
        const slotWidth = 62;
        const totalWidth = tilesToDeal.length * slotWidth;
        const startOffset = Math.max(12, (rackRect.width - totalWidth) / 2);
        toX = Math.min(rackRect.right - 64, rackRect.left + startOffset + i * slotWidth);
        toY = rackRect.top + (rackRect.height - 56) / 2;
      }

      setFlyingTile({ tile, fromX, fromY, toX, toY, landed: false });

      // Trigger smooth CSS glide on next paint frame
      await sleep(35);
      if (dealSessionRef.current !== sessionId) return;
      setFlyingTile((prev) => (prev ? { ...prev, landed: true } : null));

      // Wait for slow glide from Bank to Rack
      await sleep(430);
      if (dealSessionRef.current !== sessionId) return;

      sound.playTilePlace();
      setFlyingTile(null);
      setNewlyArrivedTileId(tile.id);

      setPlayers((prev) =>
        prev.map((p, idx) => {
          if (idx !== 0) return p;
          if (p.rack.some((existing) => existing.id === tile.id)) return p;
          return { ...p, rack: [...p.rack, tile] };
        })
      );

      await sleep(110);
    }

    if (dealSessionRef.current !== sessionId) return;
    setNewlyArrivedTileId(null);
    setIsDealing(false);
    pendingDealTilesRef.current = [];
  }, []);

  const handleSkipDeal = useCallback(() => {
    dealSessionRef.current += 1;
    const remaining = pendingDealTilesRef.current;
    setFlyingTile(null);
    setNewlyArrivedTileId(null);
    setIsDealing(false);
    if (remaining.length > 0) {
      setPlayers((prev) =>
        prev.map((p, idx) => {
          if (idx !== 0) return p;
          const existingIds = new Set(p.rack.map((t) => t.id));
          const missing = remaining.filter((t) => !existingIds.has(t.id));
          return { ...p, rack: [...p.rack, ...missing] };
        })
      );
      pendingDealTilesRef.current = [];
    }
  }, []);

  // Start / Reset Game
  const startNewGame = useCallback(
    (mode: GameMode = gameMode, animateDeal = false) => {
      const sessionId = ++dealSessionRef.current;
      setFlyingTile(null);
      setNewlyArrivedTileId(null);

      const newBank = createNewTileBank();
      const p1Tiles = newBank.splice(0, 10);

      let initialPlayers: Player[] = [];
      if (mode === 'vs_ai') {
        initialPlayers = [
          {
            id: 'p1',
            name: 'Player 1',
            nameAr: 'اللاعب 1',
            isAi: false,
            score: 0,
            rack: animateDeal ? [] : p1Tiles,
            avatarColor: 'blue',
            sentencesFormed: [],
          },
          {
            id: 'p2',
            name: 'Computer',
            nameAr: 'الكمبيوتر',
            isAi: true,
            score: 0,
            rack: newBank.splice(0, 10),
            avatarColor: 'brown',
            sentencesFormed: [],
          },
        ];
      } else if (mode === 'pass_and_play') {
        initialPlayers = [
          {
            id: 'p1',
            name: 'Player 1',
            nameAr: 'اللاعب 1',
            isAi: false,
            score: 0,
            rack: animateDeal ? [] : p1Tiles,
            avatarColor: 'blue',
            sentencesFormed: [],
          },
          {
            id: 'p2',
            name: 'Player 2',
            nameAr: 'اللاعب 2',
            isAi: false,
            score: 0,
            rack: newBank.splice(0, 10),
            avatarColor: 'emerald',
            sentencesFormed: [],
          },
        ];
      } else {
        // Solo Sandbox
        initialPlayers = [
          {
            id: 'p1',
            name: 'Solo Player',
            nameAr: 'اللاعب الفردي',
            isAi: false,
            score: 0,
            rack: animateDeal ? [] : p1Tiles,
            avatarColor: 'blue',
            sentencesFormed: [],
          },
        ];
      }

      setBank(newBank);
      setPlayers(initialPlayers);
      setActivePlayerIndex(0);
      setBoard(createEmptyBoard());
      setTempPlacements([]);
      setSelectedRackTile(null);
      setIsExchangeMode(false);
      setSelectedForExchange([]);
      setConsecutivePasses(0);
      setIsAiThinking(false);
      setIsGameOver(false);
      setLastTurnSentence(null);
      setAiHighlightMove(null);
      setTurnTimeLeft(60);
      setTimeAlert(null);
      if (exchangeAlertTimerRef.current) {
        clearTimeout(exchangeAlertTimerRef.current);
        exchangeAlertTimerRef.current = null;
      }
      setExchangeAlert(null);
      setDisputedRejectedKeys([]);
      setDisputeFeedback(false);
      if (disputeTimerRef.current) {
        clearTimeout(disputeTimerRef.current);
        disputeTimerRef.current = null;
      }

      if (animateDeal) {
        sound.playShuffle();
        runSlowDealAnimation(p1Tiles, sessionId);
      } else {
        setIsDealing(false);
        pendingDealTilesRef.current = [];
      }
    },
    [gameMode, runSlowDealAnimation]
  );

  // Initial load (behind Welcome Screen)
  useEffect(() => {
    startNewGame(gameMode, false);
  }, []);

  const handleStartFromWelcome = () => {
    setShowWelcome(false);
    startNewGame(gameMode, true);
  };

  const activePlayer = players[activePlayerIndex];

  // Total number of plays formed across all players
  const totalPlays = React.useMemo(() => {
    return players.reduce((sum, p) => sum + (p.sentencesFormed ? p.sentencesFormed.length : 0), 0);
  }, [players]);

  // Live Move Validation
  const currentValidation = React.useMemo(() => {
    if (tempPlacements.length === 0) return null;
    return validateMove(board, tempPlacements);
  }, [board, tempPlacements]);

  // Handle cell click (place selected rack tile onto board)
  const handleCellClick = (row: number, col: number) => {
    if (!selectedRackTile || !activePlayer || activePlayer.isAi || isAiThinking) return;

    // Validate placement direction (Rule 4: Left-to-Right or Top-to-Bottom)
    const check = validatePlacementDirection(tempPlacements, row, col);
    if (!check.allowed) {
      sound.playInvalid();
      return;
    }

    sound.playTilePlace();
    setAiHighlightMove(null);

    // Add to temp placements & auto-expand board edges to preserve >= 3 empty tiles on every side
    const nextTemp = [...tempPlacements, { row, col, tile: selectedRackTile }];
    const expanded = ensureBoardMargin(board, nextTemp, EDGE_MARGIN_TILES);
    if (expanded.shifted) {
      setBoard(expanded.board);
      setTempPlacements(expanded.tempPlacements);
    } else {
      setTempPlacements(nextTemp);
    }

    // Remove from active player's rack
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePlayerIndex) return p;
        return {
          ...p,
          rack: p.rack.filter((t) => t.id !== selectedRackTile.id),
        };
      })
    );

    setSelectedRackTile(null);
  };

  // Handle recall of a temp tile back to rack
  const handleRecallTempTile = (row: number, col: number) => {
    if (!activePlayer || activePlayer.isAi || isAiThinking) return;

    setSelectedRackTile(null);

    setTempPlacements((currentTemp) => {
      const recalledIndex = currentTemp.findIndex((p) => p.row === row && p.col === col);
      if (recalledIndex === -1) return currentTemp;

      sound.playTilePick();

      // Recall clicked tile and any subsequent tiles to preserve placement sequence
      const recalledTiles = currentTemp.slice(recalledIndex).map((p) => p.tile);
      const remainingTemp = currentTemp.slice(0, recalledIndex);

      setPlayers((prev) =>
        prev.map((p, idx) => {
          if (idx !== activePlayerIndex) return p;
          const existingIds = new Set(p.rack.map((t) => t.id));
          const uniqueToAdd = recalledTiles.filter((t) => !existingIds.has(t.id));
          return {
            ...p,
            rack: [...p.rack, ...uniqueToAdd],
          };
        })
      );

      return remainingTemp;
    });
  };

  // Recall all placed tiles (safe & deduplicated)
  const handleRecallAll = () => {
    setSelectedRackTile(null);
    setIsExchangeMode(false);
    setSelectedForExchange([]);

    setTempPlacements((currentTemp) => {
      if (currentTemp.length === 0) return currentTemp;
      sound.playShuffle();

      const returnedTiles = currentTemp.map((p) => p.tile);

      setPlayers((prev) =>
        prev.map((p, idx) => {
          if (idx !== activePlayerIndex) return p;
          const existingIds = new Set(p.rack.map((t) => t.id));
          const uniqueToAdd = returnedTiles.filter((t) => !existingIds.has(t.id));
          return {
            ...p,
            rack: [...p.rack, ...uniqueToAdd],
          };
        })
      );

      return [];
    });
  };

  // Shuffle active player's rack
  const handleShuffleRack = () => {
    if (!activePlayer) return;
    sound.playShuffle();
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePlayerIndex) return p;
        return {
          ...p,
          rack: shuffleTiles(p.rack),
        };
      })
    );
  };

  // Rule 6: Exchange selected tiles with bank and pass turn
  const handleConfirmExchange = (targetTile?: TileData) => {
    if (!activePlayer || activePlayer.isAi || isAiThinking || isGameOver || bank.length === 0) return;

    // Guard against React SyntheticEvent being accidentally passed via onClick={handleConfirmExchange}
    const validTargetTile =
      targetTile &&
      typeof targetTile === 'object' &&
      'id' in targetTile &&
      'word' in targetTile &&
      typeof targetTile.id === 'string' &&
      typeof targetTile.word === 'string'
        ? targetTile
        : undefined;

    // Safety: recall any placed temp tiles on the board first
    let currentRack = [...activePlayer.rack];
    if (tempPlacements.length > 0) {
      const recalled = tempPlacements.map((p) => p.tile);
      const existingIds = new Set(currentRack.map((t) => t.id));
      const unique = recalled.filter((t) => !existingIds.has(t.id));
      currentRack = [...currentRack, ...unique];
      setTempPlacements([]);
    }

    // Determine tiles to exchange:
    // 1. Explicit validTargetTile passed
    // 2. Or selectedRackTile
    // 3. Or selectedForExchange
    let tilesToExchange: TileData[] = [];
    if (validTargetTile) {
      const found = currentRack.find((t) => t.id === validTargetTile.id);
      if (found) tilesToExchange = [found];
    } else if (selectedRackTile) {
      const found = currentRack.find((t) => t.id === selectedRackTile.id);
      if (found) tilesToExchange = [found];
    } else if (selectedForExchange.length > 0) {
      tilesToExchange = currentRack.filter((t) => selectedForExchange.includes(t.id));
    }

    if (tilesToExchange.length === 0) {
      setSelectedRackTile(null);
      setIsExchangeMode(true);
      return;
    }

    sound.playShuffle();

    const countToExchange = Math.min(tilesToExchange.length, bank.length);
    const returnedTiles = tilesToExchange.slice(0, countToExchange);
    const returnedIds = new Set(returnedTiles.map((t) => t.id));
    const remainingRack = currentRack.filter((t) => !returnedIds.has(t.id));

    // Draw from bank
    const drawnTiles = bank.slice(0, countToExchange);
    const newBank = shuffleTiles([...bank.slice(countToExchange), ...returnedTiles]);

    setBank(newBank);
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePlayerIndex) return p;
        return {
          ...p,
          rack: [...remainingRack, ...drawnTiles],
        };
      })
    );

    const oldWords = returnedTiles.map((t) => t.word).join(', ');
    const newWords = drawnTiles.map((t) => t.word).join(', ');
    const nextPlayer = players.length > 1 ? players[(activePlayerIndex + 1) % players.length] : null;

    setSelectedRackTile(null);
    setIsExchangeMode(false);
    setSelectedForExchange([]);
    setConsecutivePasses(0);

    // Show brief banner alert confirming exchange + turn pass (Rule 6)
    if (exchangeAlertTimerRef.current) {
      clearTimeout(exchangeAlertTimerRef.current);
    }
    setExchangeAlert(
      nextPlayer
        ? language === 'ar'
          ? `✓ قام ${activePlayer.nameAr} بتبديل "${oldWords}" وسحب "${newWords}" — تم تمرير الدور إلى ${nextPlayer.nameAr}! (${newBank.length} كلمة بالبنك)`
          : `✓ ${activePlayer.name} exchanged "${oldWords}" for "${newWords}" — turn passed to ${nextPlayer.name}! (${newBank.length} tiles in bank)`
        : language === 'ar'
        ? `✓ تم تبديل "${oldWords}" وسحب "${newWords}" من البنك (${newBank.length} كلمة متبقية بالبنك)`
        : `✓ Exchanged "${oldWords}" for "${newWords}" from the bank! (${newBank.length} tiles in bank)`
    );
    exchangeAlertTimerRef.current = setTimeout(() => {
      setExchangeAlert(null);
      exchangeAlertTimerRef.current = null;
    }, 4500);

    // Rule 6: Turn is bypassed to next player
    advanceTurn();
  };

  // Wildcard name assignment
  const handleConfirmWildcardName = (tileId: string, customName: string) => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        rack: p.rack.map((t) => (t.id === tileId ? { ...t, customName, displayWord: customName } : t)),
      }))
    );
    setSelectedRackTile((prev) =>
      prev && prev.id === tileId ? { ...prev, customName, displayWord: customName } : prev
    );
    setTempPlacements((prev) =>
      prev.map((p) =>
        p.tile.id === tileId ? { ...p, tile: { ...p.tile, customName, displayWord: customName } } : p
      )
    );
  };

  // Play Move (Submit valid sentence)
  const handlePlayMove = () => {
    if (!currentValidation?.isValid || tempPlacements.length === 0 || !activePlayer) {
      sound.playInvalid();
      return;
    }

    sound.playValidSentence();

    // Commit temp tiles to board permanently & ensure >= 3 empty cells on every side
    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    for (const p of tempPlacements) {
      nextBoard[p.row][p.col] = {
        row: p.row,
        col: p.col,
        tile: p.tile,
        playerId: activePlayer.id,
      };
    }
    const expandedBoard = ensureBoardMargin(nextBoard, [], EDGE_MARGIN_TILES);
    setBoard(expandedBoard.board);

    // Refill player's rack from bank (Rule 5: "Substitute played words")
    const wordsNeeded = 10 - activePlayer.rack.length;
    const drawn = bank.slice(0, wordsNeeded);
    const remainingBank = bank.slice(wordsNeeded);
    setBank(remainingBank);

    // Update player score and sentences
    const earnedScore = currentValidation.score;
    const sentenceSummary = currentValidation.sentences.map((s) => s.text).join(' & ');
    setLastTurnSentence(sentenceSummary);

    const totalRecordedPlays = players.reduce(
      (sum, pl) => sum + pl.sentencesFormed.length,
      0
    );
    const acceptedCount = activePlayer.sentencesFormed.filter(
      (s) => s.disputeType !== 'rejected_player_move'
    ).length;
    const newFormedRecords = currentValidation.sentences.map((s, sIdx) => ({
      text: s.text,
      score: s.charCount,
      turn: acceptedCount + sIdx + 1,
      playOrder: totalRecordedPlays + sIdx + 1,
      ruleName: s.ruleName,
      ruleExplanation: s.ruleExplanation,
      direction: s.direction,
      playerId: activePlayer.id,
    }));

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePlayerIndex) return p;
        return {
          ...p,
          score: p.score + earnedScore,
          rack: [...p.rack, ...drawn],
          sentencesFormed: [
            ...p.sentencesFormed,
            ...newFormedRecords,
          ],
        };
      })
    );

    setTempPlacements([]);
    setConsecutivePasses(0);

    // Check game over condition (Rule 12: bank empty and player used all tiles)
    if (remainingBank.length === 0 && activePlayer.rack.length === 0) {
      handleGameOver();
      return;
    }

    advanceTurn();
  };

  // Pass Turn (Rule 12)
  const handlePassTurn = () => {
    handleRecallAll();
    sound.playTilePick();

    const nextPasses = consecutivePasses + 1;
    setConsecutivePasses(nextPasses);

    // If all players pass consecutively, game ends
    if (nextPasses >= players.length * 2) {
      handleGameOver();
      return;
    }

    advanceTurn();
  };

  // Advance to next player
  const advanceTurn = useCallback(() => {
    setSelectedRackTile(null);
    setIsExchangeMode(false);
    setSelectedForExchange([]);
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
    setTurnTimeLeft(60);
  }, [players.length]);

  // Game over celebration
  const handleGameOver = () => {
    setIsGameOver(true);
    sound.playWin();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  // 1-minute player turn expiration handler (guaranteed atomic, no duplication)
  const handleTimeExpired = useCallback(() => {
    if (isTimingOutRef.current) return;
    isTimingOutRef.current = true;

    sound.playInvalid();

    // 1. Reset selection and exchange modes
    setSelectedRackTile(null);
    setIsExchangeMode(false);
    setSelectedForExchange([]);

    // 2. Safely return all uncommitted board tiles to active player rack (strictly deduplicated)
    setTempPlacements((currentTemp) => {
      if (currentTemp.length > 0) {
        sound.playShuffle();
        const returnedTiles = currentTemp.map((p) => p.tile);

        setPlayers((prev) =>
          prev.map((p, idx) => {
            if (idx !== activePlayerIndex) return p;
            const existingIds = new Set(p.rack.map((t) => t.id));
            const uniqueToAdd = returnedTiles.filter((t) => !existingIds.has(t.id));
            return {
              ...p,
              rack: [...p.rack, ...uniqueToAdd],
            };
          })
        );
      }
      return [];
    });

    // 3. User feedback notification
    setTimeAlert(
      language === 'ar'
        ? 'انتهت مهلة الدقيقة الواحدة! تم تمرير الدور تلقائياً.'
        : '1-minute turn limit expired! Turn passed to next player.'
    );
    setTimeout(() => {
      setTimeAlert(null);
    }, 4500);

    // 4. Consecutive passes check and advance turn
    setConsecutivePasses((prevPasses) => {
      const nextPasses = prevPasses + 1;
      if (nextPasses >= players.length * 2) {
        handleGameOver();
      }
      return nextPasses;
    });

    setActivePlayerIndex((prev) => (prev + 1) % players.length);
    setTurnTimeLeft(60);

    setTimeout(() => {
      isTimingOutRef.current = false;
    }, 600);
  }, [activePlayerIndex, language, players.length]);

  // Turn Countdown Timer (1-minute limit for human player)
  useEffect(() => {
    const active = players[activePlayerIndex];
    if (
      showWelcome ||
      isDealing ||
      !active ||
      active.isAi ||
      isAiThinking ||
      isGameOver ||
      isRulesOpen ||
      isRefereeOpen ||
      isSampleBoardOpen ||
      isDemoOpen ||
      isManualPdfOpen ||
      isMediaKitOpen ||
      isStoryOpen ||
      wildcardTile
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    showWelcome,
    isDealing,
    activePlayerIndex,
    players,
    isAiThinking,
    isGameOver,
    isRulesOpen,
    isRefereeOpen,
    isSampleBoardOpen,
    isDemoOpen,
    isManualPdfOpen,
    isMediaKitOpen,
    isStoryOpen,
    wildcardTile,
    handleTimeExpired,
  ]);

  // AI Turn Trigger
  useEffect(() => {
    if (isGameOver || players.length === 0) return;
    const current = players[activePlayerIndex];
    if (current && current.isAi) {
      setIsAiThinking(true);

      const timer = setTimeout(() => {
        const botMove = findBestBotMove(board, current.rack, 'medium');

        if (botMove) {
          sound.playValidSentence();

          // Apply bot move & ensure >= 3 empty cells on every side
          const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
          for (const p of botMove.placedTiles) {
            nextBoard[p.row][p.col] = {
              row: p.row,
              col: p.col,
              tile: p.tile,
              playerId: current.id,
            };
          }
          const expandedBoard = ensureBoardMargin(nextBoard, botMove.placedTiles, EDGE_MARGIN_TILES);
          setBoard(expandedBoard.board);

          // Highlight & focus the full computer-formed sentence(s) on the expanded board
          const seenCoords = new Set<string>();
          const sentenceCoords: { row: number; col: number }[] = [];
          for (const s of botMove.sentences) {
            for (const t of s.tiles) {
              const row = t.row + expandedBoard.padTop;
              const col = t.col + expandedBoard.padLeft;
              const key = `${row},${col}`;
              if (!seenCoords.has(key)) {
                seenCoords.add(key);
                sentenceCoords.push({ row, col });
              }
            }
          }
          const placedCoords = expandedBoard.tempPlacements.map((p) => ({
            row: p.row,
            col: p.col,
          }));
          setAiHighlightMove({
            moveId: Date.now(),
            sentenceCoords,
            placedCoords,
            sentenceText: botMove.sentenceText,
          });

          // Remove played tiles from bot rack
          const placedIds = new Set(botMove.placedTiles.map((p) => p.tile.id));
          const updatedBotRack = current.rack.filter((t) => !placedIds.has(t.id));

          // Draw refill from bank
          const wordsNeeded = 10 - updatedBotRack.length;
          const drawn = bank.slice(0, wordsNeeded);
          const remainingBank = bank.slice(wordsNeeded);
          setBank(remainingBank);

          setLastTurnSentence(botMove.sentenceText);

          const totalRecordedPlays = players.reduce(
            (sum, pl) => sum + pl.sentencesFormed.length,
            0
          );
          const botFormedRecords = botMove.sentences.map((s, sIdx) => ({
            text: s.text,
            score: s.charCount,
            turn: current.sentencesFormed.length + sIdx + 1,
            playOrder: totalRecordedPlays + sIdx + 1,
            ruleName: s.ruleName,
            ruleExplanation: s.ruleExplanation,
            direction: s.direction,
            playerId: current.id,
          }));

          setPlayers((prev) =>
            prev.map((p, idx) => {
              if (idx !== activePlayerIndex) return p;
              return {
                ...p,
                score: p.score + botMove.score,
                rack: [...updatedBotRack, ...drawn],
                sentencesFormed: [
                  ...p.sentencesFormed,
                  ...botFormedRecords,
                ],
              };
            })
          );
          setConsecutivePasses(0);
        } else {
          // Bot cannot find a move: Try exchanging 3 tiles (Rule 6) or pass
          if (bank.length >= 3 && current.rack.length >= 3) {
            sound.playShuffle();
            const tilesToExchange = current.rack.slice(0, 3);
            const remainingRack = current.rack.slice(3);
            const drawn = bank.slice(0, 3);
            const newBank = [...bank.slice(3), ...tilesToExchange];
            setBank(shuffleTiles(newBank));
            setPlayers((prev) =>
              prev.map((p, idx) => {
                if (idx !== activePlayerIndex) return p;
                return { ...p, rack: [...remainingRack, ...drawn] };
              })
            );
          } else {
            setConsecutivePasses((p) => p + 1);
          }
        }

        setIsAiThinking(false);
        advanceTurn();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activePlayerIndex, isGameOver, players, board, bank]);

  // Load Authentic 2005 Board
  const handleLoadOfficialLayout = () => {
    const loadedBoard = createEmptyBoard();
    let tileSeq = 9000;

    for (const item of AUTHENTIC_2005_BOARD_PLACEMENTS) {
      if (item.row < loadedBoard.length && item.col < (loadedBoard[0]?.length ?? 0)) {
        const charLen = item.customName ? item.customName.length : item.word.replace(/\s+/g, '').length;
        const tile: TileData = {
          id: `sample_${tileSeq++}`,
          word: item.word,
          displayWord: item.customName || item.word,
          category: 'noun',
          charCount: item.word === '.' ? 0 : charLen,
          isWildcard: item.word.startsWith('N'),
          customName: item.customName,
        };
        loadedBoard[item.row][item.col] = {
          ...loadedBoard[item.row][item.col],
          row: item.row,
          col: item.col,
          tile,
        };
      }
    }

    const expanded = ensureBoardMargin(loadedBoard, [], EDGE_MARGIN_TILES);
    setBoard(expanded.board);
    setTempPlacements([]);
    sound.playWin();
  };

  // Robust ZIP file downloader enforcing binary application/zip type
  const handleDownloadZip = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('./fun-grammar-game.zip');
      const blob = await response.blob();
      const zipBlob = new Blob([blob], { type: 'application/zip' });
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'fun-grammar-game.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1500);
    } catch (err) {
      const link = document.createElement('a');
      link.href = './fun-grammar-game.zip';
      link.download = 'fun-grammar-game.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isAr = language === 'ar';
  const displayedBankCount = isDealing
    ? bank.length + Math.max(0, pendingDealTotal - (players[0]?.rack.length ?? 0))
    : bank.length;

  const handleCopyBoard = async () => {
    sound.playTilePick();
    const res = await copyBoardSnapshot({
      board,
      tempPlacements,
      players,
      bankCount: displayedBankCount,
      totalBankTiles: TOTAL_BANK_TILES,
      isAutoExpandMode,
      language,
    });
    const pdfDownloaded = await downloadSentenceGrammarHistoryPdf({
      players,
      bankCount: displayedBankCount,
      totalBankTiles: TOTAL_BANK_TILES,
      gameMode,
      language,
      board,
      tempPlacements,
      isAutoExpandMode,
      boardCanvas: res.canvas,
      dateStamp: res.dateStamp,
    });
    if (res.copiedToClipboard || pdfDownloaded) {
      if (boardCopiedTimerRef.current) {
        clearTimeout(boardCopiedTimerRef.current);
      }
      setBoardCopied(true);
      boardCopiedTimerRef.current = setTimeout(() => {
        setBoardCopied(false);
        boardCopiedTimerRef.current = null;
      }, 2500);
    }
  };

  // Dispute state & handler:
  // 1) Marks a player-formed statement rejected by the computer as disputed
  // 2) Or marks the latest sentence played by the computer as disputed for later review
  const hasAttemptedStatement =
    tempPlacements.length >= 2 || (currentValidation?.sentences?.length ?? 0) > 0;
  const currentRejectedKey =
    hasAttemptedStatement && currentValidation && !currentValidation.isValid
      ? tempPlacements
          .map((p) => `${p.row},${p.col}:${p.tile.id}:${p.tile.customName || ''}`)
          .join('|')
      : null;

  const canDisputeRejectedPlayerMove =
    Boolean(currentRejectedKey) &&
    Boolean(activePlayer && !activePlayer.isAi) &&
    !disputedRejectedKeys.includes(currentRejectedKey!);

  const aiPlayer = players.find((p) => p.isAi);
  const lastAiSentence =
    aiPlayer && aiPlayer.sentencesFormed.length > 0
      ? aiPlayer.sentencesFormed[aiPlayer.sentencesFormed.length - 1]
      : null;
  const canDisputeLastAiSentence =
    !currentRejectedKey && Boolean(lastAiSentence && !lastAiSentence.isDisputed);

  const canDispute = canDisputeRejectedPlayerMove || canDisputeLastAiSentence;

  const disputeTitle = canDisputeRejectedPlayerMove
    ? isAr
      ? 'تسجيل جملتك المرفوضة كمحل اعتراض للمراجعة في سجل التاريخ وملف PDF'
      : 'Mark your rejected statement as disputed in the sentence history for later review'
    : canDisputeLastAiSentence
    ? isAr
      ? `الاعتراض على آخر جملة لعبها الكمبيوتر: "${lastAiSentence?.text}"`
      : `Mark last computer sentence "${lastAiSentence?.text}" as disputed for later review`
    : isAr
    ? 'الاعتراض على آخر جملة للكمبيوتر أو جملة مرفوضة'
    : 'Dispute last computer sentence or a rejected player statement';

  const handleDispute = () => {
    if (!canDispute) return;
    sound.playTilePick();

    if (canDisputeRejectedPlayerMove && activePlayer && currentValidation && currentRejectedKey) {
      const attemptedText =
        currentValidation.sentences.length > 0
          ? currentValidation.sentences.map((s) => s.text).join(' & ')
          : tempPlacements
              .map((p) => (p.tile.isWildcard && p.tile.customName ? p.tile.customName : p.tile.word))
              .join(' ');

      const inferredDir: 'horizontal' | 'vertical' =
        currentValidation.sentences[0]?.direction ||
        (tempPlacements.length >= 2 && tempPlacements[0].col === tempPlacements[1].col
          ? 'vertical'
          : 'horizontal');

      const totalRecordedPlays = players.reduce(
        (sum, pl) => sum + pl.sentencesFormed.length,
        0
      );
      const acceptedCount = activePlayer.sentencesFormed.filter(
        (s) => s.disputeType !== 'rejected_player_move'
      ).length;

      const rejectionMsg =
        currentValidation.errorMessage || 'Statement rejected by computer validation';

      setPlayers((prev) =>
        prev.map((p, idx) => {
          if (idx !== activePlayerIndex) return p;
          return {
            ...p,
            sentencesFormed: [
              ...p.sentencesFormed,
              {
                text: attemptedText,
                score: 0,
                turn: acceptedCount + 1,
                playOrder: totalRecordedPlays + 1,
                direction: inferredDir,
                playerId: activePlayer.id,
                isDisputed: true,
                disputeType: 'rejected_player_move',
                disputeReason: rejectionMsg,
                ruleName: isAr
                  ? 'جملة مرفوضة — محل اعتراض للمراجعة'
                  : 'Rejected Statement — Disputed for Review',
                ruleExplanation: `Rejected by Computer: ${rejectionMsg} (Marked as disputed by player for later review).`,
              },
            ],
          };
        })
      );
      setDisputedRejectedKeys((prev) => [...prev, currentRejectedKey]);
    } else if (canDisputeLastAiSentence && aiPlayer) {
      setPlayers((prev) =>
        prev.map((p) => {
          if (!p.isAi || p.sentencesFormed.length === 0) return p;
          const lastIdx = p.sentencesFormed.length - 1;
          return {
            ...p,
            sentencesFormed: p.sentencesFormed.map((rec, idx) =>
              idx === lastIdx
                ? {
                    ...rec,
                    isDisputed: true,
                    disputeType: 'disputed_ai_move',
                    disputeReason: 'Last computer sentence marked as disputed by player for later review.',
                  }
                : rec
            ),
          };
        })
      );
    }

    if (disputeTimerRef.current) {
      clearTimeout(disputeTimerRef.current);
    }
    setDisputeFeedback(true);
    disputeTimerRef.current = setTimeout(() => {
      setDisputeFeedback(false);
      disputeTimerRef.current = null;
    }, 2500);
  };

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen
          language={language}
          onToggleLanguage={handleToggleLanguage}
          gameMode={gameMode}
          onSelectGameMode={(mode) => setGameMode(mode)}
          onStartGame={handleStartFromWelcome}
          onOpenGrammarRules={() => setIsGrammarRulesOpen(true)}
          onOpenStory={() => setIsStoryOpen(true)}
          onOpenMediaKit={() => setIsMediaKitOpen(true)}
          onDownloadZip={handleDownloadZip}
          worldwideVisits={worldwideVisits}
        />

        <GrammarValidationRulesModal
          isOpen={isGrammarRulesOpen}
          onClose={() => setIsGrammarRulesOpen(false)}
          language={language}
        />

        <MediaKitModal
          isOpen={isMediaKitOpen}
          onClose={() => setIsMediaKitOpen(false)}
          language={language}
        />

        <StoryAndGuideModal
          isOpen={isStoryOpen}
          onClose={() => setIsStoryOpen(false)}
          language={language}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${isAr ? 'rtl' : 'ltr'}`}>
      {/* Top Bar */}
      <Header
        gameMode={gameMode}
        onSelectGameMode={(mode) => {
          setGameMode(mode);
          startNewGame(mode, true);
        }}
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenReferee={() => setIsRefereeOpen(true)}
        onOpenSampleBoard={() => setIsSampleBoardOpen(true)}
        onOpenManualPdf={() => setIsManualPdfOpen(true)}
        onOpenMediaKit={() => setIsMediaKitOpen(true)}
        onOpenStory={() => setIsStoryOpen(true)}
        onRestartGame={() => startNewGame(gameMode, true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Flying Tile Overlay (Slow Bank -> Rack Transfer) */}
      {flyingTile && (
        <div
          className="fixed top-0 left-0 z-50 pointer-events-none"
          style={{
            transform: flyingTile.landed
              ? `translate3d(${flyingTile.toX}px, ${flyingTile.toY}px, 0) scale(1)`
              : `translate3d(${flyingTile.fromX}px, ${flyingTile.fromY}px, 0) scale(1.18)`,
            transition: 'transform 410ms cubic-bezier(0.22, 1, 0.36, 1), opacity 410ms ease',
          }}
        >
          <div className="relative w-14 h-14 rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-cyan-300 text-white shadow-2xl ring-4 ring-cyan-400/50 flex flex-col items-center justify-center p-1">
            <span
              className={`font-bold text-center leading-tight px-0.5 whitespace-nowrap ${
                flyingTile.tile.word.length >= 9
                  ? 'text-[8.5px] tracking-tighter'
                  : flyingTile.tile.word.length > 7
                  ? 'text-[9.5px] tracking-tighter'
                  : flyingTile.tile.word.length > 4
                  ? 'text-xs'
                  : 'text-sm'
              }`}
            >
              {flyingTile.tile.displayWord}
            </span>
            {flyingTile.tile.isWildcard && (
              <span className="absolute top-0.5 left-0.5 text-[8px] font-mono text-amber-300 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            )}
            <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-cyan-200">
              {flyingTile.tile.charCount}
            </span>
          </div>
        </div>
      )}

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-1.5 py-1 sm:px-3 sm:py-1.5 flex flex-col items-center gap-1 sm:gap-1.5">
        {/* Time Limit Alert Banner */}
        {timeAlert && (
          <div className="w-full max-w-xl px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-bounce">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{timeAlert}</span>
          </div>
        )}

        {/* Exchange Alert Banner */}
        {exchangeAlert && (
          <div className="w-full max-w-xl px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-pulse">
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{exchangeAlert}</span>
          </div>
        )}

        {/* Score Board with Bank Counter and Expand/Shrink + Copy Board Buttons */}
        <ScoreBoard
          players={players}
          activePlayerIndex={activePlayerIndex}
          bankCount={displayedBankCount}
          isAiThinking={isAiThinking}
          language={language}
          isAutoExpandMode={isAutoExpandMode}
          onToggleExpand={() => setIsAutoExpandMode((prev) => !prev)}
          onCopyBoard={handleCopyBoard}
          boardCopied={boardCopied}
          turnTimeLeft={activePlayer && !activePlayer.isAi ? turnTimeLeft : undefined}
          bankRef={bankRef}
          isDealing={isDealing}
        />

        {/* Board Viewport */}
        <Board
          board={board}
          tempPlacements={tempPlacements}
          selectedRackTile={selectedRackTile}
          onCellClick={handleCellClick}
          onRecallTempTile={handleRecallTempTile}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          language={language}
          players={players}
          isAutoExpandMode={isAutoExpandMode}
          aiHighlightMove={aiHighlightMove}
        />

        {/* Player Tile Rack (Your 10-Word Rack) */}
        {activePlayer && (
          <Rack
            rack={activePlayer.rack}
            selectedTile={selectedRackTile}
            onSelectTile={(tile) => {
              if (selectedRackTile?.id === tile.id) {
                setSelectedRackTile(null);
                sound.playTilePick();
              } else {
                setSelectedRackTile(tile);
                sound.playTilePick();
              }
            }}
            onRecallAll={handleRecallAll}
            hasTempTiles={tempPlacements.length > 0}
            isExchangeMode={isExchangeMode}
            selectedForExchange={selectedForExchange}
            onToggleExchangeTile={(tileId) => {
              setSelectedForExchange((prev) =>
                prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
              );
            }}
            onStartExchangeMode={() => {
              setIsExchangeMode(true);
            }}
            onCancelExchangeMode={() => {
              setIsExchangeMode(false);
              setSelectedForExchange([]);
            }}
            onConfirmExchange={handleConfirmExchange}
            onOpenWildcardModal={(tile) => setWildcardTile(tile)}
            disabled={activePlayer.isAi || isAiThinking || isGameOver || isDealing}
            language={language}
            rackContainerRef={rackContainerRef}
            isDealing={isDealing}
            dealingTotal={pendingDealTotal}
            newlyArrivedTileId={newlyArrivedTileId}
            onSkipDeal={handleSkipDeal}
          />
        )}

        {/* Unified Single-Line Actions: Timer + Exchange + Dispute + Play */}
        <TurnActions
          onPlayMove={handlePlayMove}
          validation={currentValidation}
          hasTempTiles={tempPlacements.length > 0}
          disabled={!activePlayer || activePlayer.isAi || isAiThinking || isGameOver || isDealing}
          language={language}
          turnTimeLeft={activePlayer && !activePlayer.isAi ? turnTimeLeft : undefined}
          onRecallAll={handleRecallAll}
          selectedTile={selectedRackTile}
          isExchangeMode={isExchangeMode}
          selectedForExchange={selectedForExchange}
          onConfirmExchange={handleConfirmExchange}
          onStartExchangeMode={() => {
            setSelectedRackTile(null);
            setIsExchangeMode(true);
          }}
          onCancelExchangeMode={() => {
            setIsExchangeMode(false);
            setSelectedForExchange([]);
          }}
          rackEmpty={!activePlayer || activePlayer.rack.length === 0}
          bankEmpty={bank.length === 0}
          onDispute={handleDispute}
          canDispute={canDispute}
          disputeTitle={disputeTitle}
          disputeFeedback={disputeFeedback}
        />

        {/* Played Sentences & Grammar Rules Log (Both Players) */}
        <PlayedSentencesLog players={players} language={language} />
      </main>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              {isAr ? 'انتهت اللعبة! (القاعدة 12)' : 'Game Finished! (Rule 12)'}
            </h3>

            <p className="text-xs text-slate-300">
              {isAr
                ? 'الفائز هو صاحب أكبر مجموع نقاط لجميع الجمل المتكونة (القاعدة 13)'
                : 'Rule 13: Sum all scores for each player. The winner is the player having the highest sum.'}
            </p>

            <div className="space-y-2 py-2">
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p, rank) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold ${
                      rank === 0
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">#{rank + 1}</span>
                      <span>{isAr ? p.nameAr : p.name}</span>
                      {rank === 0 && <span className="text-xs text-amber-400">🏆 Winner</span>}
                    </div>
                    <span className="font-mono font-bold text-base">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleCopyBoard}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border cursor-pointer ${
                  boardCopied
                    ? 'bg-emerald-800/80 border-emerald-400 text-emerald-100'
                    : 'bg-slate-800 hover:bg-slate-700 border-cyan-500/60 text-cyan-200'
                }`}
                title={
                  isAr
                    ? 'حفظ ملف PDF يحتوي على صورة اللوحة وسجل تطابق الجمل والقواعد النحوية'
                    : 'Save PDF containing the board picture & sentence-grammar rules history'
                }
              >
                {boardCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>
                  {boardCopied
                    ? isAr
                      ? 'تم حفظ PDF!'
                      : 'Saved PDF!'
                    : isAr
                    ? 'نسخ اللوحة'
                    : 'Copy Board'}
                </span>
              </button>

              <button
                onClick={() => startNewGame(gameMode, true)}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isAr ? 'العب مجدداً' : 'Play Again'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules and Photos Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={language}
      />

      {/* Rule 7 Referee Modal */}
      <RefereeModal
        isOpen={isRefereeOpen}
        onClose={() => setIsRefereeOpen(false)}
        pendingSentence={lastTurnSentence || undefined}
        language={language}
      />

      {/* Official 2005 Layout Modal */}
      <OriginalLayoutModal
        isOpen={isSampleBoardOpen}
        onClose={() => setIsSampleBoardOpen(false)}
        onLoadLayout={handleLoadOfficialLayout}
        language={language}
      />

      {/* Wildcard Tile N3-N6 Modal */}
      <WildcardModal
        tile={wildcardTile}
        isOpen={!!wildcardTile}
        onClose={() => setWildcardTile(null)}
        onConfirmName={handleConfirmWildcardName}
        language={language}
      />

      {/* Demonstration Animation Modal */}
      <DemonstrationModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        language={language}
      />

      {/* Official Game Description & PDF Manual Modal */}
      <GameManualPdfModal
        isOpen={isManualPdfOpen}
        onClose={() => setIsManualPdfOpen(false)}
        language={language}
      />

      {/* Game Cover, Animated GIF & Promotional Images Gallery Modal */}
      <MediaKitModal
        isOpen={isMediaKitOpen}
        onClose={() => setIsMediaKitOpen(false)}
        language={language}
      />

      {/* Game Story & Complete Explanation Modal (Downloadable) */}
      <StoryAndGuideModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        language={language}
      />
    </div>
  );
}
