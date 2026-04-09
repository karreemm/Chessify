import { useGameStore } from '@/store/gameStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Handshake, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface GameOverModalProps {
  totalMoves: number;
  copyText: string;
  onPlayAgain: () => void;
  whiteTime: number;
  blackTime: number;
}

const reasonLabels: Record<string, string> = {
  checkmate: 'Checkmate',
  stalemate: 'Stalemate — Draw',
  insufficient: 'Insufficient Material — Draw',
  threefold: 'Threefold Repetition — Draw',
  'fifty-move': 'Fifty-Move Rule — Draw',
  timeout: 'Time Out',
  resignation: 'Resignation',
  draw: 'Draw by Agreement',
};

export function GameOverModal({ totalMoves, copyText, onPlayAgain, whiteTime, blackTime }: GameOverModalProps) {
  const { showGameOverModal, setShowGameOverModal, gameOverInfo, setShowSetupModal } = useGameStore();

  if (!gameOverInfo) return null;

  const { reason, winner } = gameOverInfo;
  const isDraw = !winner;
  const headline = isDraw
    ? reasonLabels[reason] || 'Game Over'
    : `${winner} wins by ${reasonLabels[reason]?.toLowerCase() || reason}!`;

  const copyMoves = async () => {
    await navigator.clipboard.writeText(copyText);
    toast.success('Game notation copied');
  };

  return (
    <Dialog open={showGameOverModal} onOpenChange={setShowGameOverModal}>
      <DialogContent className="sm:max-w-md wood-texture border-2 border-primary/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <DialogHeader className="text-center pb-4 border-b border-primary/10">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            {isDraw ? (
              <Handshake className="w-8 h-8 text-primary" />
            ) : (
              <Trophy className="w-8 h-8 text-accent" />
            )}
          </div>
          <DialogTitle className="text-2xl font-[Cinzel] font-bold tracking-wide text-center">
            {headline}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="wood-panel rounded-lg p-4 text-center space-y-1">
              <div className="text-muted-foreground text-xs uppercase tracking-wider font-[Cinzel]">Total Moves</div>
              <div className="font-[Cinzel] font-bold text-2xl text-primary">{totalMoves}</div>
            </div>
            <div className="wood-panel rounded-lg p-4 text-center space-y-1">
              <div className="text-muted-foreground text-xs uppercase tracking-wider font-[Cinzel]">Result</div>
              <div className="font-[Cinzel] font-bold text-2xl">
                {isDraw ? '½-½' : winner === 'White' ? '1-0' : '0-1'}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={onPlayAgain} 
              className="flex-1 wood-button font-[Cinzel] font-semibold tracking-wide"
            >
              Play Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setShowGameOverModal(false); setShowSetupModal(true); }}
              className="flex-1 font-[Cinzel] border-primary/20 hover:bg-primary/10"
            >
              New Game
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyMoves}
              className="border-primary/20 hover:bg-primary/10"
              title="Copy moves"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}