export type LevelConfig = {
  level: number;
  min: number;
  max: number;
  maxAttempts: number;
};

/** Tunable level progression: wider ranges and tighter attempts on higher levels. */
export const LEVELS: LevelConfig[] = [
  { level: 1, min: 1, max: 50, maxAttempts: 7 },
  { level: 2, min: 1, max: 100, maxAttempts: 7 },
  { level: 3, min: 1, max: 200, maxAttempts: 6 },
];

export function getLevelConfig(index: number): LevelConfig {
  const i = Math.min(Math.max(index, 0), LEVELS.length - 1);
  return LEVELS[i]!;
}

export function randomIntInclusive(min: number, max: number): number {
  const range = max - min + 1;
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  const hi = buf[0] ?? 0;
  const lo = buf[1] ?? 0;
  const combined = hi * 4294967296 + lo;
  return min + (combined % range);
}

export type Feedback = "idle" | "low" | "high" | "correct";
