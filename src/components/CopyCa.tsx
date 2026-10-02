"use client";

import { useState } from "react";
import { BRAND, CHAIN, TOKEN, explorerToken, shortAddress } from "@/config/brand";
import { CheckIcon, CopyIcon } from "@/components/icons";

function useCopyCa() {
  const [copied, setCopied] = useState(false);
  const live = TOKEN.isLive;
  const copy = async () => {
    if (!live) return;
    try {
      await navigator.clipboard.writeText(BRAND.ca);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the address stays visible to select by hand.
    }
  };
  return { live, copied, copy };
}

/** Compact navbar pill: ticker plus a copy icon. Calm until the CA is published. */
export function NavCaPill() {
  const { live, copied, copy } = useCopyCa();
  return (
    <button
      type="button"
      onClick={copy}
      data-copy-ca="nav"
      title={live ? `Copy ${BRAND.symbol} contract address` : `${BRAND.symbol} contract is published at launch`}
      aria-label={live ? `Copy ${BRAND.symbol} contract address` : `${BRAND.symbol} contract address, published at launch`}
      className={`btn btn-sm !gap-2 !px-2.5 !font-mono !text-[12px] !normal-case !tracking-normal ${live ? "" : "cursor-default"}`}
    >
      <span className="font-semibold">
        <span className="sm:hidden">CA</span>
        <span className="hidden sm:inline">{BRAND.symbol}</span>
      </span>
      <span className="hidden text-[11px] text-ink-3 xl:inline">{copied ? "Copied" : live ? shortAddress(BRAND.ca, 4, 4) : "CA at launch"}</span>
      {copied ? <CheckIcon className="size-3.5 text-led" /> : <CopyIcon className={`size-3.5 ${live ? "text-ink-2" : "text-ink-3 opacity-60"}`} />}
    </button>
  );
}

/** Token contract block for the footer, styled as a memory card label. */
export function CaBlock() {
  const { live, copied, copy } = useCopyCa();
  return (
    <div className="w-full max-w-[420px]">
      <p className="label">{BRAND.symbol} contract · {CHAIN.name}</p>
      <div className="well mt-2.5 flex items-center gap-2 p-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink" data-ca-text>
          {live ? shortAddress(BRAND.ca, 10, 8) : "Published at launch"}
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!live}
          data-copy-ca="footer"
          aria-label="Copy contract address"
          className="btn btn-sm !min-h-[34px] !px-3"
        >
          {copied ? <CheckIcon className="size-4 text-led" /> : <CopyIcon className="size-4" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      {live ? (
        <a href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[13px] text-ink-2 underline-offset-4 hover:underline">
          View on {CHAIN.explorerName}
        </a>
      ) : (
        <p className="mt-2 text-[13px] text-ink-3">The copy button switches on when the address is published.</p>
      )}
    </div>
  );
}
