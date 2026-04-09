import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardTheme, boardThemes } from '@/lib/themes';

export type GameMode = 'two-player' | 'vs-computer';
export type PlayerColor = 'white' | 'black' | 'random';

export interface TimeControl {
  time: number; 
  increment: number; 
}

export interface GameSetup {
  mode: GameMode;
  player1Name: string;
  player2Name: string;
  autoFlip: boolean;
  humanColor: PlayerColor;
  engineLevel: number;
  timeControl: TimeControl | null; 
}

export interface SettingsState {
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  showLegalMoves: boolean;
  showLastMove: boolean;
  animationSpeed: number; 
  boardSize: number; 
  darkMode: boolean;
}

interface GameState {
  setup: GameSetup;
  setSetup: (setup: Partial<GameSetup>) => void;

  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  boardOrientation: 'white' | 'black';
  setBoardOrientation: (o: 'white' | 'black') => void;
  flipBoard: () => void;

  settings: SettingsState;
  setSettings: (s: Partial<SettingsState>) => void;

  showSetupModal: boolean;
  setShowSetupModal: (v: boolean) => void;
  showSettingsPanel: boolean;
  setShowSettingsPanel: (v: boolean) => void;
  showGameOverModal: boolean;
  setShowGameOverModal: (v: boolean) => void;
  gameOverInfo: { reason: string; winner: string | null } | null;
  setGameOverInfo: (info: { reason: string; winner: string | null } | null) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      setup: {
        mode: 'two-player',
        player1Name: 'White',
        player2Name: 'Black',
        autoFlip: true,
        humanColor: 'white',
        engineLevel: 5,
        timeControl: { time: 600, increment: 0 },
      },
      setSetup: (partial) => set((s) => ({ setup: { ...s.setup, ...partial } })),

      isPlaying: false,
      setIsPlaying: (v) => set({ isPlaying: v }),
      boardOrientation: 'white',
      setBoardOrientation: (o) => set({ boardOrientation: o }),
      flipBoard: () => set((s) => ({ boardOrientation: s.boardOrientation === 'white' ? 'black' : 'white' })),

      settings: {
        boardTheme: boardThemes[0],
        showCoordinates: true,
        showLegalMoves: true,
        showLastMove: true,
        animationSpeed: 200,
        boardSize: 560,
        darkMode: false,
      },
      setSettings: (partial) => set((s) => ({ settings: { ...s.settings, ...partial } })),

      showSetupModal: true,
      setShowSetupModal: (v) => set({ showSetupModal: v }),
      showSettingsPanel: false,
      setShowSettingsPanel: (v) => set({ showSettingsPanel: v }),
      showGameOverModal: false,
      setShowGameOverModal: (v) => set({ showGameOverModal: v }),
      gameOverInfo: null,
      setGameOverInfo: (info) => set({ gameOverInfo: info }),
    }),
    {
      name: 'chess-settings',
      partialize: (state) => ({ settings: state.settings, setup: state.setup }),
    }
  )
);
