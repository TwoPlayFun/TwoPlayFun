// Plain module (no "use client") so server components can read these values.

export type Side = "eth" | "token";
export type Difficulty = "casual" | "standard" | "expert";

export const DIFFICULTY: Record<Difficulty, { label: string; range: string; note: string; bars: number[] }> = {
  casual: { label: "Casual", range: "Full range", note: "Always in range. Smallest fee share per trade, gentlest swings.", bars: [1, 1, 1, 1, 1, 1, 1] },
  standard: { label: "Standard", range: "Wide band", note: "A broad band around the current price. Balanced fees and risk.", bars: [0, 1, 1, 1, 1, 1, 0] },
  expert: { label: "Expert", range: "Tight band", note: "A narrow band. Most fees per trade, but it can drift out of range and stop earning.", bars: [0, 0, 1, 1, 1, 0, 0] },
};

export const SIDE_LABEL: Record<Side, { player: string; asset: string }> = {
  eth: { player: "1P", asset: "ETH" },
  token: { player: "2P", asset: "$TWOPLAY" },
};

export const otherSide = (side: Side): Side => (side === "eth" ? "token" : "eth");

/** sessionStorage key that marks the boot screen as already shown. */
export const BOOT_KEY = "twoplay.booted";

export const MEMORY_BLOCKS = 15;
