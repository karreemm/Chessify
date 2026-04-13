import { useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import { useGameStore } from "@/store/gameStore";

interface ChessBoardProps {
  fen: string;
  onPieceDrop: (source: string, target: string, piece: string) => boolean;
  onSquareClick: (square: Square) => void;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  isInCheck: boolean;
  checkSquare: Square | null;
  forcedSize?: number;
}

function hexToRgb(hex: string) {
  const cleaned = hex.replace("#", "");
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;

  const num = parseInt(normalized, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function isLightSquare(square: string) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  return (file + rank) % 2 !== 0;
}

function getSquareBaseColor(square: string, light: string, dark: string) {
  return isLightSquare(square) ? light : dark;
}

function getOverlayPalette(squareColor: string) {
  const luminance = getLuminance(squareColor);
  const onLight = luminance > 0.55;

  return {
    lastMove: onLight ? "rgba(255, 214, 10, 0.42)" : "rgba(255, 214, 10, 0.30)",
    lastMoveStrong: onLight
      ? "rgba(255, 214, 10, 0.56)"
      : "rgba(255, 214, 10, 0.40)",
    selected: onLight ? "rgba(59, 130, 246, 0.30)" : "rgba(96, 165, 250, 0.26)",
    selectedBorder: onLight
      ? "rgba(37, 99, 235, 0.9)"
      : "rgba(147, 197, 253, 0.95)",
    legalDot: onLight ? "rgba(20, 20, 20, 0.28)" : "rgba(255, 255, 255, 0.30)",
    legalRing: onLight ? "rgba(20, 20, 20, 0.38)" : "rgba(255, 255, 255, 0.42)",
    check: "rgba(220, 38, 38, 0.72)",
  };
}

export function ChessBoardWrapper({
  fen,
  onPieceDrop,
  onSquareClick,
  selectedSquare,
  legalMoves,
  lastMove,
  isInCheck,
  checkSquare,
  forcedSize,
}: ChessBoardProps) {
  const { settings, boardOrientation } = useGameStore();
  const {
    boardTheme,
    showLegalMoves,
    showLastMove,
    showCoordinates,
    animationSpeed,
    boardSize,
  } = settings;

  const actualBoardSize = forcedSize || boardSize;

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    const getPalette = (square: string) =>
      getOverlayPalette(
        getSquareBaseColor(
          square,
          boardTheme.lightSquare,
          boardTheme.darkSquare,
        ),
      );

    if (showLastMove && lastMove) {
      const fromPalette = getPalette(lastMove.from);
      const toPalette = getPalette(lastMove.to);

      styles[lastMove.from] = {
        backgroundColor: fromPalette.lastMove,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
      };

      styles[lastMove.to] = {
        backgroundColor: toPalette.lastMoveStrong,
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 0 18px rgba(255,255,255,0.08)",
      };
    }

    if (selectedSquare) {
      const palette = getPalette(selectedSquare);

      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundImage: `linear-gradient(${palette.selected}, ${palette.selected})`,
        boxShadow: [
          styles[selectedSquare]?.boxShadow,
          `inset 0 0 0 3px ${palette.selectedBorder}`,
          "inset 0 0 18px rgba(0,0,0,0.12)",
        ]
          .filter(Boolean)
          .join(", "),
      };
    }

    if (showLegalMoves && legalMoves.length > 0) {
      const dotSize = actualBoardSize < 400 ? "18%" : "22%";

      for (const sq of legalMoves) {
        const palette = getPalette(sq);

        styles[sq] = {
          ...styles[sq],
          backgroundImage: [
            styles[sq]?.backgroundImage,
            `radial-gradient(circle, ${palette.legalDot} ${dotSize}, transparent calc(${dotSize} + 1%))`,
          ]
            .filter(Boolean)
            .join(", "),
        };
      }
    }

    if (isInCheck && checkSquare) {
      const palette = getPalette(checkSquare);

      styles[checkSquare] = {
        ...styles[checkSquare],
        backgroundImage: [
          styles[checkSquare]?.backgroundImage,
          `radial-gradient(circle, ${palette.check} 0%, rgba(220, 38, 38, 0.28) 68%, transparent 100%)`,
        ]
          .filter(Boolean)
          .join(", "),
        boxShadow: [
          styles[checkSquare]?.boxShadow,
          "inset 0 0 0 2px rgba(127, 29, 29, 0.45)",
        ]
          .filter(Boolean)
          .join(", "),
      };
    }

    return styles;
  }, [
    selectedSquare,
    legalMoves,
    lastMove,
    isInCheck,
    checkSquare,
    boardTheme.lightSquare,
    boardTheme.darkSquare,
    showLegalMoves,
    showLastMove,
    actualBoardSize,
  ]);

  return (
    <div
      className="p-2 rounded-lg wood-panel"
      style={{
        width: actualBoardSize + 16,
        maxWidth: "100%",
        background:
          "linear-gradient(135deg, hsl(30, 30%, 75%) 0%, hsl(30, 25%, 65%) 100%)",
      }}
    >
      <div
        className="rounded overflow-hidden shadow-2xl"
        style={{ width: actualBoardSize, maxWidth: "100%" }}
      >
        <Chessboard
          id="main-board"
          position={fen}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick as any}
          boardOrientation={boardOrientation}
          animationDuration={animationSpeed}
          arePiecesDraggable={true}
          showBoardNotation={showCoordinates}
          customSquareStyles={customSquareStyles}
          customBoardStyle={{
            borderRadius: "2px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)",
          }}
          customDarkSquareStyle={{
            backgroundColor: boardTheme.darkSquare,
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.2)",
          }}
          customLightSquareStyle={{
            backgroundColor: boardTheme.lightSquare,
            boxShadow: "inset 0 0 8px rgba(255,255,255,0.1)",
          }}
          boardWidth={actualBoardSize}
        />
      </div>
    </div>
  );
}
