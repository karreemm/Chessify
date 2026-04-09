# Chessify

Chessify is a browser-based chess platform. It supports local two-player matches and games against Stockfish.

## Features Supported

1. Two game modes:
   - Two-player local mode
   - vs Computer mode (Stockfish)
2. Difficulty slider for computer games.
3. Time controls:
   - Preset formats (bullet, blitz, rapid, classical)
   - Custom time + increment
   - No-time-limit mode
4. Move history with navigation and copy-to-clipboard.
5. Captured pieces and material advantage display.
6. Settings panel:
   - Board themes
   - Show coordinates
   - Show legal moves
   - Show last move
   - Animation speed
   - Board size
   - Light/dark appearance

## Tech Stack

1. React + TypeScript + Vite
2. React Router for navigation
3. chess.js for chess rules
4. react-chessboard for board UI
5. Zustand for app state and saved settings
6. Shadcn UI for styling/components
8. Stockfish engine running in the browser (worker script)

## Run Locally

```bash
npm install
npm run dev
```
