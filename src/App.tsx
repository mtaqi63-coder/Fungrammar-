import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BoardCell, GameMode, PlacedTile, Player, TileData } from './types/game';
import { createNewTileBank, shuffleTiles, TILE_DEFINITIONS } from './data/tiles';
import { AUTHENTIC_2005_BOARD_PLACEMENTS } from './data/sampleBoard';
import { createEmptyBoard, validateMove, validatePlacementDirection, BOARD_SIZE } from './utils/boardLogic';
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
import { PlayedSentencesLog } from './components/PlayedSentencesLog';
import { Trophy, RefreshCw, Mail, Clock, Download, ArrowRightLeft, PlayCircle, Globe, Image as ImageIcon, ScrollText } from 'lucide-react';
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

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isRefereeOpen, setIsRefereeOpen] = useState(false);
  const [isSampleBoardOpen, setIsSampleBoardOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isManualPdfOpen, setIsManualPdfOpen] = useState(false);
  const [isMediaKitOpen, setIsMediaKitOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [wildcardTile, setWildcardTile] = useState<TileData | null>(null);

  // Board Expansion (Grid expands up to 20x20)
  const [isAutoExpandMode, setIsAutoExpandMode] = useState(true);

  // 1-Minute Player Turn Timer & Race-condition Guard
  const [turnTimeLeft, setTurnTimeLeft] = useState(60);
  const [timeAlert, setTimeAlert] = useState<string | null>(null);
  const [exchangeAlert, setExchangeAlert] = useState<string | null>(null);
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

  // Start / Reset Game
  const startNewGame = useCallback((mode: GameMode = gameMode) => {
    const newBank = createNewTileBank();

    let initialPlayers: Player[] = [];
    if (mode === 'vs_ai') {
      initialPlayers = [
        {
          id: 'p1',
          name: 'Player 1',
          nameAr: 'اللاعب 1',
          isAi: false,
          score: 0,
          rack: newBank.splice(0, 10),
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
          rack: newBank.splice(0, 10),
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
          rack: newBank.splice(0, 10),
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
    setTurnTimeLeft(60);
    setTimeAlert(null);
    sound.playShuffle();
  }, [gameMode]);

  // Initial load
  useEffect(() => {
    startNewGame(gameMode);
  }, []);

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

    // Add to temp placements
    setTempPlacements((prev) => [...prev, { row, col, tile: selectedRackTile }]);

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

  // Rule 6: Exchange selected tiles with bank
  const handleConfirmExchange = (targetTile?: TileData) => {
    if (!activePlayer || bank.length === 0) return;

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
    // 1. Explicit targetTile passed
    // 2. Or selectedRackTile
    // 3. Or selectedForExchange
    let tilesToExchange: TileData[] = [];
    if (targetTile) {
      const found = currentRack.find((t) => t.id === targetTile.id);
      if (found) tilesToExchange = [found];
    } else if (selectedRackTile) {
      const found = currentRack.find((t) => t.id === selectedRackTile.id);
      if (found) tilesToExchange = [found];
    } else if (selectedForExchange.length > 0) {
      tilesToExchange = currentRack.filter((t) => selectedForExchange.includes(t.id));
    }

    if (tilesToExchange.length === 0) {
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

    setSelectedRackTile(null);
    setIsExchangeMode(false);
    setSelectedForExchange([]);
    setConsecutivePasses(0);

    // Show brief banner alert
    setExchangeAlert(
      language === 'ar'
        ? `✓ تم تبديل "${oldWords}" وسحب "${newWords}" من البنك (${newBank.length} كلمة متبقية بالبنك)`
        : `✓ Exchanged "${oldWords}" for "${newWords}" from the bank! (${newBank.length} tiles in bank)`
    );
    setTimeout(() => {
      setExchangeAlert(null);
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
  };

  // Play Move (Submit valid sentence)
  const handlePlayMove = () => {
    if (!currentValidation?.isValid || tempPlacements.length === 0 || !activePlayer) {
      sound.playInvalid();
      return;
    }

    sound.playValidSentence();

    // Commit temp tiles to board permanently
    const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    for (const p of tempPlacements) {
      nextBoard[p.row][p.col] = {
        row: p.row,
        col: p.col,
        tile: p.tile,
        playerId: activePlayer.id,
      };
    }
    setBoard(nextBoard);

    // Refill player's rack from bank (Rule 5: "Substitute played words")
    const wordsNeeded = 10 - activePlayer.rack.length;
    const drawn = bank.slice(0, wordsNeeded);
    const remainingBank = bank.slice(wordsNeeded);
    setBank(remainingBank);

    // Update player score and sentences
    const earnedScore = currentValidation.score;
    const sentenceSummary = currentValidation.sentences.map((s) => s.text).join(' & ');
    setLastTurnSentence(sentenceSummary);

    const newFormedRecords = currentValidation.sentences.map((s, sIdx) => ({
      text: s.text,
      score: s.charCount,
      turn: activePlayer.sentencesFormed.length + sIdx + 1,
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
      !active ||
      active.isAi ||
      isAiThinking ||
      isGameOver ||
      isRulesOpen ||
      isRefereeOpen ||
      isSampleBoardOpen ||
      isDemoOpen ||
      isManualPdfOpen ||
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
    activePlayerIndex,
    players,
    isAiThinking,
    isGameOver,
    isRulesOpen,
    isRefereeOpen,
    isSampleBoardOpen,
    isDemoOpen,
    isManualPdfOpen,
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

          // Apply bot move
          const nextBoard = board.map((row) => row.map((cell) => ({ ...cell })));
          for (const p of botMove.placedTiles) {
            nextBoard[p.row][p.col] = {
              row: p.row,
              col: p.col,
              tile: p.tile,
              playerId: current.id,
            };
          }
          setBoard(nextBoard);

          // Remove played tiles from bot rack
          const placedIds = new Set(botMove.placedTiles.map((p) => p.tile.id));
          const updatedBotRack = current.rack.filter((t) => !placedIds.has(t.id));

          // Draw refill from bank
          const wordsNeeded = 10 - updatedBotRack.length;
          const drawn = bank.slice(0, wordsNeeded);
          const remainingBank = bank.slice(wordsNeeded);
          setBank(remainingBank);

          setLastTurnSentence(botMove.sentenceText);

          const botFormedRecords = botMove.sentences.map((s, sIdx) => ({
            text: s.text,
            score: s.charCount,
            turn: current.sentencesFormed.length + sIdx + 1,
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
      if (item.row < BOARD_SIZE && item.col < BOARD_SIZE) {
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
          row: item.row,
          col: item.col,
          tile,
        };
      }
    }

    setBoard(loadedBoard);
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

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${isAr ? 'rtl' : 'ltr'}`}>
      {/* Top Bar */}
      <Header
        gameMode={gameMode}
        onSelectGameMode={(mode) => {
          setGameMode(mode);
          startNewGame(mode);
        }}
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenReferee={() => setIsRefereeOpen(true)}
        onOpenSampleBoard={() => setIsSampleBoardOpen(true)}
        onOpenManualPdf={() => setIsManualPdfOpen(true)}
        onOpenMediaKit={() => setIsMediaKitOpen(true)}
        onOpenStory={() => setIsStoryOpen(true)}
        onRestartGame={() => startNewGame(gameMode)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col items-center gap-2.5">
        {/* Time Limit Alert Banner */}
        {timeAlert && (
          <div className="w-full max-w-xl px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-bounce">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{timeAlert}</span>
          </div>
        )}

        {/* Exchange Alert Banner */}
        {exchangeAlert && (
          <div className="w-full max-w-xl px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-pulse">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exchangeAlert}</span>
          </div>
        )}

        {/* Score Board with Bank Counter and Expand/Shrink Button */}
        <ScoreBoard
          players={players}
          activePlayerIndex={activePlayerIndex}
          bankCount={bank.length}
          isAiThinking={isAiThinking}
          language={language}
          isAutoExpandMode={isAutoExpandMode}
          onToggleExpand={() => setIsAutoExpandMode((prev) => !prev)}
          turnTimeLeft={activePlayer && !activePlayer.isAi ? turnTimeLeft : undefined}
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
            disabled={activePlayer.isAi || isAiThinking || isGameOver}
            language={language}
          />
        )}

        {/* Unified Single-Line Actions: Timer + Worldwide Visits + Exchange + Play */}
        <TurnActions
          onPlayMove={handlePlayMove}
          validation={currentValidation}
          hasTempTiles={tempPlacements.length > 0}
          disabled={!activePlayer || activePlayer.isAi || isAiThinking || isGameOver}
          language={language}
          turnTimeLeft={activePlayer && !activePlayer.isAi ? turnTimeLeft : undefined}
          worldwideVisits={worldwideVisits}
          onRecallAll={handleRecallAll}
          selectedTile={selectedRackTile}
          isExchangeMode={isExchangeMode}
          selectedForExchange={selectedForExchange}
          onConfirmExchange={handleConfirmExchange}
          onStartExchangeMode={() => setIsExchangeMode(true)}
          onCancelExchangeMode={() => {
            setIsExchangeMode(false);
            setSelectedForExchange([]);
          }}
          rackEmpty={!activePlayer || activePlayer.rack.length === 0}
        />

        {/* Played Sentences & Grammar Rules Log (Both Players) */}
        <PlayedSentencesLog players={players} language={language} />
      </main>

      {/* Footer with author feedback email, worldwide visits counter & Download ZIP */}
      <footer className="w-full bg-slate-900/90 border-t border-slate-800 py-3 px-4 text-center text-xs text-slate-400 mt-auto select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          {/* Email Feedback */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium">
                {isAr ? 'لإرسال الآراء والملاحظات:' : 'To send feedback or suggestions:'}
              </span>
            </div>
            <a
              href="mailto:Mtk6300@hotmail.com?subject=Fun%20Grammar%20Game%20Feedback"
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400 transition-colors flex items-center gap-1"
            >
              <span>Mtk6300@hotmail.com</span>
            </a>
          </div>

          {/* Worldwide Page Visits Counter */}
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs shadow-xs"
            title={
              isAr
                ? 'عدد مرات زيارة وتصفح اللعبة حول العالم'
                : 'Total number of times the game page is visited worldwide'
            }
          >
            <div className="relative flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-slate-400 font-medium">
              {isAr ? 'الزيارات حول العالم:' : 'Worldwide Visits:'}
            </span>
            <span className="font-mono font-extrabold text-cyan-300 tabular-nums">
              {worldwideVisits !== null ? worldwideVisits.toLocaleString() : '...'}
            </span>
          </div>

          {/* Download Game ZIP, Story & Media Kit Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setIsStoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all transform hover:scale-105 active:scale-95"
              title={isAr ? 'قراءة وتنزيل قصة اللعبة وشرحها الكامل' : 'Read & download the game story and complete explanation'}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>{isAr ? 'قصة اللعبة وشرحها' : 'Game Story & Guide'}</span>
            </button>

            <button
              onClick={() => setIsMediaKitOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all transform hover:scale-105 active:scale-95"
              title={isAr ? 'معاينة وتنزيل غلاف اللعبة وملف التعريف المتحرك GIF والصور' : 'Preview & download game cover, intro GIF, and promotional images'}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'الغلاف والصور و GIF' : 'Cover, GIF & Images'}</span>
            </button>

            <a
              href="./fun-grammar-game.zip"
              download="fun-grammar-game.zip"
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all transform hover:scale-105 active:scale-95"
              title={isAr ? 'تحميل ملف اللعبة المضغوط (ZIP) لرفعه على منصات الألعاب' : 'Download game ZIP file to upload to game platforms'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحميل ملف اللعبة (ZIP)' : 'Download Game ZIP'}</span>
            </a>
          </div>

          {/* Copyright */}
          <span className="text-slate-500 text-[11px]">
            {isAr
              ? 'ابتكار: د. محمد تقي الخنيزي (البحرين © 2005)'
              : 'Invented by Dr. Mohammed Taqi Alkhonaizi (Bahrain © 2005)'}
          </span>
        </div>
      </footer>

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

            <button
              onClick={() => startNewGame(gameMode)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isAr ? 'العب مجدداً' : 'Play Again'}</span>
            </button>
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
