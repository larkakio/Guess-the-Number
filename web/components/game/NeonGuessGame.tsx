"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Feedback,
  getLevelConfig,
  LEVELS,
  randomIntInclusive,
} from "@/lib/game-logic";
import { SwipePlayfield } from "./SwipePlayfield";

const STORAGE_KEY = "neon-cipher-guess-v1";

type Persisted = { levelIndex: number };

function loadProgress(): Persisted {
  if (typeof window === "undefined") return { levelIndex: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { levelIndex: 0 };
    const p = JSON.parse(raw) as Persisted;
    return {
      levelIndex: Math.min(
        Math.max(0, Number(p.levelIndex) || 0),
        LEVELS.length - 1,
      ),
    };
  } catch {
    return { levelIndex: 0 };
  }
}

function saveProgress(levelIndex: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ levelIndex }));
  } catch {
    /* ignore */
  }
}

export function NeonGuessGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const cfg = useMemo(() => getLevelConfig(levelIndex), [levelIndex]);
  const [secret, setSecret] = useState(() =>
    randomIntInclusive(cfg.min, cfg.max),
  );
  const [attemptsLeft, setAttemptsLeft] = useState(cfg.maxAttempts);
  const [guess, setGuess] = useState(() =>
    Math.floor((cfg.min + cfg.max) / 2),
  );
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [overlay, setOverlay] = useState<
    null | "level_won" | "lost" | "all_clear"
  >(null);

  useEffect(() => {
    const p = loadProgress();
    setLevelIndex(p.levelIndex);
    setHydrated(true);
  }, []);

  const resetRoundForConfig = useCallback((nextCfg: ReturnType<typeof getLevelConfig>) => {
    setSecret(randomIntInclusive(nextCfg.min, nextCfg.max));
    setAttemptsLeft(nextCfg.maxAttempts);
    setGuess(Math.floor((nextCfg.min + nextCfg.max) / 2));
    setFeedback("idle");
    setOverlay(null);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    resetRoundForConfig(cfg);
  }, [cfg, hydrated, resetRoundForConfig]);

  const submitGuess = useCallback(() => {
    if (overlay) return;
    if (attemptsLeft <= 0) return;

    if (guess === secret) {
      setFeedback("correct");
      if (levelIndex >= LEVELS.length - 1) {
        setOverlay("all_clear");
      } else {
        setOverlay("level_won");
      }
      return;
    }

    const nextAttempts = attemptsLeft - 1;
    setAttemptsLeft(nextAttempts);
    setFeedback(guess < secret ? "low" : "high");
    if (nextAttempts === 0) {
      setOverlay("lost");
    }
  }, [guess, secret, attemptsLeft, overlay, levelIndex]);

  useEffect(() => {
    if (feedback === "idle" || feedback === "correct") return;
    const t = window.setTimeout(() => setFeedback("idle"), 2200);
    return () => clearTimeout(t);
  }, [feedback]);

  const advanceLevel = () => {
    const next = levelIndex + 1;
    setLevelIndex(next);
    saveProgress(next);
    setOverlay(null);
  };

  const retryLevel = () => {
    resetRoundForConfig(cfg);
  };

  const feedbackText =
    feedback === "low"
      ? "TOO LOW"
      : feedback === "high"
        ? "TOO HIGH"
        : feedback === "correct"
          ? "LOCKED IN"
          : "—";

  return (
    <div className="flex w-full max-w-lg flex-col gap-5 px-4 pb-8 pt-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.4em] text-[#ff00aa]/90">
            NEON CIPHER
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-[#e8fbff]">
            Guess the Number
          </h1>
        </div>
        <div className="rounded-lg border border-[#00f5ff]/35 bg-black/40 px-3 py-2 text-right font-mono text-xs text-[#c8ff00]">
          <div>SECTOR {cfg.level}</div>
          <div className="text-[#00f5ff]/80">TRIES {attemptsLeft}</div>
        </div>
      </header>

      <SwipePlayfield
        min={cfg.min}
        max={cfg.max}
        value={guess}
        onValueChange={setGuess}
        onSubmit={submitGuess}
        disabled={!!overlay}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={[
            "min-h-[3rem] flex-1 rounded-xl border px-4 py-3 font-mono text-sm tracking-wide",
            feedback === "low"
              ? "border-[#c8ff00]/50 text-[#c8ff00] shadow-[0_0_20px_rgba(200,255,0,0.15)]"
              : feedback === "high"
                ? "border-[#ff00aa]/50 text-[#ff99dd] shadow-[0_0_20px_rgba(255,0,170,0.15)]"
                : feedback === "correct"
                  ? "border-[#00f5ff]/60 text-[#00f5ff] shadow-[0_0_24px_rgba(0,245,255,0.25)]"
                  : "border-white/10 text-[#9fb8c9]",
          ].join(" ")}
        >
          SIGNAL · {feedbackText}
        </div>
        <button
          type="button"
          onClick={submitGuess}
          disabled={!!overlay}
          className="shrink-0 rounded-xl border-2 border-[#00f5ff]/60 bg-[linear-gradient(90deg,rgba(0,245,255,0.15),rgba(255,0,170,0.12))] px-6 py-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-[#e8fbff] shadow-[0_0_28px_rgba(0,245,255,0.25)] transition hover:border-[#c8ff00]/70 hover:shadow-[0_0_32px_rgba(200,255,0,0.2)] disabled:opacity-40"
        >
          COMMIT GUESS
        </button>
      </div>

      {overlay === "level_won" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl border border-[#00f5ff]/40 bg-[#070714]/95 p-6 text-center shadow-[0_0_60px_rgba(0,245,255,0.2)]">
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.25em] text-[#ff00aa]">
              SECTOR CLEARED
            </p>
            <p className="mt-2 font-mono text-sm text-[#9fb8c9]">
              The key matched. Next sector has a wider band and sharper noise.
            </p>
            <button
              type="button"
              onClick={advanceLevel}
              className="mt-6 w-full rounded-xl border border-[#c8ff00]/50 bg-[#c8ff00]/10 py-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-widest text-[#c8ff00]"
            >
              ENTER NEXT SECTOR
            </button>
          </div>
        </div>
      )}

      {overlay === "lost" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl border border-[#ff00aa]/35 bg-[#070714]/95 p-6 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.3em] text-[#ff6699]">
              SIGNAL LOST
            </p>
            <p className="mt-2 font-mono text-sm text-[#9fb8c9]">
              Attempts exhausted. Recalibrate and try again.
            </p>
            <button
              type="button"
              onClick={retryLevel}
              className="mt-6 w-full rounded-xl border border-[#00f5ff]/50 py-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-widest text-[#00f5ff]"
            >
              RETRY SECTOR
            </button>
          </div>
        </div>
      )}

      {overlay === "all_clear" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl border border-[#c8ff00]/40 bg-[#070714]/95 p-6 text-center shadow-[0_0_80px_rgba(200,255,0,0.15)]">
            <p className="font-[family-name:var(--font-display)] text-lg tracking-[0.25em] text-[#c8ff00]">
              ALL SECTORS OPEN
            </p>
            <p className="mt-2 font-mono text-sm text-[#9fb8c9]">
              You cleared every band. The grid goes quiet — for now.
            </p>
            <button
              type="button"
              onClick={() => {
                setLevelIndex(0);
                saveProgress(0);
                setOverlay(null);
                resetRoundForConfig(getLevelConfig(0));
              }}
              className="mt-6 w-full rounded-xl border border-[#00f5ff]/50 py-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-widest text-[#00f5ff]"
            >
              RESET RUN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
