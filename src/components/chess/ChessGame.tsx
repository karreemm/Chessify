import { useCallback, useMemo, useEffect, useState } from "react";
import { Square } from "chess.js";
import { useChessGame } from "@/hooks/useChessGame";
import { useGameStore } from "@/store/gameStore";
import { ChessBoardWrapper } from "./ChessBoard";
import { PlayerPanel } from "./PlayerPanel";
import { MoveHistory } from "./MoveHistory";
import { GameControls } from "./GameControls";
import { GameOverModal } from "./GameOverModal";
import { SettingsPanel } from "./SettingsPanel";
import { SetupModal } from "./SetupModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChessGame() {
  const store = useGameStore();
  const { setup, isPlaying } = store;
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    game,
    currentFen,
    moveHistory,
    fenHistory,
    selectedSquare,
    legalMoves,
    lastMove,
    captured,
    isThinking,
    viewingMoveIndex,
    timer,
    onSquareClick,
    onPieceDrop,
    newGame,
    resign,
    undoMove,
    viewMove,
  } = useChessGame();

  const isInCheck = game.inCheck();
  const checkSquare = useMemo(() => {
    if (!isInCheck) return null;
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq && sq.type === "k" && sq.color === game.turn()) {
          const files = "abcdefgh";
          return `${files[c]}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [isInCheck, game]);

  const copyText = useMemo(() => {
    if (moveHistory.length === 0) return "";
    const chunks: string[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const white = moveHistory[i];
      const black = moveHistory[i + 1];
      chunks.push(
        `${Math.floor(i / 2) + 1}. ${white.san}${black ? ` ${black.san}` : ""}`,
      );
    }
    return chunks.join(" ").trim();
  }, [moveHistory]);

  const handleStart = useCallback(() => {
    setTimeout(() => {
      const latestSetup = useGameStore.getState().setup;
      newGame(latestSetup);
    }, 50);
  }, [newGame]);

  const handlePlayAgain = useCallback(() => {
    newGame();
  }, [newGame]);

  const handlePrevMove = () => {
    if (viewingMoveIndex > 0) {
      viewMove(viewingMoveIndex - 1);
    } else if (viewingMoveIndex === -1 && fenHistory.length > 1) {
      viewMove(fenHistory.length - 2);
    }
  };

  const handleNextMove = () => {
    if (viewingMoveIndex >= 0) {
      if (viewingMoveIndex < fenHistory.length - 2) {
        viewMove(viewingMoveIndex + 1);
      } else {
        viewMove(-1);
      }
    }
  };

  const topPlayer =
    store.boardOrientation === "white"
      ? { name: setup.player2Name, color: "b" as const, time: timer.blackTime }
      : { name: setup.player1Name, color: "w" as const, time: timer.whiteTime };

  const bottomPlayer =
    store.boardOrientation === "white"
      ? { name: setup.player1Name, color: "w" as const, time: timer.whiteTime }
      : { name: setup.player2Name, color: "b" as const, time: timer.blackTime };

  const humanPieceColor =
    setup.humanColor === "black"
      ? "b"
      : setup.humanColor === "white"
        ? "w"
        : store.boardOrientation === "white"
          ? "w"
          : "b";
  const isEngineThinkingTop =
    isThinking &&
    setup.mode === "vs-computer" &&
    topPlayer.color !== humanPieceColor;
  const isEngineThinkingBottom =
    isThinking &&
    setup.mode === "vs-computer" &&
    bottomPlayer.color !== humanPieceColor;

  const isViewingHistory =
    viewingMoveIndex >= 0 && viewingMoveIndex < fenHistory.length - 1;

  const mobileBoardSize = Math.min(
    Math.floor(windowHeight - 248),
    Math.floor(window.innerWidth - 32),
  );

  const desktopBoardSize = Math.min(Math.floor(windowHeight - 280), 600);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background p-2 sm:p-4">
      <div className="h-full max-w-[1400px] mx-auto flex flex-col lg:block">
        <div className="lg:hidden flex flex-col h-full gap-2">
          <div className="flex-shrink-0">
            <GameControls
              onNewGame={() => store.setShowSetupModal(true)}
              onResign={resign}
              onUndo={undoMove}
              onFlip={store.flipBoard}
              isPlaying={isPlaying}
            />
          </div>

          <div className="wood-panel rounded-lg flex-shrink-0 h-12 flex items-center px-2 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handlePrevMove}
              disabled={
                viewingMoveIndex === 0 ||
                (viewingMoveIndex === -1 && fenHistory.length <= 1)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 overflow-x-auto moves-scroll flex items-center gap-2 px-1">
              {moveHistory.length === 0 ? (
                <span className="text-muted-foreground text-xs italic w-full text-center">
                  Start playing...
                </span>
              ) : (
                moveHistory.map((move, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === moveHistory.length - 1) {
                        viewMove(-1);
                      } else {
                        viewMove(idx + 1);
                      }
                    }}
                    className={`flex-shrink-0 px-2 py-1 rounded text-xs font-mono transition-colors ${
                      (viewingMoveIndex === -1
                        ? moveHistory.length
                        : viewingMoveIndex) ===
                      idx + 1
                        ? "bg-primary/20 text-primary font-semibold"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="text-muted-foreground mr-1">
                      {Math.floor(idx / 2) + 1}.
                    </span>
                    <span
                      className={idx % 2 === 0 ? "move-white" : "move-black"}
                    >
                      {move.san}
                    </span>
                  </button>
                ))
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleNextMove}
              disabled={
                viewingMoveIndex === -1 ||
                (viewingMoveIndex >= 0 &&
                  viewingMoveIndex >= fenHistory.length - 1)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-shrink-0">
            <PlayerPanel
              name={topPlayer.name}
              color={topPlayer.color}
              time={topPlayer.time}
              isActive={
                game.turn() === topPlayer.color &&
                isPlaying &&
                !isViewingHistory
              }
              isThinking={isEngineThinkingTop && !isViewingHistory}
              captured={captured}
              noLimit={timer.noLimit}
              compact
            />
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            <ChessBoardWrapper
              fen={currentFen}
              onPieceDrop={onPieceDrop}
              onSquareClick={onSquareClick}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isInCheck={isInCheck}
              checkSquare={checkSquare}
              forcedSize={mobileBoardSize}
            />
          </div>

          <div className="flex-shrink-0">
            <PlayerPanel
              name={bottomPlayer.name}
              color={bottomPlayer.color}
              time={bottomPlayer.time}
              isActive={
                game.turn() === bottomPlayer.color &&
                isPlaying &&
                !isViewingHistory
              }
              isThinking={isEngineThinkingBottom && !isViewingHistory}
              captured={captured}
              noLimit={timer.noLimit}
              compact
            />
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-6 h-full items-center">
          <div className="h-full flex flex-col justify-center items-center gap-4 max-h-screen py-4">
            <div className="w-full max-w-[600px] flex-shrink-0">
              <PlayerPanel
                name={topPlayer.name}
                color={topPlayer.color}
                time={topPlayer.time}
                isActive={
                  game.turn() === topPlayer.color &&
                  isPlaying &&
                  !isViewingHistory
                }
                isThinking={isEngineThinkingTop && !isViewingHistory}
                captured={captured}
                noLimit={timer.noLimit}
              />
            </div>

            <div className="flex-shrink-0 flex items-center justify-center">
              <ChessBoardWrapper
                fen={currentFen}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isInCheck={isInCheck}
                checkSquare={checkSquare}
                forcedSize={desktopBoardSize}
              />
            </div>

            <div className="w-full max-w-[600px] flex-shrink-0">
              <PlayerPanel
                name={bottomPlayer.name}
                color={bottomPlayer.color}
                time={bottomPlayer.time}
                isActive={
                  game.turn() === bottomPlayer.color &&
                  isPlaying &&
                  !isViewingHistory
                }
                isThinking={isEngineThinkingBottom && !isViewingHistory}
                captured={captured}
                noLimit={timer.noLimit}
              />
            </div>
          </div>

          <div className="h-full flex flex-col py-4 gap-4 min-h-0">
            <div className="flex-shrink-0">
              <GameControls
                onNewGame={() => store.setShowSetupModal(true)}
                onResign={resign}
                onUndo={undoMove}
                onFlip={store.flipBoard}
                isPlaying={isPlaying}
              />
            </div>

            <div className="wood-panel rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden">
              <MoveHistory
                moves={moveHistory}
                currentIndex={
                  viewingMoveIndex >= 0
                    ? viewingMoveIndex
                    : fenHistory.length - 1
                }
                onMoveClick={(index) => {
                  if (index === fenHistory.length - 1) {
                    viewMove(-1);
                  } else {
                    viewMove(index);
                  }
                }}
                copyText={copyText}
                isViewingHistory={isViewingHistory}
              />
            </div>
          </div>
        </div>
      </div>

      <SetupModal onStart={handleStart} />
      <GameOverModal
        totalMoves={moveHistory.length}
        copyText={copyText}
        onPlayAgain={handlePlayAgain}
      />
      <SettingsPanel />
    </div>
  );
}
