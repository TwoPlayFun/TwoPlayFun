"use client";

import { useSyncExternalStore } from "react";

/*
 * Pre-launch lobby. Rooms live in this browser's localStorage and every open
 * tab hears about changes over a BroadcastChannel, so two tabs (or two
 * wallets in one browser) can play both sides of a pair. Nothing is sent to
 * a server and nothing is deposited: matching across devices opens with the
 * lobby contract at launch.
 */

import { MEMORY_BLOCKS, otherSide, type Difficulty, type Side } from "@/config/game";
export { DIFFICULTY, MEMORY_BLOCKS, SIDE_LABEL, otherSide, type Difficulty, type Side } from "@/config/game";


export type Seat = {
  address: string;
  side: Side;
  /** Pledged amount as typed, a decimal string. */
  amount: string;
  at: number;
};

export type Room = {
  id: string;
  /** Short code players can read out to each other, e.g. "K7Q2". */
  code: string;
  name: string;
  difficulty: Difficulty;
  createdAt: number;
  host: Seat;
  guest: Seat | null;
};

const KEY = "twoplay.rooms.v1";
const CHANNEL = "twoplay-rooms";
const TTL_MS = 24 * 60 * 60 * 1000;


let cache: Room[] | null = null;
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;

function parse(raw: string | null): Room[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Room[];
    const now = Date.now();
    return Array.isArray(list) ? list.filter((r) => r && r.id && r.host && now - r.createdAt < TTL_MS) : [];
  } catch {
    return [];
  }
}

function load(): Room[] {
  try {
    return parse(window.localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

function emit() {
  for (const l of listeners) l();
}

function reload() {
  cache = load();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    cache = load();
    window.addEventListener("storage", onStorage);
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = reload;
    } catch {
      channel = null;
    }
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      channel?.close();
      channel = null;
    }
  };
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key === KEY) reload();
}

const EMPTY: Room[] = [];
function snapshot() {
  cache ??= load();
  return cache;
}

function save(next: Room[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: rooms still work in this tab until it closes.
  }
  try {
    const c = channel ?? new BroadcastChannel(CHANNEL);
    c.postMessage("changed");
    if (c !== channel) c.close();
  } catch {
    // No BroadcastChannel: other tabs catch up through the storage event.
  }
  emit();
}

export function useRooms() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function roomsOf(rooms: Room[], address: string | null) {
  if (!address) return [];
  return rooms.filter((r) => same(r.host.address, address) || (r.guest && same(r.guest.address, address)));
}

export function createRoom(input: { address: string; side: Side; amount: string; difficulty: Difficulty; name: string }): Room {
  const rooms = load();
  if (rooms.length >= MEMORY_BLOCKS) throw new Error("The memory card is full: all 15 blocks hold a room. Join one or wait for a room to close.");
  if (rooms.some((r) => same(r.host.address, input.address) && !r.guest)) throw new Error("This wallet already hosts an open room. Close it before opening another.");
  const room: Room = {
    id: randomCode(12),
    code: randomCode(4),
    name: input.name.trim().slice(0, 18) || "Open room",
    difficulty: input.difficulty,
    createdAt: Date.now(),
    host: { address: input.address, side: input.side, amount: input.amount, at: Date.now() },
    guest: null,
  };
  save([...rooms, room]);
  return room;
}

export function joinRoom(id: string, input: { address: string; amount: string }) {
  const rooms = load();
  const room = rooms.find((r) => r.id === id);
  if (!room) throw new Error("That room has closed.");
  if (room.guest) throw new Error("Both seats in that room are already taken.");
  if (same(room.host.address, input.address)) throw new Error("You are already in this room. Player 2 needs a different wallet.");
  room.guest = { address: input.address, side: otherSide(room.host.side), amount: input.amount, at: Date.now() };
  save(rooms);
}

export function leaveRoom(id: string, address: string) {
  const rooms = load();
  const room = rooms.find((r) => r.id === id);
  if (!room) return;
  if (same(room.host.address, address)) {
    // The host leaving closes the room; a waiting guest becomes the host of a fresh one.
    const rest = rooms.filter((r) => r.id !== id);
    if (room.guest) rest.push({ ...room, host: room.guest, guest: null, createdAt: Date.now() });
    save(rest);
  } else if (room.guest && same(room.guest.address, address)) {
    room.guest = null;
    save(rooms);
  }
}

/* ---------- amounts ---------- */

/** Parses a decimal string into base units; throws a readable error. */
export function parseAmount(value: string, decimals = 18): bigint {
  const v = value.trim();
  if (!v) throw new Error("Enter an amount.");
  if (!/^\d*\.?\d*$/.test(v) || v === ".") throw new Error("Use digits and one decimal point, e.g. 0.25");
  const [whole, frac = ""] = v.split(".");
  if (frac.length > decimals) throw new Error(`At most ${decimals} decimals.`);
  const units = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt((frac + "0".repeat(decimals)).slice(0, decimals) || "0");
  if (units <= 0n) throw new Error("The amount must be more than zero.");
  return units;
}
