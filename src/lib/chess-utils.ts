import { Chess, Square } from 'chess.js';
import { PIECE_VALUES, PIECE_ORDER } from './themes';


export interface CapturedPieces {
  w: Record<string, number>;
  b: Record<string, number>;
}

export function getCapturedPieces(game: Chess): CapturedPieces {
  const initial: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const current = { w: { ...initial }, b: { ...initial } };

  const board = game.board();
  for (const row of board) {
    for (const sq of row) {
      if (sq && sq.type !== 'k') {
        current[sq.color][sq.type]--;
      }
    }
  }
  return current;
}

export function getMaterialAdvantage(captured: CapturedPieces): number {
  let whiteCaptures = 0;
  let blackCaptures = 0;
  for (const piece of PIECE_ORDER) {
    whiteCaptures += (captured.b[piece] || 0) * PIECE_VALUES[piece]; 
    blackCaptures += (captured.w[piece] || 0) * PIECE_VALUES[piece]; 
  }
  return blackCaptures - whiteCaptures; 
}

export function getPlayerCaptures(captured: CapturedPieces, color: 'w' | 'b'): { piece: string; count: number }[] {
  const source = color === 'w' ? captured.b : captured.w;
  return PIECE_ORDER.map(p => ({ piece: p, count: source[p] || 0 })).filter(x => x.count > 0);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getGameOverReason(game: Chess): string | null {
  if (game.isCheckmate()) return 'checkmate';
  if (game.isStalemate()) return 'stalemate';
  if (game.isInsufficientMaterial()) return 'insufficient';
  if (game.isThreefoldRepetition()) return 'threefold';
  if (game.isDraw()) return 'fifty-move';
  return null;
}

export function getLegalMovesForSquare(game: Chess, square: Square): Square[] {
  return game.moves({ square, verbose: true }).map(m => m.to as Square);
}

export function isPromotion(game: Chess, from: Square, to: Square): boolean {
  const piece = game.get(from);
  if (!piece || piece.type !== 'p') return false;
  const rank = to[1];
  return (piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1');
}
