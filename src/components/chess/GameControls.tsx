import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw, Flag, RefreshCw, Undo2, Settings } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface GameControlsProps {
  onNewGame: () => void;
  onResign: () => void;
  onUndo: () => void;
  onFlip: () => void;
  isPlaying: boolean;
}

export function GameControls({ onNewGame, onResign, onUndo, onFlip, isPlaying }: GameControlsProps) {
  const { setup, setShowSettingsPanel, setShowSetupModal } = useGameStore();
  const isVsComputer = setup.mode === 'vs-computer';

  return (
    <div className="wood-panel rounded-lg p-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 flex-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 w-9 sm:w-auto sm:px-3 bg-transparent border-border hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-sm">New</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="wood-panel">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-[Cinzel]">Start new game?</AlertDialogTitle>
              <AlertDialogDescription>Current game will be abandoned.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-border hover:bg-secondary">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onNewGame(); setShowSetupModal(true); }} className="btn-wood">
                New Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onFlip}
          className="h-9 w-9 sm:w-auto sm:px-3 bg-transparent border-border hover:bg-primary/10 hover:text-primary"
        >
          <RotateCcw className="w-4 h-4 sm:mr-1.5" />
          <span className="hidden sm:inline text-sm">Flip</span>
        </Button>

        {isPlaying && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 w-9 sm:w-auto sm:px-3 bg-transparent border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Flag className="w-4 h-4 sm:mr-1.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="wood-panel">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-[Cinzel]">Resign?</AlertDialogTitle>
                <AlertDialogDescription>You will lose this game.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-border hover:bg-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onResign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Resign
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isVsComputer && isPlaying && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUndo}
            className="h-9 w-9 sm:w-auto sm:px-3 bg-transparent border-border hover:bg-primary/10 hover:text-primary"
          >
            <Undo2 className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-sm">Undo</span>
          </Button>
        )}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowSettingsPanel(true)}
        className="h-9 w-9 sm:w-auto sm:px-3 bg-transparent border-border hover:bg-primary/10 hover:text-primary flex-shrink-0"
      >
        <Settings className="w-4 h-4 sm:mr-1.5" />
      </Button>
    </div>
  );
}