import { Move } from 'chess.js';
import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, ChevronFirst, ChevronLast, Radio } from 'lucide-react';
import { toast } from 'sonner';

interface MoveHistoryProps {
  moves: Move[];
  currentIndex: number;
  onMoveClick: (index: number) => void;
  copyText: string;
  isViewingHistory?: boolean;
}

export function MoveHistory({ moves, currentIndex, onMoveClick, copyText, isViewingHistory }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  const pairs: { num: number; white: Move; black?: Move }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  const copyMoves = async () => {
    await navigator.clipboard.writeText(copyText);
    toast.success('PGN copied');
  };

  const goToStart = () => onMoveClick(0);
  const goToEnd = () => onMoveClick(moves.length);

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between px-4 py-3 border-b transition-colors flex-shrink-0 ${
        isViewingHistory ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border'
      }`}>
        <div className="flex items-center gap-2">
          {isViewingHistory && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" />
              Viewing
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 hover:bg-secondary"
            onClick={goToStart}
            disabled={currentIndex <= 0}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 hover:bg-secondary"
            onClick={goToEnd}
            disabled={currentIndex >= moves.length}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyMoves} 
            className="h-7 px-2 hover:bg-secondary font-medium text-xs ml-2"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-2">
          {pairs.length > 0 && (
            <div className="space-y-0.5">
              {pairs.map((pair, pairIdx) => (
                <div 
                  key={pairIdx} 
                  className="flex items-center text-sm py-0.5 hover:bg-secondary/30 rounded px-1 transition-colors"
                >
                  <span className="w-8 text-muted-foreground text-xs text-right mr-3 font-mono select-none">
                    {pair.num}.
                  </span>
                  
                  <button
                    ref={currentIndex === pairIdx * 2 + 1 ? activeRef : null}
                    onClick={() => onMoveClick(pairIdx * 2 + 1)}
                    className={`flex-1 px-2 py-1 rounded text-left font-mono transition-all ${
                      currentIndex === pairIdx * 2 + 1 
                        ? 'move-highlight font-semibold' 
                        : 'hover:bg-secondary/50'
                    }`}
                  >
                    <span className="move-white">{pair.white.san}</span>
                  </button>
                  
                  {pair.black && (
                    <button
                      ref={currentIndex === pairIdx * 2 + 2 ? activeRef : null}
                      onClick={() => onMoveClick(pairIdx * 2 + 2)}
                      className={`flex-1 px-2 py-1 rounded text-left font-mono transition-all ${
                        currentIndex === pairIdx * 2 + 2 
                          ? 'move-highlight font-semibold' 
                          : 'hover:bg-secondary/50'
                      }`}
                    >
                      <span className="move-black">{pair.black.san}</span>
                    </button>
                  )}
                  
                  {!pair.black && <div className="flex-1" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="px-4 py-2 border-t border-border bg-muted/20 text-[10px] text-muted-foreground text-center font-mono flex-shrink-0">
        {moves.length} moves • {isViewingHistory ? '→ to return' : 'Live'}
      </div>
    </div>
  );
}