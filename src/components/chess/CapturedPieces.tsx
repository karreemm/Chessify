import { ChessPiece } from './ChessPiece';
import { getPlayerCaptures, CapturedPieces } from '@/lib/chess-utils';

interface CapturedPiecesProps {
  captured: CapturedPieces;
  color: 'w' | 'b';
}

export function CapturedPiecesDisplay({ captured, color }: CapturedPiecesProps) {
  const pieces = getPlayerCaptures(captured, color);

  if (pieces.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5">
      {pieces.map(({ piece, count }) => (
        <div key={piece} className="relative flex items-center justify-center w-6 h-6">
          <ChessPiece 
            piece={piece.toLowerCase()} 
            color={color === 'w' ? 'b' : 'w'} 
            size={22}
            className="drop-shadow-sm"
          />
          {count > 1 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-background z-10">
              {count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}