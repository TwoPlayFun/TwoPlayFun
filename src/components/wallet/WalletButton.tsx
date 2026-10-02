"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BRAND, CHAIN as chain, TOKEN, explorerAddress, shortAddress } from "@/config/brand";
import { formatUnits } from "@/lib/rpc";
import { WALLET_CATALOG, catalogIcon } from "@/config/wallets";
import { WALLETCONNECT_RDNS, useWallet, type DiscoveredWallet } from "@/components/wallet/WalletProvider";
import { Mark } from "@/components/Logo";
import { AlertIcon, ArrowUpRight, CheckIcon, ChevronDownIcon, CloseIcon, CopyIcon, LogOutIcon, WalletIcon } from "@/components/icons";

/* ------------------------------------------------------------------ */
/* One dialog for the whole site. Every "Connect wallet" and "Sign in"  */
/* button opens it through this context instead of owning a copy.       */
/* ------------------------------------------------------------------ */

const ModalContext = createContext<{ open: () => void } | null>(null);

export function WalletModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  return (
    <ModalContext.Provider value={{ open: show }}>
      {children}
      {open ? <WalletDialog onClose={() => setOpen(false)} /> : null}
    </ModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useWalletModal must be used inside WalletModalProvider");
  return context;
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function Icon({ src }: { src: string | null }) {
  return src ? (
    <img src={src} alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-[9px]" />
  ) : (
    <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-plastic text-ink-3">
      <WalletIcon className="size-5" />
    </span>
  );
}

const row =
  "flex min-h-[58px] w-full items-center gap-3 rounded-[8px] border border-plastic-3 bg-[linear-gradient(180deg,#fbfaf7,#e4e2dc)] px-3 py-2.5 text-left text-[15px] text-ink shadow-[inset_1px_1px_0_#fff,0_2px_0_#b6b4ad]";
const group = "px-0.5 pb-2 font-pixel text-[10px] uppercase tracking-[0.08em] text-ink-3";

/**
 * The wallet list itself: detected wallets (EIP-6963) first, then
 * WalletConnect, then wallets that support Robinhood Chain but are not in
 * this browser (install link on desktop, open-in-wallet link on phones).
 */
export function WalletPicker({ onConnected }: { onConnected?: () => void }) {
  const { wallets, connect, connecting, error } = useWallet();
  const [pending, setPending] = useState<string | null>(null);
  // Only ever rendered after a click, so the browser is there to ask.
  const [mobile] = useState(() => typeof navigator !== "undefined" && isMobile());
  const [here] = useState(() => (typeof window === "undefined" ? BRAND.url : window.location.href));

  useEffect(() => {
    // Late-loading extensions announce on request, so ask again on open.
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }, []);

  const installed = wallets
    .filter((w) => w.rdns !== WALLETCONNECT_RDNS)
    .sort((a, b) => Number(Boolean(a.unsupported)) - Number(Boolean(b.unsupported)));
  const walletConnect = wallets.find((w) => w.rdns === WALLETCONNECT_RDNS) ?? null;
  const detected = new Set(wallets.map((w) => w.rdns));
  const more = WALLET_CATALOG.filter((c) => !c.rdns.some((r) => detected.has(r)));

  async function pick(wallet: DiscoveredWallet) {
    setPending(wallet.rdns);
    const ok = await connect(wallet);
    setPending(null);
    if (ok) onConnected?.();
  }

  return (
    <div>
      {installed.length ? (
        <>
          <p className={group}>Detected in this browser</p>
          <ul className="grid grid-cols-1 gap-1.5">
            {installed.map((wallet) => (
              <li key={wallet.rdns}>
                <button
                  type="button"
                  disabled={connecting || Boolean(wallet.unsupported)}
                  onClick={() => pick(wallet)}
                  data-wallet={wallet.rdns}
                  className={`${row} transition-colors enabled:hover:border-ink-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Icon src={wallet.icon || catalogIcon(wallet.rdns)} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{wallet.name}</span>
                    <span className="block text-[12.5px] text-ink-3">{wallet.unsupported ? `Not supported · ${wallet.unsupported}` : "Installed"}</span>
                  </span>
                  {pending === wallet.rdns ? <span className="font-mono text-[11px] uppercase text-crs">Check wallet…</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className={`${group} pt-4 first:pt-0`}>Mobile and other wallets</p>
      {walletConnect ? (
        <button
          type="button"
          disabled={connecting}
          onClick={() => pick(walletConnect)}
          className={`${row} transition-colors enabled:hover:border-ink-2 disabled:opacity-50`}
        >
          <Icon src="/wallets/walletconnect.webp" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">WalletConnect</span>
            <span className="block text-[12.5px] text-ink-3">Scan a QR code with a mobile wallet</span>
          </span>
          {pending === WALLETCONNECT_RDNS ? <span className="font-mono text-[11px] uppercase text-crs">Opening…</span> : null}
        </button>
      ) : (
        <div className={`${row} opacity-50`} data-walletconnect="off">
          <Icon src="/wallets/walletconnect.webp" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">WalletConnect</span>
            <span className="block text-[12.5px] text-ink-3">Not configured on this site yet</span>
          </span>
        </div>
      )}

      {more.length ? (
        <>
          <p className={`${group} pt-4`}>{mobile ? "Open this site in a wallet app" : `Not installed · supports ${chain.name}`}</p>
          <ul className="grid grid-cols-1 gap-1.5">
            {more.map((w) => {
              const href = mobile && w.deepLink ? w.deepLink(here) : w.install;
              const label = mobile && w.deepLink ? "Open" : "Install";
              return (
                <li key={w.id}>
                  <a href={href} target="_blank" rel="noreferrer" className={`${row} transition-colors hover:border-ink-2`}>
                    <Icon src={`/wallets/${w.id}.webp`} />
                    <span className="min-w-0 flex-1 font-medium">{w.name}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase text-ink-3">
                      {label} <ArrowUpRight className="size-3" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-[10px] border border-led-red/40 bg-led-red/10 px-3 py-2.5 text-[13.5px] leading-[1.45] text-led-red">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function WalletDialog({ onClose }: { onClose: () => void }) {
  const { clearError } = useWallet();

  const close = useCallback(() => {
    onClose();
    clearError();
  }, [onClose, clearError]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  // The header blurs what is behind it, and a backdrop filter turns it into
  // the containing block for fixed children. Rendered in place, the dialog
  // would be clipped to the header, so it always goes to <body>.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title" className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 animate-fade cursor-default bg-[#2a2c33]/60 dither" />
      <div className="relative flex max-h-[92dvh] w-full max-w-[440px] animate-sheet flex-col overflow-hidden rounded-t-[14px] border border-edge bg-shell text-ink shadow-[inset_1px_1px_0_#fff,0_4px_0_#8f8d86,0_40px_90px_-30px_rgba(0,0,0,0.6)] sm:animate-pop sm:rounded-[14px]">
        <div className="ridges flex items-center justify-between border-b border-plastic-3 bg-plastic px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Mark size={24} />
            <h2 id="wallet-dialog-title" className="font-display text-[20px] font-bold uppercase tracking-[0.04em]">
              Connect a wallet
            </h2>
          </div>
          <button type="button" aria-label="Close" onClick={close} className="btn btn-sm !size-9 !min-h-0 !p-0">
            <CloseIcon />
          </button>
        </div>
        <p className="px-5 pt-4 text-[14.5px] leading-[1.5] text-ink-2">
          Your wallet is your sign-in. Any EVM wallet that can add a custom network works on {chain.name}. Connecting only shares your address; nothing moves without a signature in your wallet.
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-4">
          <WalletPicker onConnected={onClose} />
        </div>
        <p className="border-t border-plastic-3 bg-plastic px-5 py-3.5 font-pixel text-[10px] uppercase tracking-[0.06em] text-ink-2">
          {chain.name} · chain id {chain.id} · added to your wallet on connect
        </p>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Navbar control: Connect, or the connected account with its menu.     */
/* ------------------------------------------------------------------ */

export function NavWallet({ compact = false, label = "Connect wallet" }: { compact?: boolean; label?: string }) {
  const { address } = useWallet();
  const { open } = useWalletModal();
  if (address) return <AccountMenu compact={compact} />;
  return (
    <button type="button" onClick={open} data-connect="nav" className="btn btn-sm btn-dark shrink-0 !px-3 sm:!px-4">
      <WalletIcon className="size-4" />
      <span>{compact ? "Connect" : label}</span>
    </button>
  );
}

/** A plain button anywhere on the site that opens the one wallet dialog. */
export function ConnectButton({ className = "btn btn-dark", children }: { className?: string; children?: React.ReactNode }) {
  const { open } = useWalletModal();
  return (
    <button type="button" onClick={open} className={className}>
      {children ?? "Connect wallet"}
    </button>
  );
}

function AccountMenu({ compact }: { compact: boolean }) {
  const { address, walletName, chainId, balance, tokenWei, onRobinhoodChain, switchNetwork, switching, disconnect, error } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const WIDTH = 296;
    const position = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.max(8, Math.min(rect.right - WIDTH, window.innerWidth - WIDTH - 8));
      setPlace({ top: rect.bottom + 10, left });
    };
    position();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
    };
  }, [open]);

  if (!address) return null;
  const wrongNetwork = chainId !== null && !onRobinhoodChain;
  const item = "flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-ink-2 transition-colors hover:bg-plastic hover:text-ink";

  return (
    <div ref={root} className="flex shrink-0 items-center">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        data-account-chip
        onClick={() => setOpen((value) => !value)}
        className="btn btn-sm !gap-2 !px-2.5 !font-mono !text-[12px] !normal-case !tracking-normal sm:!px-3"
      >
        <span className={`size-2 rounded-full ${wrongNetwork ? "bg-led-red" : "bg-led"}`} />
        <span>{shortAddress(address, compact ? 4 : 5, 4)}</span>
        <ChevronDownIcon className="size-3.5 opacity-70" />
      </button>

      {open && place
        ? createPortal(
            <div
              ref={menu}
              role="menu"
              style={{ position: "fixed", top: place.top, left: place.left }}
              className="z-[80] w-[296px] animate-fade overflow-hidden rounded-[10px] border border-edge bg-shell text-ink shadow-[inset_1px_1px_0_#fff,0_3px_0_#8f8d86,0_30px_60px_-24px_rgba(0,0,0,0.5)]"
            >
              <div className="border-b border-plastic-3 px-4 py-4">
                <p className="label">{walletName ?? "Wallet"}</p>
                <p className="mt-1 font-mono text-[12.5px]">{shortAddress(address, 10, 8)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="well px-2.5 py-2">
                    <p className="label">{chain.nativeSymbol}</p>
                    <p className="num mt-0.5 text-[16px]" data-balance="eth">{balance === null ? "…" : balance}</p>
                  </div>
                  <div className="well px-2.5 py-2">
                    <p className="label">{BRAND.symbol}</p>
                    <p className="num mt-0.5 text-[16px]" data-balance="token">{!TOKEN.isLive ? "--" : tokenWei === null ? "…" : formatUnits(tokenWei, TOKEN.decimals)}</p>
                  </div>
                </div>
                <p className={`mt-2.5 flex items-center gap-1.5 text-[12.5px] ${wrongNetwork ? "text-led-red" : "text-ink-3"}`} data-network-status>
                  <span className={`size-1.5 rounded-full ${wrongNetwork ? "bg-led-red" : "bg-led"}`} />
                  {chainId === null ? "Reading network…" : onRobinhoodChain ? `On ${chain.name}` : `On chain ${chainId}, not ${chain.name}`}
                </p>
              </div>
              {wrongNetwork ? (
                <div className="border-b border-plastic-3 p-2">
                  <button type="button" role="menuitem" disabled={switching} onClick={switchNetwork} className="btn btn-sm btn-dark w-full">
                    {switching ? "Confirm in wallet…" : `Switch to ${chain.name}`}
                  </button>
                  {error ? <p className="mt-2 px-1 text-[12.5px] leading-[1.45] text-led-red">{error}</p> : null}
                </div>
              ) : null}
              <div className="flex flex-col p-1.5 text-[14.5px]">
                <Link role="menuitem" href="/lobby" onClick={() => setOpen(false)} className={item}>
                  <WalletIcon className="size-4" /> Open lobby
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1400);
                    } catch {
                      // Clipboard refused; the address above stays readable.
                    }
                  }}
                  className={item}
                >
                  {copied ? <CheckIcon className="size-4 text-led" /> : <CopyIcon className="size-4" />}
                  {copied ? "Copied" : "Copy address"}
                </button>
                <a role="menuitem" href={explorerAddress(address)} target="_blank" rel="noreferrer" className={item}>
                  <ArrowUpRight className="size-4" /> View on explorer
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    disconnect();
                  }}
                  className="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-led-red transition-colors hover:bg-led-red/10"
                >
                  <LogOutIcon className="size-4" /> Disconnect
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
