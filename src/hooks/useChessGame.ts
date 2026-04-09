import { useState, useCallback, useRef, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";
import { useGameStore } from "@/store/gameStore";
import { useTimer } from "./useTimer";
import { useStockfish } from "./useStockfish";
import {
  getGameOverReason,
  getCapturedPieces,
  getLegalMovesForSquare,
  isPromotion,
} from "@/lib/chess-utils";
import {
  playMoveSound,
  playCaptureSound,
  playIllegalMoveSound,
  playCheckSound,
  playGameOverSound,
} from "@/lib/sounds";

function cloneGame(game: Chess): Chess {
  const clone = new Chess();
  const pgn = game.pgn();
  if (pgn) {
    clone.loadPgn(pgn);
  }
  return clone;
}

export function useChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  ]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(
    null,
  );
  const [viewingMoveIndex, setViewingMoveIndex] = useState<number>(-1);
  const [waitingForEngine, setWaitingForEngine] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;

  const store = useGameStore();
  const {
    setup,
    setBoardOrientation,
    setIsPlaying,
    setShowGameOverModal,
    setGameOverInfo,
  } = store;

  const handleTimeout = useCallback(
    (color: "w" | "b") => {
      const winner = color === "w" ? setup.player2Name : setup.player1Name;
      setGameOverInfo({ reason: "timeout", winner });
      setShowGameOverModal(true);
      setIsPlaying(false);
      playGameOverSound();
    },
    [
      setup.player1Name,
      setup.player2Name,
      setGameOverInfo,
      setShowGameOverModal,
      setIsPlaying,
    ],
  );

  const timer = useTimer(
    setup.timeControl?.time ?? null,
    setup.timeControl?.increment ?? 0,
    handleTimeout,
  );

  const {
    isThinking,
    getBestMove,
    isReady: engineReady,
  } = useStockfish(setup.engineLevel);

  const checkGameOver = useCallback(
    (g: Chess) => {
      const reason = getGameOverReason(g);
      if (reason) {
        let winner: string | null = null;
        if (reason === "checkmate") {
          winner = g.turn() === "w" ? setup.player2Name : setup.player1Name;
        }
        setGameOverInfo({ reason, winner });
        setShowGameOverModal(true);
        setIsPlaying(false);
        timer.pause();
        playGameOverSound();
        return true;
      }
      return false;
    },
    [
      setup.player1Name,
      setup.player2Name,
      setGameOverInfo,
      setShowGameOverModal,
      setIsPlaying,
      timer,
    ],
  );

  const getHumanColor = useCallback((): "w" | "b" => {
    const { humanColor } = store.setup;
    if (humanColor === "black") return "b";
    if (humanColor === "white") return "w";
    return store.boardOrientation === "white" ? "w" : "b";
  }, [store.setup, store.boardOrientation]);

  const makeEngineMove = useCallback(
    async (currentFen: string) => {
      if (setup.mode !== "vs-computer") return;
      if (!engineReady) return;

      setWaitingForEngine(true);

      try {
        const bestMove = await getBestMove(currentFen);
        if (!bestMove) {
          setWaitingForEngine(false);
          return;
        }

        await new Promise((r) => setTimeout(r, 300));

        const currentGame = gameRef.current;
        const from = bestMove.substring(0, 2) as Square;
        const to = bestMove.substring(2, 4) as Square;
        const promotion = bestMove.length > 4 ? bestMove[4] : undefined;

        const newGame = cloneGame(currentGame);
        const move = newGame.move({ from, to, promotion: promotion as any });

        if (move) {
          setGame(newGame);
          gameRef.current = newGame;
          setMoveHistory((prev) => [...prev, move]);
          setFenHistory((prev) => [...prev, newGame.fen()]);
          setLastMove({ from, to });
          setViewingMoveIndex(-1);

          if (move.captured) playCaptureSound();
          else playMoveSound();
          if (newGame.inCheck()) playCheckSound();

          timer.switchTurn(newGame.turn());
          checkGameOver(newGame);
        }
      } catch (e) {
        console.error("Engine move failed:", e);
      } finally {
        setWaitingForEngine(false);
      }
    },
    [setup.mode, getBestMove, engineReady, timer, checkGameOver],
  );

  useEffect(() => {
    if (setup.mode !== "vs-computer") return;
    if (!store.isPlaying) return;
    if (waitingForEngine || isThinking) return;

    const humanColor = getHumanColor();
    const currentTurn = game.turn();

    if (currentTurn !== humanColor && !game.isGameOver()) {
      makeEngineMove(game.fen());
    }
  }, [
    game,
    setup.mode,
    store.isPlaying,
    waitingForEngine,
    isThinking,
    getHumanColor,
    makeEngineMove,
  ]);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      const newGame = cloneGame(game);

      try {
        const move = newGame.move({
          from,
          to,
          promotion: (promotion || "q") as any,
        });

        if (!move) return false;

        setGame(newGame);
        gameRef.current = newGame;
        setMoveHistory((prev) => [...prev, move]);
        setFenHistory((prev) => [...prev, newGame.fen()]);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMoves([]);
        setViewingMoveIndex(-1);

        if (move.captured) playCaptureSound();
        else playMoveSound();
        if (newGame.inCheck()) playCheckSound();

        const nextTurn = newGame.turn();
        timer.switchTurn(nextTurn);

        if (setup.mode === "two-player" && setup.autoFlip) {
          setBoardOrientation(nextTurn === "w" ? "white" : "black");
        }

        checkGameOver(newGame);
        return true;
      } catch {
        return false;
      }
    },
    [game, timer, setup, setBoardOrientation, checkGameOver],
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (viewingMoveIndex >= 0) return;

      if (setup.mode === "vs-computer") {
        const humanColor = getHumanColor();
        if (game.turn() !== humanColor) return;
      }

      if (selectedSquare) {
        if (legalMoves.includes(square)) {
          const needsPromotion = isPromotion(game, selectedSquare, square);
          makeMove(selectedSquare, square, needsPromotion ? "q" : undefined);
          return;
        }

        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          const newMoves = getLegalMovesForSquare(game, square);
          if (newMoves.length === 0) {
            playIllegalMoveSound();
            setSelectedSquare(null);
            setLegalMoves([]);
            return;
          }
          setSelectedSquare(square);
          setLegalMoves(newMoves);
          return;
        }

        playIllegalMoveSound();
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        const moves = getLegalMovesForSquare(game, square);
        if (moves.length === 0) {
          playIllegalMoveSound();
          return;
        }
        setSelectedSquare(square);
        setLegalMoves(moves);
      } else {
        playIllegalMoveSound();
      }
    },
    [
      game,
      selectedSquare,
      legalMoves,
      makeMove,
      setup,
      viewingMoveIndex,
      getHumanColor,
    ],
  );

  const onPieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string): boolean => {
      if (viewingMoveIndex >= 0) return false;

      if (setup.mode === "vs-computer") {
        const humanColor = getHumanColor();
        if (game.turn() !== humanColor) return false;
      }

      const from = sourceSquare as Square;
      const to = targetSquare as Square;
      const needsPromotion = isPromotion(game, from, to);

      const result = makeMove(from, to, needsPromotion ? "q" : undefined);
      if (!result) playIllegalMoveSound();
      return result;
    },
    [game, makeMove, setup, viewingMoveIndex, getHumanColor],
  );

  const newGame = useCallback(
    (gameSetup?: typeof setup) => {
      const s = gameSetup || setup;
      const fresh = new Chess();
      setGame(fresh);
      gameRef.current = fresh;
      setMoveHistory([]);
      setFenHistory([fresh.fen()]);
      setSelectedSquare(null);
      setLegalMoves([]);
      setLastMove(null);
      setViewingMoveIndex(-1);
      setWaitingForEngine(false);
      timer.reset(s.timeControl?.time ?? null);

      let orientation: "white" | "black" = "white";
      if (s.mode === "vs-computer") {
        if (s.humanColor === "black") orientation = "black";
        else if (s.humanColor === "random")
          orientation = Math.random() > 0.5 ? "white" : "black";
      }
      setBoardOrientation(orientation);
      setIsPlaying(true);
      setShowGameOverModal(false);
      setGameOverInfo(null);
      timer.switchTurn("w");
    },
    [
      setup,
      timer,
      setBoardOrientation,
      setIsPlaying,
      setShowGameOverModal,
      setGameOverInfo,
    ],
  );

  const resign = useCallback(() => {
    const winner = game.turn() === "w" ? setup.player2Name : setup.player1Name;
    setGameOverInfo({ reason: "resignation", winner });
    setShowGameOverModal(true);
    setIsPlaying(false);
    timer.pause();
    playGameOverSound();
  }, [game, setup, setGameOverInfo, setShowGameOverModal, setIsPlaying, timer]);

  const undoMove = useCallback(() => {
    if (setup.mode !== "vs-computer" || moveHistory.length < 2) return;
    const newG = cloneGame(game);
    newG.undo();
    newG.undo();
    setGame(newG);
    gameRef.current = newG;
    setMoveHistory((prev) => prev.slice(0, -2));
    setFenHistory((prev) => prev.slice(0, -2));
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setViewingMoveIndex(-1);
  }, [game, setup.mode, moveHistory]);

  const viewMove = useCallback(
    (index: number) => {
      if (index < 0 || index >= fenHistory.length) {
        setViewingMoveIndex(-1);
        return;
      }
      setViewingMoveIndex(index);
    },
    [fenHistory],
  );

  const exitPreview = useCallback(() => {
    setViewingMoveIndex(-1);
  }, []);

  const captured = getCapturedPieces(game);
  const currentFen =
    viewingMoveIndex >= 0 ? fenHistory[viewingMoveIndex] : game.fen();

  return {
    game,
    currentFen,
    moveHistory,
    fenHistory,
    selectedSquare,
    legalMoves,
    lastMove,
    captured,
    isThinking: isThinking || waitingForEngine,
    engineReady,
    viewingMoveIndex,
    timer,
    onSquareClick,
    onPieceDrop,
    newGame,
    resign,
    undoMove,
    makeMove,
    viewMove,
    exitPreview,
  };
}
