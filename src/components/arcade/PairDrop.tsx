"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * PAIR DROP: catch one ETH crystal and one coin in a row to form a pair.
 * Two of the same in a row spills the first; a rug costs a life.
 * Internal resolution 320x240, scaled up with hard pixels, flat-shaded
 * low-poly sprites and an ordered-dither sky, like a late-90s console game.
 */

const W = 320;
const H = 240;
const FLOOR = 214;
const TRAY_W = 38;
const BEST_KEY = "twoplay.arcade.best";

type Kind = "eth" | "coin" | "rug";
type Item = { x: number; y: number; vy: number; kind: Kind; spin: number };
type Pop = { x: number; y: number; text: string; t: number; color: string };
type Phase = "title" | "play" | "pause" | "over";

type Game = {
  phase: Phase;
  x: number;
  target: number | null;
  left: boolean;
  right: boolean;
  items: Item[];
  pops: Pop[];
  spawnIn: number;
  score: number;
  lives: number;
  combo: number;
  pairs: number;
  holding: Kind | null;
  flash: number;
  time: number;
  scroll: number;
};

const fresh = (phase: Phase = "title"): Game => ({
  phase,
  x: W / 2,
  target: null,
  left: false,
  right: false,
  items: [],
  pops: [],
  spawnIn: 0.6,
  score: 0,
  lives: 3,
  combo: 1,
  pairs: 0,
  holding: null,
  flash: 0,
  time: 0,
  scroll: 0,
});

const level = (g: Game) => 1 + Math.floor(g.score / 300);

/* 4x4 Bayer matrix for the dithered sky */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function makeSky(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const top = [64, 70, 92];
  const bottom = [188, 186, 178];
  const levels = 6;
  for (let y = 0; y < H; y++) {
    const t = Math.min(1, y / 150);
    for (let x = 0; x < W; x++) {
      const threshold = BAYER[(y % 4) * 4 + (x % 4)] / 16;
      const i = (y * W + x) * 4;
      for (let k = 0; k < 3; k++) {
        const v = top[k] + (bottom[k] - top[k]) * t;
        const step = 255 / levels;
        const q = Math.floor(v / step + threshold) * step;
        img.data[i + k] = Math.max(0, Math.min(255, q * 0.6 + v * 0.4));
      }
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function poly(ctx: CanvasRenderingContext2D, pts: number[], fill: string) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawItem(ctx: CanvasRenderingContext2D, it: Item) {
  const { x, y } = it;
  const s = Math.cos(it.spin);
  if (it.kind === "eth") {
    // faceted octahedron; the visible width breathes with the spin
    const w = 7 + 2 * Math.abs(s);
    poly(ctx, [x, y - 11, x - w, y, x, y + 2], "#e9ecf3");
    poly(ctx, [x, y - 11, x + w, y, x, y + 2], "#9aa3bd");
    poly(ctx, [x - w, y, x, y + 2, x, y + 11], "#7d86a3");
    poly(ctx, [x + w, y, x, y + 2, x, y + 11], "#4b5370");
  } else if (it.kind === "coin") {
    const w = 3 + 6 * Math.abs(s);
    poly(ctx, [x - w, y - 5, x, y - 9, x + w, y - 5, x + w, y + 5, x, y + 9, x - w, y + 5], "#d9a441");
    poly(ctx, [x - w, y - 5, x, y - 9, x, y, x - w, y + 5], "#f2cf7c");
    poly(ctx, [x + w, y + 5, x, y + 9, x, y], "#9c6f1c");
    if (w > 5) {
      ctx.fillStyle = "#6e4c10";
      ctx.fillRect(x - 1, y - 4, 2, 8);
    }
  } else {
    // rug: a jagged dark shard
    poly(ctx, [x, y - 10, x + 9, y - 2, x + 4, y + 1, x + 10, y + 9, x, y + 5, x - 10, y + 9, x - 4, y + 1, x - 9, y - 2], "#7a1f1a");
    poly(ctx, [x, y - 10, x - 9, y - 2, x - 4, y + 1, x, y + 5], "#c2463a");
  }
}

function drawTray(ctx: CanvasRenderingContext2D, x: number, holding: Kind | null) {
  const half = TRAY_W / 2;
  const y = FLOOR;
  // pale half (1P) and charcoal half (2P), the mark's two sides
  poly(ctx, [x - half, y, x - 1, y, x - 1, y + 9, x - half + 4, y + 9], "#ecebe6");
  poly(ctx, [x + 1, y, x + half, y, x + half - 4, y + 9, x + 1, y + 9], "#2b2d34");
  ctx.fillStyle = "#8f8d86";
  ctx.fillRect(x - half, y - 1, TRAY_W, 1);
  // what the tray is holding while it waits for its partner
  if (holding) drawItem(ctx, { x, y: y - 9, vy: 0, kind: holding, spin: 0 });
}

export function PairDrop({ onScore }: { onScore?: (score: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(fresh());
  const [phase, setPhase] = useState<Phase>("title");
  const [best, setBest] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      // no storage: best stays at 0
    }
  }, []);

  const setGamePhase = useCallback((p: Phase) => {
    game.current.phase = p;
    setPhase(p);
  }, []);

  const start = useCallback(() => {
    const g = game.current;
    if (g.phase === "play") return setGamePhase("pause");
    if (g.phase === "pause") return setGamePhase("play");
    game.current = fresh("play");
    setScore(0);
    setPhase("play");
    canvas.current?.focus({ preventScroll: true });
  }, [setGamePhase]);

  // main loop
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const sky = makeSky();
    const pixelFont = getComputedStyle(document.documentElement).getPropertyValue("--font-silk").trim() || "monospace";
    let raf = 0;
    let last = performance.now();

    const text = (s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "left") => {
      ctx.font = `${size}px ${pixelFont}`;
      ctx.textAlign = align;
      ctx.fillStyle = "#14151a";
      ctx.fillText(s, x + 1, y + 1);
      ctx.fillStyle = color;
      ctx.fillText(s, x, y);
    };

    const step = (dt: number) => {
      const g = game.current;
      g.time += dt;
      g.scroll = (g.scroll + dt * (20 + level(g) * 6)) % 16;
      if (g.flash > 0) g.flash -= dt;
      for (const p of g.pops) p.t -= dt;
      g.pops = g.pops.filter((p) => p.t > 0);
      if (g.phase !== "play") return;

      // movement: keys first, then a pointer target
      const speed = 170;
      if (g.left) g.x -= speed * dt;
      if (g.right) g.x += speed * dt;
      if (!g.left && !g.right && g.target !== null) {
        const d = g.target - g.x;
        g.x += Math.sign(d) * Math.min(Math.abs(d), speed * 1.4 * dt);
      }
      g.x = Math.max(TRAY_W / 2, Math.min(W - TRAY_W / 2, g.x));

      // spawning
      const lv = level(g);
      g.spawnIn -= dt;
      if (g.spawnIn <= 0) {
        g.spawnIn = Math.max(0.32, 0.95 - lv * 0.07) * (0.7 + Math.random() * 0.6);
        const r = Math.random();
        const rugChance = Math.min(0.32, 0.16 + lv * 0.02);
        const kind: Kind = r < rugChance ? "rug" : r < rugChance + (1 - rugChance) / 2 ? "eth" : "coin";
        g.items.push({ x: 14 + Math.random() * (W - 28), y: -12, vy: 55 + lv * 12 + Math.random() * 25, kind, spin: Math.random() * 6 });
      }

      // falling and catching
      const keep: Item[] = [];
      for (const it of g.items) {
        it.y += it.vy * dt;
        it.spin += dt * 4;
        const caught = it.y >= FLOOR - 8 && it.y <= FLOOR + 6 && Math.abs(it.x - g.x) <= TRAY_W / 2 + 4;
        if (caught) {
          if (it.kind === "rug") {
            g.lives -= 1;
            g.combo = 1;
            g.holding = null;
            g.flash = 0.25;
            g.pops.push({ x: it.x, y: FLOOR - 16, text: "RUGGED", t: 0.9, color: "#ff7a6b" });
            if (g.lives <= 0) {
              g.phase = "over";
              setPhase("over");
              setScore(g.score);
              onScore?.(g.score);
              setBest((b) => {
                const nb = Math.max(b, g.score);
                try {
                  window.localStorage.setItem(BEST_KEY, String(nb));
                } catch {
                  // ignore
                }
                return nb;
              });
            }
          } else if (g.holding && g.holding !== it.kind) {
            const gain = 50 * g.combo;
            g.score += gain;
            g.pairs += 1;
            g.combo = Math.min(g.combo + 1, 8);
            g.holding = null;
            g.pops.push({ x: it.x, y: FLOOR - 18, text: `PAIR +${gain}`, t: 1, color: "#9df0b4" });
          } else {
            if (g.holding === it.kind) {
              g.combo = 1;
              g.pops.push({ x: it.x, y: FLOOR - 18, text: "SPILL", t: 0.7, color: "#f2cf7c" });
            } else {
              g.score += 10;
            }
            g.holding = it.kind;
          }
          continue;
        }
        if (it.y < H + 16) keep.push(it);
      }
      g.items = keep;
      setScore(g.score);
    };

    const render = () => {
      const g = game.current;
      ctx.drawImage(sky, 0, 0);
      // perspective floor grid
      const horizon = 132;
      ctx.strokeStyle = "rgba(40,42,50,0.35)";
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 6, horizon);
        ctx.lineTo(W / 2 + i * 60, H);
        ctx.stroke();
      }
      for (let k = 0; k < 8; k++) {
        const t = ((k * 16 + g.scroll) / 128) ** 2;
        const y = Math.round(horizon + t * (H - horizon));
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(W, y + 0.5);
        ctx.stroke();
      }
      for (const it of g.items) drawItem(ctx, it);
      drawTray(ctx, g.x, g.holding);
      for (const p of g.pops) text(p.text, p.x, p.y - (1 - p.t) * 14, 8, p.color, "center");

      // HUD
      text(`SCORE ${String(g.score).padStart(5, "0")}`, 8, 14, 8, "#f2f2ee");
      text(`x${g.combo}`, 8, 26, 8, g.combo > 1 ? "#9df0b4" : "#c9cbd3");
      text(`LV ${level(g)}`, W / 2, 14, 8, "#f2f2ee", "center");
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < g.lives ? "#ecebe6" : "#4a4c55";
        ctx.fillRect(W - 14 - i * 10, 7, 7, 7);
      }

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(204,63,53,${g.flash * 1.6})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (g.phase !== "play") {
        ctx.fillStyle = "rgba(14,15,19,0.72)";
        ctx.fillRect(0, 0, W, H);
        if (g.phase === "title") {
          text("PAIR DROP", W / 2, 92, 16, "#f2f2ee", "center");
          text("CATCH ETH + COIN = PAIR", W / 2, 118, 8, "#c9cbd3", "center");
          text("SAME TWICE SPILLS. RUGS BITE.", W / 2, 132, 8, "#c9cbd3", "center");
          if (Math.floor(g.time * 2) % 2 === 0) text("PRESS START", W / 2, 166, 8, "#9df0b4", "center");
        } else if (g.phase === "pause") {
          text("PAUSED", W / 2, 120, 16, "#f2f2ee", "center");
        } else {
          text("GAME OVER", W / 2, 96, 16, "#ff7a6b", "center");
          text(`SCORE ${g.score}   PAIRS ${g.pairs}`, W / 2, 122, 8, "#f2f2ee", "center");
          if (Math.floor(g.time * 2) % 2 === 0) text("PRESS START", W / 2, 160, 8, "#9df0b4", "center");
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (document.hidden && game.current.phase === "play") setGamePhase("pause");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [onScore, setGamePhase]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const g = game.current;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        g.left = down;
        if (g.phase === "play") e.preventDefault();
      } else if (k === "arrowright" || k === "d") {
        g.right = down;
        if (g.phase === "play") e.preventDefault();
      } else if (down && (k === " " || k === "enter" || k === "p")) {
        // Space and Enter only drive the game when the page is not focused on a control.
        if (tag === "BUTTON" || tag === "A") return;
        if (k === "p" && g.phase !== "play" && g.phase !== "pause") return;
        e.preventDefault();
        start();
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [start]);

  // pointer drag on the screen steers the tray
  const toGameX = (clientX: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  };
  const onPointer = (e: React.PointerEvent) => {
    if (e.type === "pointerdown" && game.current.phase !== "play") {
      start();
      return;
    }
    if (e.buttons || e.pointerType === "mouse") game.current.target = toGameX(e.clientX);
  };

  const hold = (dir: "left" | "right", on: boolean) => () => {
    game.current[dir] = on;
  };
  const padBtn = "btn !min-h-[56px] !w-[52px] touch-none select-none !p-0 text-[18px] sm:!w-[64px]";

  return (
    <div>
      <div className="crt overflow-hidden p-2 sm:p-3">
        <canvas
          ref={canvas}
          width={W}
          height={H}
          tabIndex={0}
          aria-label="Pair Drop game screen. Arrow keys or A and D move, Space starts and pauses."
          onPointerDown={onPointer}
          onPointerMove={onPointer}
          onPointerLeave={() => (game.current.target = null)}
          className="block aspect-[4/3] w-full touch-none rounded-[6px] outline-none [image-rendering:pixelated]"
          data-game
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" aria-label="Move left" className={padBtn} onPointerDown={hold("left", true)} onPointerUp={hold("left", false)} onPointerLeave={hold("left", false)} onPointerCancel={hold("left", false)}>
            ◀
          </button>
          <button type="button" aria-label="Move right" className={padBtn} onPointerDown={hold("right", true)} onPointerUp={hold("right", false)} onPointerLeave={hold("right", false)} onPointerCancel={hold("right", false)}>
            ▶
          </button>
        </div>
        <div className="text-center">
          <p className="num text-[20px] leading-none" data-score>
            {String(score).padStart(5, "0")}
          </p>
          <p className="label mt-1">Best {best}</p>
        </div>
        <button type="button" className="btn btn-dark !min-h-[56px] !px-4 sm:!px-[18px]" onClick={start} data-start>
          {phase === "play" ? "Pause" : phase === "pause" ? "Resume" : "Start"}
        </button>
      </div>
    </div>
  );
}
