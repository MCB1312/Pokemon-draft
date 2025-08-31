export type StatKey =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export interface Mon {
  id: number;
  name: string;
  sprite: string | null;
  stats: Record<StatKey, number>;
}

export const STATS: StatKey[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export const STAT_LABEL: Record<StatKey, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

// National Dex ranges per gen (matches PokéAPI order)
export const GENS = [
  { label: "Gen 1", start: 1, end: 151 },
  { label: "Gen 2", start: 152, end: 251 },
  { label: "Gen 3", start: 252, end: 386 },
  { label: "Gen 4", start: 387, end: 493 },
  { label: "Gen 5", start: 494, end: 649 },
  { label: "Gen 6", start: 650, end: 721 },
  { label: "Gen 7", start: 722, end: 809 },
  { label: "Gen 8", start: 810, end: 905 },
  { label: "Gen 9", start: 906, end: 1025 },
] as const;

// Game modes
export type GameMode = "normal" | "minimal" | "blind";

export const MODE_LABEL: Record<GameMode, string> = {
  normal: "Max Score",
  minimal: "Minimal Stat",
  blind: "Blind Draft",
};
