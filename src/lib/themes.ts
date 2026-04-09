export interface BoardTheme {
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightColor: string;
}

export const boardThemes: BoardTheme[] = [
  {
    name: "Classic Walnut",
    lightSquare: "#E8D5B7",
    darkSquare: "#8B5A2B",
    highlightColor: "#D4A574",
  },
  {
    name: "Dark Rosewood",
    lightSquare: "#E6D2B5",
    darkSquare: "#5D4037",
    highlightColor: "#A1887F",
  },
  {
    name: "Ebony",
    lightSquare: "#D7CCC8",
    darkSquare: "#3E2723",
    highlightColor: "#8D6E63",
  },
  {
    name: "Natural Oak",
    lightSquare: "#F5F5DC",
    darkSquare: "#D2B48C",
    highlightColor: "#DEB887",
  },
  {
    name: "Mahogany",
    lightSquare: "#F5DEB3",
    darkSquare: "#4A0404",
    highlightColor: "#CD853F",
  },
  {
    name: "Classic",
    lightSquare: "#F0D9B5",
    darkSquare: "#B58863",
    highlightColor: "#F7EC5E",
  },
];

export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_UNICODE: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};

export const PIECE_ORDER = ["p", "n", "b", "r", "q"];

export const TIME_CONTROLS = {
  bullet: [
    { label: "1 min", time: 60, increment: 0 },
    { label: "1+1", time: 60, increment: 1 },
    { label: "2+1", time: 120, increment: 1 },
  ],
  blitz: [
    { label: "3 min", time: 180, increment: 0 },
    { label: "3+2", time: 180, increment: 2 },
    { label: "5 min", time: 300, increment: 0 },
    { label: "5+3", time: 300, increment: 3 },
  ],
  rapid: [
    { label: "10 min", time: 600, increment: 0 },
    { label: "15+10", time: 900, increment: 10 },
    { label: "30 min", time: 1800, increment: 0 },
  ],
  classical: [
    { label: "60 min", time: 3600, increment: 0 },
    { label: "90+30", time: 5400, increment: 30 },
  ],
};

export const DIFFICULTY_LABELS: { label: string; range: [number, number] }[] = [
  { label: "Beginner", range: [1, 4] },
  { label: "Intermediate", range: [5, 9] },
  { label: "Advanced", range: [10, 14] },
  { label: "Expert", range: [15, 18] },
  { label: "Master", range: [19, 20] },
];

export function getDifficultyLabel(level: number): string {
  return (
    DIFFICULTY_LABELS.find((d) => level >= d.range[0] && level <= d.range[1])
      ?.label || "Unknown"
  );
}

export function getThinkTime(level: number): number {
  if (level <= 4) return 100;
  if (level <= 9) return 500;
  if (level <= 14) return 1500;
  if (level <= 18) return 3000;
  return 5000;
}
