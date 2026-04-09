import { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useGameStore } from '@/store/gameStore';

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
  const { boardTheme, showLegalMoves, showLastMove, showCoordinates, animationSpeed, boardSize } = settings;

  const actualBoardSize = forcedSize || boardSize;

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (showLastMove && lastMove) {
      styles[lastMove.from] = { 
        backgroundColor: boardTheme.highlightColor + '66',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)'
      };
      styles[lastMove.to] = { 
        backgroundColor: boardTheme.highlightColor + '88',
        boxShadow: 'inset 0 0 12px rgba(0,0,0,0.3)'
      };
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: boardTheme.highlightColor + 'AA',
        boxShadow: 'inset 0 0 16px rgba(0,0,0,0.25)',
        borderRadius: '4px'
      };
    }

    if (showLegalMoves && legalMoves.length > 0) {
      for (const sq of legalMoves) {
        const baseSize = actualBoardSize < 400 ? '20%' : '25%';
        styles[sq] = {
          ...styles[sq],
          background: styles[sq]?.backgroundColor
            ? `radial-gradient(circle, rgba(139, 90, 43, 0.3) ${baseSize}, transparent ${baseSize}), ${styles[sq].backgroundColor}`
            : `radial-gradient(circle, rgba(139, 90, 43, 0.4) ${baseSize}, transparent ${baseSize})`,
          borderRadius: '50%',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)'
        };
      }
    }

    if (isInCheck && checkSquare) {
      styles[checkSquare] = {
        ...styles[checkSquare],
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(220, 38, 38, 0.3) 70%, transparent 100%)',
        borderRadius: '50%',
        boxShadow: 'inset 0 0 20px rgba(220, 38, 38, 0.4)'
      };
    }

    return styles;
  }, [selectedSquare, legalMoves, lastMove, isInCheck, checkSquare, boardTheme, showLegalMoves, showLastMove, actualBoardSize]);

  return (
    <div 
      className="p-2 rounded-lg wood-panel"
      style={{ 
        width: actualBoardSize + 16, 
        maxWidth: '100%',
        background: 'linear-gradient(135deg, hsl(30, 30%, 75%) 0%, hsl(30, 25%, 65%) 100%)',
      }}
    >
      <div className="rounded overflow-hidden shadow-2xl" style={{ width: actualBoardSize, maxWidth: '100%' }}>
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
            borderRadius: '2px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)',
          }}
          customDarkSquareStyle={{ 
            backgroundColor: boardTheme.darkSquare,
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)'
          }}
          customLightSquareStyle={{ 
            backgroundColor: boardTheme.lightSquare,
            boxShadow: 'inset 0 0 8px rgba(255,255,255,0.1)'
          }}
          boardWidth={actualBoardSize}
        />
      </div>
    </div>
  );
}