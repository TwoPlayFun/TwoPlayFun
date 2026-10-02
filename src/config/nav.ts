export type NavItem = { href: string; label: string; hint: string; glyph: "tri" | "ring" | "cross" | "box" };

export const SITE_NAV: NavItem[] = [
  { href: "/lobby", label: "Lobby", hint: "Open a room, find player 2", glyph: "tri" },
  { href: "/arcade", label: "Arcade", hint: "Mini-games while you wait", glyph: "ring" },
  { href: "/docs", label: "Manual", hint: "How a co-op pair works", glyph: "box" },
  { href: "/draw", label: "Draw", hint: "Pre-launch $TWOPLAY lottery", glyph: "cross" },
];
