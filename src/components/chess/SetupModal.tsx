import { useState } from 'react';
import { useGameStore, GameMode, PlayerColor, TimeControl } from '@/store/gameStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TIME_CONTROLS, getDifficultyLabel } from '@/lib/themes';
import { Users, Bot, Clock, ChevronRight } from 'lucide-react';

interface SetupModalProps {
  onStart: () => void;
}

export function SetupModal({ onStart }: SetupModalProps) {
  const { showSetupModal, setShowSetupModal, setup, setSetup } = useGameStore();
  const [mode, setMode] = useState<GameMode>(setup.mode);
  const [p1, setP1] = useState(setup.player1Name);
  const [p2, setP2] = useState(setup.player2Name);
  const [autoFlip, setAutoFlip] = useState(setup.autoFlip);
  const [humanColor, setHumanColor] = useState<PlayerColor>(setup.humanColor);
  const [engineLevel, setEngineLevel] = useState(setup.engineLevel);
  const [timeControl, setTimeControl] = useState<TimeControl | null>(setup.timeControl);
  const [customMin, setCustomMin] = useState(10);
  const [customInc, setCustomInc] = useState(0);
  const [timeTab, setTimeTab] = useState('blitz');

  const handleStart = () => {
    setSetup({
      mode,
      player1Name: p1 || 'White',
      player2Name: mode === 'vs-computer' ? 'Stockfish' : (p2 || 'Black'),
      autoFlip: mode === 'two-player' ? autoFlip : false,
      humanColor,
      engineLevel,
      timeControl,
    });
    setShowSetupModal(false);
    onStart();
  };

  return (
    <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 wood-panel border-2 border-primary/10">
        <DialogHeader className="shrink-0 border-b border-primary/10 px-6 py-4">
          <DialogTitle className="text-2xl font-[Cinzel] text-center">New Game</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={mode === 'two-player' ? 'default' : 'outline'}
              onClick={() => setMode('two-player')}
              className={`h-auto py-4 flex-col gap-2 transition-all ${mode === 'two-player' ? 'btn-wood' : 'btn-wood-secondary'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Two Players</span>
            </Button>
            <Button
              variant={mode === 'vs-computer' ? 'default' : 'outline'}
              onClick={() => setMode('vs-computer')}
              className={`h-auto py-4 flex-col gap-2 transition-all ${mode === 'vs-computer' ? 'btn-wood' : 'btn-wood-secondary'}`}
            >
              <Bot className="w-5 h-5" />
              <span className="text-sm font-medium">vs Computer</span>
            </Button>
          </div>

          <div className="wood-panel p-4 rounded-lg space-y-4">
            {mode === 'two-player' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">White</Label>
                    <Input
                      value={p1}
                      onChange={e => setP1(e.target.value)}
                      placeholder="Player 1"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Black</Label>
                    <Input
                      value={p2}
                      onChange={e => setP2(e.target.value)}
                      placeholder="Player 2"
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Label className="text-sm font-medium">Auto-flip board</Label>
                  <Switch checked={autoFlip} onCheckedChange={setAutoFlip} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Name</Label>
                  <Input
                    value={p1}
                    onChange={e => setP1(e.target.value)}
                    placeholder="Player"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Play As</Label>
                  <div className="flex gap-2">
                    {(['white', 'black', 'random'] as PlayerColor[]).map(c => (
                      <Button
                        key={c}
                        variant={humanColor === c ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setHumanColor(c)}
                        className={`flex-1 capitalize ${humanColor === c ? 'btn-wood' : 'btn-wood-secondary'}`}
                      >
                        {c === 'random' ? '🎲 Random' : c}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <Label className="font-medium">Difficulty</Label>
                    <span className="text-muted-foreground">{getDifficultyLabel(engineLevel)} ({engineLevel})</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={engineLevel}
                    onChange={(e) => setEngineLevel(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span>Beginner</span>
                    <span>Master</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2 font-[Cinzel]">
              <Clock className="w-4 h-4" /> Time Control
            </Label>

            <Tabs value={timeTab} onValueChange={setTimeTab} className="w-full">
              <TabsList className="w-full grid grid-cols-5 h-9 bg-muted p-1 rounded-lg">
                {['bullet', 'blitz', 'rapid', 'classical', 'custom'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-[10px] sm:text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(TIME_CONTROLS).map(([key, controls]) => (
                <TabsContent key={key} value={key} className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {controls.map(tc => (
                      <Button
                        key={tc.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setTimeControl({ time: tc.time, increment: tc.increment })}
                        className={`h-10 text-xs font-medium transition-all ${
                          timeControl?.time === tc.time && timeControl?.increment === tc.increment
                            ? 'time-selected btn-wood'
                            : 'btn-wood-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {tc.label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}

              <TabsContent value="custom" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      type="number"
                      min={1}
                      max={180}
                      value={customMin}
                      onChange={e => setCustomMin(Number(e.target.value))}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Increment (sec)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      value={customInc}
                      onChange={e => setCustomInc(Number(e.target.value))}
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setTimeControl({ time: customMin * 60, increment: customInc })}
                  className={`w-full h-10 text-xs font-medium ${
                    timeControl && timeControl.time === customMin * 60 && timeControl.increment === customInc
                      ? 'time-selected btn-wood'
                      : 'btn-wood-secondary'
                  }`}
                >
                  Set Custom Time
                </Button>
              </TabsContent>
            </Tabs>

            <Button
              variant={timeControl === null ? 'default' : 'outline'}
              size="sm"
              className={`w-full h-10 font-medium ${
                timeControl === null ? 'btn-wood' : 'btn-wood-secondary text-muted-foreground'
              }`}
              onClick={() => setTimeControl(null)}
            >
              No Time Limit — Casual Game
            </Button>
          </div>

        </div>
        <div className="shrink-0 border-t border-primary/10 px-6 py-4">
          <Button
            onClick={handleStart}
            className="w-full h-12 text-base font-[Cinzel] font-semibold tracking-wide btn-wood"
          >
            Start Game
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}