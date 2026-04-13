"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";

const SWIPE_PX_PER_STEP = 14;
const SUBMIT_SWIPE_MIN = 72;

type Props = {
  min: number;
  max: number;
  value: number;
  onValueChange: (n: number) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function SwipePlayfield({
  min,
  max,
  value,
  onValueChange,
  onSubmit,
  disabled,
}: Props) {
  const accDy = useRef(0);
  const originX = useRef(0);
  const startY = useRef(0);
  const [active, setActive] = useState(false);

  const clamp = useCallback(
    (n: number) => Math.min(max, Math.max(min, n)),
    [min, max],
  );

  const bump = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      const next = clamp(value + delta);
      if (next !== value) onValueChange(next);
    },
    [clamp, onValueChange, value],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setActive(true);
    accDy.current = 0;
    originX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || !active) return;
    const dy = e.clientY - startY.current;
    startY.current = e.clientY;

    accDy.current += dy;

    // Vertical: swipe up (negative dy) increases guess
    while (accDy.current <= -SWIPE_PX_PER_STEP) {
      accDy.current += SWIPE_PX_PER_STEP;
      bump(1);
    }
    while (accDy.current >= SWIPE_PX_PER_STEP) {
      accDy.current -= SWIPE_PX_PER_STEP;
      bump(-1);
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    setActive(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const dx = e.clientX - originX.current;
    const dy = accDy.current;
    if (
      dx >= SUBMIT_SWIPE_MIN &&
      Math.abs(dx) > Math.abs(dy) &&
      dx > 0
    ) {
      onSubmit();
    }
    accDy.current = 0;
  };

  return (
    <div
      role="application"
      aria-label="Guess adjustment area. Swipe vertically to change the number, swipe right to submit."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={[
        "relative flex min-h-[min(52vh,420px)] w-full touch-none select-none flex-col items-center justify-center overflow-hidden rounded-2xl border-2",
        "border-[#00f5ff]/40 bg-[linear-gradient(165deg,rgba(6,8,22,0.95)_0%,rgba(12,6,28,0.92)_50%,rgba(4,18,32,0.94)_100%)]",
        "shadow-[0_0_40px_rgba(0,245,255,0.12),inset_0_0_80px_rgba(255,0,170,0.06)]",
        active ? "ring-2 ring-[#ff00aa]/50" : "",
        disabled ? "pointer-events-none opacity-50" : "cursor-ns-resize",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 245, 255, 0.4) 2px,
            rgba(0, 245, 255, 0.4) 3px
          )`,
        }}
      />
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#c8ff00]/15" />
      <p className="relative z-[1] px-6 text-center font-mono text-[11px] tracking-[0.35em] text-[#00f5ff]/80">
        SWIPE ↑↓ ADJUST · SWIPE → SUBMIT
      </p>
      <div className="relative z-[1] mt-4 font-[family-name:var(--font-display)] text-7xl font-bold tabular-nums tracking-tight text-[#f0fcff] [text-shadow:0_0_24px_rgba(0,245,255,0.55),0_0_60px_rgba(255,0,170,0.25)] sm:text-8xl">
        {value}
      </div>
      <p className="relative z-[1] mt-6 font-mono text-xs text-[#c8ff00]/70">
        RANGE {min} — {max}
      </p>
    </div>
  );
}
