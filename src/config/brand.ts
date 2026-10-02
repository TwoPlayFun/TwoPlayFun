// Single place to change project identity. Everything on the site reads from here.
// The token contract below is a placeholder until launch: paste the real
// 0x address (0x + 40 hex) into CA and the navbar pill, the footer block and
// every copy button switch from "Published at launch" to a working copy.

const CA = "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export const isAddress = (v: string): v is `0x${string}` => /^0x[0-9a-fA-F]{40}$/.test(v);

export const BRAND = {
  name: "Two Play",
  word: "TWOPLAY",
  ticker: "TWOPLAY",
  symbol: "$TWOPLAY",
  domain: "twoplay.fun",
  url: "https://twoplay.fun",
  slogan: "Two players. One pool. Real earnings.",
  tagline: "Co-op liquidity on Robinhood Chain where two players pool together.",
  description:
    "Two Play turns liquidity into a co-op game on Robinhood Chain. Player 1 brings ETH, Player 2 brings the token, and together they open one pair that earns trading fees and rewards for both seats.",
  x: "https://x.com/twoplayfun",
  xHandle: "@twoplayfun",
  /** Public GitHub repository. Empty hides every GitHub link on the site. */
  github: "https://github.com/TwoPlayFun/TwoPlayFun" as string,
  ca: CA,
} as const;

// Public endpoints are the default. An operator can point server reads at a
// private RPC with ROBINHOOD_RPC_URL (optional, server only).
const PUBLIC_RPC = "https://rpc.mainnet.chain.robinhood.com";

export const CHAIN = {
  id: 4663,
  hex: "0x1237",
  name: "Robinhood Chain",
  nativeSymbol: "ETH",
  decimals: 18,
  publicRpc: PUBLIC_RPC,
  /** Second public endpoint, used for reads only when the first one fails. */
  fallbackRpc: "https://robinhood-rpc.publicnode.com",
  explorer: "https://robinhoodchain.blockscout.com",
  explorerName: "Blockscout",
} as const;

/** RPC for server code: the private endpoint when set, else the public one. */
export function serverRpc() {
  return process.env.ROBINHOOD_RPC_URL || PUBLIC_RPC;
}

export const TOKEN = {
  decimals: 18,
  get isLive() {
    return isAddress(BRAND.ca);
  },
};

/**
 * Game contracts. Nothing is deployed on mainnet yet; every entry stays empty
 * until launch and the site says so instead of inventing numbers.
 */
export const CONTRACTS: { name: string; role: string; address: string }[] = [
  { name: "PairLobby", role: "Holds 1P and 2P deposits until a match", address: "" },
  { name: "SeatNFT", role: "One save file per seat in a pair", address: "" },
  { name: "FeeSplitter", role: "Splits pool fees between the two seats", address: "" },
  { name: "Rewards", role: "Streams $TWOPLAY rewards to paired seats", address: "" },
];

export function explorerAddress(address: string) {
  return `${CHAIN.explorer}/address/${address}`;
}
export function explorerToken(address: string) {
  return `${CHAIN.explorer}/token/${address}`;
}
export function shortAddress(address: string, head = 6, tail = 4) {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}
