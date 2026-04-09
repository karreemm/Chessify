import { formatTime } from '@/lib/chess-utils';
import { CapturedPiecesDisplay } from './CapturedPieces';
import type { CapturedPieces } from '@/lib/chess-utils';
import { getMaterialAdvantage } from '@/lib/chess-utils';

interface PlayerPanelProps {
  name: string;
  color: 'w' | 'b';
  time: number;
  isActive: boolean;
  isThinking?: boolean;
  captured: CapturedPieces;
  noLimit: boolean;
  compact?: boolean;
}

export function PlayerPanel({ 
  name, 
  color, 
  time, 
  isActive, 
  isThinking, 
  captured, 
  noLimit,
  compact = false 
}: PlayerPanelProps) {
  const isDanger = !noLimit && time < 10 && time > 0 && isActive;
  
  const advantage = getMaterialAdvantage(captured);
  const myAdvantage = color === 'w' ? advantage : -advantage;
  
  if (compact) {
    return (
      <div className={`wood-panel rounded-lg h-14 flex items-center justify-between px-3 transition-all ${
        isActive ? 'ring-2 ring-primary/30 shadow-md' : 'opacity-90'
      }`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0 ${
            color === 'w' 
              ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border border-amber-300' 
              : 'bg-gradient-to-br from-stone-700 to-stone-800 text-stone-100 border border-stone-600'
          }`}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold leading-tight truncate">{name}</span>
              {myAdvantage > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">+{myAdvantage}</span>
              )}
            </div>
            <div className="scale-75 origin-left -mt-0.5">
              <CapturedPiecesDisplay captured={captured} color={color} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {isThinking && (
            <span className="flex gap-0.5 text-xs text-muted-foreground">
              <span className="thinking-dot">.</span>
              <span className="thinking-dot">.</span>
              <span className="thinking-dot">.</span>
            </span>
          )}
          {!noLimit && (
            <div className={`text-sm font-mono font-bold px-2 py-1 rounded ${
              isDanger 
                ? 'bg-destructive/20 text-destructive animate-pulse' 
                : 'bg-secondary text-foreground'
            }`}>
              {formatTime(time)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`wood-panel rounded-xl transition-all duration-300 ${
      isActive 
        ? 'ring-2 ring-primary/25 shadow-lg' 
        : 'opacity-95'
    }`}>
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-md font-[Cinzel] flex-shrink-0 ${
            color === 'w' 
              ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 border-2 border-amber-300' 
              : 'bg-gradient-to-br from-stone-700 to-stone-800 text-stone-100 border-2 border-stone-600'
          }`}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-[Cinzel] font-semibold text-base tracking-wide truncate">{name}</div>
              {myAdvantage > 0 && (
                <span className="text-sm font-bold text-primary px-2">+{myAdvantage}</span>
              )}
            </div>
            <div className="mt-0.5">
              <CapturedPiecesDisplay captured={captured} color={color} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isThinking && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
              <span>Thinking</span>
              <span className="flex gap-0.5">
                <span className="thinking-dot">.</span>
                <span className="thinking-dot">.</span>
                <span className="thinking-dot">.</span>
              </span>
            </div>
          )}
          {!noLimit && (
            <div className={`chess-timer text-xl font-bold px-4 py-2 rounded-lg min-w-[100px] text-center ${
              isDanger ? 'chess-timer-danger' : ''
            }`}>
              {formatTime(time)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}