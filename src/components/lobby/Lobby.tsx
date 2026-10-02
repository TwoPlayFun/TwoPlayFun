"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BRAND, CHAIN, TOKEN, shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectButton } from "@/components/wallet/WalletButton";
import { CrossGlyph, Hint, RingGlyph, TriGlyph } from "@/components/Glyphs";
import { Kv, Led, RangeBars, Seg } from "@/components/ui";
import { formatEth, formatUnits } from "@/lib/rpc";
import {
  DIFFICULTY,
  MEMORY_BLOCKS,
  SIDE_LABEL,
  createRoom,
  joinRoom,
  leaveRoom,
  otherSide,
  parseAmount,
  roomsOf,
  useRooms,
  type Difficulty,
  type Room,
  type Side,
} from "@/lib/rooms";

const same = (a?: string | null, b?: string | null) => Boolean(a && b && a.toLowerCase() === b.toLowerCase());

/**
 * Checks a pledged amount against what the wallet really holds on Robinhood
 * Chain. ETH is always checkable; the token only once its address is public.
 */
function useAmountCheck(side: Side, amount: string) {
  const { balanceWei, tokenWei } = useWallet();
  return useMemo(() => {
    if (!amount.trim()) return { ok: false, msg: null as string | null };
    let units: bigint;
    try {
      units = parseAmount(amount, 18);
    } catch (e) {
      return { ok: false, msg: (e as Error).message };
    }
    if (side === "eth") {
      if (balanceWei === null) return { ok: false, msg: `Reading your ${CHAIN.nativeSymbol} balance on ${CHAIN.name}…` };
      if (units > balanceWei) return { ok: false, msg: `More than this wallet holds on ${CHAIN.name} (${formatEth("0x" + balanceWei.toString(16))} ETH).` };
      return { ok: true, msg: null };
    }
    if (TOKEN.isLive) {
      if (tokenWei === null) return { ok: false, msg: `Reading your ${BRAND.symbol} balance…` };
      if (units > tokenWei) return { ok: false, msg: `More than this wallet holds (${formatUnits(tokenWei, TOKEN.decimals)} ${BRAND.symbol}).` };
    }
    return { ok: true, msg: null };
  }, [side, amount, balanceWei, tokenWei]);
}

function BalanceLine({ side }: { side: Side }) {
  const { balance, tokenWei, refreshBalances } = useWallet();
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
      {side === "eth" ? (
        <span>
          Wallet on {CHAIN.name}: <span className="num text-ink" data-eth-balance>{balance === null ? "…" : `${balance} ETH`}</span>
        </span>
      ) : TOKEN.isLive ? (
        <span>
          Wallet: <span className="num text-ink">{tokenWei === null ? "…" : `${formatUnits(tokenWei, TOKEN.decimals)} ${BRAND.symbol}`}</span>
        </span>
      ) : (
        <span>{BRAND.symbol} balance can be checked once the token address is published. Until then this is a pledge.</span>
      )}
      <button type="button" onClick={refreshBalances} className="underline underline-offset-2 hover:text-ink">
        Refresh
      </button>
    </p>
  );
}

function AmountField({ side, value, onChange }: { side: Side; value: string; onChange: (v: string) => void }) {
  const { balanceWei } = useWallet();
  return (
    <div>
      <label className="label" htmlFor={`amount-${side}`}>
        {SIDE_LABEL[side].player} brings · {SIDE_LABEL[side].asset}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={`amount-${side}`}
          className="input"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(",", "."))}
          data-amount
        />
        {side === "eth" && balanceWei !== null && balanceWei > 0n ? (
          <button type="button" className="btn btn-sm !min-h-[44px]" onClick={() => onChange(formatEth("0x" + balanceWei.toString(16), 6))}>
            Max
          </button>
        ) : null}
      </div>
      <BalanceLine side={side} />
    </div>
  );
}

/* ---------------- memory card grid ---------------- */

function MemoryCard({ rooms, selected, onSelect, me }: { rooms: Room[]; selected: string | null; onSelect: (id: string | null) => void; me: string | null }) {
  const blocks = Array.from({ length: MEMORY_BLOCKS }, (_, i) => rooms[i] ?? null);
  return (
    <div className="plate p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="label !text-ink-2">Memory card 1 · rooms</p>
        <p className="num text-[12px] text-ink-3" data-blocks-used>
          {rooms.length}/{MEMORY_BLOCKS} blocks
        </p>
      </div>
      <div className="well mt-3 grid grid-cols-3 gap-1.5 p-2 sm:grid-cols-5">
        {blocks.map((room, i) =>
          room ? (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelect(room.id)}
              aria-pressed={selected === room.id}
              data-room={room.code}
              className={`relative flex aspect-[5/4] min-w-0 flex-col justify-between rounded-[5px] border p-1.5 text-left transition-colors ${
                selected === room.id ? "border-crs bg-screen text-phos" : "border-plastic-3 bg-[linear-gradient(180deg,#fbfaf7,#e2e0da)] text-ink hover:border-ink-2"
              }`}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="font-pixel text-[10px] leading-none">{room.code}</span>
                <Led on={Boolean(room.guest)} blink={!room.guest} />
              </span>
              <span className="flex items-center gap-1">
                {room.host.side === "eth" ? <TriGlyph className="size-3" /> : <RingGlyph className="size-3" />}
                <span className="truncate text-[10.5px] leading-tight opacity-80">{room.guest ? "Paired" : `Needs ${SIDE_LABEL[otherSide(room.host.side)].player}`}</span>
              </span>
              {roomsOf([room], me).length ? <span className="absolute -right-1 -top-1 size-2.5 rounded-full border border-paper bg-crs" title="Your room" /> : null}
            </button>
          ) : (
            <button
              key={`free-${i}`}
              type="button"
              onClick={() => onSelect(null)}
              className="flex aspect-[5/4] min-w-0 items-center justify-center rounded-[5px] border border-dashed border-plastic-3 font-pixel text-[9px] uppercase text-ink-3 hover:border-ink-3"
              aria-label="Free block: open a new room"
            >
              Free
            </button>
          ),
        )}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
        Preview lobby: rooms are saved in this browser and shared between its tabs. To try both seats, switch to a second account in your wallet and take the open seat. Matching across
        devices opens with the lobby contract.
      </p>
    </div>
  );
}

/* ---------------- new room ---------------- */

function NewRoom({ onCreated }: { onCreated: (id: string) => void }) {
  const { address } = useWallet();
  const [side, setSide] = useState<Side>("eth");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const check = useAmountCheck(side, amount);

  if (!address) {
    return (
      <div className="plate p-5 sm:p-6">
        <p className="label">New game</p>
        <h2 className="h-display mt-2 text-[28px]">Insert a wallet</h2>
        <p className="mt-3 text-[15px] text-ink-2">
          Connect a wallet to open a room or take a seat. Your address is your player tag; amounts are checked against your real balance on {CHAIN.name}.
        </p>
        <ConnectButton className="btn btn-dark mt-5 w-full sm:w-auto">Connect wallet</ConnectButton>
      </div>
    );
  }

  const submit = () => {
    setError(null);
    if (!check.ok) {
      setError(check.msg ?? "Enter an amount.");
      return;
    }
    try {
      const room = createRoom({ address, side, amount: amount.trim(), difficulty, name });
      onCreated(room.id);
      setAmount("");
      setName("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="plate p-5 sm:p-6" data-new-room>
      <p className="label">New game</p>
      <h2 className="h-display mt-2 text-[28px]">Open a room</h2>

      <div className="mt-5 grid gap-5">
        <div>
          <p className="label mb-2">Your seat</p>
          <Seg
            label="Your seat"
            value={side}
            onChange={(v) => {
              setSide(v);
              setAmount("");
            }}
            options={[
              { value: "eth", label: "1P · ETH" },
              { value: "token", label: `2P · ${BRAND.symbol}` },
            ]}
          />
        </div>
        <div>
          <p className="label mb-2">Difficulty</p>
          <Seg label="Difficulty" value={difficulty} onChange={setDifficulty} options={(Object.keys(DIFFICULTY) as Difficulty[]).map((d) => ({ value: d, label: DIFFICULTY[d].label }))} />
          <p className="mt-2 flex items-center gap-3 text-[13.5px] text-ink-2">
            <RangeBars bars={DIFFICULTY[difficulty].bars} />
            <span>
              <b className="font-semibold text-ink">{DIFFICULTY[difficulty].range}.</b> {DIFFICULTY[difficulty].note}
            </span>
          </p>
        </div>
        <AmountField side={side} value={amount} onChange={setAmount} />
        <div>
          <label className="label" htmlFor="room-name">
            Room name (optional)
          </label>
          <input id="room-name" className="input mt-2 !font-sans" maxLength={18} placeholder="e.g. Night shift" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        {check.msg || error ? (
          <p className={`text-[13.5px] ${error || !check.msg?.startsWith("Reading") ? "text-led-red" : "text-ink-3"}`} data-amount-msg>
            {error ?? check.msg}
          </p>
        ) : null}
        <button type="button" className="btn btn-dark w-full" onClick={submit} data-open-room>
          <CrossGlyph className="size-4 [&_path]:stroke-paper" /> Open room
        </button>
      </div>
    </div>
  );
}

/* ---------------- room view ---------------- */

function SeatCard({ side, seat, mine }: { side: Side; seat: Room["host"] | null; mine: boolean }) {
  return (
    <div className={`rounded-[8px] border p-4 ${seat ? "border-plastic-3 bg-paper" : "border-dashed border-plastic-3 bg-shell-2"}`} data-seat={side}>
      <div className="flex items-center justify-between">
        <span className="font-display text-[26px] font-bold leading-none">{SIDE_LABEL[side].player}</span>
        <span className="font-pixel text-[10px] uppercase text-ink-3">{SIDE_LABEL[side].asset}</span>
      </div>
      {seat ? (
        <>
          <p className="num mt-4 truncate text-[20px]">
            {seat.amount} <span className="text-[13px] text-ink-3">{SIDE_LABEL[side].asset}</span>
          </p>
          <p className="mt-1 truncate font-mono text-[12px] text-ink-3">
            {shortAddress(seat.address)} {mine ? <span className="text-crs">· you</span> : null}
          </p>
        </>
      ) : (
        <p className="mt-4 font-pixel text-[11px] uppercase text-ink-3">
          Waiting for player<span className="animate-blink">_</span>
        </p>
      )}
    </div>
  );
}

function RoomView({ room, onClose }: { room: Room; onClose: () => void }) {
  const { address } = useWallet();
  const openSide = otherSide(room.host.side);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const check = useAmountCheck(openSide, amount);
  const isHost = same(address, room.host.address);
  const isGuest = same(address, room.guest?.address);
  const ethSeat = room.host.side === "eth" ? room.host : room.guest;
  const tokenSeat = room.host.side === "token" ? room.host : room.guest;
  const d = DIFFICULTY[room.difficulty];

  const take = () => {
    if (!address) return;
    setError(null);
    if (!check.ok) {
      setError(check.msg ?? "Enter an amount.");
      return;
    }
    try {
      joinRoom(room.id, { address, amount: amount.trim() });
      setAmount("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="plate p-5 sm:p-6" data-room-view={room.code}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label">Room {room.code}</p>
          <h2 className="h-display mt-2 truncate text-[28px]">{room.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-[13.5px] text-ink-2">
            <RangeBars bars={d.bars} /> {d.label} · {d.range} · {BRAND.ticker} / ETH
          </p>
        </div>
        <button type="button" className="btn btn-sm shrink-0" onClick={onClose}>
          Back
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <SeatCard side="eth" seat={ethSeat} mine={same(address, ethSeat?.address)} />
        <span className="text-center font-display text-[22px] font-bold text-ink-3">+</span>
        <SeatCard side="token" seat={tokenSeat} mine={same(address, tokenSeat?.address)} />
      </div>

      {room.guest ? (
        <div className="crt mt-6 p-5" data-paired>
          <p className="flex items-center gap-2 font-pixel text-[12px] uppercase text-phos">
            <Led /> Pair formed
          </p>
          <p className="mt-2 text-[14.5px] text-phos-dim">
            Both seats are filled. At launch this pair deposits into one {BRAND.ticker}/ETH position at {d.label.toLowerCase()} range and both seats start earning the pool&apos;s
            trading fees plus {BRAND.symbol} rewards.
          </p>
          <div className="mt-3">
            <Kv screen k="Fees earned" v="--" />
            <Kv screen k="Rewards" v="--" />
          </div>
          <button type="button" disabled className="btn mt-4 w-full" data-deposit>
            Deposit · Opens at launch
          </button>
          <Link href="/arcade" className="mt-3 block text-center text-[13.5px] text-phos-dim underline underline-offset-4 hover:text-phos">
            Play the Arcade while you wait
          </Link>
        </div>
      ) : address && !isHost ? (
        <div className="mt-6 grid gap-4" data-join>
          <AmountField side={openSide} value={amount} onChange={setAmount} />
          {check.msg || error ? <p className={`text-[13.5px] ${error || !check.msg?.startsWith("Reading") ? "text-led-red" : "text-ink-3"}`}>{error ?? check.msg}</p> : null}
          <button type="button" className="btn btn-dark w-full" onClick={take} data-take-seat>
            Take seat {SIDE_LABEL[openSide].player}
          </button>
        </div>
      ) : !address ? (
        <ConnectButton className="btn btn-dark mt-6 w-full">Connect to take seat {SIDE_LABEL[openSide].player}</ConnectButton>
      ) : (
        <div className="well mt-6 p-4 text-[14px] text-ink-2">
          Waiting for {SIDE_LABEL[openSide].player} to bring {SIDE_LABEL[openSide].asset}. Share the room code <b className="font-mono text-ink">{room.code}</b>; in this preview the other
          player joins from this browser with another wallet account.
        </div>
      )}

      {isHost || isGuest ? (
        <button
          type="button"
          className="btn btn-sm mt-4"
          onClick={() => {
            if (address) leaveRoom(room.id, address);
            onClose();
          }}
          data-leave
        >
          {isHost ? "Close room" : "Leave seat"}
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- page ---------------- */

export function Lobby() {
  const rooms = useRooms();
  const { address } = useWallet();
  const [selected, setSelected] = useState<string | null>(null);
  const room = rooms.find((r) => r.id === selected) ?? null;
  const open = rooms.filter((r) => !r.guest).length;

  return (
    <div className="wrap mt-10 grid items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
      <div className="grid gap-6">
        <MemoryCard rooms={rooms} selected={room?.id ?? null} onSelect={setSelected} me={address} />
        <div className="plate grid grid-cols-3 divide-x divide-plastic-3 p-0 text-center">
          {[
            { k: "Open rooms", v: open },
            { k: "Paired", v: rooms.length - open },
            { k: "On-chain pairs", v: "--" },
          ].map((s) => (
            <div key={s.k} className="px-2 py-4">
              <p className="num text-[24px] leading-none">{s.v}</p>
              <p className="label mt-2">{s.k}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-ink-3">
          <Hint g="tri">1P brings ETH</Hint>
          <Hint g="ring">2P brings {BRAND.symbol}</Hint>
          <Hint g="cross">Select a block</Hint>
        </div>
      </div>
      {room ? <RoomView room={room} onClose={() => setSelected(null)} /> : <NewRoom onCreated={setSelected} />}
    </div>
  );
}
